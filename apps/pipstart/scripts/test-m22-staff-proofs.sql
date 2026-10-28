-- Generated marked disposable database only. Provider tables/claims are SQL
-- fixtures, not real Auth/PostgREST/MFA evidence. All changes below roll back.
begin;
create function pg_temp.proof_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'MP03 assertion: %',label; end if; end;
$$;
create function pg_temp.proof_denied(command text,expected text default '42501') returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then if sqlstate=expected then return; end if; raise exception 'Unexpected MP03 SQLSTATE %',sqlstate; end;
  raise exception 'Expected MP03 refusal';
end;
$$;
create function pg_temp.proof_claim(n integer,assurance text default 'aal2',stamp_offset integer default 0) returns void
language plpgsql security definer set search_path='' as $$
declare u uuid:=('40000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid;
  s uuid:=('50000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid; t bigint;
begin
  select floor(extract(epoch from updated_at))::bigint into t from auth.mfa_amr_claims where session_id=s and authentication_method='totp';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'session_id',s,'role','authenticated','aal',assurance,
    'user_metadata',jsonb_build_object('role','owner'),'amr',jsonb_build_array(jsonb_build_object('method','totp','timestamp',t+stamp_offset)))::text,true);
end;
$$;
do $$ begin execute format('grant usage on schema %I to authenticated',pg_my_temp_schema()::regnamespace::text); end; $$;
insert into auth.users(id,raw_user_meta_data)
select ('40000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,jsonb_build_object('display_name','Fixture '||n,'role','owner') from generate_series(1,6)n;
insert into auth.mfa_factors(id,user_id,factor_type,status)
select ('60000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('40000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp','verified' from generate_series(1,6)n;
insert into auth.sessions(id,user_id,factor_id,aal)
select ('50000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('40000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
  ('60000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,6)n;
insert into auth.mfa_amr_claims(id,session_id,authentication_method,updated_at)
select ('70000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('50000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp',clock_timestamp()-interval '1 minute' from generate_series(1,6)n;
insert into pipstart_staff_private.members(user_id)
select ('40000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from unnest(array[1,2,3,5,6])n;
insert into pipstart_staff_private.roles values
 ('40000000-0000-4000-8000-000000000001','owner'),('40000000-0000-4000-8000-000000000002','administrator'),
 ('40000000-0000-4000-8000-000000000003','author'),('40000000-0000-4000-8000-000000000005','owner'),('40000000-0000-4000-8000-000000000006','administrator');
insert into pipstart_staff_private.delegations values('40000000-0000-4000-8000-000000000006','roles.delegate');
update public.pipstart_profiles set role='admin' where user_id='40000000-0000-4000-8000-000000000004';
select pg_temp.proof_ok(not (select enabled from pipstart_staff_private.control),'migration remains default closed');
select pg_temp.proof_ok(not has_table_privilege('authenticated','pipstart_staff_private.proof_uses','SELECT'),'proof ledger private');
select pg_temp.proof_ok(not has_function_privilege('service_role','public.pipstart_staff_receipt(uuid,text,text,text,text,text)','EXECUTE'),'service credential cannot issue');
set local role authenticated;
select pg_temp.proof_claim(1);
select pg_temp.proof_denied('select public.pipstart_staff_people()');
reset role;
select pipstart_staff_private.transition(true,0,gen_random_uuid());
set local role authenticated;
select pg_temp.proof_claim(4);
select pg_temp.proof_denied('select public.pipstart_staff_people()');
select pg_temp.proof_claim(3);
select pg_temp.proof_denied('select public.pipstart_staff_people()');
select pg_temp.proof_denied($q$select public.pipstart_staff_receipt('40000000-0000-4000-8000-000000000004','grant_role','author','','',repeat('a',64))$q$);
select pg_temp.proof_claim(1,'aal1');
select pg_temp.proof_denied('select public.pipstart_staff_people()');
select pg_temp.proof_claim(2);
select pg_temp.proof_ok(jsonb_array_length(public.pipstart_staff_people(null,1)->'items')=1,'administrator bounded page');
select pg_temp.proof_ok(public.pipstart_staff_people(null,1)->>'next_after' is not null,'keyset cursor');
select pg_temp.proof_denied('select public.pipstart_staff_people(null,51)','22023');
select pg_temp.proof_denied($q$select public.pipstart_staff_people(null,25,'%')$q$,'22023');
select pg_temp.proof_ok((public.pipstart_staff_people(null,25,'','40000000-0000-4000-8000-000000000004')->'items'->0->'staff_roles')='[]'::jsonb,'learner has no staff role despite legacy flag');
select pg_temp.proof_ok((select array_agg(k order by k)=array['created_at','display_name','staff_active','staff_roles','user_id'] from jsonb_object_keys(public.pipstart_staff_people(null,1)->'items'->0)k),'minimal DTO keys');
select pg_temp.proof_denied($q$select public.pipstart_staff_receipt('40000000-0000-4000-8000-000000000004','grant_role','author','','',repeat('a',64))$q$);
select pg_temp.proof_claim(6);
select pg_temp.proof_denied($q$select public.pipstart_staff_receipt('40000000-0000-4000-8000-000000000001','revoke_role','owner','','',repeat('a',64))$q$);
select pg_temp.proof_claim(1,'aal2',1);
select pg_temp.proof_denied($q$select public.pipstart_staff_receipt('40000000-0000-4000-8000-000000000004','grant_role','author','','',repeat('a',64))$q$);
select pg_temp.proof_claim(1);
select pg_temp.proof_ok(public.pipstart_staff_receipt('40000000-0000-4000-8000-000000000004','grant_role','author','','',repeat('a',64))->>'status'='issued','fresh verified session issues bound receipt');
select pg_temp.proof_ok(public.pipstart_staff_receipt('40000000-0000-4000-8000-000000000004','grant_role','author','','',repeat('a',64))->>'status'='already_issued','exact uncertainty reconciliation');
select pg_temp.proof_denied($q$select public.pipstart_staff_receipt('40000000-0000-4000-8000-000000000004','grant_role','editor','','',repeat('a',64))$q$);
select pg_temp.proof_denied($q$select public.pipstart_staff_receipt('40000000-0000-4000-8000-000000000004','grant_role','author','','',repeat('b',64))$q$);
reset role;
update auth.mfa_amr_claims set updated_at=date_trunc('second',updated_at)+interval '900 milliseconds' where session_id='50000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.proof_claim(1);
select pg_temp.proof_denied($q$select public.pipstart_staff_receipt('40000000-0000-4000-8000-000000000004','grant_role','author','','',repeat('b',64))$q$);
select pg_temp.proof_denied($q$select public.pipstart_staff_change('40000000-0000-4000-8000-000000000004','grant_role','editor','','',repeat('a',64),gen_random_uuid(),'access_change')$q$);
select pg_temp.proof_ok(public.pipstart_staff_change('40000000-0000-4000-8000-000000000004','grant_role','author','','',repeat('a',64),'80000000-0000-4000-8000-000000000001','staff_onboarding')->>'status'='changed','minted receipt consumes through MP02 boundary');
select pg_temp.proof_ok(public.pipstart_staff_change('40000000-0000-4000-8000-000000000004','grant_role','author','','',repeat('a',64),'80000000-0000-4000-8000-000000000001','staff_onboarding')->>'status'='already_recorded','committed result retry');
select pg_temp.proof_denied($q$select public.pipstart_staff_receipt('40000000-0000-4000-8000-000000000004','grant_role','author','','',repeat('a',64))$q$);
reset role;
select pg_temp.proof_ok((select count(*)=1 from pipstart_staff_private.proof_uses),'one proof use only');
select pg_temp.proof_ok((select count(*)=1 from pipstart_staff_private.audit where operation='grant_role'),'one transactional mutation audit');
select pg_temp.proof_denied('delete from pipstart_staff_private.proof_uses');
-- A provider update makes the previous token's AMR stale even if it is unexpired.
update auth.mfa_amr_claims set updated_at=clock_timestamp()-interval '1 second' where session_id='50000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.proof_denied($q$select public.pipstart_staff_receipt('40000000-0000-4000-8000-000000000004','revoke_role','author','','',repeat('b',64))$q$);
select pg_temp.proof_claim(1);
select pg_temp.proof_ok(public.pipstart_staff_receipt('40000000-0000-4000-8000-000000000004','revoke_role','author','','',repeat('b',64))->>'status'='issued','new provider event permits new receipt');
reset role;
create function pg_temp.proof_fail_audit() returns trigger language plpgsql as $$ begin raise exception 'fixture fault'; end; $$;
create trigger proof_fault before insert on pipstart_staff_private.audit for each row execute function pg_temp.proof_fail_audit();
set local role authenticated;
select pg_temp.proof_denied($q$select public.pipstart_staff_change('40000000-0000-4000-8000-000000000004','revoke_role','author','','',repeat('b',64),gen_random_uuid(),'access_change')$q$,'P0001');
reset role;
select pg_temp.proof_ok((select consumed_at is null from pipstart_staff_private.receipts where token_hash=sha256(convert_to(repeat('b',64),'UTF8'))),'audit fault preserves receipt');
select pg_temp.proof_ok(exists(select 1 from pipstart_staff_private.roles where user_id='40000000-0000-4000-8000-000000000004' and role_name='author'),'audit fault preserves role');
drop trigger proof_fault on pipstart_staff_private.audit;
update auth.mfa_amr_claims set updated_at=clock_timestamp()-interval '6 minutes' where session_id='50000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.proof_claim(1);
select pg_temp.proof_denied($q$select public.pipstart_staff_receipt('40000000-0000-4000-8000-000000000004','revoke_role','author','','',repeat('c',64))$q$);
reset role;
update auth.sessions set aal='aal1' where id='50000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.proof_ok(public.pipstart_staff_access()='{"authorized":false}'::jsonb,'provider downgrade revokes old AAL2 JWT');
reset role;
update auth.sessions set aal='aal2',not_after=clock_timestamp()-interval '1 second' where id='50000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.proof_denied('select public.pipstart_staff_people()');
reset role;
update auth.sessions set not_after=null where id='50000000-0000-4000-8000-000000000001';
update auth.mfa_factors set status='unverified' where id='60000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.proof_denied('select public.pipstart_staff_people()');
reset role;
rollback;
