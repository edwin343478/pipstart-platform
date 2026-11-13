-- Check-only reconciliation. No deployment request, claim, retry or scheduler change.
begin;
do $$begin
 if to_regclass('pipstart_editorial_private.publication_pointer') is null
 or to_regclass('pipstart_editorial_private.refresh_jobs') is null
 or to_regprocedure('public.pipstart_publication_verify_observed(bigint,text,text,integer)') is not null then
  raise exception 'Accepted publication store and unused reconciliation function required';
 end if;
end$$;
create function public.pipstart_publication_verify_observed(p_generation bigint,p_snapshot_sha256 text,p_expected_state text,p_expected_attempts integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare cur bigint; j pipstart_editorial_private.refresh_jobs;
begin
 if p_generation is null or p_generation<1 or p_generation>9007199254740991
 or p_snapshot_sha256 is null or p_snapshot_sha256 !~ '^[0-9a-f]{64}$'
 or p_expected_state is null or p_expected_state not in ('processing','failed')
 or p_expected_attempts is null or p_expected_attempts not between 1 and 20 then
  raise exception using errcode='22023',message='Invalid observed-publication verification';
 end if;
 -- Same pointer-before-refresh order as publication. Publication cannot advance during commit.
 select generation into cur from pipstart_editorial_private.publication_pointer where singleton for share;
 if cur is distinct from p_generation or not exists(select 1 from pipstart_editorial_private.generation_seals
 where generation=p_generation and snapshot_sha256=p_snapshot_sha256) then
  raise exception using errcode='PT409',message='Observed publication changed';
 end if;
 select * into j from pipstart_editorial_private.refresh_jobs where generation=p_generation for update;
 if not found then raise exception using errcode='55000',message='No refresh record to verify';end if;
 if j.attempts<>p_expected_attempts then
  raise exception using errcode='PT409',message='Delivery attempt changed during observation';end if;
 if j.state='verified' then return jsonb_build_object('generation',j.generation,'state',j.state,'attempts',j.attempts);end if;
 if j.state<>p_expected_state then raise exception using errcode='55000',message='Refresh state changed during observation';end if;
 update pipstart_editorial_private.refresh_jobs set state='verified',
 note='Observed live generation, seal and configured groups match. No deployment request sent by this check.',
 updated_at=clock_timestamp() where generation=p_generation returning * into j;
 -- Preserve attempts and the historical scheduler-delivery receipt (including unknown).
 return jsonb_build_object('generation',j.generation,'state',j.state,'attempts',j.attempts);
end$$;
revoke all on function public.pipstart_publication_verify_observed(bigint,text,text,integer) from public,anon,authenticated,service_role,pipstart_publication_scheduler;
grant execute on function public.pipstart_publication_verify_observed(bigint,text,text,integer) to service_role;
commit;