-- Additive versioned acknowledgement; legacy boolean RPC and stop controls stay intact.
begin;
set local lock_timeout='5s';
create function public.pipstart_begin_optional_email_v2(p_job_id uuid,p_token uuid,p_message jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare before_job public.pipstart_optional_email_jobs%rowtype;
 after_job public.pipstart_optional_email_jobs%rowtype;
 started boolean; checked_at timestamptz;
begin
 -- Match the legacy cadence lock order, never acquire row then cadence lock.
 perform pg_advisory_xact_lock(hashtextextended('pipstart-optional-cadence-v1',0));
 select * into before_job from public.pipstart_optional_email_jobs where id=p_job_id for update;
 checked_at:=clock_timestamp();
 if not found or p_token is null or before_job.status<>'preparing'
  or before_job.lease_token is distinct from p_token or before_job.lease_until<=checked_at
  or before_job.prepared_message is not null
  or exists(select 1 from public.pipstart_optional_email_reservations where job_id=p_job_id) then
  return jsonb_build_object('version',2,'status','lease_lost');
 end if;
 -- Do not catch exceptions: lost acknowledgements, invalid bodies and closed
 -- permit triggers must remain uncertain/fail-closed, never safe deferrals.
 started:=public.pipstart_begin_optional_email(p_job_id,p_token,p_message);
 if started is true then return jsonb_build_object('version',2,'status','started');end if;
 select * into after_job from public.pipstart_optional_email_jobs where id=p_job_id;
 if found and after_job.status='pending' and after_job.reason='cadence_limited'
  and after_job.lease_token is null and after_job.lease_until is null
  and after_job.prepared_message is null and after_job.provider_id is null
  and after_job.attempts=greatest(before_job.attempts-1,0)
  and after_job.available_at>checked_at
  and not exists(select 1 from public.pipstart_optional_email_reservations where job_id=p_job_id) then
  return jsonb_build_object('version',2,'status','cadence_deferred');
 end if;
 return jsonb_build_object('version',2,'status','lease_lost');
end $$;
revoke all on function public.pipstart_begin_optional_email_v2(uuid,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.pipstart_begin_optional_email_v2(uuid,uuid,jsonb) to service_role;
comment on function public.pipstart_begin_optional_email_v2(uuid,uuid,jsonb) is
 'Version 2 begin acknowledgement. Only transaction-proven pre-handoff cadence deferral is safe; no provider call or worker unlock.';
notify pgrst,'reload schema';
commit;
