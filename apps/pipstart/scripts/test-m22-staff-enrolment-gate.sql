-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Rolled back: no fixture survives. AAL is deliberately not required (enrolment).
begin;
create function pg_temp.gate_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Enrolment gate assertion: %',label; end if; end $$;
create function pg_temp.gate_denied(command text,expected text default '42501') returns void language plpgsql as $$
begin begin execute command;exception when others then if sqlstate=expected then return;end if;raise exception 'Unexpected enrolment SQLSTATE % (%)',sqlstate,sqlerrm;end;raise exception 'Expected enrolment refusal';end $$;
create function pg_temp.gate_as(u uuid,role_claim text default 'authenticated') returns void language plpgsql as $$
begin perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'role',role_claim,'aal','aal1')::text,true); end $$;
do $$begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text);end $$;
insert into auth.users(id,raw_user_meta_data)
select ('e1000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,jsonb_build_object('display_name','Enrolment fixture','role','owner') from generate_series(1,5)n;
-- 1 active member, 2 inactive member, 3 banned member, 4 deleted member, 5 learner (no membership).
insert into pipstart_staff_private.members(user_id) select ('e1000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from generate_series(1,4)n;
update pipstart_staff_private.members set active=false where user_id='e1000000-0000-4000-8000-000000000002';
update auth.users set banned_until=clock_timestamp()+interval '1 hour' where id='e1000000-0000-4000-8000-000000000003';
update auth.users set deleted_at=clock_timestamp() where id='e1000000-0000-4000-8000-000000000004';

select pg_temp.gate_ok(has_function_privilege('authenticated','public.pipstart_staff_enrolment_allowed()','execute'),'authenticated may ask');
select pg_temp.gate_ok(not has_function_privilege('anon','public.pipstart_staff_enrolment_allowed()','execute'),'anonymous refused');
select pg_temp.gate_ok(not has_function_privilege('service_role','public.pipstart_staff_enrolment_allowed()','execute'),'service credential refused');
select pg_temp.gate_ok((select prorettype='boolean'::regtype and provolatile='s' and prosecdef and proconfig=array['search_path=""'] from pg_proc where oid='public.pipstart_staff_enrolment_allowed()'::regprocedure),'boolean-only stable definer with empty search path');

set local role authenticated;
select pg_temp.gate_as('e1000000-0000-4000-8000-000000000001');
select pg_temp.gate_ok(public.pipstart_staff_enrolment_allowed(),'active member may enrol at AAL1 while paused');
select pg_temp.gate_as('e1000000-0000-4000-8000-000000000002');
select pg_temp.gate_ok(not public.pipstart_staff_enrolment_allowed(),'inactive member refused');
select pg_temp.gate_as('e1000000-0000-4000-8000-000000000003');
select pg_temp.gate_ok(not public.pipstart_staff_enrolment_allowed(),'banned member refused');
select pg_temp.gate_as('e1000000-0000-4000-8000-000000000004');
select pg_temp.gate_ok(not public.pipstart_staff_enrolment_allowed(),'deleted member refused');
select pg_temp.gate_as('e1000000-0000-4000-8000-000000000005');
select pg_temp.gate_ok(not public.pipstart_staff_enrolment_allowed(),'learner refused');
-- Editable metadata claiming owner, or a service-role claim inside a user session, grants nothing.
select pg_temp.gate_as('e1000000-0000-4000-8000-000000000005','service_role');
select pg_temp.gate_ok(not public.pipstart_staff_enrolment_allowed(),'forged role claim refused');
select set_config('request.jwt.claims','{"role":"authenticated"}',true);
select pg_temp.gate_ok(not public.pipstart_staff_enrolment_allowed(),'missing subject refused');
reset role;
set local role anon;
select pg_temp.gate_denied($q$select public.pipstart_staff_enrolment_allowed()$q$);
reset role;
set local role service_role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
select pg_temp.gate_denied($q$select public.pipstart_staff_enrolment_allowed()$q$);
reset role;
select pg_temp.gate_ok((select not enabled from pipstart_staff_private.control where singleton),'staff remains paused');
rollback;
