-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Rolled back: no fixture survives.
begin;
create function pg_temp.qv_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Quiz version assertion: %',label; end if; end $$;
create function pg_temp.qv_denied(command text,expected text,label text) returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then if sqlstate=expected then return; end if;
    raise exception 'Quiz version %: expected SQLSTATE % but got % (%)',label,expected,sqlstate,sqlerrm; end;
  raise exception 'Quiz version %: expected refusal %',label,expected;
end $$;
create function pg_temp.qv_as(n integer) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform set_config('request.jwt.claims',jsonb_build_object('sub',('fc000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
    'session_id',('fc200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'role','authenticated','aal','aal2',
    'user_metadata',jsonb_build_object('role','owner'))::text,true);
end $$;
create function pg_temp.qv_sha(p_id text) returns text language sql as $$ select public.pipstart_editorial_item(p_id)->'revision'->>'body_sha256' $$;
create function pg_temp.qv_rev(p_id text) returns integer language sql as $$ select (public.pipstart_editorial_item(p_id)->'item'->>'latest_revision')::integer $$;
-- A one-question quiz body at a version, with the correct choice named.
create function pg_temp.qz(v jsonb,correct text) returns jsonb language sql immutable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title','Quiz')||case when v is null then '{}'::jsonb else jsonb_build_object('version',v) end,
    'questions',jsonb_build_array(jsonb_build_object('id','q1','choices',jsonb_build_array(jsonb_build_object('id','a'),jsonb_build_object('id','b')),'correctChoiceIds',jsonb_build_array(correct)))) $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;

-- The rule functions are private; the RPCs keep their grants and stay volatile.
select pg_temp.qv_ok(not has_function_privilege(r,f,'EXECUTE'),'private '||f||' for '||r)
  from unnest(array['anon','authenticated','service_role'])r,unnest(array['pipstart_editorial_private.quiz_published_version(text)','pipstart_editorial_private.quiz_version_ok(text,jsonb)','pipstart_editorial_private.quiz_decision_ok(text,integer)'])f;
select pg_temp.qv_ok(has_function_privilege('authenticated',f,'EXECUTE') and not has_function_privilege('anon',f,'EXECUTE') and not has_function_privilege('service_role',f,'EXECUTE'),'grants kept for '||f)
  from unnest(array['public.pipstart_editorial_create(text,text,text,text,jsonb,text)','public.pipstart_editorial_save(text,integer,jsonb,text)','public.pipstart_editorial_submit(text,integer,text)','public.pipstart_editorial_review(text,integer,text,boolean,text)','public.pipstart_editorial_approve_single_person(text,integer,text,text)'])f;
select pg_temp.qv_ok((select count(*) from pg_proc where pronamespace='public'::regnamespace and proname like 'pipstart_editorial_%' and provolatile<>'v')=0,'every editorial RPC is still volatile');

-- Earlier runner stages leave staff fixtures behind; start from no active member (rolled back).
update pipstart_staff_private.members set active=false where active;
-- 1 Owner, 2 author, 3 reviewer; both assigned to every quiz below.
insert into auth.users(id,raw_user_meta_data) select ('fc000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'{}' from generate_series(1,3)n;
insert into auth.mfa_factors(id,user_id,factor_type,status)
select ('fc100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fc000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp','verified' from generate_series(1,3)n;
insert into auth.sessions(id,user_id,factor_id,aal)
select ('fc200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fc000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fc100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,3)n;
insert into pipstart_staff_private.members(user_id) select ('fc000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from generate_series(1,3)n;
insert into pipstart_staff_private.roles values
 ('fc000000-0000-4000-8000-000000000001','owner'),('fc000000-0000-4000-8000-000000000002','author'),('fc000000-0000-4000-8000-000000000003','reviewer');
insert into pipstart_staff_private.assignments(user_id,resource_kind,resource_id)
select ('fc000000-0000-4000-8000-'||lpad(u::text,12,'0'))::uuid,'quiz',q from generate_series(2,3)u,unnest(array['qv-main','qv-review'])q;
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
set local role authenticated;

select pg_temp.qv_as(1);
select pg_temp.qv_ok((public.pipstart_editorial_create('qv-course','course','forex',null,'{"metadata":{"title":"Course"}}','first'))->>'state'='draft','course');
select pg_temp.qv_ok((public.pipstart_editorial_create('qv-module','module','forex','qv-course','{"metadata":{"title":"Module"}}','first'))->>'state'='draft','other families need no version');
-- A new quiz starts at version 1; a missing, zero, text or later version is refused.
select pg_temp.qv_denied(format($q$select public.pipstart_editorial_create('qv-main','quiz','forex','qv-module',%L,'first')$q$,pg_temp.qz(v,'a')),'22023','new quiz at '||coalesce(v::text,'no version'))
  from unnest(array[null,'0','2','"1"','1.5']::jsonb[])v;
select pg_temp.qv_ok((public.pipstart_editorial_create('qv-main','quiz','forex','qv-module',pg_temp.qz('1','a'),'first'))->>'state'='draft','new quiz at version 1');
-- Until version 1 is approved, every draft stays at version 1.
select pg_temp.qv_denied(format($q$select public.pipstart_editorial_save('qv-main',1,%L,'jump')$q$,pg_temp.qz('2','a')),'22023','draft skipping ahead before approval');
select pg_temp.qv_ok((public.pipstart_editorial_save('qv-main',1,pg_temp.qz('1','b'),'edit v1 draft'))->>'revision_no'='2','second draft of version 1');
select pg_temp.qv_ok((public.pipstart_editorial_approve_single_person('qv-main',2,pg_temp.qv_sha('qv-main'),null))->>'state'='approved','owner publishes version 1');
-- After version 1 is approved, the next draft must be version 2.
select pg_temp.qv_denied(format($q$select public.pipstart_editorial_save('qv-main',2,%L,'reuse')$q$,pg_temp.qz('1','a')),'22023','editing a published version in place');
select pg_temp.qv_denied(format($q$select public.pipstart_editorial_save('qv-main',2,%L,'skip')$q$,pg_temp.qz('3','a')),'22023','skipping a version');
select pg_temp.qv_ok((public.pipstart_editorial_save('qv-main',2,pg_temp.qz('2','a'),'version 2 draft'))->>'revision_no'='3','version 2 draft');
select pg_temp.qv_ok((public.pipstart_editorial_save('qv-main',3,pg_temp.qz('2','b'),'version 2 draft again'))->>'revision_no'='4','later drafts keep version 2');
select pg_temp.qv_ok((public.pipstart_editorial_approve_single_person('qv-main',4,pg_temp.qv_sha('qv-main'),null))->>'state'='approved','owner publishes version 2');

-- A revision reusing an approved version with different content is refused at every decision.
reset role;
insert into pipstart_editorial_private.revisions(item_id,revision_no,schema_version,body,body_sha256,base_revision,author_id,reason,state)
  values('qv-main',5,1,pg_temp.qz('2','a'),repeat('0',64),4,'fc000000-0000-4000-8000-000000000002','tampered','draft');
update pipstart_editorial_private.items set latest_revision=5 where id='qv-main';
create temporary table qv_before as select (select count(*) from pipstart_editorial_private.decisions) decisions,(select count(*) from pipstart_editorial_private.audit) audit;
grant select on qv_before to authenticated;
set local role authenticated;
select pg_temp.qv_as(1);
select pg_temp.qv_denied(format($q$select public.pipstart_editorial_approve_single_person('qv-main',5,%L,null)$q$,pg_temp.qv_sha('qv-main')),'22023','publish a different body under version 2');
select pg_temp.qv_as(2);
select pg_temp.qv_denied(format($q$select public.pipstart_editorial_submit('qv-main',5,%L)$q$,pg_temp.qv_sha('qv-main')),'22023','send a different body under version 2 to review');
reset role;
update pipstart_editorial_private.revisions set state='submitted' where item_id='qv-main' and revision_no=5;
set local role authenticated;
select pg_temp.qv_as(3);
select pg_temp.qv_denied(format($q$select public.pipstart_editorial_review('qv-main',5,%L,true,null)$q$,pg_temp.qv_sha('qv-main')),'22023','reviewer approval of a different body under version 2');
select pg_temp.qv_ok((public.pipstart_editorial_review('qv-main',5,pg_temp.qv_sha('qv-main'),false,'Use version 3'))->>'state'='changes_requested','changes may still be requested');
reset role;
select pg_temp.qv_ok((select count(*) from pipstart_editorial_private.decisions)-(select decisions from qv_before)=1
  and (select count(*) from pipstart_editorial_private.audit)-(select audit from qv_before)=1,'refusals recorded nothing; one changes request recorded');
select pg_temp.qv_ok(pipstart_editorial_private.quiz_published_version('qv-main')=2,'published version stays 2');
set local role authenticated;

-- The review path: an author's next version, approved by a different reviewer.
select pg_temp.qv_as(2);
select pg_temp.qv_ok((public.pipstart_editorial_save('qv-main',5,pg_temp.qz('3','a'),'version 3 draft'))->>'revision_no'='6','author drafts version 3');
select pg_temp.qv_ok((public.pipstart_editorial_submit('qv-main',6,pg_temp.qv_sha('qv-main')))->>'state'='submitted','author sends version 3 to review');
select pg_temp.qv_as(3);
select pg_temp.qv_ok((public.pipstart_editorial_review('qv-main',6,pg_temp.qv_sha('qv-main'),true,null))->>'state'='approved','reviewer approves version 3');

-- An identical body may be approved again under its version (a restore copies the latest body).
select pg_temp.qv_as(1);
select pg_temp.qv_ok((public.pipstart_editorial_create('qv-review','quiz','forex','qv-module',pg_temp.qz('1','a'),'first'))->>'state'='draft','second quiz');
select pg_temp.qv_ok((public.pipstart_editorial_approve_single_person('qv-review',1,pg_temp.qv_sha('qv-review'),null))->>'state'='approved','second quiz version 1');
select pg_temp.qv_ok((public.pipstart_editorial_trash('qv-review','retire'))->>'trashed'='true','archive');
select pg_temp.qv_ok((public.pipstart_editorial_restore('qv-review','needed again'))->>'revision_no'='2','restore as a new draft of version 1');
select pg_temp.qv_ok((public.pipstart_editorial_approve_single_person('qv-review',2,pg_temp.qv_sha('qv-review'),null))->>'state'='approved','identical version 1 approved again');

reset role;
select pg_temp.qv_ok(pipstart_editorial_private.quiz_published_version('qv-main')=3 and pipstart_editorial_private.quiz_published_version('qv-review')=1,'published versions 3 and 1');
-- Every approved quiz version has exactly one body.
select pg_temp.qv_ok(not exists(select 1 from pipstart_editorial_private.revisions r join pipstart_editorial_private.decisions d using(item_id,revision_no)
  where r.item_id like 'qv-%' and d.kind in ('imported','reviewed','single_person') group by r.item_id,r.body->'metadata'->>'version' having count(distinct r.body_sha256)>1),'one body per approved version');
rollback;
