-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Rolled back: no fixture survives.
begin;
create function pg_temp.ps_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Publication sources assertion: %',label; end if; end $$;
create function pg_temp.ps_denied(command text,expected text,label text) returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then if sqlstate=expected then return; end if;
    raise exception 'Publication sources %: expected SQLSTATE % but got % (%)',label,expected,sqlstate,sqlerrm; end;
  raise exception 'Publication sources %: expected refusal %',label,expected;
end $$;
create function pg_temp.ps_as(n integer) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform set_config('request.jwt.claims',jsonb_build_object('sub',('fb000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
    'session_id',('fb200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'role','authenticated','aal','aal2',
    'user_metadata',jsonb_build_object('role','owner'))::text,true);
end $$;
create function pg_temp.ps_sha(p_id text) returns text language sql as $$ select public.pipstart_editorial_item(p_id)->'revision'->>'body_sha256' $$;
create function pg_temp.ps_lesson(p_sources jsonb) returns jsonb language sql immutable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title','Lesson')||case when p_sources is null then '{}'::jsonb else jsonb_build_object('sources',p_sources) end,
    'blocks',jsonb_build_array(jsonb_build_object('type','paragraph','children','Text'))) $$;
create function pg_temp.ps_ok_sources(p jsonb) returns boolean language sql as $$ select pipstart_editorial_private.publication_sources_ok('lesson',pg_temp.ps_lesson(p)) $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;

-- Grants and volatility are unchanged; the rule itself is private.
select pg_temp.ps_ok(not has_function_privilege(r,'pipstart_editorial_private.publication_sources_ok(text,jsonb)','EXECUTE'),'rule not callable by '||r) from unnest(array['anon','authenticated','service_role'])r;
select pg_temp.ps_ok(has_function_privilege('authenticated',f,'EXECUTE') and not has_function_privilege('anon',f,'EXECUTE') and not has_function_privilege('service_role',f,'EXECUTE'),'grants kept for '||f)
  from unnest(array['public.pipstart_editorial_submit(text,integer,text)','public.pipstart_editorial_review(text,integer,text,boolean,text)','public.pipstart_editorial_approve_single_person(text,integer,text,text)'])f;
select pg_temp.ps_ok((select count(*) from pg_proc where pronamespace='public'::regnamespace and proname like 'pipstart_editorial_%' and provolatile<>'v')=0,'every editorial RPC is still volatile');

-- The sources shape.
select pg_temp.ps_ok(pg_temp.ps_ok_sources('[{"title":"CFTC","url":"https://www.cftc.gov/a?b=1#c"}]'),'one valid source');
select pg_temp.ps_ok(pg_temp.ps_ok_sources((select jsonb_agg(jsonb_build_object('title','S'||n,'url','https://example.com/'||n)) from generate_series(1,50)n)),'fifty sources');
select pg_temp.ps_ok(not pg_temp.ps_ok_sources(s),'refused sources '||coalesce(s::text,'missing')) from (values
  (null::jsonb),
  ('[]'::jsonb),
  ('{}'::jsonb),
  ('"https://example.com"'::jsonb),
  ('[{"title":"Plain","url":"http://example.com"}]'::jsonb),
  ('[{"title":"","url":"https://example.com"}]'::jsonb),
  ('[{"title":"   ","url":"https://example.com"}]'::jsonb),
  ('[{"title":"S","url":"https://"}]'::jsonb),
  ('[{"title":"S","url":"https://user@example.com"}]'::jsonb),
  ('[{"title":"S","url":"https://example.com/a b"}]'::jsonb),
  ('[{"title":"S","url":"https://example.com","publisher":"x"}]'::jsonb),
  ('[{"title":"S"}]'::jsonb),
  ('[{"title":1,"url":"https://example.com"}]'::jsonb),
  ('["https://example.com"]'::jsonb)) v(s);
select pg_temp.ps_ok(not pg_temp.ps_ok_sources((select jsonb_agg(jsonb_build_object('title','S'||n,'url','https://example.com/'||n)) from generate_series(1,51)n)),'fifty-one sources');
select pg_temp.ps_ok(not pg_temp.ps_ok_sources(jsonb_build_array(jsonb_build_object('title',repeat('x',201),'url','https://example.com'))),'overlong title');
select pg_temp.ps_ok(not pg_temp.ps_ok_sources(jsonb_build_array(jsonb_build_object('title','S','url','https://example.com/'||repeat('x',2048)))),'overlong url');
select pg_temp.ps_ok(not pg_temp.ps_ok_sources(jsonb_build_array(jsonb_build_object('title','S','url','https://example.com/'||chr(7)))),'control character in url');
select pg_temp.ps_ok(pipstart_editorial_private.publication_sources_ok(f,'{"metadata":{"title":"No sources"}}'),'family '||f||' is unaffected') from unnest(array['course','module','quiz','analysis'])f;

-- Earlier runner stages leave staff fixtures behind; start from no active member (rolled back).
update pipstart_staff_private.members set active=false where active;
-- 1 Owner, 2 author, 3 reviewer; both assigned to every lesson below.
insert into auth.users(id,raw_user_meta_data) select ('fb000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'{}' from generate_series(1,3)n;
insert into auth.mfa_factors(id,user_id,factor_type,status)
select ('fb100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fb000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp','verified' from generate_series(1,3)n;
insert into auth.sessions(id,user_id,factor_id,aal)
select ('fb200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fb000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fb100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,3)n;
insert into pipstart_staff_private.members(user_id) select ('fb000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from generate_series(1,3)n;
insert into pipstart_staff_private.roles values
 ('fb000000-0000-4000-8000-000000000001','owner'),('fb000000-0000-4000-8000-000000000002','author'),('fb000000-0000-4000-8000-000000000003','reviewer');
insert into pipstart_staff_private.assignments(user_id,resource_kind,resource_id)
select ('fb000000-0000-4000-8000-'||lpad(u::text,12,'0'))::uuid,'lesson',l from generate_series(2,3)u,unnest(array['ps-none','ps-good','ps-owner','ps-bad'])l;
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
set local role authenticated;

-- The Owner builds the hierarchy; drafts may be saved without sources.
select pg_temp.ps_as(1);
select pg_temp.ps_ok((public.pipstart_editorial_create('ps-course','course','forex',null,'{"metadata":{"title":"Course"}}','first'))->>'state'='draft','course');
select pg_temp.ps_ok((public.pipstart_editorial_create('ps-module','module','forex','ps-course','{"metadata":{"title":"Module"}}','first'))->>'state'='draft','module');
select pg_temp.ps_ok((public.pipstart_editorial_create(id,'lesson','forex','ps-module',pg_temp.ps_lesson(s),'first'))->>'state'='draft','lesson draft '||id)
  from (values('ps-none',null::jsonb),('ps-good','[{"title":"Good","url":"https://example.com/good"}]'),('ps-owner','[{"title":"Owner","url":"https://example.com/owner"}]'),('ps-bad','[{"title":"Plain","url":"http://example.com"}]')) v(id,s);
select pg_temp.ps_ok((public.pipstart_editorial_save('ps-none',1,pg_temp.ps_lesson('[]'),'still drafting'))->>'revision_no'='2','a draft saves with an empty sources list');
reset role;
create temporary table ps_before as select (select count(*) from pipstart_editorial_private.decisions) decisions,(select count(*) from pipstart_editorial_private.audit) audit;
grant select on ps_before to authenticated;
set local role authenticated;

-- Send to reviewer: refused without valid sources, allowed with them.
select pg_temp.ps_as(2);
select pg_temp.ps_denied(format($q$select public.pipstart_editorial_submit('ps-none',2,%L)$q$,pg_temp.ps_sha('ps-none')),'22023','submit without sources');
select pg_temp.ps_denied(format($q$select public.pipstart_editorial_submit('ps-bad',1,%L)$q$,pg_temp.ps_sha('ps-bad')),'22023','submit with an http source');
select pg_temp.ps_ok((public.pipstart_editorial_submit('ps-good',1,pg_temp.ps_sha('ps-good')))->>'state'='submitted','author sends a sourced lesson to review');
-- Ordinary review still requires a different person and approves the exact revision.
select pg_temp.ps_denied(format($q$select public.pipstart_editorial_review('ps-good',1,%L,true,null)$q$,pg_temp.ps_sha('ps-good')),'42501','author cannot review own revision');
select pg_temp.ps_as(3);
select pg_temp.ps_ok((public.pipstart_editorial_review('ps-good',1,pg_temp.ps_sha('ps-good'),true,'Checked sources'))->>'state'='approved','reviewer approves the sourced lesson');

-- A revision submitted before this rule existed cannot be approved without sources, but changes can be requested.
reset role;
update pipstart_editorial_private.revisions set state='submitted' where item_id='ps-none' and revision_no=2;
set local role authenticated;
select pg_temp.ps_as(3);
select pg_temp.ps_denied(format($q$select public.pipstart_editorial_review('ps-none',2,%L,true,null)$q$,pg_temp.ps_sha('ps-none')),'22023','reviewer approval without sources');
select pg_temp.ps_ok((public.pipstart_editorial_review('ps-none',2,pg_temp.ps_sha('ps-none'),false,'Add sources'))->>'state'='changes_requested','changes may still be requested');

-- Owner Publish: refused without valid sources; other families need none.
select pg_temp.ps_as(1);
select pg_temp.ps_denied(format($q$select public.pipstart_editorial_approve_single_person('ps-bad',1,%L,null)$q$,pg_temp.ps_sha('ps-bad')),'22023','publish with an http source');
select pg_temp.ps_ok((public.pipstart_editorial_approve_single_person('ps-owner',1,pg_temp.ps_sha('ps-owner'),null))->>'state'='approved','owner publishes a sourced lesson');
select pg_temp.ps_ok((public.pipstart_editorial_approve_single_person('ps-module',1,pg_temp.ps_sha('ps-module'),null))->>'state'='approved','owner publishes a module without sources');
-- Existing checks still come first: stale hash and wrong state are refused as before.
select pg_temp.ps_denied($q$select public.pipstart_editorial_approve_single_person('ps-course',1,repeat('0',64),null)$q$,'PT409','stale hash');
select pg_temp.ps_denied(format($q$select public.pipstart_editorial_approve_single_person('ps-good',1,%L,null)$q$,pg_temp.ps_sha('ps-good')),'55000','already approved');
select pg_temp.ps_as(2);
select pg_temp.ps_denied(format($q$select public.pipstart_editorial_approve_single_person('ps-bad',1,%L,null)$q$,pg_temp.ps_sha('ps-bad')),'42501','non-Owner publish still refused first');

-- Refusals wrote nothing: exactly three approvals and one changes request were recorded.
reset role;
select pg_temp.ps_ok((select count(*) from pipstart_editorial_private.decisions)-(select decisions from ps_before)=4
  and (select count(*) from pipstart_editorial_private.decisions where item_id like 'ps-%' and kind in ('reviewed','single_person'))=3
  and (select count(*) from pipstart_editorial_private.decisions where item_id='ps-none' and kind='changes_requested')=1,'only successful decisions recorded');
select pg_temp.ps_ok((select count(*) from pipstart_editorial_private.audit)-(select audit from ps_before)=5,'audit counts one submit and four decisions');
select pg_temp.ps_ok((select state from pipstart_editorial_private.revisions where item_id='ps-bad' and revision_no=1)='draft','refused lesson stays a draft');
rollback;
