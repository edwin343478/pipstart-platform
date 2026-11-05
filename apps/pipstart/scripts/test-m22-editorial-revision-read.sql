-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Rolled back: no fixture survives.
begin;
create function pg_temp.rd_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Revision read assertion: %',label; end if; end $$;
create function pg_temp.rd_denied(command text,expected text,label text) returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then if sqlstate=expected then return; end if;
    raise exception 'Revision read %: expected SQLSTATE % but got % (%)',label,expected,sqlstate,sqlerrm; end;
  raise exception 'Revision read %: expected refusal %',label,expected;
end $$;
create function pg_temp.rd_as(n integer,assurance text default 'aal2') returns void
language plpgsql security definer set search_path='' as $$
begin
  perform set_config('request.jwt.claims',jsonb_build_object('sub',('fa000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
    'session_id',('fa200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'role','authenticated','aal',assurance,
    'user_metadata',jsonb_build_object('role','owner'))::text,true);
end $$;
create function pg_temp.rd_sha(b jsonb) returns text language sql immutable as $$ select encode(sha256(convert_to(b::text,'UTF8')),'hex') $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;

-- Grants: only authenticated staff sessions may call the reads; the helper is private.
select pg_temp.rd_ok(has_function_privilege('authenticated',f,'EXECUTE') and not has_function_privilege('anon',f,'EXECUTE') and not has_function_privilege('service_role',f,'EXECUTE'),'grants for '||f)
  from unnest(array['public.pipstart_editorial_revision(text,integer)','public.pipstart_editorial_history(text,integer,integer)'])f;
select pg_temp.rd_ok(not has_function_privilege(r,'pipstart_editorial_private.decisions_for(text,integer,uuid)','EXECUTE'),'private helper not callable by '||r) from unnest(array['anon','authenticated','service_role'])r;
select pg_temp.rd_ok((select count(*) from pg_proc where pronamespace='public'::regnamespace and proname in ('pipstart_editorial_revision','pipstart_editorial_history') and provolatile='v')=2,'both reads are volatile');

-- Earlier runner stages leave staff fixtures behind; start from no active member (rolled back).
update pipstart_staff_private.members set active=false where active;
-- 1 Owner, 2 author assigned to the lesson, 3 unassigned author, 4 learner (no membership).
insert into auth.users(id,raw_user_meta_data) select ('fa000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'{}' from generate_series(1,4)n;
insert into auth.mfa_factors(id,user_id,factor_type,status)
select ('fa100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fa000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp','verified' from generate_series(1,4)n;
insert into auth.sessions(id,user_id,factor_id,aal)
select ('fa200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fa000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fa100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,4)n;
insert into pipstart_staff_private.members(user_id) select ('fa000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from generate_series(1,3)n;
insert into pipstart_staff_private.roles values
 ('fa000000-0000-4000-8000-000000000001','owner'),('fa000000-0000-4000-8000-000000000002','author'),('fa000000-0000-4000-8000-000000000003','author');
insert into pipstart_staff_private.assignments(user_id,resource_kind,resource_id) values('fa000000-0000-4000-8000-000000000002','lesson','rd-lesson');

-- An imported course: its revision reports import provenance and the imported decision.
select pg_temp.rd_ok(pipstart_editorial_private.import_item('rd-course','course','forex',null,'{"metadata":{"title":"Course"}}','curriculum:forex/rd-course',pg_temp.rd_sha('{"metadata":{"title":"Course"}}'))='created','imported course');
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
set local role authenticated;

-- Owner history: rev 1 draft, rev 2 published by the Owner, rev 3 a later draft.
select pg_temp.rd_as(1);
select pg_temp.rd_ok((public.pipstart_editorial_create('rd-module','module','forex','rd-course','{"metadata":{"title":"Module"}}','first'))->>'state'='draft','module');
select pg_temp.rd_ok((public.pipstart_editorial_create('rd-lesson','lesson','forex','rd-module','{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"one"}]}','first draft'))->>'state'='draft','lesson rev 1');
select pg_temp.rd_ok((public.pipstart_editorial_save('rd-lesson',1,'{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"two"}]}','second'))->>'revision_no'='2','lesson rev 2');
select pg_temp.rd_ok((public.pipstart_editorial_approve_single_person('rd-lesson',2,public.pipstart_editorial_item('rd-lesson')->'revision'->>'body_sha256','ok'))->>'state'='approved','owner publishes rev 2');
select pg_temp.rd_ok((public.pipstart_editorial_save('rd-lesson',2,'{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"three"}]}','third'))->>'revision_no'='3','lesson rev 3');
reset role;
create temporary table rd_counts as select (select count(*) from pipstart_editorial_private.revisions) revisions,(select count(*) from pipstart_editorial_private.audit) audit,(select count(*) from pipstart_editorial_private.decisions) decisions;
grant select on rd_counts to authenticated;
set local role authenticated;
select pg_temp.rd_as(1);

-- An exact earlier revision: body, hash, state and its decisions; reads are not mutations.
select pg_temp.rd_ok((select r->'revision'->'body'->'blocks'->0->>'children'='two' and r->'revision'->>'state'='superseded' and (r->>'latest_revision')::int=3
  and r->'revision'->>'body_sha256'=pg_temp.rd_sha(r->'revision'->'body') and (r->'revision'->>'author_is_me')::boolean
  and jsonb_array_length(r->'decisions')=1 and r->'decisions'->0->>'kind'='single_person' and (r->'decisions'->0->>'by_me')::boolean and not (r->>'imported')::boolean
  from (select public.pipstart_editorial_revision('rd-lesson',2) r) x),'published revision 2 read exactly');
select pg_temp.rd_ok((select r->'revision'->>'state'='draft' and jsonb_array_length(r->'decisions')=0 from (select public.pipstart_editorial_revision('rd-lesson',3) r) x),'latest draft has no decision');
select pg_temp.rd_ok((select (r->>'imported')::boolean and r->'decisions'->0->>'kind'='imported' and r->'revision'->>'state'='approved' from (select public.pipstart_editorial_revision('rd-course',1) r) x),'import provenance reported');
select pg_temp.rd_denied($q$select public.pipstart_editorial_revision('rd-lesson',9)$q$,'22023','unknown revision');
select pg_temp.rd_denied($q$select public.pipstart_editorial_revision('rd-lesson',null)$q$,'22023','missing revision');
select pg_temp.rd_denied($q$select public.pipstart_editorial_revision('rd-none',1)$q$,'22023','unknown identity');

-- History: newest first, no bodies, keyset pages, bounded.
select pg_temp.rd_ok((select (h->>'latest_revision')::int=3 and jsonb_array_length(h->'revisions')=3
  and (select array_agg((e->>'revision_no')::int order by o) from jsonb_array_elements(h->'revisions') with ordinality t(e,o))=array[3,2,1]
  and not exists(select 1 from jsonb_array_elements(h->'revisions') e where e ? 'body')
  and h->'revisions'->1->'decisions'->0->>'kind'='single_person' and h->'revisions'->2->>'reason'='first draft'
  from (select public.pipstart_editorial_history('rd-lesson') h) x),'full history');
select pg_temp.rd_ok((select jsonb_array_length(h->'revisions')=1 and (h->'revisions'->0->>'revision_no')::int=2 from (select public.pipstart_editorial_history('rd-lesson',3,1) h) x),'keyset page');
select pg_temp.rd_ok((select jsonb_array_length(public.pipstart_editorial_history('rd-lesson',2,50)->'revisions')=1),'last page');
select pg_temp.rd_denied($q$select public.pipstart_editorial_history('rd-lesson',null,0)$q$,'22023','zero page');
select pg_temp.rd_denied($q$select public.pipstart_editorial_history('rd-lesson',null,51)$q$,'22023','oversized page');
select pg_temp.rd_denied($q$select public.pipstart_editorial_history('rd-lesson',1,10)$q$,'22023','nothing below revision 1');
select pg_temp.rd_denied($q$select public.pipstart_editorial_history('rd-none')$q$,'22023','unknown identity history');

-- Scoped: the assigned author reads the lesson only; others are refused.
select pg_temp.rd_as(2);
select pg_temp.rd_ok((select not (r->'revision'->>'author_is_me')::boolean and not (r->'decisions'->0->>'by_me')::boolean from (select public.pipstart_editorial_revision('rd-lesson',2) r) x),'assigned author reads without attribution');
select pg_temp.rd_ok(jsonb_array_length(public.pipstart_editorial_history('rd-lesson')->'revisions')=3,'assigned author history');
select pg_temp.rd_denied($q$select public.pipstart_editorial_revision('rd-module',1)$q$,'42501','unassigned item');
select pg_temp.rd_as(3);
select pg_temp.rd_denied($q$select public.pipstart_editorial_revision('rd-lesson',1)$q$,'42501','unassigned author revision');
select pg_temp.rd_denied($q$select public.pipstart_editorial_history('rd-lesson')$q$,'42501','unassigned author history');
select pg_temp.rd_as(4);
select pg_temp.rd_denied($q$select public.pipstart_editorial_revision('rd-lesson',1)$q$,'42501','learner');
select pg_temp.rd_as(1,'aal1');
select pg_temp.rd_denied($q$select public.pipstart_editorial_history('rd-lesson')$q$,'42501','AAL1 owner');
reset role;
select pg_temp.rd_ok((select revisions=(select count(*) from pipstart_editorial_private.revisions) and audit=(select count(*) from pipstart_editorial_private.audit) and decisions=(select count(*) from pipstart_editorial_private.decisions) from rd_counts),'reads write nothing');
select pg_temp.rd_ok((select state from pipstart_editorial_private.revisions where item_id='rd-lesson' and revision_no=2)='superseded','state untouched by reads');

-- Paused staff control refuses even the Owner.
select pipstart_staff_private.transition(false,(select version from pipstart_staff_private.control),gen_random_uuid());
set local role authenticated;
select pg_temp.rd_as(1);
select pg_temp.rd_denied($q$select public.pipstart_editorial_revision('rd-lesson',1)$q$,'42501','paused control');
reset role;
rollback;
