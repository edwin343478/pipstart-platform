-- Generated fixtures in a marked disposable database only; all fixture changes roll back.
begin;
create function pg_temp.sc_ok(v boolean,label text) returns void language plpgsql as $$begin if v is distinct from true then raise exception 'Schedule assertion: %',label;end if;end$$;
create function pg_temp.sc_denied(command text,expected text,label text) returns void language plpgsql as $$begin
 begin execute command;exception when others then if sqlstate=expected then return;end if;raise exception 'Schedule % expected % got % (%)',label,expected,sqlstate,sqlerrm;end;
 raise exception 'Schedule % expected refusal %',label,expected;end$$;
create function pg_temp.sc_as(n integer) returns void language plpgsql security definer set search_path='' as $$begin
 perform set_config('request.jwt.claims',jsonb_build_object('sub',('ed800000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
 'session_id',('ed820000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'role','authenticated','aal','aal2')::text,true);end$$;
create function pg_temp.sc_op(n integer) returns uuid language sql immutable as $$select ('ed890000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid$$;
create function pg_temp.sc_due() returns timestamptz language sql stable as $$select date_trunc('minute',now()+interval '2 hours')$$;
create function pg_temp.sc_local() returns text language sql stable as $$select to_char(pg_temp.sc_due() at time zone 'UTC','YYYY-MM-DD"T"HH24:MI')$$;
create function pg_temp.sc_sha(p_id text) returns text language sql security definer set search_path='' as $$select body_sha256 from pipstart_editorial_private.revisions where item_id=p_id and revision_no=1$$;
create function pg_temp.sc_create(n integer,p_item text,p_action text default 'publish',expected bigint default 1) returns jsonb language sql as $$
 select public.pipstart_publication_schedule(pg_temp.sc_op(n),expected,p_action,p_item,case when p_action='publish' then 1 end,
 case when p_action='publish' then pg_temp.sc_sha(p_item) end,pg_temp.sc_local(),'UTC',pg_temp.sc_due(),'Generated schedule')$$;
do $$begin execute format('grant usage on schema %I to anon,authenticated,service_role,pipstart_publication_scheduler',pg_my_temp_schema()::regnamespace::text);end$$;
-- The SQL authority independently rejects DST ambiguity/gaps and forged UTC conversion.
select pg_temp.sc_ok(pipstart_editorial_private.schedule_time('2027-01-15T12:30','Africa/Nairobi','2027-01-15T09:30Z')='2027-01-15T09:30Z','Nairobi exact instant');
select pg_temp.sc_ok(pipstart_editorial_private.schedule_time('2027-01-15T12:30','Asia/Kathmandu','2027-01-15T06:45Z')='2027-01-15T06:45Z','quarter-hour offset');
select pg_temp.sc_denied($q$select pipstart_editorial_private.schedule_time('2027-03-14T02:30','America/New_York','2027-03-14T07:30Z')$q$,'22023','DST gap');
select pg_temp.sc_denied($q$select pipstart_editorial_private.schedule_time('2027-11-07T01:30','America/New_York','2027-11-07T05:30Z')$q$,'22023','DST ambiguity');
select pg_temp.sc_denied($q$select pipstart_editorial_private.schedule_time('2027-10-03T02:15','Australia/Lord_Howe','2027-10-02T15:45Z')$q$,'22023','half-hour DST gap');
select pg_temp.sc_denied($q$select pipstart_editorial_private.schedule_time('2027-04-04T01:45','Australia/Lord_Howe','2027-04-03T14:45Z')$q$,'22023','half-hour DST ambiguity');
select pg_temp.sc_denied($q$select pipstart_editorial_private.schedule_time('2027-02-29T12:00','UTC','2027-02-28T12:00Z')$q$,'22023','invalid calendar');
select pg_temp.sc_denied($q$select pipstart_editorial_private.schedule_time('2027-01-15T12:30','Africa/Nairobi','2027-01-15T12:30Z')$q$,'22023','forged UTC');
select pg_temp.sc_denied($q$select pipstart_editorial_private.schedule_time('2027-01-15T12:30','EST','2027-01-15T17:30Z')$q$,'22023','abbreviation refused');
select pg_temp.sc_denied($q$select pipstart_editorial_private.schedule_time('2027-01-15T12:30','Invalid/Zone','2027-01-15T12:30Z')$q$,'22023','unknown zone');
select pg_temp.sc_ok(not exists(select 1 from pipstart_editorial_private.publication_scheduler_control where enabled),'execution default off');
select pg_temp.sc_ok(not has_function_privilege(r,fn::regprocedure,'EXECUTE'),'private helper '||r||fn) from unnest(array['anon','authenticated','service_role'])r,
 unnest(array['pipstart_editorial_private.schedule_time(text,text,timestamptz)','pipstart_editorial_private.schedule_guard()','pipstart_editorial_private.schedule_result(uuid)'])fn;
select pg_temp.sc_ok(has_function_privilege('authenticated',fn::regprocedure,'EXECUTE') and not has_function_privilege('anon',fn::regprocedure,'EXECUTE') and not has_function_privilege('service_role',fn::regprocedure,'EXECUTE'),'staff-only RPC '||fn)
 from unnest(array['public.pipstart_publication_schedule(uuid,bigint,text,text,integer,text,text,text,timestamptz,text)','public.pipstart_publication_cancel_schedule(uuid,text)','public.pipstart_publication_schedule_status(text)'])fn;
select pg_temp.sc_ok(not has_table_privilege(r,t::regclass,'SELECT,INSERT,UPDATE,DELETE'),'private table '||r||t) from unnest(array['anon','authenticated','service_role'])r,
 unnest(array['pipstart_editorial_private.publication_scheduler_control','pipstart_editorial_private.publication_schedules','pipstart_editorial_private.publication_schedule_events'])t;
update pipstart_staff_private.members set active=false where active;
insert into auth.users(id,raw_user_meta_data) select ('ed800000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'{}' from generate_series(1,4)n;
insert into auth.mfa_factors(id,user_id,factor_type,status) select ('ed810000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('ed800000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp','verified' from generate_series(1,4)n;
insert into auth.sessions(id,user_id,factor_id,aal) select ('ed820000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('ed800000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('ed810000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,4)n;
insert into pipstart_staff_private.members(user_id) select ('ed800000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from generate_series(1,4)n;
insert into pipstart_staff_private.roles values('ed800000-0000-4000-8000-000000000001','owner'),('ed800000-0000-4000-8000-000000000002','editor'),('ed800000-0000-4000-8000-000000000003','author'),('ed800000-0000-4000-8000-000000000004','reviewer');
insert into pipstart_staff_private.assignments(user_id,resource_kind,resource_id) select ('ed800000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'course',id from generate_series(2,4)n,unnest(array['sc-base','sc-new'])id;
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
set local role authenticated;select pg_temp.sc_as(1);
select public.pipstart_editorial_approve_single_person('sc-base',1,(public.pipstart_editorial_create('sc-base','course','forex',null,'{"metadata":{"title":"Restore baseline"}}','fixture'))->>'body_sha256',null);
select public.pipstart_publication_baseline(pg_temp.sc_op(90),'Generated restore baseline');
select public.pipstart_editorial_approve_single_person('sc-new',1,(public.pipstart_editorial_create('sc-new','course','forex',null,'{"metadata":{"title":"New approved course"}}','fixture'))->>'body_sha256',null);
select public.pipstart_editorial_create('sc-draft','course','forex',null,'{"metadata":{"title":"Unapproved draft"}}','fixture');

reset role;
create function pg_temp.sc_enqueue(n integer,p_item text,p_action text default 'publish',actor integer default 1) returns void language plpgsql as $$begin
 insert into pipstart_editorial_private.publication_schedules(id,actor_id,action,item_id,revision_no,body_sha256,base_generation,policy_version,due_at,time_zone,local_input,reason)
 values(pg_temp.sc_op(n),('ed800000-0000-4000-8000-'||lpad(actor::text,12,'0'))::uuid,p_action,p_item,case when p_action='publish' then 1 end,case when p_action='publish' then pg_temp.sc_sha(p_item) end,
 (select generation from pipstart_editorial_private.publication_pointer),(select version from pipstart_editorial_private.policy),date_trunc('minute',now()-interval '1 hour'),'UTC',to_char(now()-interval '1 hour','YYYY-MM-DD"T"HH24:MI'),'Generated due fixture');
 insert into pipstart_editorial_private.publication_schedule_events(schedule_id,actor_id,executor,kind,reason)
 values(pg_temp.sc_op(n),('ed800000-0000-4000-8000-'||lpad(actor::text,12,'0'))::uuid,'staff','scheduled','Generated due fixture');
end$$;
-- No public, user, service or arbitrary private-kernel entry to the executor.
select pg_temp.sc_ok(not rolcanlogin and not rolsuper and not rolbypassrls and not rolcreaterole and not rolcreatedb and not rolinherit,'restricted role') from pg_roles where rolname='pipstart_publication_scheduler';
select pg_temp.sc_ok(not has_function_privilege(r,'pipstart_editorial_private.scheduler_tick()','execute'),'executor ACL '||r) from unnest(array['anon','authenticated','service_role'])r;
select pg_temp.sc_ok(not has_function_privilege('pipstart_publication_scheduler','pipstart_editorial_private.publication_apply(uuid,uuid,text,bigint,text,integer,text,text)','execute'),'worker cannot bypass due queue');
select pg_temp.sc_ok(not has_table_privilege('pipstart_publication_scheduler','auth.users','select,update') and not has_table_privilege('pipstart_publication_scheduler','pipstart_editorial_private.publication_schedules','select,insert,update'),'no direct worker data privileges');
select pg_temp.sc_denied($q$select pipstart_editorial_private.scheduler_tick()$q$,'42501','wrong execution role even trusted direct caller');
set local role pipstart_publication_scheduler;
select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'state'='disabled','default closed');
select pg_temp.sc_ok(not pipstart_editorial_private.scheduler_wake(),'no default-off extension or network access');
select pg_temp.sc_denied($q$select public.pipstart_publication_scheduler_claim()$q$,'42501','no worker service API');reset role;
update pipstart_editorial_private.publication_scheduler_control set enabled=true;
select pg_temp.sc_enqueue(1,'sc-new','publish',3);
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'failed'='1','Author cannot execute publication');reset role;
select pg_temp.sc_ok((select failure_code='revoked' from pipstart_editorial_private.publication_schedules where id=pg_temp.sc_op(1)),'revocation outcome');
select pg_temp.sc_enqueue(2,'sc-new');update pipstart_editorial_private.policy set version=version+1;
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'failed'='1','changed policy refused');reset role;
select pg_temp.sc_ok((select failure_code='approval' from pipstart_editorial_private.publication_schedules where id=pg_temp.sc_op(2)),'policy outcome');
select pg_temp.sc_enqueue(3,'sc-draft');
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'failed'='1','unapproved exact revision refused');reset role;
select pg_temp.sc_enqueue(4,'sc-new');update auth.users set banned_until=now()+interval '1 day' where id='ed800000-0000-4000-8000-000000000001';
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'failed'='1','banned actor refused');reset role;
update auth.users set banned_until=null where id='ed800000-0000-4000-8000-000000000001';
select pg_temp.sc_enqueue(5,'sc-new');update auth.mfa_factors set status='unverified' where user_id='ed800000-0000-4000-8000-000000000001';
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'failed'='1','removed factor refused');reset role;
update auth.mfa_factors set status='verified' where user_id='ed800000-0000-4000-8000-000000000001';
select pg_temp.sc_enqueue(6,'sc-base','withdraw');
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'failed'='1','empty resulting generation refused');reset role;
select pg_temp.sc_enqueue(7,'sc-new','publish',2);delete from pipstart_staff_private.assignments where user_id='ed800000-0000-4000-8000-000000000002' and resource_id='sc-new';
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'failed'='1','removed item assignment refused');reset role;
select pg_temp.sc_ok((select generation from pipstart_editorial_private.publication_pointer)=1,'refusals did not publish');
-- Due authority survives natural human session expiry, but never a removed account/factor/grant.
select pg_temp.sc_enqueue(8,'sc-new');update auth.sessions set not_after=now()-interval '1 minute' where user_id='ed800000-0000-4000-8000-000000000001';
select set_config('request.jwt.claims','{}',true);
set local role pipstart_publication_scheduler;
select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'published'='1','due exact revision executes without human session');
select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'processed'='0','replay does not execute twice');reset role;
select pg_temp.sc_ok((select generation from pipstart_editorial_private.publication_pointer)=2 and (select actor_id='ed800000-0000-4000-8000-000000000001'::uuid and operation_id=pg_temp.sc_op(8) from pipstart_editorial_private.generations where generation=2),'authorizer and stable identity retained');
select pg_temp.sc_ok((select count(*) from pipstart_editorial_private.publication_schedule_events where schedule_id=pg_temp.sc_op(8))=2,'one execution event');
-- Transport stub only, in this rolled-back disposable SQL fixture. No external requests.
set local role pipstart_publication_scheduler;
select pg_temp.sc_denied($q$select pipstart_editorial_private.scheduler_wake()$q$,'P0001','missing wake prerequisites leave generation pending');reset role;
create schema vault;create table vault.decrypted_secrets(name text,decrypted_secret text);
create schema net;create temporary table wake_fixture(url text,body jsonb,headers jsonb,budget integer);
create function net.http_post(url text,body jsonb,params jsonb default '{}',headers jsonb default '{}',timeout_milliseconds integer default 1000) returns bigint language plpgsql as $$begin
 insert into pg_temp.wake_fixture values(url,body,headers,timeout_milliseconds);return 101;end$$;
insert into vault.decrypted_secrets values('pipstart_publication_scheduler_token','short');
set local role pipstart_publication_scheduler;
select pg_temp.sc_denied($q$select pipstart_editorial_private.scheduler_wake()$q$,'P0001','invalid dedicated wake token refused');reset role;
update vault.decrypted_secrets set decrypted_secret='TEST_ONLY_NOT_A_SECRET_012345678901234567890';
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_wake(),'configured pending scheduled generation wakes delivery');reset role;
select pg_temp.sc_ok((select count(*)=1 and bool_and(url='https://pipstart.net/api/internal/publication/scheduled-delivery' and body='{}'::jsonb and budget=8000 and headers->>'Authorization'='Bearer TEST_ONLY_NOT_A_SECRET_012345678901234567890' and headers->>'Content-Type'='application/json') from pg_temp.wake_fixture),'exact fixed wake request and existing timeout');
select pg_temp.sc_ok((select state='pending' and attempts=0 from pipstart_editorial_private.refresh_jobs where generation=2),'wake itself never claims or marks delivery sent');

-- Durable delivery claim: no caller chooses a generation, no automatic uncertain retry.
set local role service_role;
create temporary table claim_fixture as select public.pipstart_publication_scheduler_claim() c;
select pg_temp.sc_ok((select c->>'state'='claimed' from claim_fixture),'scheduled generation claimed');
select pg_temp.sc_ok(public.pipstart_publication_scheduler_claim()->>'state'='idle','second wake cannot resend');
select pg_temp.sc_ok(not public.pipstart_publication_scheduler_finish(2,gen_random_uuid(),false),'wrong claim token refused');
select pg_temp.sc_ok(public.pipstart_publication_scheduler_finish(2,(select (c->>'token')::uuid from claim_fixture),false),'uncertain handoff recorded');
select pg_temp.sc_ok(public.pipstart_publication_scheduler_finish(2,(select (c->>'token')::uuid from claim_fixture),false),'identical finish replay');
select pg_temp.sc_ok(not public.pipstart_publication_scheduler_finish(2,(select (c->>'token')::uuid from claim_fixture),true),'contradictory finish refused');
select pg_temp.sc_ok(public.pipstart_publication_scheduler_claim()->>'state'='idle','failed uncertain request never auto-retried');reset role;
select pg_temp.sc_ok((select state='failed' and attempts=1 from pipstart_editorial_private.refresh_jobs where generation=2),'uncertainty remains visible');
update auth.sessions set not_after=null where user_id='ed800000-0000-4000-8000-000000000001';
set local role authenticated;select pg_temp.sc_as(1);
select public.pipstart_editorial_approve_single_person('sc-other',1,(public.pipstart_editorial_create('sc-other','course','forex',null,'{"metadata":{"title":"Independent course"}}','fixture'))->>'body_sha256',null);reset role;
select pg_temp.sc_enqueue(9,'sc-new','withdraw');
set local role authenticated;select pg_temp.sc_as(1);select public.pipstart_publication_publish(pg_temp.sc_op(190),2,'sc-other',1,pg_temp.sc_sha('sc-other'),'Unrelated manual publication');reset role;
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'published'='1','unrelated publication does not discard schedule');reset role;
select pg_temp.sc_ok((select generation from pipstart_editorial_private.publication_pointer)=4,'independent publication plus withdrawal');
select pg_temp.sc_enqueue(10,'sc-new');
set local role authenticated;select pg_temp.sc_as(1);select public.pipstart_publication_cancel_schedule(pg_temp.sc_op(10),'Cancel before due');reset role;
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'processed'='0','cancelled schedule never publishes');reset role;
select pg_temp.sc_enqueue(11,'sc-new');
set local role authenticated;select pg_temp.sc_as(1);select public.pipstart_publication_publish(pg_temp.sc_op(191),4,'sc-new',1,pg_temp.sc_sha('sc-new'),'Later same-item manual decision');reset role;
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'failed'='1','later same-item decision supersedes due work');reset role;
select pg_temp.sc_ok((select failure_code='superseded' from pipstart_editorial_private.publication_schedules where id=pg_temp.sc_op(11)),'superseded outcome');
select pg_temp.sc_enqueue(12,'sc-new','withdraw');
set local role authenticated;select pg_temp.sc_as(1);select public.pipstart_publication_restore(pg_temp.sc_op(192),5,2,'Later restore decision');reset role;
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'failed'='1','restore supersedes old queue');reset role;
-- A future plan is untouched; batch refuses excess work instead of running without a bound.
set local role authenticated;select pg_temp.sc_as(1);select pg_temp.sc_create(13,'sc-new','withdraw',6);reset role;
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'processed'='0','future job not due');reset role;
do $$begin for n in 1..6 loop
 insert into pipstart_editorial_private.items(id,family,learning_path,created_by) values('sc-cap-'||n,'course','forex','ed800000-0000-4000-8000-000000000001');
 perform pg_temp.sc_enqueue(20+n,'sc-cap-'||n,'withdraw',3);
end loop;end$$;
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'processed'='5','five due requests maximum');reset role;
select pg_temp.sc_ok((select count(*) from pipstart_editorial_private.publication_schedules where state='scheduled' and due_at<=now())=1,'remaining due work stays durable');
update pipstart_editorial_private.publication_scheduler_control set enabled=false;
set local role pipstart_publication_scheduler;select pg_temp.sc_ok(pipstart_editorial_private.scheduler_tick()->>'state'='disabled','pause prevents further work');select pg_temp.sc_ok(not pipstart_editorial_private.scheduler_wake(),'pause suppresses network wake');reset role;
set local role service_role;select pg_temp.sc_ok(public.pipstart_publication_scheduler_claim()->>'state'='disabled','pause blocks delivery claims');reset role;
rollback;
