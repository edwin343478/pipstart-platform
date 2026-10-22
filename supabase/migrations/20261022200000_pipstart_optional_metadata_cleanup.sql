-- Dormant owner-only manual metadata cleanup. No content/token/job deletion.
begin;
create table public.pipstart_optional_cleanup_receipts (
 id uuid primary key default gen_random_uuid(),
 plan_hash text not null unique check(plan_hash ~ '^[a-f0-9]{64}$'),
 plan_at timestamptz not null check(isfinite(plan_at)),
 proof_ref text not null check(proof_ref ~ '^M21-[A-Za-z0-9_-]{8,80}$'),
 database_session text not null,
 cadence_count integer not null check(cadence_count between 0 and 100),
 recovery_count integer not null check(recovery_count between 0 and 100),
 executed_at timestamptz not null default clock_timestamp() check(isfinite(executed_at)),
 check(cadence_count+recovery_count between 1 and 100)
);
alter table public.pipstart_optional_cleanup_receipts enable row level security;
revoke all on public.pipstart_optional_cleanup_receipts from public,anon,authenticated,service_role;

create function public.pipstart_optional_metadata_cleanup_candidates(p_plan_at timestamptz)
returns table(entity_kind text,entity_ref text,row_hash text)
language sql stable set search_path='' set timezone='UTC' as $$
 with held_jobs as (
  select subject_ref::uuid id from public.pipstart_optional_retention_holds where entity_kind='job'
  union select unnest(r.job_ids) from public.pipstart_optional_worker_recoveries r
   join public.pipstart_optional_retention_holds h on h.entity_kind='recovery' and h.subject_ref=r.run_fingerprint
  union select unnest(s.job_ids) from public.pipstart_optional_worker_slot s where s.run_token is not null
 ), candidates as (
  select 'cadence'::text kind,r.job_id::text ref,r.reserved_at age,
   jsonb_build_object('row',to_jsonb(r),'job',(select jsonb_build_array(j.id,j.status,j.updated_at) from public.pipstart_optional_email_jobs j where j.id=r.job_id)) snapshot
  from public.pipstart_optional_email_reservations r where r.reserved_at<p_plan_at-interval '744 hours'
   and not exists(select 1 from held_jobs h where h.id=r.job_id)
   and not exists(select 1 from public.pipstart_optional_email_jobs j where j.id=r.job_id and j.status not in ('accepted','suppressed'))
  union all
  select 'recovery',r.run_fingerprint,r.recovered_at,
   jsonb_build_object('row',to_jsonb(r),'jobs',(select jsonb_agg(jsonb_build_array(j.id,j.status,j.updated_at) order by j.id) from public.pipstart_optional_email_jobs j where j.id=any(r.job_ids)))
  from public.pipstart_optional_worker_recoveries r where r.recovered_at<p_plan_at-interval '8760 hours'
   and not exists(select 1 from public.pipstart_optional_retention_holds h where h.entity_kind='recovery' and h.subject_ref=r.run_fingerprint)
   and not exists(select 1 from unnest(r.job_ids) x(id) join held_jobs h on h.id=x.id)
   and not exists(select 1 from unnest(r.job_ids) x(id) join public.pipstart_optional_email_jobs j on j.id=x.id where j.status not in ('accepted','suppressed'))
 )
 select kind,ref,encode(sha256(convert_to(snapshot::text,'UTF8')),'hex') from candidates
 where p_plan_at is not null and isfinite(p_plan_at) order by age,kind,ref limit 100;
$$;
revoke all on function public.pipstart_optional_metadata_cleanup_candidates(timestamptz) from public,anon,authenticated,service_role;

create function public.pipstart_optional_metadata_cleanup_plan(p_plan_at timestamptz default statement_timestamp())
returns jsonb language sql stable set search_path='' set timezone='UTC' as $$
 with batch as (select * from public.pipstart_optional_metadata_cleanup_candidates(p_plan_at)),
 worker as (select count(*)=1 and bool_and(singleton and run_token is null and started_at is null and cardinality(job_ids)=0) idle from public.pipstart_optional_worker_slot)
 select jsonb_build_object(
  'status',case when not coalesce(w.idle,false) then 'worker_review_required' when p_plan_at is null or not isfinite(p_plan_at) then 'invalid' else 'review_required' end,
  'planAt',p_plan_at,
  'planHash',case when coalesce(w.idle,false) and p_plan_at is not null and isfinite(p_plan_at) then
   encode(sha256(convert_to(jsonb_build_object('policyVersion',1,'planAt',p_plan_at,'maxRows',100,'cadenceHours',744,'recoveryHours',8760,
    'batch',coalesce((select jsonb_agg(jsonb_build_array(entity_kind,entity_ref,row_hash) order by entity_kind,entity_ref) from batch),'[]'::jsonb))::text,'UTF8')),'hex') else null end,
  'cadenceCount',(select count(*) from batch where entity_kind='cadence'),
  'recoveryAuditCount',(select count(*) from batch where entity_kind='recovery'),
  'maxRows',100,'automaticDeletion',false,'payloadCleanupEnabled',false,'resendAllowed',false
 ) from worker w;
$$;
revoke all on function public.pipstart_optional_metadata_cleanup_plan(timestamptz) from public,anon,authenticated,service_role;

create function public.pipstart_execute_optional_metadata_cleanup(p_plan_at timestamptz,p_plan_hash text,p_senders_stopped boolean,p_proof_ref text)
returns jsonb language plpgsql set search_path='' set timezone='UTC' set lock_timeout='5s' as $$
declare s public.pipstart_optional_worker_slot%rowtype;r public.pipstart_optional_cleanup_receipts%rowtype;p jsonb;batch jsonb;nc integer;nr integer;
begin
 if (p_plan_at is not null and isfinite(p_plan_at) and p_plan_at<=clock_timestamp() and p_plan_at>=clock_timestamp()-interval '15 minutes'
  and p_plan_hash ~ '^[a-f0-9]{64}$' and p_senders_stopped is true and p_proof_ref ~ '^M21-[A-Za-z0-9_-]{8,80}$') is distinct from true then
  raise exception 'Fresh reviewed plan and explicit sender-stop attestation required';end if;
 select * into strict s from public.pipstart_optional_worker_slot where singleton for update;
 -- A previous receipt is evidence, not another deletion opportunity.
 select * into r from public.pipstart_optional_cleanup_receipts where plan_hash=p_plan_hash;
 if found then
  if r.plan_at is distinct from p_plan_at or r.proof_ref is distinct from p_proof_ref then raise exception 'Cleanup receipt scope differs';end if;
  return jsonb_build_object('status','already_recorded','receiptId',r.id,'cadenceCount',r.cadence_count,'recoveryAuditCount',r.recovery_count,'resendAllowed',false);
 end if;
 if s.run_token is not null or cardinality(s.job_ids)<>0 or s.started_at is not null then return jsonb_build_object('status','worker_review_required','resendAllowed',false);end if;
 -- Stable CAS/deletion window; no remote-executor fencing is inferred from locks.
 lock table public.pipstart_optional_retention_holds,public.pipstart_optional_email_jobs,
  public.pipstart_optional_worker_recoveries,public.pipstart_optional_email_reservations in share row exclusive mode;
 p:=public.pipstart_optional_metadata_cleanup_plan(p_plan_at);
 if p->>'status'<>'review_required' or p->>'planHash' is distinct from p_plan_hash then return jsonb_build_object('status','changed','resendAllowed',false);end if;
 select coalesce(jsonb_agg(jsonb_build_object('kind',entity_kind,'ref',entity_ref)),'[]'::jsonb) into batch from public.pipstart_optional_metadata_cleanup_candidates(p_plan_at);
 if jsonb_array_length(batch)=0 then return jsonb_build_object('status','no_work','resendAllowed',false);end if;
 delete from public.pipstart_optional_email_reservations target using jsonb_to_recordset(batch) x(kind text,ref text) where x.kind='cadence' and target.job_id::text=x.ref;
 get diagnostics nc=row_count;
 delete from public.pipstart_optional_worker_recoveries target using jsonb_to_recordset(batch) x(kind text,ref text) where x.kind='recovery' and target.run_fingerprint=x.ref;
 get diagnostics nr=row_count;
 if nc<>(p->>'cadenceCount')::integer or nr<>(p->>'recoveryAuditCount')::integer or nc+nr>100 then raise exception 'Cleanup batch changed';end if;
 insert into public.pipstart_optional_cleanup_receipts(plan_hash,plan_at,proof_ref,database_session,cadence_count,recovery_count)
 values(p_plan_hash,p_plan_at,p_proof_ref,session_user,nc,nr) returning * into r;
 return jsonb_build_object('status','cleaned','receiptId',r.id,'cadenceCount',nc,'recoveryAuditCount',nr,'resendAllowed',false);
end $$;
revoke all on function public.pipstart_execute_optional_metadata_cleanup(timestamptz,text,boolean,text) from public,anon,authenticated,service_role;
-- No grants, schedule, automatic invocation or live-delete script supplied.
commit;
