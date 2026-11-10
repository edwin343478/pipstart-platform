-- Trusted operator only, separately authorized after c3 hosted review. Never an activation script.
-- pg_cron must already be installed in this database. Do not create/enable extensions here.
begin;
do $$begin
 if to_regprocedure('cron.schedule(text,text,text)') is null or to_regprocedure('cron.alter_job(bigint,text,text,text,text,boolean)') is null
  or to_regprocedure('pipstart_editorial_private.scheduler_tick()') is null
  or exists(select 1 from pipstart_editorial_private.publication_scheduler_control where enabled)
  or exists(select 1 from pipstart_staff_private.control where enabled) then raise exception 'Accepted paused scheduler and pg_cron required';end if;
 if exists(select 1 from cron.job where jobname='pipstart-publication-minute') then raise exception 'Existing job refused: review its exact definition separately';end if;
end$$;
-- Publication commits before an independently failing wake, so network/setup errors never undo it.
select cron.schedule('pipstart-publication-minute','* * * * *',
$job$begin;set local role pipstart_publication_scheduler;set local statement_timeout='8s';set local lock_timeout='2s';select pipstart_editorial_private.scheduler_tick();commit;
begin;set local role pipstart_publication_scheduler;set local statement_timeout='8s';set local lock_timeout='2s';select pipstart_editorial_private.scheduler_wake();commit;$job$);
select cron.alter_job((select jobid from cron.job where jobname='pipstart-publication-minute'),active:=false);
do $$begin
 if not exists(select 1 from cron.job where jobname='pipstart-publication-minute' and not active and schedule='* * * * *' and username=current_user and database=current_database()) then raise exception 'Inactive Cron postcondition failed';end if;
end$$;
commit;
