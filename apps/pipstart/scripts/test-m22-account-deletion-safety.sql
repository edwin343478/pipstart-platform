-- Marked disposable SQL Auth-stub database only, never an application DB.
-- No real Auth account is deleted by these rolled-back fixtures.
begin;
create function pg_temp.deletion_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Deletion safety assertion: %',label; end if; end $$;
create function pg_temp.deletion_denied(command text,expected text default '42501') returns void language plpgsql as $$
begin
 begin execute command;
 exception when others then if sqlstate=expected then return; end if; raise exception 'Unexpected deletion SQLSTATE %',sqlstate; end;
 raise exception 'Expected deletion safety refusal';
end $$;
create function pg_temp.deletion_claim(n integer,assurance text default 'aal1',sid integer default null) returns void language plpgsql as $$
begin
 perform set_config('request.jwt.claims',jsonb_build_object('role','authenticated','aal',assurance,
  'sub',('81000000-0000-4000-8000-'||lpad(n::text,12,'0')),
  'session_id',('82000000-0000-4000-8000-'||lpad(coalesce(sid,n)::text,12,'0')))::text,true);
end $$;
do $$ begin execute format('grant usage on schema %I to authenticated',pg_my_temp_schema()::regnamespace::text); end $$;
insert into auth.users(id,raw_user_meta_data)
select ('81000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,jsonb_build_object('display_name','Deletion fixture') from generate_series(1,4)n;
insert into auth.sessions(id,user_id,aal)
select ('82000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('81000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal1' from generate_series(1,4)n;
insert into pipstart_staff_private.members(user_id,active) values
 ('81000000-0000-4000-8000-000000000001',true),('81000000-0000-4000-8000-000000000002',false);
insert into pipstart_staff_private.roles(user_id,role_name) values('81000000-0000-4000-8000-000000000001','owner');
select pg_temp.deletion_ok(not (select enabled from pipstart_staff_private.control),'default closed');
select pg_temp.deletion_ok(not has_function_privilege('anon','public.pipstart_account_deletion_eligibility()','EXECUTE'),'anonymous denied');
select pg_temp.deletion_ok(not has_function_privilege('service_role','public.pipstart_account_deletion_eligibility()','EXECUTE'),'service key no grant');
select pg_temp.deletion_ok(has_function_privilege('authenticated','public.pipstart_account_deletion_eligibility()','EXECUTE'),'own read grant');
select pg_temp.deletion_ok(not has_table_privilege('authenticated','pipstart_staff_private.members','SELECT'),'no raw member read');
select pg_temp.deletion_denied('select public.pipstart_account_deletion_eligibility()');
set local role authenticated;
select pg_temp.deletion_claim(1);
select pg_temp.deletion_ok(public.pipstart_account_deletion_eligibility()=jsonb_build_object('user_id','81000000-0000-4000-8000-000000000001','status','staff_retirement_required'),'active Owner blocked while disabled');
select pg_temp.deletion_claim(2);
select pg_temp.deletion_ok(public.pipstart_account_deletion_eligibility()->>'status'='staff_retirement_required','former inactive no-role staff blocked');
select pg_temp.deletion_claim(3);
select pg_temp.deletion_ok(public.pipstart_account_deletion_eligibility()=jsonb_build_object('user_id','81000000-0000-4000-8000-000000000003','status','eligible'),'AAL1 learner eligible and minimized');
select pg_temp.deletion_claim(3,'aal2');
select pg_temp.deletion_ok(public.pipstart_account_deletion_eligibility()->>'status'='eligible','AAL2 own read');
select pg_temp.deletion_claim(3,'aal1',4);
select pg_temp.deletion_denied('select public.pipstart_account_deletion_eligibility()');
select pg_temp.deletion_claim(3,'aal1',99);
select pg_temp.deletion_denied('select public.pipstart_account_deletion_eligibility()');
select pg_temp.deletion_claim(3,'invalid');
select pg_temp.deletion_denied('select public.pipstart_account_deletion_eligibility()');
select set_config('request.jwt.claims','{}',true);
select pg_temp.deletion_denied('select public.pipstart_account_deletion_eligibility()');
select set_config('request.jwt.claims','{"role":"authenticated","aal":"aal1","sub":"81000000-0000-4000-8000-000000000003","session_id":"malformed"}',true);
select pg_temp.deletion_denied('select public.pipstart_account_deletion_eligibility()');
reset role;
update auth.sessions set not_after=clock_timestamp()-interval '1 second' where user_id='81000000-0000-4000-8000-000000000003';
set local role authenticated;
select pg_temp.deletion_claim(3);
select pg_temp.deletion_denied('select public.pipstart_account_deletion_eligibility()');
reset role;
select pg_temp.deletion_denied($q$delete from auth.users where id='81000000-0000-4000-8000-000000000001'$q$,'23503');
select pg_temp.deletion_denied($q$delete from auth.users where id='81000000-0000-4000-8000-000000000002'$q$,'23503');
-- Membership added after an eligibility read must still prevent deletion.
set local role authenticated;
select pg_temp.deletion_claim(4);
select pg_temp.deletion_ok(public.pipstart_account_deletion_eligibility()->>'status'='eligible','before late membership');
reset role;
insert into pipstart_staff_private.members(user_id) values('81000000-0000-4000-8000-000000000004');
select pg_temp.deletion_denied($q$delete from auth.users where id='81000000-0000-4000-8000-000000000004'$q$,'23503');
delete from auth.users where id='81000000-0000-4000-8000-000000000003';
select pg_temp.deletion_ok(not exists(select 1 from auth.users where id='81000000-0000-4000-8000-000000000003'),'nonstaff SQL fixture deletion allowed');
select pg_temp.deletion_ok(not exists(select 1 from pipstart_staff_private.audit),'eligibility does not mutate audit');
rollback;
