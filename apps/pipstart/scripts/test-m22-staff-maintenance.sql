-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Provider AMR updates below are simulated fixtures, not live MFA evidence.
begin;
create function pg_temp.bridge_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Account bridge assertion: %',label; end if; end $$;
-- An optional message fragment proves which guard refused, not merely the SQLSTATE.
create function pg_temp.bridge_denied(command text,expected text default '42501',fragment text default null) returns void language plpgsql as $$
begin begin execute command;exception when others then if sqlstate=expected and (fragment is null or strpos(sqlerrm,fragment)>0) then return;end if;raise exception 'Unexpected bridge SQLSTATE % (%)',sqlstate,sqlerrm;end;raise exception 'Expected bridge refusal';end $$;
create function pg_temp.bridge_fault() returns trigger language plpgsql as $$begin raise exception 'Controlled bridge append failure';end $$;
create temp table bridge_clock(t timestamptz);
insert into bridge_clock values(date_trunc('second',clock_timestamp())-interval '120 seconds');
create function pg_temp.bridge_claim(n integer,step integer default 0,assurance text default 'aal2',stamp_offset integer default 0) returns void
language plpgsql security definer set search_path='' as $$
declare u uuid:=('a4000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid;
 s uuid:=('a5000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid;t timestamptz;
begin
 select c.t+step*interval '1 second' into t from pg_temp.bridge_clock c;
 update auth.mfa_amr_claims set updated_at=t where session_id=s and authentication_method='totp';
 perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'session_id',s,'role','authenticated','aal',assurance,'amr',jsonb_build_array(jsonb_build_object('method','totp','timestamp',floor(extract(epoch from t))::bigint+stamp_offset)))::text,true);
end $$;
do $$begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text);end $$;
insert into auth.users(id,raw_user_meta_data)
select ('a4000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,jsonb_build_object('display_name','Bridge fixture','role','owner') from generate_series(1,5)n;
insert into auth.mfa_factors(id,user_id,factor_type,status)
select ('a6000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('a4000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp','verified' from generate_series(1,5)n;
insert into auth.sessions(id,user_id,factor_id,aal)
select ('a5000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('a4000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('a6000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,5)n;
insert into auth.mfa_amr_claims(id,session_id,authentication_method,updated_at)
select ('a7000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('a5000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp',(select t from pg_temp.bridge_clock) from generate_series(1,5)n;
insert into pipstart_staff_private.members(user_id) select ('a4000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from unnest(array[1,2,3,5])n;
insert into pipstart_staff_private.roles values('a4000000-0000-4000-8000-000000000001','owner'),('a4000000-0000-4000-8000-000000000002','author'),('a4000000-0000-4000-8000-000000000003','administrator');
select pipstart_staff_private.account_operation_prepare('b1000000-0000-4000-8000-000000000001','a4000000-0000-4000-8000-000000000002','auth_resume',null,null,'access_change',0);
select pipstart_staff_private.account_operation_prepare('b1000000-0000-4000-8000-000000000002','a4000000-0000-4000-8000-000000000001','auth_resume',null,null,'access_change',0);
select pipstart_staff_private.account_operation_prepare('b1000000-0000-4000-8000-000000000003','a4000000-0000-4000-8000-000000000005','factor_recovery','a6000000-0000-4000-8000-000000000005',null,'owner_recovery',0);

-- SQL-only rolled-back Auth/session fixtures, not real provider acceptance.
select pg_temp.bridge_ok(not has_function_privilege('anon','public.pipstart_staff_maintenance_review(uuid,text,text)','execute'),'anonymous review refused');
select pg_temp.bridge_ok(not has_function_privilege('service_role','public.pipstart_staff_maintenance_claim(uuid,text,text)','execute'),'service cannot mint user permit');
select pg_temp.bridge_ok(not has_function_privilege('authenticated','public.pipstart_staff_maintenance_take(uuid,uuid,text,text)','execute'),'user cannot take service permit');
select pg_temp.bridge_ok(not has_table_privilege('service_role','pipstart_staff_private.maintenance_permits','select'),'service cannot read permit table');
select pg_temp.bridge_ok((select relrowsecurity from pg_class where oid='pipstart_staff_private.maintenance_permits'::regclass),'permit RLS enabled');
create temp table maintenance_test_grants(mode text, grant_data jsonb);
grant select,insert,update on maintenance_test_grants to authenticated,service_role;
set local role authenticated;
select pg_temp.bridge_claim(3,1);
select pg_temp.bridge_denied($q$select public.pipstart_staff_maintenance_review('b1000000-0000-4000-8000-000000000001','dispatch',repeat('a',64))$q$);
-- A delegated Administrator with fresh AAL2 still cannot obtain maintenance evidence.
select pg_temp.bridge_denied($q$select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','dispatch',repeat('d',64))$q$,'42501','Paused Owner authorization required');
select pg_temp.bridge_claim(1,4);
select pg_temp.bridge_denied($q$select public.pipstart_staff_maintenance_review('b1000000-0000-4000-8000-000000000003','dispatch',repeat('e',64))$q$,'42501','Reviewed staff request required');
-- Usable-Owner guard: an Owner target needs another unbanned active Owner at take.
reset role;
select pipstart_staff_private.account_operation_cancel('b1000000-0000-4000-8000-000000000003');
insert into pipstart_staff_private.roles values('a4000000-0000-4000-8000-000000000005','owner');
select pipstart_staff_private.account_operation_prepare('b1000000-0000-4000-8000-000000000005','a4000000-0000-4000-8000-000000000005','auth_suspend',null,clock_timestamp()+interval '1 day','security_response',(select version from pipstart_staff_private.control where singleton));
set local role authenticated;
select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000005','dispatch',repeat('e',64));
insert into maintenance_test_grants values('owner_target',public.pipstart_staff_maintenance_claim('b1000000-0000-4000-8000-000000000005','dispatch',repeat('e',64)));
reset role;
create temp table maintenance_saved_bans as select id,banned_until from auth.users where id in(select user_id from pipstart_staff_private.roles where role_name='owner') and id<>'a4000000-0000-4000-8000-000000000005';
update auth.users set banned_until=clock_timestamp()+interval '1 hour' where id in(select id from maintenance_saved_bans);
set local role service_role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
select pg_temp.bridge_denied($q$select public.pipstart_staff_maintenance_take('b1000000-0000-4000-8000-000000000005',(select (grant_data->>'permit_id')::uuid from maintenance_test_grants where mode='owner_target'),(select grant_data->>'permit' from maintenance_test_grants where mode='owner_target'),repeat('e',64))$q$,'42501','Another usable Owner must remain');
reset role;
update auth.users a set banned_until=s.banned_until from maintenance_saved_bans s where a.id=s.id;
select pg_temp.bridge_ok((select status='prepared' from pipstart_staff_private.account_operations where request_id='b1000000-0000-4000-8000-000000000005'),'guarded Owner suspension not dispatched');
set local role authenticated;
select pg_temp.bridge_claim(1,1);
select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','dispatch',repeat('a',64));
-- Same verified second, but AAL1 or a different session cannot use the proof.
select pg_temp.bridge_claim(1,1,'aal1');
select pg_temp.bridge_denied($q$select public.pipstart_staff_maintenance_review('b1000000-0000-4000-8000-000000000001','dispatch',repeat('a',64))$q$,'42501','Paused bound Owner proof required');
select pg_temp.bridge_claim(1,1);
select set_config('request.jwt.claims',jsonb_set(current_setting('request.jwt.claims')::jsonb,'{session_id}','"a5000000-0000-4000-8000-000000000002"')::text,true);
select pg_temp.bridge_denied($q$select public.pipstart_staff_maintenance_review('b1000000-0000-4000-8000-000000000001','dispatch',repeat('a',64))$q$,'42501','Paused bound Owner proof required');
select pg_temp.bridge_claim(1,1);
select pg_temp.bridge_ok(public.pipstart_staff_maintenance_review('b1000000-0000-4000-8000-000000000001','dispatch',repeat('a',64))->>'status'='reviewed','exact Owner review');
select pg_temp.bridge_denied($q$select public.pipstart_staff_maintenance_claim('b1000000-0000-4000-8000-000000000001','inspect',repeat('a',64))$q$);
insert into maintenance_test_grants values('dispatch',public.pipstart_staff_maintenance_claim('b1000000-0000-4000-8000-000000000001','dispatch',repeat('a',64)));
select pg_temp.bridge_denied($q$select public.pipstart_staff_maintenance_claim('b1000000-0000-4000-8000-000000000001','dispatch',repeat('a',64))$q$,'42501','Maintenance proof already claimed');
reset role;
select pg_temp.bridge_ok((select status='prepared' from pipstart_staff_private.account_operations where request_id='b1000000-0000-4000-8000-000000000001'),'permit mint does not dispatch');
update pipstart_staff_private.members set active=false where user_id='a4000000-0000-4000-8000-000000000001';
set local role service_role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
select pg_temp.bridge_denied($q$select public.pipstart_staff_maintenance_take('b1000000-0000-4000-8000-000000000001',(select (grant_data->>'permit_id')::uuid from maintenance_test_grants where mode='dispatch'),(select grant_data->>'permit' from maintenance_test_grants where mode='dispatch'),repeat('a',64))$q$);
reset role;
update pipstart_staff_private.members set active=true where user_id='a4000000-0000-4000-8000-000000000001';
set local role service_role;
select pg_temp.bridge_denied($q$select public.pipstart_staff_maintenance_take('b1000000-0000-4000-8000-000000000001',(select (grant_data->>'permit_id')::uuid from maintenance_test_grants where mode='dispatch'),repeat('c',64),repeat('a',64))$q$);
-- A control-version change after the permit was minted invalidates it.
reset role;
update pipstart_staff_private.control set version=version+1 where singleton;
set local role service_role;
select pg_temp.bridge_denied($q$select public.pipstart_staff_maintenance_take('b1000000-0000-4000-8000-000000000001',(select (grant_data->>'permit_id')::uuid from maintenance_test_grants where mode='dispatch'),(select grant_data->>'permit' from maintenance_test_grants where mode='dispatch'),repeat('a',64))$q$,'42501','Bound maintenance service permit required');
reset role;
update pipstart_staff_private.control set version=version-1 where singleton;
set local role service_role;
update maintenance_test_grants set grant_data=grant_data||jsonb_build_object('execution',public.pipstart_staff_maintenance_take('b1000000-0000-4000-8000-000000000001',(select (grant_data->>'permit_id')::uuid from maintenance_test_grants where mode='dispatch'),(select grant_data->>'permit' from maintenance_test_grants where mode='dispatch'),repeat('a',64))) where mode='dispatch';
select pg_temp.bridge_ok((select grant_data->'execution'->>'status'='dispatch_authorized' from maintenance_test_grants where mode='dispatch'),'one exact dispatch');
select pg_temp.bridge_denied($q$select public.pipstart_staff_maintenance_take('b1000000-0000-4000-8000-000000000001',(select (grant_data->>'permit_id')::uuid from maintenance_test_grants where mode='dispatch'),(select grant_data->>'permit' from maintenance_test_grants where mode='dispatch'),repeat('a',64))$q$);
reset role;
select pg_temp.bridge_ok((select consumed_at is not null and dispatch_id is not null from pipstart_staff_private.maintenance_permits where id=(select (grant_data->>'permit_id')::uuid from maintenance_test_grants where mode='dispatch')),'permit consumed atomically');
select pg_temp.bridge_ok((select consumed_at is null from pipstart_staff_private.maintenance_permits where id=(select (grant_data->>'permit_id')::uuid from maintenance_test_grants where mode='owner_target')),'refused Owner-target permit stays unconsumed');
select pg_temp.bridge_denied($q$update pipstart_staff_private.maintenance_permits set consumed_at=null where id=(select (grant_data->>'permit_id')::uuid from maintenance_test_grants where mode='dispatch')$q$,'42501','Immutable one-use maintenance permit');
select pg_temp.bridge_denied($q$delete from pipstart_staff_private.maintenance_permits where id=(select (grant_data->>'permit_id')::uuid from maintenance_test_grants where mode='dispatch')$q$,'42501','append-only');
set local role service_role;
select pg_temp.bridge_ok(public.pipstart_staff_maintenance_result('b1000000-0000-4000-8000-000000000001',(select (grant_data->>'permit_id')::uuid from maintenance_test_grants where mode='dispatch'),(select grant_data->>'permit' from maintenance_test_grants where mode='dispatch'),(select (grant_data->'execution'->>'dispatch_id')::uuid from maintenance_test_grants where mode='dispatch'),'unknown')->>'state'='unknown','uncertain result recorded');
reset role;
set local role authenticated;
select pg_temp.bridge_claim(1,2);
select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','inspect',repeat('b',64));
insert into maintenance_test_grants values('inspect',public.pipstart_staff_maintenance_claim('b1000000-0000-4000-8000-000000000001','inspect',repeat('b',64)));
reset role;
set local role service_role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
select pg_temp.bridge_ok(public.pipstart_staff_maintenance_take('b1000000-0000-4000-8000-000000000001',(select (grant_data->>'permit_id')::uuid from maintenance_test_grants where mode='inspect'),(select grant_data->>'permit' from maintenance_test_grants where mode='inspect'),repeat('b',64))->>'status'='inspection_authorized','separate fresh inspection');
reset role;
select pg_temp.bridge_ok((select status='unknown' from pipstart_staff_private.account_operations where request_id='b1000000-0000-4000-8000-000000000001'),'inspection cannot resolve uncertainty');
select pipstart_staff_private.account_operation_prepare('b1000000-0000-4000-8000-000000000004','a4000000-0000-4000-8000-000000000003','auth_suspend',null,clock_timestamp()+interval '1 day','security_response',0);
set local role authenticated;
select pg_temp.bridge_claim(1,3);
select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000004','dispatch',repeat('c',64));
insert into maintenance_test_grants values('second',public.pipstart_staff_maintenance_claim('b1000000-0000-4000-8000-000000000004','dispatch',repeat('c',64)));
reset role;
set local role service_role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
select pg_temp.bridge_denied($q$select public.pipstart_staff_maintenance_take('b1000000-0000-4000-8000-000000000004',(select (grant_data->>'permit_id')::uuid from maintenance_test_grants where mode='second'),(select grant_data->>'permit' from maintenance_test_grants where mode='second'),repeat('c',64))$q$,'42501','Resolve outstanding staff dispatch first');
reset role;
select pg_temp.bridge_ok((select status='prepared' from pipstart_staff_private.account_operations where request_id='b1000000-0000-4000-8000-000000000004'),'uncertainty blocks another suspension');
select pg_temp.bridge_ok((select not enabled from pipstart_staff_private.control where singleton),'staff remains paused');
rollback;
