-- Generated marked disposable database only. All fixture writes roll back.
-- Operator journal tests: not a user-context/MFA/provider-execution proof.
begin;
create function pg_temp.journal_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Account journal assertion: %',label; end if; end $$;
create function pg_temp.journal_denied(command text,expected text default '42501') returns void language plpgsql as $$
begin
 begin execute command;
 exception when others then if sqlstate=expected then return; end if; raise exception 'Unexpected journal SQLSTATE %',sqlstate; end;
 raise exception 'Expected account journal refusal';
end $$;
create function pg_temp.journal_fault() returns trigger language plpgsql as $$
begin raise exception 'Controlled journal append failure'; end $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;
insert into auth.users(id,raw_user_meta_data)
select ('91000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,jsonb_build_object('display_name','Journal fixture') from generate_series(1,4)n;
insert into pipstart_staff_private.members(user_id,active) values
 ('91000000-0000-4000-8000-000000000001',true),('91000000-0000-4000-8000-000000000002',true),('91000000-0000-4000-8000-000000000003',false);
insert into pipstart_staff_private.roles(user_id,role_name) values
 ('91000000-0000-4000-8000-000000000001','owner'),('91000000-0000-4000-8000-000000000002','author');
insert into auth.mfa_factors(id,user_id,factor_type,status) values
 ('92000000-0000-4000-8000-000000000002','91000000-0000-4000-8000-000000000002','totp','verified');
select pg_temp.journal_ok(not (select enabled from pipstart_staff_private.control),'head remains disabled');
select pg_temp.journal_ok(not exists(
 select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace cross join unnest(array['anon','authenticated','service_role']) r
 where n.nspname='pipstart_staff_private' and p.proname like 'account_operation_%' and has_function_privilege(r,p.oid,'EXECUTE')
),'no API role may execute journal primitives');
select pg_temp.journal_ok(not exists(
 select 1 from unnest(array['anon','authenticated','service_role']) r
 where has_table_privilege(r,'pipstart_staff_private.account_operations','SELECT')
  or has_table_privilege(r,'pipstart_staff_private.account_operations','INSERT')
  or has_table_privilege(r,'pipstart_staff_private.account_operations','UPDATE')
  or has_table_privilege(r,'pipstart_staff_private.account_operation_events','SELECT')
  or has_schema_privilege(r,'pipstart_staff_private','USAGE')
),'no raw API journal access');
set local role anon;
select pg_temp.journal_denied('select pipstart_staff_private.account_operation_claim(gen_random_uuid())');
reset role;
set local role authenticated;
select pg_temp.journal_denied('select pipstart_staff_private.account_operation_claim(gen_random_uuid())');
reset role;
set local role service_role;
select pg_temp.journal_denied('select pipstart_staff_private.account_operation_claim(gen_random_uuid())');
reset role;
do $$
declare own uuid:='91000000-0000-4000-8000-000000000001'; staff uuid:='91000000-0000-4000-8000-000000000002';
 former uuid:='91000000-0000-4000-8000-000000000003'; learner uuid:='91000000-0000-4000-8000-000000000004';
 factor uuid:='92000000-0000-4000-8000-000000000002'; j uuid:=gen_random_uuid(); other uuid:=gen_random_uuid();
 expiry timestamptz:=clock_timestamp()+interval '1 day'; r jsonb; d uuid; past timestamptz;
begin
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_prepare(%L,%L,%L,null,null,%L,0)',j,learner,'auth_resume','access_change'));
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_prepare(%L,%L,%L,null,null,%L,0)',j,staff,'grant_owner','access_change'),'22023');
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_prepare(%L,%L,%L,null,null,%L,0)',j,staff,'factor_recovery','owner_recovery'),'22023');
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_prepare(%L,%L,%L,%L,null,%L,0)',j,own,'factor_recovery',factor,'owner_recovery'));
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_prepare(%L,%L,%L,null,%L,%L,0)',j,own,'auth_suspend',expiry,'security_response'));
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_prepare(%L,%L,%L,null,null,%L,0)',j,staff,'staff_retirement','staff_retirement'));
 r:=pipstart_staff_private.account_operation_prepare(j,former,'staff_retirement',null,null,'staff_retirement',0);
 perform pg_temp.journal_ok(r->>'status'='prepared','inactive no-access retirement intent');
 perform pipstart_staff_private.account_operation_cancel(j);
 perform pg_temp.journal_ok(pipstart_staff_private.account_operation_cancel(j)->>'status'='already_recorded','cancel idempotent');
 j:=gen_random_uuid();
 perform pipstart_staff_private.account_operation_prepare(j,staff,'auth_resume',null,null,'access_change',0);
 perform pg_temp.journal_ok(pipstart_staff_private.account_operation_prepare(j,staff,'auth_resume',null,null,'access_change',0)->>'status'='already_recorded','exact request replay is readback');
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_prepare(%L,%L,%L,null,null,%L,0)',j,former,'auth_resume','access_change'),'22023');
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_prepare(%L,%L,%L,null,null,%L,0)',other,staff,'auth_resume','access_change'));
 perform pg_temp.journal_denied(format('select pipstart_staff_private.transition(true,0,%L)',gen_random_uuid()));
 perform pg_temp.journal_ok((select count(*)=1 from pipstart_staff_private.account_operation_events where request_id=j),'prepare replay appends no event');
 perform pg_temp.journal_denied(format('update pipstart_staff_private.account_operations set target_id=%L,status=%L,revision=revision+1 where request_id=%L',former,'cancelled',j));
 execute 'create trigger m22_journal_controlled_fault before insert on pipstart_staff_private.account_operation_events for each row execute function pg_temp.journal_fault()';
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_prepare(%L,%L,%L,null,null,%L,0)',other,former,'auth_resume','access_change'),'P0001');
 perform pg_temp.journal_ok(not exists(select 1 from pipstart_staff_private.account_operations where request_id=other),'prepare append failure leaves no intent');
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_claim(%L)',j),'P0001');
 perform pg_temp.journal_ok((select status='prepared' and revision=1 and dispatch_id is null from pipstart_staff_private.account_operations where request_id=j),'claim append failure rolls permit back');
 execute 'drop trigger m22_journal_controlled_fault on pipstart_staff_private.account_operation_events';
 r:=pipstart_staff_private.account_operation_claim(j); d:=(r->>'dispatch_id')::uuid;
 perform pg_temp.journal_ok(r->>'status'='dispatch_authorized' and d is not null and r->>'target_id'=staff::text,'first claim binds exact dispatch');
 r:=pipstart_staff_private.account_operation_claim(j);
 perform pg_temp.journal_ok(r->>'status'='not_dispatchable' and not (r?'dispatch_id') and not (r?'target_id'),'repeat claim has no executable permit');
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_cancel(%L)',j));
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_result(%L,%L,%L)',j,gen_random_uuid(),'succeeded'),'22023');
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_result(%L,%L,%L)',j,d,'observed_desired'));
 execute 'create trigger m22_journal_controlled_fault before insert on pipstart_staff_private.account_operation_events for each row execute function pg_temp.journal_fault()';
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_result(%L,%L,%L)',j,d,'unknown'),'P0001');
 perform pg_temp.journal_ok((select status='dispatched' and revision=2 from pipstart_staff_private.account_operations where request_id=j),'audit append failure rolls status back');
 perform pg_temp.journal_ok((select count(*)=2 from pipstart_staff_private.account_operation_events where request_id=j),'audit append failure adds no event');
 execute 'drop trigger m22_journal_controlled_fault on pipstart_staff_private.account_operation_events';
 perform pipstart_staff_private.account_operation_result(j,d,'unknown');
 perform pg_temp.journal_ok(pipstart_staff_private.account_operation_result(j,d,'unknown')->>'status'='already_recorded','unknown replay idempotent');
 perform pg_temp.journal_denied(format('select pipstart_staff_private.transition(true,0,%L)',gen_random_uuid()));
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_cancel(%L)',j));
 perform pipstart_staff_private.account_operation_result(j,d,'observed_other');
 perform pg_temp.journal_ok(pipstart_staff_private.account_operation_result(j,d,'observed_other')->>'status'='already_recorded','observed state replay');
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_result(%L,%L,%L)',j,d,'succeeded'));
 perform pg_temp.journal_ok(pipstart_staff_private.account_operation_claim(j)->>'status'='not_dispatchable','resolved work cannot dispatch again');
 perform pg_temp.journal_denied(format('update pipstart_staff_private.account_operations set target_id=%L where request_id=%L',former,j));
 perform pg_temp.journal_denied(format('delete from pipstart_staff_private.account_operations where request_id=%L',j));
 perform pg_temp.journal_denied(format('update pipstart_staff_private.account_operation_events set status=%L where request_id=%L','failed',j));
 perform pg_temp.journal_denied(format('delete from pipstart_staff_private.account_operation_events where request_id=%L',j));
 -- Expiry fixture is inserted by the trusted SQL test owner; production callers
 -- receive no raw write grant and cannot alter the expiry of a prepared intent.
 j:=gen_random_uuid();
 past:=clock_timestamp()-interval '10 minutes';
 insert into pipstart_staff_private.account_operations(request_id,target_id,operation,reason_code,control_version,created_at,expires_at)
 values(j,staff,'auth_resume','access_change',0,past,past+interval '5 minutes');
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_claim(%L)',j));
 perform pipstart_staff_private.account_operation_cancel(j);
 j:=gen_random_uuid();
 perform pipstart_staff_private.account_operation_prepare(j,staff,'auth_resume',null,null,'access_change',0);
 update pipstart_staff_private.control set version=1 where singleton;
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_claim(%L)',j),'40001');
 perform pipstart_staff_private.account_operation_cancel(j);
 update pipstart_staff_private.control set version=0 where singleton;
 j:=gen_random_uuid();
 perform pipstart_staff_private.account_operation_prepare(j,staff,'factor_recovery',factor,null,'owner_recovery',0);
 update auth.mfa_factors set status='unverified' where id=factor;
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_claim(%L)',j));
 perform pipstart_staff_private.account_operation_cancel(j);
 update auth.mfa_factors set status='verified' where id=factor;
 insert into pipstart_staff_private.roles(user_id,role_name) values(staff,'owner');
 j:=gen_random_uuid();
 perform pipstart_staff_private.account_operation_prepare(j,own,'auth_suspend',null,expiry,'security_response',0);
 delete from pipstart_staff_private.roles where user_id=staff and role_name='owner';
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_claim(%L)',j));
 perform pipstart_staff_private.account_operation_cancel(j);
 j:=gen_random_uuid();
 perform pipstart_staff_private.account_operation_prepare(j,staff,'auth_resume',null,null,'access_change',0);
 r:=pipstart_staff_private.account_operation_claim(j);d:=(r->>'dispatch_id')::uuid;
 perform pipstart_staff_private.account_operation_result(j,d,'succeeded');
 perform pg_temp.journal_ok(pipstart_staff_private.account_operation_result(j,d,'succeeded')->>'status'='already_recorded','confirmed result idempotent');
 perform pg_temp.journal_denied(format('select pipstart_staff_private.account_operation_result(%L,%L,%L)',j,d,'failed'));
 j:=gen_random_uuid();
 perform pipstart_staff_private.account_operation_prepare(j,staff,'auth_resume',null,null,'access_change',0);
 r:=pipstart_staff_private.account_operation_claim(j);d:=(r->>'dispatch_id')::uuid;
 perform pipstart_staff_private.account_operation_result(j,d,'unknown');
 -- A later stop/version change cannot prevent recording an exact known result.
 update pipstart_staff_private.control set version=1 where singleton;
 perform pipstart_staff_private.account_operation_result(j,d,'failed');
 update pipstart_staff_private.control set version=0 where singleton;
 perform pg_temp.journal_ok(not exists(select 1 from pipstart_staff_private.account_operations where status in ('prepared','dispatched','unknown')),'no pending fixture operations');
 perform pipstart_staff_private.transition(true,0,gen_random_uuid());
 perform pipstart_staff_private.transition(false,1,gen_random_uuid());
 perform pg_temp.journal_ok(not (select enabled from pipstart_staff_private.control),'closed after resolved fixture transitions');
 perform pg_temp.journal_ok((select count(*)=4 from auth.users),'journal never deletes Auth users');
 perform pg_temp.journal_ok((select status::text='verified' from auth.mfa_factors where id=factor),'journal never removes provider factors');
end $$;
rollback;
