-- Owner-only manual recovery; never a worker/API capability. No automatic call site.
begin;
create table public.pipstart_optional_worker_recoveries (
 run_fingerprint text primary key check(run_fingerprint ~ '^[a-f0-9]{64}$'),
 snapshot_hash text not null check(snapshot_hash ~ '^[a-f0-9]{64}$'),
 proof_ref text not null check(proof_ref ~ '^M21-[A-Za-z0-9_-]{8,80}$'),
 database_session text not null,
 executor_stopped_attested boolean not null check(executor_stopped_attested),
 started_at timestamptz not null check(isfinite(started_at)),
 recovered_at timestamptz not null default clock_timestamp() check(isfinite(recovered_at)),
 job_ids uuid[] not null check(cardinality(job_ids) between 1 and 5)
);
alter table public.pipstart_optional_worker_recoveries enable row level security;
revoke all on public.pipstart_optional_worker_recoveries from public,anon,authenticated,service_role;

-- Canonical UTC snapshot of private rows; only bounded hashes/metadata returned.
create function public.pipstart_optional_worker_recovery_snapshot()
returns jsonb language sql stable set search_path='' set timezone='UTC' as $$
 select case when (select count(*) from public.pipstart_optional_worker_slot)<>1 then
  jsonb_build_object('status','unavailable','runFingerprint',null,'snapshotHash',null,'jobCount',0,'resendAllowed',false)
 else (select jsonb_build_object(
  'status',case when s.run_token is null then 'idle' else 'review_required' end,
  'runFingerprint',case when s.run_token is null then null else encode(sha256(convert_to(s.run_token::text,'UTF8')),'hex') end,
  'snapshotHash',encode(sha256(convert_to(jsonb_build_object(
   'slot',to_jsonb(s),
   'jobs',coalesce((select jsonb_agg(to_jsonb(j) order by j.id) from public.pipstart_optional_email_jobs j where j.id=any(s.job_ids)),'[]'::jsonb),
   'receipts',coalesce((select jsonb_agg(to_jsonb(r) order by r.job_id) from public.pipstart_optional_provider_receipts r where r.job_id=any(s.job_ids)),'[]'::jsonb),
   'events',coalesce((select jsonb_agg(to_jsonb(e) order by e.event_id) from public.pipstart_optional_delivery_events e where e.job_id=any(s.job_ids)),'[]'::jsonb),
   'reservations',coalesce((select jsonb_agg(to_jsonb(r) order by r.job_id) from public.pipstart_optional_email_reservations r where r.job_id=any(s.job_ids)),'[]'::jsonb)
  )::text,'UTF8')),'hex'),
  'jobCount',cardinality(s.job_ids),'resendAllowed',false
 ) from public.pipstart_optional_worker_slot s where singleton) end;
$$;
revoke all on function public.pipstart_optional_worker_recovery_snapshot() from public,anon,authenticated,service_role;

create function public.pipstart_recover_optional_worker(p_run_fingerprint text,p_snapshot_hash text,p_executor_stopped boolean,p_proof_ref text)
returns jsonb language plpgsql set search_path='' set timezone='UTC' set lock_timeout='5s' as $$
declare s public.pipstart_optional_worker_slot%rowtype;r jsonb;
begin
 if (p_run_fingerprint ~ '^[a-f0-9]{64}$' and p_snapshot_hash ~ '^[a-f0-9]{64}$'
  and p_executor_stopped is true and p_proof_ref ~ '^M21-[A-Za-z0-9_-]{8,80}$') is distinct from true then
  raise exception 'Explicit reviewed executor-stop attestation required';end if;
 select * into strict s from public.pipstart_optional_worker_slot where singleton for update;
 if s.run_token is null then return jsonb_build_object('status','idle','resendAllowed',false);end if;
 if cardinality(s.job_ids) not between 1 and 5 then raise exception 'Invalid active worker batch';end if;
 -- Block writers briefly so evidence cannot drift between the CAS and audit.
 -- These table locks do not fence a remote executor: external stop proof is mandatory.
 lock table public.pipstart_optional_email_jobs,public.pipstart_optional_provider_receipts,
  public.pipstart_optional_delivery_events,public.pipstart_optional_email_reservations in share row exclusive mode;
 r:=public.pipstart_optional_worker_recovery_snapshot();
 if r->>'status'<>'review_required' or r->>'runFingerprint' is distinct from p_run_fingerprint
  or r->>'snapshotHash' is distinct from p_snapshot_hash then
  return jsonb_build_object('status','changed','resendAllowed',false);end if;
 insert into public.pipstart_optional_worker_recoveries(run_fingerprint,snapshot_hash,proof_ref,database_session,executor_stopped_attested,started_at,job_ids)
 values(p_run_fingerprint,p_snapshot_hash,p_proof_ref,session_user,true,s.started_at,s.job_ids);
 update public.pipstart_optional_worker_slot set run_token=null,job_ids='{}',started_at=null
  where singleton and run_token=s.run_token;
 if not found then raise exception 'Worker admission changed';end if;
 return jsonb_build_object('status','recovered','resendAllowed',false);
end $$;
revoke all on function public.pipstart_recover_optional_worker(text,text,boolean,text) from public,anon,authenticated,service_role;
-- Deliberately NO execute grants to service_role and NO automatic recovery route.
commit;
