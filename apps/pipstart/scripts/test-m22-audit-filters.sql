-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Rolled back: no fixture survives. MP10f audit filters: grants, audit.read gating, every filter,
-- cursor paging, minimized content rows (no reasons or details), and argument refusals.
begin;
create function pg_temp.af_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Audit assertion: %',label; end if; end $$;
create function pg_temp.af_denied(command text,expected text,label text) returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then if sqlstate=expected then return; end if;
    raise exception 'Audit %: expected SQLSTATE % but got % (%)',label,expected,sqlstate,sqlerrm; end;
  raise exception 'Audit %: expected refusal %',label,expected;
end $$;
create function pg_temp.af_as(n integer) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform set_config('request.jwt.claims',jsonb_build_object('sub',('fc000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
    'session_id',('fc200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'role','authenticated','aal','aal2',
    'user_metadata',jsonb_build_object('role','owner'))::text,true);
end $$;
create function pg_temp.uid(n integer) returns uuid language sql immutable as $$ select ('fc000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.t(n integer) returns timestamptz language sql immutable as $$ select '2026-11-10T00:00:00Z'::timestamptz+make_interval(hours=>n) $$;
create function pg_temp.s(p_op text default null,p_actor uuid default null,p_res text default null,p_from timestamptz default null,p_to timestamptz default null,p_before timestamptz default null,p_before_id uuid default null,p_limit integer default 101)
  returns jsonb language sql as $$ select public.pipstart_staff_audit_page_filtered(p_before,p_before_id,p_limit,p_op,p_actor,p_res,p_from,p_to) $$;
create function pg_temp.c(p_op text default null,p_actor uuid default null,p_item text default null,p_from timestamptz default null,p_to timestamptz default null,p_before timestamptz default null,p_before_id uuid default null,p_limit integer default 101)
  returns jsonb language sql as $$ select public.pipstart_content_audit_page(p_before,p_before_id,p_limit,p_op,p_actor,p_item,p_from,p_to) $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;

-- Grants: both views authenticated only and volatile; the helper closed.
select pg_temp.af_ok(has_function_privilege('authenticated',f,'EXECUTE') and not has_function_privilege('anon',f,'EXECUTE') and not has_function_privilege('service_role',f,'EXECUTE'),'grant '||f)
  from unnest(array['public.pipstart_staff_audit_page_filtered(timestamptz,uuid,integer,text,uuid,text,timestamptz,timestamptz)',
    'public.pipstart_content_audit_page(timestamptz,uuid,integer,text,uuid,text,timestamptz,timestamptz)'])f;
select pg_temp.af_ok(not has_function_privilege(r,'pipstart_staff_private.audit_page_ok(timestamptz,uuid,integer,timestamptz,timestamptz)','EXECUTE'),'helper closed for '||r)
  from unnest(array['anon','authenticated','service_role'])r;
select pg_temp.af_ok((select count(*) from pg_proc where pronamespace='public'::regnamespace and proname in ('pipstart_staff_audit_page_filtered','pipstart_content_audit_page') and provolatile<>'v')=0,'views volatile');
select pg_temp.af_ok(to_regclass('pipstart_editorial_private.pipstart_editorial_audit_time_idx') is not null,'ordering index');

-- 1 Owner, 2 Administrator with audit.read, 3 Administrator without, 4 Moderator.
update pipstart_staff_private.members set active=false where active;
insert into auth.users(id,raw_user_meta_data) select pg_temp.uid(n),'{}' from generate_series(1,4)n;
insert into auth.mfa_factors(id,user_id,factor_type,status) select ('fc100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),'totp','verified' from generate_series(1,4)n;
insert into auth.sessions(id,user_id,factor_id,aal) select ('fc200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),('fc100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,4)n;
insert into pipstart_staff_private.members(user_id) select pg_temp.uid(n) from generate_series(1,4)n;
insert into pipstart_staff_private.roles values (pg_temp.uid(1),'owner'),(pg_temp.uid(2),'administrator'),(pg_temp.uid(3),'administrator'),(pg_temp.uid(4),'moderator');
insert into pipstart_staff_private.delegations(user_id,capability) values (pg_temp.uid(2),'audit.read');
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());

-- Fixture audit rows at fixed times (the tables are append-only; inserts are allowed).
insert into pipstart_staff_private.audit(id,created_at,actor_id,request_id,operation,target_id,value,resource_kind,resource_id,reason_code,outcome) values
 ('fc300000-0000-4000-8000-000000000001',pg_temp.t(1),pg_temp.uid(1),gen_random_uuid(),'grant_role',pg_temp.uid(4),'moderator','','','staff_onboarding','changed'),
 ('fc300000-0000-4000-8000-000000000002',pg_temp.t(2),pg_temp.uid(1),gen_random_uuid(),'assign',pg_temp.uid(4),'','lesson','af-lesson','access_change','changed'),
 ('fc300000-0000-4000-8000-000000000003',pg_temp.t(3),pg_temp.uid(2),gen_random_uuid(),'grant_role',pg_temp.uid(3),'administrator','','','access_change','changed');
insert into pipstart_editorial_private.audit(id,created_at,actor_id,operation,item_id,revision_no,detail) values
 ('fc400000-0000-4000-8000-000000000001',pg_temp.t(1),pg_temp.uid(1),'create','af-lesson',1,'PRIVATE_REASON_SENTINEL'),
 ('fc400000-0000-4000-8000-000000000002',pg_temp.t(2),pg_temp.uid(1),'publish','af-lesson',1,'PRIVATE_REASON_SENTINEL'),
 ('fc400000-0000-4000-8000-000000000003',pg_temp.t(3),pg_temp.uid(4),'maintenance','af-lesson',1,'acknowledge: PRIVATE_REASON_SENTINEL'),
 ('fc400000-0000-4000-8000-000000000004',pg_temp.t(4),pg_temp.uid(1),'maintenance','af-post',2,'reschedule to 2027-01-01: PRIVATE_REASON_SENTINEL'),
 ('fc400000-0000-4000-8000-000000000005',pg_temp.t(5),pg_temp.uid(1),'maintenance',null,null,'allowlist add docs.example.org: PRIVATE_REASON_SENTINEL'),
 ('fc400000-0000-4000-8000-000000000006',pg_temp.t(6),pg_temp.uid(1),'maintenance','af-post',2,'unexpected wording');
set local role authenticated;

-- Gating: Owner and delegated Administrator read; others refused.
select pg_temp.af_as(n),pg_temp.af_denied('select pg_temp.s()','42501','staff view for '||n),pg_temp.af_denied('select pg_temp.c()','42501','content view for '||n) from unnest(array[3,4,9])n;
select pg_temp.af_as(2);
select pg_temp.af_ok(jsonb_array_length(pg_temp.s(p_from=>pg_temp.t(0),p_to=>pg_temp.t(10)))=3 and jsonb_array_length(pg_temp.c(p_from=>pg_temp.t(0),p_to=>pg_temp.t(10)))=6,'delegated Administrator reads both views');
select pg_temp.af_as(1);

-- Staff view: same columns as the unfiltered page, each filter, newest first.
select pg_temp.af_ok((select string_agg(k,',' order by k) from jsonb_object_keys(pg_temp.s(p_from=>pg_temp.t(0),p_to=>pg_temp.t(10))->0) k)='actor_id,created_at,id,operation,outcome,reason_code,request_id,resource_id,resource_kind,target_id,value','staff rows keep the existing minimized columns');
select pg_temp.af_ok((select string_agg(x->>'id',',') from jsonb_array_elements(pg_temp.s(p_from=>pg_temp.t(0),p_to=>pg_temp.t(10))) x)='fc300000-0000-4000-8000-000000000003,fc300000-0000-4000-8000-000000000002,fc300000-0000-4000-8000-000000000001','staff newest first');
select pg_temp.af_ok(jsonb_array_length(pg_temp.s('grant_role',p_from=>pg_temp.t(0),p_to=>pg_temp.t(10)))=2,'staff action filter');
select pg_temp.af_ok(jsonb_array_length(pg_temp.s(p_actor=>pg_temp.uid(2),p_from=>pg_temp.t(0),p_to=>pg_temp.t(10)))=1,'staff actor filter');
select pg_temp.af_ok(pg_temp.s(p_res=>'af-lesson')->0->>'id'='fc300000-0000-4000-8000-000000000002' and jsonb_array_length(pg_temp.s(p_res=>'af-lesson'))=1,'staff resource filter');
select pg_temp.af_ok(jsonb_array_length(pg_temp.s(p_from=>pg_temp.t(2),p_to=>pg_temp.t(3)))=1,'staff time range: from inclusive, to exclusive');
select pg_temp.af_ok((select string_agg(x->>'id',',') from jsonb_array_elements(pg_temp.s(p_from=>pg_temp.t(0),p_to=>pg_temp.t(10),p_before=>pg_temp.t(3),p_before_id=>'fc300000-0000-4000-8000-000000000003',p_limit=>1)) x)='fc300000-0000-4000-8000-000000000002','staff cursor continues after the given row');

-- Content view: minimized rows; reasons never returned; maintenance action word only.
select pg_temp.af_ok((select string_agg(k,',' order by k) from jsonb_object_keys(pg_temp.c(p_from=>pg_temp.t(0),p_to=>pg_temp.t(10))->0) k)='action,actor_id,created_at,id,item_id,operation,revision_no','content rows are minimized');
select pg_temp.af_ok(position('PRIVATE_REASON_SENTINEL' in pg_temp.c(p_from=>pg_temp.t(0),p_to=>pg_temp.t(10))::text)=0 and position('unexpected' in pg_temp.c(p_from=>pg_temp.t(0),p_to=>pg_temp.t(10))::text)=0,'no reason or detail text is returned');
select pg_temp.af_ok((select string_agg(coalesce(x->>'action','-'),',') from jsonb_array_elements(pg_temp.c(p_from=>pg_temp.t(0),p_to=>pg_temp.t(10))) x)='-,allowlist,reschedule,acknowledge,-,-','maintenance action words, newest first; unknown wording gives none');
select pg_temp.af_ok(jsonb_array_length(pg_temp.c('maintenance',p_from=>pg_temp.t(0),p_to=>pg_temp.t(10)))=4 and jsonb_array_length(pg_temp.c('publish'))=1,'content operation filter');
select pg_temp.af_ok(jsonb_array_length(pg_temp.c(p_actor=>pg_temp.uid(4)))=1 and pg_temp.c(p_actor=>pg_temp.uid(4))->0->>'action'='acknowledge','content actor filter');
select pg_temp.af_ok(jsonb_array_length(pg_temp.c(p_item=>'af-post'))=2 and jsonb_array_length(pg_temp.c(p_item=>'af-lesson'))=3,'content item filter');
select pg_temp.af_ok(jsonb_array_length(pg_temp.c(p_from=>pg_temp.t(4),p_to=>pg_temp.t(6)))=2,'content time range');
select pg_temp.af_ok((select string_agg(x->>'id',',') from jsonb_array_elements(pg_temp.c(p_before=>pg_temp.t(5),p_before_id=>'fc400000-0000-4000-8000-000000000005',p_limit=>2,p_from=>pg_temp.t(0),p_to=>pg_temp.t(10))) x)='fc400000-0000-4000-8000-000000000004,fc400000-0000-4000-8000-000000000003','content cursor paging');

-- Argument refusals.
select pg_temp.af_denied(c,'22023','bad '||c) from unnest(array[
 $$select pg_temp.s('delete')$$,$$select pg_temp.c('drop')$$,$$select pg_temp.s(p_res=>'Bad Id')$$,$$select pg_temp.c(p_item=>'../x')$$,
 $$select pg_temp.s(p_limit=>0)$$,$$select pg_temp.c(p_limit=>102)$$,$$select pg_temp.s(p_before=>now())$$,$$select pg_temp.c(p_before_id=>gen_random_uuid())$$,
 $$select pg_temp.s(p_from=>pg_temp.t(5),p_to=>pg_temp.t(5))$$,$$select pg_temp.c(p_from=>pg_temp.t(6),p_to=>pg_temp.t(1))$$])c;
reset role;
select pg_temp.af_ok((select count(*) from pipstart_editorial_private.audit where id::text like 'fc400000-%')=6 and (select count(*) from pipstart_staff_private.audit where id::text like 'fc300000-%')=3,'views are read-only');
rollback;
