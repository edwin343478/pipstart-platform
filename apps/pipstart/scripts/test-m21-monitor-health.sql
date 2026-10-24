-- Empty generated disposable database only. All behavioral fixtures roll back.
begin;
create function pg_temp.assert(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Monitor health assertion: %',label;end if;end $$;
select pg_temp.assert(public.pipstart_email_monitor_health()='{"manual_alerts":0,"overdue_alerts":0,"stale_runs":0}'::jsonb,'idle is not evidence of ingestion failure');
select pg_temp.assert(has_function_privilege('service_role','public.pipstart_email_monitor_health()','EXECUTE'),'service executes');
select pg_temp.assert(not has_function_privilege('anon','public.pipstart_email_monitor_health()','EXECUTE') and not has_function_privilege('authenticated','public.pipstart_email_monitor_health()','EXECUTE'),'learners cannot read operational counts');
select pg_temp.assert((select prosecdef and provolatile='s' and proconfig=array['search_path=""'] from pg_proc where oid='public.pipstart_email_monitor_health()'::regprocedure),'stable definer with empty search path');
do $$declare before_rows jsonb;after_rows jsonb;h jsonb;j uuid;begin
 insert into public.pipstart_email_monitor_sweeps(started_at) values(now()-interval '10 minutes') returning id into j;
 perform pg_temp.assert((select manual_alerts is null and overdue_alerts is null and stale_runs is null from public.pipstart_email_monitor_sweeps where id=j),'old-client/historical counts remain unassessed');
 insert into public.pipstart_email_monitor_sweeps(started_at,status) values(now()-interval '9 minutes','running'),(now()-interval '1 day','partial'),(now()-interval '1 day','completed');
 insert into public.pipstart_account_email_alerts(message_id,event_type,created_at,first_attempt_at,lease_until)
 values('health-manual','email.bounced',now()-interval '2 days',now()-interval '23 hours 1 second',now()+interval '1 minute'),
 ('health-overdue','email.failed',now()-interval '15 minutes',null,null),
 ('health-exact-retry-boundary','email.failed',now(),now()-interval '23 hours',null),
 ('health-fresh','email.failed',now(),null,now()+interval '1 minute');
 insert into public.pipstart_account_email_alerts(message_id,event_type,created_at,first_attempt_at,accepted_at)
 values('health-accepted','email.bounced',now()-interval '2 days',now()-interval '2 days',now());
 insert into public.pipstart_account_email_alerts(message_id,event_type,created_at,first_attempt_at,resolved_at)
 values('health-resolved','email.delivery_missing',now()-interval '2 days',now()-interval '2 days',now());
 before_rows:=jsonb_build_object('alerts',(select jsonb_agg(to_jsonb(a) order by message_id,event_type) from public.pipstart_account_email_alerts a),'sweeps',(select jsonb_agg(to_jsonb(s) order by id) from public.pipstart_email_monitor_sweeps s));
 h:=public.pipstart_email_monitor_health();
 perform pg_temp.assert(h='{"manual_alerts":1,"overdue_alerts":2,"stale_runs":1}'::jsonb,'age boundaries and unresolved-only counts, including live leases');
 perform pg_temp.assert(public.pipstart_email_monitor_health()=h,'repeat read is stable');
 after_rows:=jsonb_build_object('alerts',(select jsonb_agg(to_jsonb(a) order by message_id,event_type) from public.pipstart_account_email_alerts a),'sweeps',(select jsonb_agg(to_jsonb(s) order by id) from public.pipstart_email_monitor_sweeps s));
 perform pg_temp.assert(before_rows=after_rows,'health neither acknowledges, unlocks, resolves nor deletes evidence');
 perform pg_temp.assert((select status='running' from public.pipstart_email_monitor_sweeps where id=j),'stale run preserved for review');
 update public.pipstart_email_monitor_sweeps set status='partial',finished_at=now() where id=j;
 update public.pipstart_account_email_alerts set accepted_at=now() where message_id in ('health-manual','health-overdue');
 perform pg_temp.assert(public.pipstart_email_monitor_health()='{"manual_alerts":0,"overdue_alerts":0,"stale_runs":0}'::jsonb,'healthy only after explicit fixture acknowledgment');
 update public.pipstart_email_monitor_sweeps set manual_alerts=0,overdue_alerts=0,stale_runs=0 where id=j;
 begin update public.pipstart_email_monitor_sweeps set manual_alerts=-1 where id=j;raise exception 'Negative health count accepted';exception when check_violation then null;end;
end $$;
rollback;
