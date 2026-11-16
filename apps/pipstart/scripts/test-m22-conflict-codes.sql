-- Generated marked disposable database only. All fixture writes roll back.
-- MP11b: deterministic conflicts raise PT409 (HTTP 409 through PostgREST), never 40001,
-- and a refused call changes nothing.
begin;
create function pg_temp.conflict_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Conflict code assertion: %',label; end if; end $$;
create function pg_temp.conflict_code(command text) returns text language plpgsql as $$
begin
 begin execute command;
 exception when others then return sqlstate; end;
 return 'none';
end $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;
grant execute on function pg_temp.conflict_ok(boolean,text),pg_temp.conflict_code(text) to authenticated;

select pg_temp.conflict_ok(position('40001' in pg_get_functiondef('public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)'::regprocedure))=0
 and position('PT409' in pg_get_functiondef('public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)'::regprocedure))>0,'progress raises PT409, not 40001');
select pg_temp.conflict_ok(position('40001' in pg_get_functiondef('pipstart_staff_private.account_operation_claim(uuid)'::regprocedure))=0
 and position('PT409' in pg_get_functiondef('pipstart_staff_private.account_operation_claim(uuid)'::regprocedure))>0,'claim raises PT409, not 40001');
select pg_temp.conflict_ok(has_function_privilege('authenticated','public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)','execute')
 and not has_function_privilege('anon','public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)','execute')
 and not has_function_privilege('service_role','public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)','execute'),'progress grant unchanged: authenticated only');
select pg_temp.conflict_ok(not exists(select 1 from unnest(array['anon','authenticated','service_role']) r
 where has_function_privilege(r,'pipstart_staff_private.account_operation_claim(uuid)','execute')),'claim stays closed to every API role');
select pg_temp.conflict_ok((select prosecdef and provolatile='v' from pg_proc where oid='public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)'::regprocedure),'progress stays security definer and volatile');

-- Learner progress: a stale revision is refused with PT409 and changes nothing.
insert into auth.users(id) values('fd000000-0000-4000-8000-000000000001');
create temporary table conflict_seen(revision bigint,events bigint,complete boolean);
grant all on conflict_seen to authenticated;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"fd000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select set_config('request.jwt.claim.sub','fd000000-0000-4000-8000-000000000001',true);
insert into conflict_seen select revision,0,is_complete from public.pipstart_set_lesson_completion('fd-course','fd-module','fd-lesson',true,null);
reset role;
update conflict_seen set events=(select count(*) from public.pipstart_learning_events where user_id='fd000000-0000-4000-8000-000000000001');
select pg_temp.conflict_ok((select complete and revision>=1 from conflict_seen),'first completion saved');
set local role authenticated;
select pg_temp.conflict_ok(pg_temp.conflict_code(format('select * from public.pipstart_set_lesson_completion(%L,%L,%L,false,%s)','fd-course','fd-module','fd-lesson',(select revision-1 from conflict_seen)))='PT409','stale revision answers PT409');
reset role;
select pg_temp.conflict_ok((select p.revision=s.revision and p.is_complete from public.pipstart_lesson_progress p,conflict_seen s where p.user_id='fd000000-0000-4000-8000-000000000001' and p.lesson_id='fd-lesson'),'refused save leaves the lesson as it was');
select pg_temp.conflict_ok((select count(*) from public.pipstart_learning_events where user_id='fd000000-0000-4000-8000-000000000001' and event_type in ('lesson_completed','lesson_reopened'))=1,'refused save adds no completion event');
set local role authenticated;
select pg_temp.conflict_ok((select not is_complete and revision=(select revision+1 from conflict_seen) from public.pipstart_set_lesson_completion('fd-course','fd-module','fd-lesson',false,(select revision from conflict_seen))),'current revision saves');
reset role;

-- Account journal claim: a staff version change after preparation answers PT409; the request stays prepared.
insert into auth.users(id,raw_user_meta_data) values('fd000000-0000-4000-8000-000000000002','{"display_name":"Conflict fixture"}');
insert into pipstart_staff_private.members(user_id,active) values('fd000000-0000-4000-8000-000000000002',true);
insert into pipstart_staff_private.roles(user_id,role_name) values('fd000000-0000-4000-8000-000000000002','author');
do $$
declare v bigint; j uuid:='fd100000-0000-4000-8000-000000000001';
begin
 select version into v from pipstart_staff_private.control where singleton;
 perform pg_temp.conflict_ok(not (select enabled from pipstart_staff_private.control),'head staff control is paused');
 perform pg_temp.conflict_ok(pipstart_staff_private.account_operation_prepare(j,'fd000000-0000-4000-8000-000000000002','auth_resume',null,null,'access_change',v)->>'status'='prepared','request prepared');
 update pipstart_staff_private.control set version=v+1 where singleton;
 perform pg_temp.conflict_ok(pg_temp.conflict_code(format('select pipstart_staff_private.account_operation_claim(%L)',j))='PT409','version change answers PT409');
 perform pg_temp.conflict_ok((select status='prepared' and dispatch_id is null and revision=1 from pipstart_staff_private.account_operations where request_id=j),'refused claim leaves the request prepared');
 perform pg_temp.conflict_ok((select count(*)=1 from pipstart_staff_private.account_operation_events where request_id=j),'refused claim appends no event');
 update pipstart_staff_private.control set version=v where singleton;
 perform pg_temp.conflict_ok(pipstart_staff_private.account_operation_claim(j)->>'status'='dispatch_authorized','unchanged version still claims');
end $$;
rollback;
