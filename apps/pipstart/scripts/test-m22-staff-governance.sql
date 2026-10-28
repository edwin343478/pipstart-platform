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
-- Appended to the accepted isolated SQL Auth-stub fixture setup. Not live Auth.
insert into pipstart_staff_private.assignments(user_id,resource_kind,resource_id)
select '40000000-0000-4000-8000-000000000006','lesson',v from unnest(array['a-b','a.b','a/b','a:b','a_b','b'])v;
select pg_temp.proof_ok(not (select enabled from pipstart_staff_private.control),'governance migration stays closed');
select pg_temp.proof_ok(not has_function_privilege('anon','public.pipstart_staff_governance(uuid,text,text,integer)','EXECUTE'),'anonymous has no governance grant');
select pg_temp.proof_ok(not has_function_privilege('service_role','public.pipstart_staff_governance(uuid,text,text,integer)','EXECUTE'),'service role has no governance grant');
set local role authenticated;
select pg_temp.proof_claim(1);
select pg_temp.proof_denied($q$select public.pipstart_staff_governance('40000000-0000-4000-8000-000000000006')$q$);
reset role;
select pipstart_staff_private.transition(true,0,gen_random_uuid());
set local role authenticated;
select pg_temp.proof_claim(2);
select pg_temp.proof_denied($q$select public.pipstart_staff_governance('40000000-0000-4000-8000-000000000006')$q$);
select pg_temp.proof_claim(3);
select pg_temp.proof_denied($q$select public.pipstart_staff_governance('40000000-0000-4000-8000-000000000006')$q$);
select pg_temp.proof_claim(6);
select pg_temp.proof_denied($q$select public.pipstart_staff_governance('40000000-0000-4000-8000-000000000006')$q$);
select pg_temp.proof_claim(4);
select pg_temp.proof_denied($q$select public.pipstart_staff_governance('40000000-0000-4000-8000-000000000006')$q$);
select pg_temp.proof_claim(1,'aal1');
select pg_temp.proof_denied($q$select public.pipstart_staff_governance('40000000-0000-4000-8000-000000000006')$q$);
select pg_temp.proof_claim(1);
select pg_temp.proof_denied('select public.pipstart_staff_governance(null)','22023');
select pg_temp.proof_denied($q$select public.pipstart_staff_governance('40000000-0000-4000-8000-000000000099')$q$,'22023');
select pg_temp.proof_denied($q$select public.pipstart_staff_governance('40000000-0000-4000-8000-000000000006',null,null,51)$q$,'22023');
select pg_temp.proof_denied($q$select public.pipstart_staff_governance('40000000-0000-4000-8000-000000000006','lesson',null)$q$,'22023');
select pg_temp.proof_denied($q$select public.pipstart_staff_governance('40000000-0000-4000-8000-000000000006','lesson','Uppercase')$q$,'22023');
select pg_temp.proof_ok(public.pipstart_staff_governance('40000000-0000-4000-8000-000000000004')->'staff_active'='null'::jsonb,'non-staff state not invented');
select pg_temp.proof_ok(public.pipstart_staff_governance('40000000-0000-4000-8000-000000000004')->'staff_roles'='[]'::jsonb,'legacy admin not staff role');
select pg_temp.proof_ok(public.pipstart_staff_governance('40000000-0000-4000-8000-000000000006')->'delegations'='["roles.delegate"]'::jsonb,'exact current delegations');
select pg_temp.proof_ok((select array_agg(k order by k)=array['assignments','delegations','next_after','staff_active','staff_roles','target_id'] from jsonb_object_keys(public.pipstart_staff_governance('40000000-0000-4000-8000-000000000006'))k),'minimized governance fields');
do $$ declare page jsonb; cursor_kind text; cursor_id text; seen jsonb:='[]'::jsonb; pages integer:=0;
begin
  loop
    page:=public.pipstart_staff_governance('40000000-0000-4000-8000-000000000006',cursor_kind,cursor_id,2);
    pages:=pages+1;
    perform pg_temp.proof_ok(pages<=3 and jsonb_array_length(page->'assignments')=2,'bounded advancing pages');
    seen:=seen||(select jsonb_agg(e->>'resource_id') from jsonb_array_elements(page->'assignments')e);
    exit when page->'next_after'='null'::jsonb;
    cursor_kind:=page->'next_after'->>'resource_kind';cursor_id:=page->'next_after'->>'resource_id';
  end loop;
  perform pg_temp.proof_ok(pages=3 and seen='["a-b","a.b","a/b","a:b","a_b","b"]'::jsonb,'C-collation pagination no repeats or skips');
end $$;
reset role;
update pipstart_staff_private.members set active=false where user_id='40000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.proof_denied($q$select public.pipstart_staff_governance('40000000-0000-4000-8000-000000000006')$q$);
reset role;
rollback;
