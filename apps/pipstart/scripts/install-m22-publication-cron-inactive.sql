-- Trusted postgres operator only, separately authorized. Installs one INACTIVE job; never activates.
-- Existing extensions and accepted scheduler schema are prerequisites; no credentials or staff changes.
begin;
set local statement_timeout='15s';
set local lock_timeout='2s';
set local search_path='';
do $install$
declare
 staff_before pipstart_staff_private.control;
 scheduler_before pipstart_editorial_private.publication_scheduler_control;
 head bigint;
 installed bigint;
 fixed_command text:=$job$begin;set local role pipstart_publication_scheduler;set local statement_timeout='8s';set local lock_timeout='2s';select pipstart_editorial_private.scheduler_tick();commit;
begin;set local role pipstart_publication_scheduler;set local statement_timeout='8s';set local lock_timeout='2s';select pipstart_editorial_private.scheduler_wake();commit;$job$;
begin
 if current_user<>'postgres' then raise exception using errcode='42501',message='Trusted postgres operator required';end if;
 if not pg_catalog.pg_try_advisory_xact_lock(870022,8083) then raise exception 'Inactive installer already running';end if;
 if pg_catalog.to_regprocedure('cron.schedule(text,text,text)') is null
  or pg_catalog.to_regprocedure('cron.alter_job(bigint,text,text,text,text,boolean)') is null
  or pg_catalog.to_regprocedure('pipstart_editorial_private.scheduler_tick()') is null
  or pg_catalog.to_regprocedure('pipstart_editorial_private.scheduler_wake()') is null then
  raise exception 'Accepted scheduler and existing pg_cron required';end if;
 select * into strict staff_before from pipstart_staff_private.control where singleton for share;
 select * into strict scheduler_before from pipstart_editorial_private.publication_scheduler_control where singleton for share;
 if scheduler_before.enabled is distinct from false then raise exception 'Scheduler must remain paused';end if;
 select generation into strict head from pipstart_editorial_private.publication_pointer where singleton for share;
 lock table pipstart_editorial_private.publication_schedules in share mode;
 if head is null or not exists(select 1 from pipstart_editorial_private.generation_seals s
  join pipstart_editorial_private.refresh_jobs j using(generation) where s.generation=head and j.state='verified') then
  raise exception 'Verified publication head required';end if;
 if exists(select 1 from pipstart_editorial_private.publication_schedules where state='scheduled')
  or exists(select 1 from pipstart_editorial_private.refresh_jobs where state in ('pending','processing','failed'))
  or exists(select 1 from pipstart_editorial_private.publication_scheduler_deliveries where state in ('claimed','unknown')) then
  raise exception 'Queued or unresolved publication work requires review';end if;
 if not exists(select 1 from pg_catalog.pg_roles where rolname='pipstart_publication_scheduler'
  and not rolcanlogin and not rolinherit and not rolsuper and not rolcreatedb and not rolcreaterole and not rolreplication and not rolbypassrls)
  or exists(select 1 from pg_catalog.pg_auth_members m join pg_catalog.pg_roles r on r.oid=m.roleid
   join pg_catalog.pg_roles u on u.oid=m.member where r.rolname='pipstart_publication_scheduler' and u.rolname<>'postgres') then
  raise exception 'Restricted executor role or membership mismatch';end if;
 if not pg_catalog.has_function_privilege('pipstart_publication_scheduler','pipstart_editorial_private.scheduler_tick()','EXECUTE')
  or not pg_catalog.has_function_privilege('pipstart_publication_scheduler','pipstart_editorial_private.scheduler_wake()','EXECUTE')
  or exists(select 1 from unnest(array['anon','authenticated','service_role']) r
    where pg_catalog.has_function_privilege(r,'pipstart_editorial_private.scheduler_tick()','EXECUTE')
     or pg_catalog.has_function_privilege(r,'pipstart_editorial_private.scheduler_wake()','EXECUTE')) then
  raise exception 'Scheduler execution grants mismatch';end if;
 if exists(select 1 from cron.job where jobname='pipstart-publication-minute'
  or command like '%scheduler_tick%' or command like '%scheduler_wake%') then
  raise exception 'Existing publication job refused; review exact definition separately';end if;
 installed:=cron.schedule('pipstart-publication-minute','* * * * *',fixed_command);
 perform cron.alter_job(installed,active:=false);
 if installed is null or not exists(select 1 from cron.job where jobid=installed and jobname='pipstart-publication-minute'
  and schedule='* * * * *' and command=fixed_command and username=current_user
  and database=current_database() and active is false)
  or (select count(*) from cron.job where jobname='pipstart-publication-minute'
   or command like '%scheduler_tick%' or command like '%scheduler_wake%')<>1 then
  raise exception 'Exact inactive Cron postcondition failed';end if;
 if not exists(select 1 from pipstart_staff_private.control c where c.singleton and c.enabled=staff_before.enabled and c.version=staff_before.version)
  or not exists(select 1 from pipstart_editorial_private.publication_scheduler_control c where c.singleton and c.enabled=scheduler_before.enabled and c.version=scheduler_before.version)
  or (select generation from pipstart_editorial_private.publication_pointer where singleton) is distinct from head then
  raise exception 'Control or publication head changed';end if;
end $install$;
commit;
