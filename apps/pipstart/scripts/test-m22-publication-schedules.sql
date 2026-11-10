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
do $$begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text);end$$;
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
select pg_temp.sc_ok(pg_temp.sc_create(1,'sc-new')->>'state'='scheduled','approved revision scheduled');
select pg_temp.sc_ok(pg_temp.sc_create(1,'sc-new')->>'id'=pg_temp.sc_op(1)::text,'same identity replay');
select pg_temp.sc_denied($q$select public.pipstart_publication_schedule(pg_temp.sc_op(1),1,'publish','sc-new',1,pg_temp.sc_sha('sc-new'),pg_temp.sc_local(),'UTC',pg_temp.sc_due(),'Different reason')$q$,'22023','identity collision');
select pg_temp.sc_denied($q$select pg_temp.sc_create(2,'sc-new')$q$,'55000','one pending schedule per item');
select pg_temp.sc_denied($q$select pg_temp.sc_create(3,'sc-draft')$q$,'55000','approval required');
select pg_temp.sc_denied($q$select pg_temp.sc_create(4,'sc-new','publish',9)$q$,'PT409','stale generation');
select pg_temp.sc_denied($q$select public.pipstart_publication_schedule(pg_temp.sc_op(5),1,'publish','sc-new',1,repeat('a',64),pg_temp.sc_local(),'UTC',pg_temp.sc_due(),'Fixture')$q$,'PT409','wrong revision hash');
select pg_temp.sc_denied($q$select public.pipstart_publication_schedule(pg_temp.sc_op(6),1,'publish','sc-new',1,pg_temp.sc_sha('sc-new'),to_char(date_trunc('minute',now()-interval '1 hour') at time zone 'UTC','YYYY-MM-DD"T"HH24:MI'),'UTC',date_trunc('minute',now()-interval '1 hour'),'Fixture')$q$,'22023','past due time');
select pg_temp.sc_denied($q$select public.pipstart_publication_schedule(pg_temp.sc_op(7),1,'publish','sc-new',1,pg_temp.sc_sha('sc-new'),to_char(date_trunc('minute',now()+interval '367 days') at time zone 'UTC','YYYY-MM-DD"T"HH24:MI'),'UTC',date_trunc('minute',now()+interval '367 days'),'Fixture')$q$,'22023','due horizon');
select pg_temp.sc_ok(pg_temp.sc_create(8,'sc-base','withdraw')->>'state'='scheduled','published item withdrawal scheduled');
select pg_temp.sc_as(3);select pg_temp.sc_denied($q$select pg_temp.sc_create(9,'sc-base','withdraw')$q$,'42501','Author cannot schedule');
select pg_temp.sc_denied($q$select public.pipstart_publication_cancel_schedule(pg_temp.sc_op(1),'cancel')$q$,'42501','Author cannot cancel');
select pg_temp.sc_as(4);select pg_temp.sc_ok(jsonb_array_length(public.pipstart_publication_schedule_status('sc-new')->'schedules')=1,'assigned Reviewer can read');
select pg_temp.sc_denied($q$select public.pipstart_publication_cancel_schedule(pg_temp.sc_op(1),'cancel')$q$,'42501','Reviewer cannot cancel');
select pg_temp.sc_as(2);select pg_temp.sc_ok(public.pipstart_publication_cancel_schedule(pg_temp.sc_op(1),'Cancel planned change')->>'state'='cancelled','assigned Editor cancel');
select pg_temp.sc_ok(public.pipstart_publication_cancel_schedule(pg_temp.sc_op(1),'Repeated cancel')->>'state'='cancelled','cancel replay');
reset role;
select pg_temp.sc_ok((select count(*) from pipstart_editorial_private.publication_schedules)=2 and (select count(*) from pipstart_editorial_private.publication_schedule_events)=3,'exact schedule and immutable event counts');
select pg_temp.sc_ok((select generation from pipstart_editorial_private.publication_pointer)=1 and (select count(*) from pipstart_editorial_private.generations)=1 and (select count(*) from pipstart_editorial_private.refresh_jobs)=1,'scheduling and cancellation never publish or request delivery');
select pg_temp.sc_ok(not exists(select 1 from pipstart_editorial_private.publication_scheduler_control where enabled),'execution stays disabled');
select pg_temp.sc_denied($q$update pipstart_editorial_private.publication_schedules set reason='changed' where id=pg_temp.sc_op(1)$q$,'42501','immutable request');
select pg_temp.sc_denied($q$delete from pipstart_editorial_private.publication_schedules where id=pg_temp.sc_op(1)$q$,'42501','no schedule deletion');
select pg_temp.sc_denied($q$update pipstart_editorial_private.publication_schedules set state='scheduled',completed_at=null where id=pg_temp.sc_op(1)$q$,'42501','terminal request cannot reopen');
select pg_temp.sc_denied($q$update pipstart_editorial_private.publication_schedule_events set reason='changed'$q$,'42501','immutable event');
select pg_temp.sc_denied($q$delete from pipstart_editorial_private.publication_schedule_events$q$,'42501','no event deletion');
delete from pipstart_staff_private.assignments where user_id='ed800000-0000-4000-8000-000000000002' and resource_id='sc-new';
set local role authenticated;select pg_temp.sc_as(2);select pg_temp.sc_denied($q$select public.pipstart_publication_schedule_status('sc-new')$q$,'42501','assignment revocation');
reset role;
update auth.users set banned_until=clock_timestamp()+interval '1 hour' where id='ed800000-0000-4000-8000-000000000001';
set local role authenticated;select pg_temp.sc_as(1);select pg_temp.sc_denied($q$select public.pipstart_publication_schedule_status('sc-new')$q$,'42501','banned authorizer refused');
reset role;update auth.users set banned_until=null where id='ed800000-0000-4000-8000-000000000001';
set local role authenticated;select pg_temp.sc_as(1);select public.pipstart_publication_cancel_schedule(pg_temp.sc_op(8),'Cancel withdrawal');
do $$begin for n in 20..31 loop perform pg_temp.sc_create(n,'sc-new');perform public.pipstart_publication_cancel_schedule(pg_temp.sc_op(n),'Bounded history fixture');end loop;end$$;
select pg_temp.sc_ok(jsonb_array_length(public.pipstart_publication_schedule_status('sc-new')->'schedules')=10,'status limited to ten recent schedules');
select pg_temp.sc_ok(not (public.pipstart_publication_schedule_status('sc-new')::text like '%actor_id%'),'status omits actor identity');
select pg_temp.sc_ok(public.pipstart_publication_schedule_status('sc-new')->>'execution_enabled'='false','status reports inactive execution');
-- Generated restore drill: new generation copies a sealed earlier set, then refuses a trashed set.
select pg_temp.sc_ok((public.pipstart_publication_publish(pg_temp.sc_op(91),1,'sc-new',1,pg_temp.sc_sha('sc-new'),'Generated drill publish'))->>'generation'='2','drill publishes exact revision');
select pg_temp.sc_ok((public.pipstart_publication_withdraw(pg_temp.sc_op(92),2,'sc-new','Generated drill withdrawal'))->>'generation'='3','drill withdrawal');
select pg_temp.sc_ok((public.pipstart_publication_restore(pg_temp.sc_op(93),3,2,'Generated drill restore'))->>'generation'='4','restore creates a new generation');
reset role;
select pg_temp.sc_ok((select jsonb_agg(item_id||':'||revision_no||':'||body_sha256 order by item_id) from pipstart_editorial_private.generation_entries where generation=4)
 =(select jsonb_agg(item_id||':'||revision_no||':'||body_sha256 order by item_id) from pipstart_editorial_private.generation_entries where generation=2),'restored entries equal earlier sealed set');
select pg_temp.sc_ok((select from_generation=2 and previous_generation=3 and kind='restore' from pipstart_editorial_private.generations where generation=4),'restore lineage retained');
set local role service_role;select pg_temp.sc_ok(public.pipstart_publication_snapshot()->>'generation'='4','restored build snapshot seal verifies');reset role;
set local role authenticated;select pg_temp.sc_as(1);select public.pipstart_publication_withdraw(pg_temp.sc_op(94),4,'sc-new','Withdraw before trash');select public.pipstart_editorial_trash('sc-new','Generated drill trash');
select pg_temp.sc_denied($q$select public.pipstart_publication_restore(pg_temp.sc_op(95),5,4,'Refused restore fixture')$q$,'55000','restore refuses trashed content');
reset role;select pg_temp.sc_ok((select generation from pipstart_editorial_private.publication_pointer)=5 and (select count(*) from pipstart_editorial_private.generations)=5,'refused restore never moves pointer or creates history');
rollback;
