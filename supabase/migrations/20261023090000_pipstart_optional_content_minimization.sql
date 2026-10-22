-- Dormant owner-only bounded content minimization. No execution or activation.
begin;
lock table public.pipstart_optional_email_jobs in share row exclusive mode;
create table public.pipstart_optional_minimization_receipts (
 id uuid primary key default gen_random_uuid(),
 plan_hash text not null unique check(plan_hash ~ '^[a-f0-9]{64}$'),
 plan_at timestamptz not null check(isfinite(plan_at)),
 proof_ref text not null check(proof_ref ~ '^M21-[A-Za-z0-9_-]{8,80}$'),
 database_session text not null,
 job_count integer not null check(job_count between 1 and 100),
 executed_at timestamptz not null default clock_timestamp() check(isfinite(executed_at))
);
alter table public.pipstart_optional_minimization_receipts enable row level security;
revoke all on public.pipstart_optional_minimization_receipts from public,anon,authenticated,service_role;

-- Relax exactly the accepted prepared-payload CHECK, not any lease/provider rule.
-- An AFTER-row guard additionally requires the private minimization facts.
do $$declare cname text;begin
 select conname into strict cname from pg_constraint where conrelid='public.pipstart_optional_email_jobs'::regclass
  and contype='c' and convalidated and pg_get_expr(conbin,conrelid)=
  '((status <> ALL (ARRAY[''sending''::text, ''accepted''::text])) OR (prepared_message IS NOT NULL))';
 execute format('alter table public.pipstart_optional_email_jobs drop constraint %I',cname);
end $$;
alter table public.pipstart_optional_email_jobs add constraint pipstart_optional_jobs_payload_or_minimized
 check(status not in ('sending','accepted') or prepared_message is not null or
  (status='accepted' and subject='[Content removed]' and html='<p>Content removed.</p>' and body_text='Content removed.'));

create function public.pipstart_guard_optional_minimized_job()
returns trigger language plpgsql set search_path='' as $$
declare f public.pipstart_optional_content_facts%rowtype;
begin
 select * into f from public.pipstart_optional_content_facts where job_id=new.id;
 if f.minimized_at is not null or (new.status='accepted' and new.prepared_message is null) then
  if f.job_id is null or f.minimized_at is null or new.status not in ('accepted','suppressed')
   or new.subject<>'[Content removed]' or new.html<>'<p>Content removed.</p>' or new.body_text<>'Content removed.' or new.prepared_message is not null
   or (new.status='accepted' and (f.prepared_hash is null or f.recipient_hash is null or f.envelope_recorded_at is null)) then
   raise exception 'Minimized optional job requires matching terminal facts';
  end if;
 end if;
 return new;
end $$;
revoke all on function public.pipstart_guard_optional_minimized_job() from public,anon,authenticated,service_role;
-- Runs after the existing alphabetically earlier content-facts capture trigger.
-- Includes status-only updates so a tombstone cannot be silently reopened.
create trigger pipstart_optional_minimized_guard after insert or update
 on public.pipstart_optional_email_jobs for each row execute function public.pipstart_guard_optional_minimized_job();

create function public.pipstart_optional_content_minimization_candidates(p_plan_at timestamptz)
returns table(job_id uuid,row_hash text)
language sql stable set search_path='' set timezone='UTC' as $$
 with held_jobs as (
  select subject_ref::uuid id from public.pipstart_optional_retention_holds where entity_kind='job'
  union select unnest(r.job_ids) from public.pipstart_optional_worker_recoveries r
   join public.pipstart_optional_retention_holds h on h.entity_kind='recovery' and h.subject_ref=r.run_fingerprint
  union select unnest(s.job_ids) from public.pipstart_optional_worker_slot s where s.run_token is not null
 ), terminal as (
  select j.id,
   greatest(j.created_at,j.updated_at,f.envelope_recorded_at,r.api_ack_at,r.signed_event_at,
    (select max(greatest(e.occurred_at,e.received_at)) from public.pipstart_optional_delivery_events e where e.job_id=j.id)) last_activity,
   jsonb_build_object('job',to_jsonb(j),'facts',to_jsonb(f),'receipt',to_jsonb(r),
    'events',(select jsonb_agg(to_jsonb(e) order by e.event_id) from public.pipstart_optional_delivery_events e where e.job_id=j.id)) snapshot
  from public.pipstart_optional_email_jobs j join public.pipstart_optional_content_facts f on f.job_id=j.id
   left join public.pipstart_optional_provider_receipts r on r.job_id=j.id
  where j.status in ('accepted','suppressed') and f.minimized_at is null
   and not exists(select 1 from held_jobs h where h.id=j.id)
   and f.content_hash=public.pipstart_optional_content_digest(j.kind,j.subject,j.html,j.body_text)
   and ((j.prepared_message is null and j.status='suppressed' and f.prepared_hash is null and r.job_id is null)
    or (j.prepared_message is not null
     and f.prepared_hash=public.pipstart_optional_prepared_digest(j.prepared_message)
     and f.recipient_hash=public.pipstart_optional_address_hash(j.prepared_message->>'to')
     and j.prepared_message->>'jobId'=j.id::text and j.prepared_message->>'subject'=j.subject
     and (r.job_id is null or (r.prepared_hash=f.prepared_hash and (j.status<>'accepted' or r.provider_id=j.provider_id)))))
 )
 select id,encode(sha256(convert_to(snapshot::text,'UTF8')),'hex') from terminal
 where p_plan_at is not null and isfinite(p_plan_at) and last_activity<p_plan_at-interval '2160 hours'
 order by last_activity,id limit 100;
$$;
revoke all on function public.pipstart_optional_content_minimization_candidates(timestamptz) from public,anon,authenticated,service_role;

create function public.pipstart_optional_content_minimization_plan(p_plan_at timestamptz default statement_timestamp())
returns jsonb language sql stable set search_path='' set timezone='UTC' as $$
 with batch as (select * from public.pipstart_optional_content_minimization_candidates(p_plan_at)),
 worker as (select count(*)=1 and bool_and(singleton and run_token is null and started_at is null and cardinality(job_ids)=0) idle from public.pipstart_optional_worker_slot)
 select jsonb_build_object(
  'status',case when not coalesce(w.idle,false) then 'worker_review_required' when p_plan_at is null or not isfinite(p_plan_at) then 'invalid' else 'review_required' end,
  'planAt',p_plan_at,
  'planHash',case when coalesce(w.idle,false) and p_plan_at is not null and isfinite(p_plan_at) then
   encode(sha256(convert_to(jsonb_build_object('policyVersion',1,'planAt',p_plan_at,'maxRows',100,'terminalHours',2160,
    'batch',coalesce((select jsonb_agg(jsonb_build_array(job_id,row_hash) order by job_id) from batch),'[]'::jsonb))::text,'UTF8')),'hex') else null end,
  'jobCount',(select count(*) from batch),'maxRows',100,'terminalContentDays',90,
  'automaticDeletion',false,'resendAllowed',false,'unsubscribeTokenAction','retain_valid_account_links'
 ) from worker w;
$$;
revoke all on function public.pipstart_optional_content_minimization_plan(timestamptz) from public,anon,authenticated,service_role;

create function public.pipstart_execute_optional_content_minimization(p_plan_at timestamptz,p_plan_hash text,p_senders_stopped boolean,p_proof_ref text)
returns jsonb language plpgsql set search_path='' set timezone='UTC' set lock_timeout='5s' as $$
declare s public.pipstart_optional_worker_slot%rowtype;r public.pipstart_optional_minimization_receipts%rowtype;p jsonb;batch uuid[];nf integer;nj integer;
begin
 if (p_plan_at is not null and isfinite(p_plan_at) and p_plan_at<=clock_timestamp() and p_plan_at>=clock_timestamp()-interval '15 minutes'
  and p_plan_hash ~ '^[a-f0-9]{64}$' and p_senders_stopped is true and p_proof_ref ~ '^M21-[A-Za-z0-9_-]{8,80}$') is distinct from true then
  raise exception 'Fresh reviewed plan and explicit sender-stop attestation required';end if;
 select * into strict s from public.pipstart_optional_worker_slot where singleton for update;
 select * into r from public.pipstart_optional_minimization_receipts where plan_hash=p_plan_hash;
 if found then
  if r.plan_at is distinct from p_plan_at or r.proof_ref is distinct from p_proof_ref then raise exception 'Minimization receipt scope differs';end if;
  return jsonb_build_object('status','already_recorded','receiptId',r.id,'jobCount',r.job_count,'resendAllowed',false);
 end if;
 if s.run_token is not null or cardinality(s.job_ids)<>0 or s.started_at is not null then return jsonb_build_object('status','worker_review_required','resendAllowed',false);end if;
 -- Brief stable CAS/update window. Sender-stop attestation is not a remote fence.
 lock table public.pipstart_optional_retention_holds,public.pipstart_optional_email_jobs,
  public.pipstart_optional_worker_recoveries,public.pipstart_optional_content_facts,
  public.pipstart_optional_provider_receipts,public.pipstart_optional_delivery_events in share row exclusive mode;
 p:=public.pipstart_optional_content_minimization_plan(p_plan_at);
 if p->>'status'<>'review_required' or p->>'planHash' is distinct from p_plan_hash then return jsonb_build_object('status','changed','resendAllowed',false);end if;
 -- Freeze the reviewed batch exactly once; do not refill/drain after updates.
 select coalesce(array_agg(job_id order by job_id),'{}'::uuid[]) into batch from public.pipstart_optional_content_minimization_candidates(p_plan_at);
 if cardinality(batch)=0 then return jsonb_build_object('status','no_work','resendAllowed',false);end if;
 perform 1 from public.pipstart_optional_email_jobs where id=any(batch) order by id for update;
 perform 1 from public.pipstart_optional_content_facts where job_id=any(batch) order by job_id for update;
 update public.pipstart_optional_content_facts set minimized_at=clock_timestamp() where job_id=any(batch) and minimized_at is null;
 get diagnostics nf=row_count;
 update public.pipstart_optional_email_jobs set subject='[Content removed]',html='<p>Content removed.</p>',
  body_text='Content removed.',prepared_message=null,updated_at=clock_timestamp() where id=any(batch) and status in ('accepted','suppressed');
 get diagnostics nj=row_count;
 if nf<>cardinality(batch) or nj<>nf or nj<>(p->>'jobCount')::integer or nj>100 then raise exception 'Minimization batch changed';end if;
 insert into public.pipstart_optional_minimization_receipts(plan_hash,plan_at,proof_ref,database_session,job_count)
 values(p_plan_hash,p_plan_at,p_proof_ref,session_user,nj) returning * into r;
 return jsonb_build_object('status','minimized','receiptId',r.id,'jobCount',nj,'resendAllowed',false);
end $$;
revoke all on function public.pipstart_execute_optional_content_minimization(timestamptz,text,boolean,text) from public,anon,authenticated,service_role;
-- No grants, schedule, invocation or live-redaction script supplied.
commit;
