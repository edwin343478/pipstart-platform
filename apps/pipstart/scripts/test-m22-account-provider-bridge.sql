-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Provider AMR updates below are simulated fixtures, not live MFA evidence.
begin;
create function pg_temp.bridge_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Account bridge assertion: %',label; end if; end $$;
create function pg_temp.bridge_denied(command text,expected text default '42501') returns void language plpgsql as $$
begin begin execute command;exception when others then if sqlstate=expected then return;end if;raise exception 'Unexpected bridge SQLSTATE %',sqlstate;end;raise exception 'Expected bridge refusal';end $$;
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
select pg_temp.bridge_ok(not has_function_privilege('anon','public.pipstart_staff_account_receipt(uuid,text,text)','EXECUTE'),'anonymous denied');
select pg_temp.bridge_ok(not has_function_privilege('service_role','public.pipstart_staff_account_receipt(uuid,text,text)','EXECUTE'),'service key cannot mint proof');
select pg_temp.bridge_ok(not has_function_privilege('authenticated','pipstart_staff_private.account_operation_take(uuid,text,text)','EXECUTE'),'user cannot claim provider dispatch');
select pg_temp.bridge_ok(not has_function_privilege('service_role','pipstart_staff_private.account_operation_take(uuid,text,text)','EXECUTE'),'service key alone cannot claim');
set local role authenticated;
select pg_temp.bridge_claim(4);
select pg_temp.bridge_denied($q$select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','dispatch',repeat('a',64))$q$);
select pg_temp.bridge_claim(3);
select pg_temp.bridge_denied($q$select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','dispatch',repeat('a',64))$q$);
select pg_temp.bridge_claim(1,1,'aal1');
select pg_temp.bridge_denied($q$select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','dispatch',repeat('a',64))$q$);
select pg_temp.bridge_claim(1,1);
select pg_temp.bridge_denied($q$select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000002','dispatch',repeat('a',64))$q$);
select pg_temp.bridge_denied($q$select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000003','dispatch',repeat('a',64))$q$);
select pg_temp.bridge_ok(public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','dispatch',repeat('a',64))->>'status'='issued','fresh exact dispatch proof issued');
select pg_temp.bridge_ok(public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','dispatch',repeat('a',64))->>'status'='already_issued','receipt replay idempotent');
select pg_temp.bridge_denied($q$select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','inspect',repeat('b',64))$q$);
select pg_temp.bridge_claim(1,2);
select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','inspect',repeat('b',64));
reset role;
select pg_temp.bridge_denied($q$select pipstart_staff_private.account_operation_take('b1000000-0000-4000-8000-000000000001','dispatch',repeat('b',64))$q$);
select pg_temp.bridge_ok(pipstart_staff_private.account_operation_take('b1000000-0000-4000-8000-000000000001','inspect',repeat('b',64))->>'status'='inspection_authorized','inspection cannot dispatch');
select pg_temp.bridge_ok((select status='prepared' from pipstart_staff_private.account_operations where request_id='b1000000-0000-4000-8000-000000000001'),'inspection leaves journal state');
select pg_temp.bridge_denied($q$select pipstart_staff_private.account_operation_take('b1000000-0000-4000-8000-000000000001','inspect',repeat('b',64))$q$);
select pg_temp.bridge_denied($q$select pipstart_staff_private.account_operation_take('b1000000-0000-4000-8000-000000000001','dispatch',repeat('a',64))$q$);
set local role authenticated;
select pg_temp.bridge_claim(1,3);
select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','dispatch',repeat('c',64));
reset role;
delete from pipstart_staff_private.roles where user_id='a4000000-0000-4000-8000-000000000001' and role_name='owner';
select pg_temp.bridge_denied($q$select pipstart_staff_private.account_operation_take('b1000000-0000-4000-8000-000000000001','dispatch',repeat('c',64))$q$);
insert into pipstart_staff_private.roles values('a4000000-0000-4000-8000-000000000001','owner');
set local role authenticated;
select pg_temp.bridge_claim(1,4);
select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','dispatch',repeat('d',64));
reset role;
update auth.users set banned_until=clock_timestamp()+interval '1 day' where id='a4000000-0000-4000-8000-000000000001';
select pg_temp.bridge_denied($q$select pipstart_staff_private.account_operation_take('b1000000-0000-4000-8000-000000000001','dispatch',repeat('d',64))$q$);
update auth.users set banned_until=null where id='a4000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.bridge_claim(1,5);
select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','dispatch',repeat('e',64));
reset role;
create trigger m22_bridge_append_fault before insert on pipstart_staff_private.account_operation_events for each row execute function pg_temp.bridge_fault();
select pg_temp.bridge_denied($q$select pipstart_staff_private.account_operation_take('b1000000-0000-4000-8000-000000000001','dispatch',repeat('e',64))$q$,'P0001');
select pg_temp.bridge_ok((select consumed_at is null from pipstart_staff_private.receipts where token_hash=sha256(convert_to(repeat('e',64),'UTF8'))),'append failure rolls consumption back');
drop trigger m22_bridge_append_fault on pipstart_staff_private.account_operation_events;
select pg_temp.bridge_ok(pipstart_staff_private.account_operation_take('b1000000-0000-4000-8000-000000000001','dispatch',repeat('e',64))->>'status'='dispatch_authorized','fresh proof consumed with one durable claim');
select pg_temp.bridge_denied($q$select pipstart_staff_private.account_operation_take('b1000000-0000-4000-8000-000000000001','dispatch',repeat('e',64))$q$);
select pipstart_staff_private.account_operation_result(request_id,dispatch_id,'unknown') from pipstart_staff_private.account_operations where request_id='b1000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.bridge_claim(1,6);
select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','inspect',repeat('f',64));
reset role;
select pg_temp.bridge_ok(pipstart_staff_private.account_operation_take('b1000000-0000-4000-8000-000000000001','inspect',repeat('f',64))->>'state'='unknown','unknown inspection preserves state');
select pg_temp.bridge_ok((select status='unknown' from pipstart_staff_private.account_operations where request_id='b1000000-0000-4000-8000-000000000001'),'inspection cannot resolve uncertainty');
select pg_temp.bridge_denied('select pipstart_staff_private.transition(true,0,gen_random_uuid())');
select pipstart_staff_private.account_operation_result(request_id,dispatch_id,'failed') from pipstart_staff_private.account_operations where request_id='b1000000-0000-4000-8000-000000000001';
select pipstart_staff_private.account_operation_cancel('b1000000-0000-4000-8000-000000000002');
select pipstart_staff_private.account_operation_cancel('b1000000-0000-4000-8000-000000000003');
select pipstart_staff_private.transition(true,0,gen_random_uuid());
set local role authenticated;
select pg_temp.bridge_claim(1,7);
select pg_temp.bridge_ok(public.pipstart_staff_access()->>'authorized'='true','ordinary Owner staff access before ban');
reset role;
update auth.users set banned_until=clock_timestamp()+interval '1 day' where id='a4000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.bridge_ok(public.pipstart_staff_access()->>'authorized'='false','provider ban denies old valid staff claims');
reset role;
update auth.users set banned_until=null where id='a4000000-0000-4000-8000-000000000001';
select pipstart_staff_private.transition(false,1,gen_random_uuid());
set local role authenticated;
select pg_temp.bridge_claim(1,8,'aal2',10);
select pg_temp.bridge_denied($q$select public.pipstart_staff_account_receipt('b1000000-0000-4000-8000-000000000001','inspect',repeat('1',64))$q$);
reset role;
rollback;
