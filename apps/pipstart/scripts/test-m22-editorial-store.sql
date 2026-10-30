-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Rolled back: no fixture survives. Live Auth/PostgREST evidence is a separate run.
begin;
create function pg_temp.ed_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Editorial assertion: %',label; end if; end $$;
create function pg_temp.ed_denied(command text,expected text,label text) returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then if sqlstate=expected then return; end if;
    raise exception 'Editorial %: expected SQLSTATE % but got % (%)',label,expected,sqlstate,sqlerrm; end;
  raise exception 'Editorial %: expected refusal %',label,expected;
end $$;
create function pg_temp.ed_as(n integer,assurance text default 'aal2') returns void
language plpgsql security definer set search_path='' as $$
begin
  perform set_config('request.jwt.claims',jsonb_build_object('sub',('f4000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
    'session_id',('f5000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'role','authenticated','aal',assurance,
    'user_metadata',jsonb_build_object('role','owner'))::text,true);
end $$;
create function pg_temp.ed_sha(p_id text) returns text language sql as $$ select public.pipstart_editorial_item(p_id)->'revision'->>'body_sha256' $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;

-- 1 Owner, 2 author, 3 reviewer, 4 editor, 5 learner (no membership), 6 author without assignments.
insert into auth.users(id,raw_user_meta_data)
select ('f4000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,jsonb_build_object('display_name','Editorial fixture '||n,'role','owner') from generate_series(1,6)n;
insert into auth.mfa_factors(id,user_id,factor_type,status)
select ('f6000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('f4000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp','verified' from generate_series(1,6)n;
insert into auth.sessions(id,user_id,factor_id,aal)
select ('f5000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('f4000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('f6000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,6)n;
insert into pipstart_staff_private.members(user_id) select ('f4000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from unnest(array[1,2,3,4,6])n;
insert into pipstart_staff_private.roles values
 ('f4000000-0000-4000-8000-000000000001','owner'),('f4000000-0000-4000-8000-000000000002','author'),
 ('f4000000-0000-4000-8000-000000000003','reviewer'),('f4000000-0000-4000-8000-000000000004','editor'),
 ('f4000000-0000-4000-8000-000000000006','author');

-- Grants: authenticated may call the RPCs; nobody reaches the private tables or schema.
select pg_temp.ed_ok(has_function_privilege('authenticated','public.pipstart_editorial_save(text,integer,jsonb,text)','EXECUTE'),'authenticated may call save');
select pg_temp.ed_ok(not has_function_privilege('anon','public.pipstart_editorial_save(text,integer,jsonb,text)','EXECUTE'),'anonymous cannot call save');
select pg_temp.ed_ok(not has_function_privilege('service_role','public.pipstart_editorial_approve_single_person(text,integer,text,text)','EXECUTE'),'service credential cannot publish');
select pg_temp.ed_ok(not has_schema_privilege(r,'pipstart_editorial_private','USAGE'),'no private schema access for '||r) from unnest(array['anon','authenticated','service_role'])r;
select pg_temp.ed_ok(not has_function_privilege('authenticated','pipstart_editorial_private.body_ok(text,jsonb)','EXECUTE'),'private helpers are not callable');
-- PostgREST runs stable/immutable functions read-only, where the actor check's FOR SHARE fails.
select pg_temp.ed_ok((select count(*) from pg_proc where pronamespace='public'::regnamespace and proname like 'pipstart_editorial_%' and provolatile='v')=11
  and not exists(select 1 from pg_proc where pronamespace='public'::regnamespace and proname like 'pipstart_editorial_%' and provolatile<>'v'),'every editorial RPC is volatile');
select pg_temp.ed_ok((select not require_review and version=0 from pipstart_editorial_private.policy),'review is optional by default');

-- Paused staff control: even the Owner is refused.
set local role authenticated;
select pg_temp.ed_as(1);
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-course','course','forex',null,'{"metadata":{"title":"Course"}}','first')$q$,'42501','paused control');
reset role;
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
set local role authenticated;

-- AAL1 and non-members are refused; editable metadata claiming owner grants nothing.
select pg_temp.ed_as(1,'aal1');
select pg_temp.ed_denied($q$select public.pipstart_editorial_list()$q$,'42501','AAL1 owner');
select pg_temp.ed_as(5);
select pg_temp.ed_denied($q$select public.pipstart_editorial_list()$q$,'42501','learner list');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-course','course','forex',null,'{"metadata":{"title":"Course"}}','first')$q$,'42501','learner create');

-- Creation within the hierarchy.
select pg_temp.ed_as(2);
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-course','course','forex',null,'{"metadata":{"title":"Course"}}','first')$q$,'42501','author cannot create a course');
select pg_temp.ed_as(1);
select pg_temp.ed_ok((public.pipstart_editorial_create('mp04-course','course','forex',null,'{"metadata":{"title":"Course"}}','first'))->>'state'='draft','owner creates course');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-course','course','forex',null,'{"metadata":{"title":"Again"}}','dup')$q$,'22023','duplicate identity');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('Bad ID','course','forex',null,'{"metadata":{"title":"Course"}}','bad')$q$,'22023','invalid identity');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-lone-lesson','lesson','forex',null,'{"metadata":{"title":"L"},"blocks":[{"type":"paragraph","children":"x"}]}','x')$q$,'22023','lesson needs a parent');
select pg_temp.ed_ok((public.pipstart_editorial_create('mp04-module','module','forex','mp04-course','{"metadata":{"title":"Module"}}','first'))->>'revision_no'='1','owner creates module');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-cross','module','crypto','mp04-course','{"metadata":{"title":"M"}}','x')$q$,'22023','parent path must match');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-bad-parent','module','forex','mp04-module','{"metadata":{"title":"M"}}','x')$q$,'22023','module needs a course parent');
reset role;
insert into pipstart_staff_private.assignments(user_id,resource_kind,resource_id) values
 ('f4000000-0000-4000-8000-000000000002','module','mp04-module'),('f4000000-0000-4000-8000-000000000002','lesson','mp04-lesson'),
 ('f4000000-0000-4000-8000-000000000003','lesson','mp04-lesson'),('f4000000-0000-4000-8000-000000000004','lesson','mp04-lesson');
set local role authenticated;
select pg_temp.ed_as(6);
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-lesson','lesson','forex','mp04-module','{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"x"}]}','x')$q$,'42501','unassigned author cannot create');
select pg_temp.ed_as(2);
-- Server-side structure is enforced even when the RPC is called directly.
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-lesson','lesson','forex','mp04-module','{"metadata":{"title":"Lesson"},"blocks":[{"type":"script","children":"x"}]}','x')$q$,'22023','unsupported block type');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-lesson','lesson','forex','mp04-module','{"metadata":{"title":" "},"blocks":[{"type":"paragraph","children":"x"}]}','x')$q$,'22023','blank title');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-lesson','lesson','forex','mp04-module','{"metadata":{"title":"Lesson"},"blocks":[]}','x')$q$,'22023','empty lesson');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-lesson','lesson','forex','mp04-module','{"metadata":{},"blocks":[{"type":"paragraph","children":"x"}]}','x')$q$,'22023','missing title');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-lesson','lesson','forex','mp04-module','{"metadata":{"title":"Lesson"}}','x')$q$,'22023','missing blocks');
select pg_temp.ed_denied(format($q$select public.pipstart_editorial_create('mp04-lesson','lesson','forex','mp04-module',%L,'x')$q$,jsonb_build_object('metadata',jsonb_build_object('title','Lesson'),'blocks',jsonb_build_array(jsonb_build_object('type','paragraph','children',repeat('x',262200))))),'22023','oversized body');
select pg_temp.ed_ok((public.pipstart_editorial_create('mp04-lesson','lesson','forex','mp04-module','{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"one"}]}','first draft'))->>'state'='draft','author creates lesson');

-- Saves create immutable revisions with optimistic concurrency.
select pg_temp.ed_ok((public.pipstart_editorial_save('mp04-lesson',1,'{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"two"}]}','second'))->>'revision_no'='2','author saves revision 2');
select pg_temp.ed_denied($q$select public.pipstart_editorial_save('mp04-lesson',1,'{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"stale"}]}','stale')$q$,'PT409','stale base refused');
select pg_temp.ed_as(3);
select pg_temp.ed_denied($q$select public.pipstart_editorial_save('mp04-lesson',2,'{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"x"}]}','x')$q$,'42501','reviewer cannot write');
select pg_temp.ed_as(5);
select pg_temp.ed_denied($q$select public.pipstart_editorial_item('mp04-lesson')$q$,'42501','learner cannot read drafts');

-- "Send to reviewer": exact hash, a different reviewer decides.
select pg_temp.ed_as(2);
select pg_temp.ed_denied($q$select public.pipstart_editorial_submit('mp04-lesson',2,repeat('0',64))$q$,'PT409','wrong hash refused');
select pg_temp.ed_denied($q$select public.pipstart_editorial_submit('mp04-lesson',1,pg_temp.ed_sha('mp04-lesson'))$q$,'PT409','old revision refused');
select pg_temp.ed_ok((public.pipstart_editorial_submit('mp04-lesson',2,pg_temp.ed_sha('mp04-lesson')))->>'state'='submitted','author submits');
select pg_temp.ed_denied($q$select public.pipstart_editorial_review('mp04-lesson',2,pg_temp.ed_sha('mp04-lesson'),true,null)$q$,'42501','author cannot review');
select pg_temp.ed_denied($q$select public.pipstart_editorial_approve_single_person('mp04-lesson',2,pg_temp.ed_sha('mp04-lesson'),null)$q$,'42501','author cannot publish without review');
select pg_temp.ed_as(3);
select pg_temp.ed_denied($q$select public.pipstart_editorial_review('mp04-lesson',2,pg_temp.ed_sha('mp04-lesson'),false,null)$q$,'22023','changes need a note');
select pg_temp.ed_ok((public.pipstart_editorial_review('mp04-lesson',2,pg_temp.ed_sha('mp04-lesson'),false,'Add a source'))->>'state'='changes_requested','reviewer requests changes');
select pg_temp.ed_as(2);
select pg_temp.ed_denied($q$select public.pipstart_editorial_submit('mp04-lesson',2,pg_temp.ed_sha('mp04-lesson'))$q$,'55000','changes-requested revision cannot be resubmitted');
select pg_temp.ed_ok((public.pipstart_editorial_save('mp04-lesson',2,'{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"three"},{"type":"references","items":[]}]}','sources added'))->>'revision_no'='3','author saves revision 3');
select pg_temp.ed_ok((public.pipstart_editorial_submit('mp04-lesson',3,pg_temp.ed_sha('mp04-lesson')))->>'state'='submitted','author resubmits');
select pg_temp.ed_as(3);
select pg_temp.ed_ok((public.pipstart_editorial_review('mp04-lesson',3,pg_temp.ed_sha('mp04-lesson'),true,null))->>'state'='approved','reviewer approves exact revision');
select pg_temp.ed_ok((public.pipstart_editorial_item('mp04-lesson')->'decisions'->0->>'kind')='reviewed','approval recorded as reviewed');

-- A later edit supersedes approval; the Owner cannot review their own revision.
select pg_temp.ed_as(1);
select pg_temp.ed_ok((public.pipstart_editorial_save('mp04-lesson',3,'{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"four"}]}','owner edit'))->>'state'='draft','owner saves revision 4');
reset role;
select pg_temp.ed_ok((select state from pipstart_editorial_private.revisions where item_id='mp04-lesson' and revision_no=3)='superseded','new edit supersedes the approved revision');
set local role authenticated;
select pg_temp.ed_as(1);
select pg_temp.ed_ok((public.pipstart_editorial_submit('mp04-lesson',4,pg_temp.ed_sha('mp04-lesson')))->>'state'='submitted','owner sends own draft to reviewer');
select pg_temp.ed_denied($q$select public.pipstart_editorial_review('mp04-lesson',4,pg_temp.ed_sha('mp04-lesson'),true,null)$q$,'42501','owner cannot review own revision');

-- "Publish": Owner single-person decision on the exact revision.
select pg_temp.ed_denied($q$select public.pipstart_editorial_approve_single_person('mp04-lesson',4,repeat('0',64),null)$q$,'PT409','single-person needs exact hash');
select pg_temp.ed_ok((public.pipstart_editorial_approve_single_person('mp04-lesson',4,pg_temp.ed_sha('mp04-lesson'),'Solo publish'))->>'state'='approved','owner single-person approval');
select pg_temp.ed_ok((public.pipstart_editorial_item('mp04-lesson')->'decisions'->0->>'kind')='single_person','approval recorded as single_person');
select pg_temp.ed_denied($q$select public.pipstart_editorial_approve_single_person('mp04-lesson',4,pg_temp.ed_sha('mp04-lesson'),null)$q$,'55000','approval is not repeated');

-- Policy switch: requiring review closes "Publish" for everyone, without touching past approvals.
select pg_temp.ed_denied($q$select public.pipstart_editorial_set_review_policy(true,7)$q$,'PT409','stale policy version');
select pg_temp.ed_ok((public.pipstart_editorial_set_review_policy(true,0))->>'version'='1','owner requires review');
select pg_temp.ed_ok((public.pipstart_editorial_save('mp04-course',1,'{"metadata":{"title":"Course v2"}}','rename'))->>'revision_no'='2','owner saves course');
select pg_temp.ed_denied($q$select public.pipstart_editorial_approve_single_person('mp04-course',2,pg_temp.ed_sha('mp04-course'),null)$q$,'42501','policy closes single-person publish');
select pg_temp.ed_ok((public.pipstart_editorial_item('mp04-lesson')->'revision'->>'state')='approved','earlier approval unchanged');
select pg_temp.ed_ok((public.pipstart_editorial_set_review_policy(false,1))->>'version'='2','owner reopens single-person publish');
select pg_temp.ed_as(2);
select pg_temp.ed_denied($q$select public.pipstart_editorial_set_review_policy(true,2)$q$,'42501','author cannot change policy');

-- Trash, hold and restore.
select pg_temp.ed_as(1);
select pg_temp.ed_ok((public.pipstart_editorial_hold('mp04-lesson','Legal review'))->>'held'='true','owner holds lesson');
select pg_temp.ed_as(2);
select pg_temp.ed_denied($q$select public.pipstart_editorial_hold('mp04-lesson',null)$q$,'42501','author cannot release hold');
select pg_temp.ed_denied($q$select public.pipstart_editorial_trash('mp04-lesson','tidy')$q$,'55000','held content cannot be trashed');
select pg_temp.ed_as(1);
select pg_temp.ed_ok((public.pipstart_editorial_hold('mp04-lesson',null))->>'held'='false','owner releases hold');
select pg_temp.ed_denied($q$select public.pipstart_editorial_trash('mp04-module','tidy')$q$,'55000','parent with live children cannot be trashed');
select pg_temp.ed_as(2);
select pg_temp.ed_denied($q$select public.pipstart_editorial_trash('mp04-lesson',' ')$q$,'22023','trash needs a reason');
select pg_temp.ed_ok((public.pipstart_editorial_trash('mp04-lesson','Replaced'))->>'trashed'='true','author trashes assigned lesson');
select pg_temp.ed_denied($q$select public.pipstart_editorial_save('mp04-lesson',4,'{"metadata":{"title":"L"},"blocks":[{"type":"paragraph","children":"x"}]}','x')$q$,'55000','trashed content cannot be edited');
select pg_temp.ed_denied($q$select public.pipstart_editorial_restore('mp04-lesson','back')$q$,'42501','author cannot restore');
select pg_temp.ed_as(4);
select pg_temp.ed_ok((public.pipstart_editorial_restore('mp04-lesson','Back in use'))->>'state'='draft','editor restores as a new draft');
select pg_temp.ed_ok((public.pipstart_editorial_item('mp04-lesson')->'revision'->>'revision_no')='5','restore created revision 5');
select pg_temp.ed_ok((public.pipstart_editorial_item('mp04-lesson')->'decisions')='[]'::jsonb,'restore does not reinstate approval');

-- Reads are scoped: the unassigned author sees nothing; the Owner sees everything.
select pg_temp.ed_as(6);
select pg_temp.ed_ok(jsonb_array_length(public.pipstart_editorial_list())=0,'unassigned author lists nothing');
select pg_temp.ed_as(2);
select pg_temp.ed_ok(jsonb_array_length(public.pipstart_editorial_list())=2,'author lists assigned module and lesson');
select pg_temp.ed_as(1);
select pg_temp.ed_ok(jsonb_array_length(public.pipstart_editorial_list())=3,'owner lists all three');
select pg_temp.ed_ok(jsonb_array_length(public.pipstart_editorial_list('mp04-lesson',1))=1,'keyset page after an id');
select pg_temp.ed_denied($q$select public.pipstart_editorial_list('',101)$q$,'22023','page size is bounded');

-- Analysis posts: no path, no parent, exactly one section (fundamental or technical).
select pg_temp.ed_as(2);
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-gold','analysis',null,null,'{"metadata":{"title":"Gold outlook","category":"technical","excerpt":"Levels to watch"},"paragraphs":["One"]}','x')$q$,'42501','author cannot create analysis');
select pg_temp.ed_as(1);
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-gold','analysis','forex',null,'{"metadata":{"title":"Gold outlook","category":"technical","excerpt":"Levels to watch"},"paragraphs":["One"]}','x')$q$,'22023','analysis has no learning path');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-gold','analysis',null,'mp04-course','{"metadata":{"title":"Gold outlook","category":"technical","excerpt":"Levels to watch"},"paragraphs":["One"]}','x')$q$,'22023','analysis has no parent');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-pathless','course',null,null,'{"metadata":{"title":"C"}}','x')$q$,'22023','learning content needs a path');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-gold','analysis',null,null,'{"metadata":{"title":"Gold","excerpt":"e"},"paragraphs":["One"]}','x')$q$,'22023','analysis needs a section');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-gold','analysis',null,null,'{"metadata":{"title":"Gold","category":["fundamental","technical"],"excerpt":"e"},"paragraphs":["One"]}','x')$q$,'22023','analysis cannot be in both sections');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-gold','analysis',null,null,'{"metadata":{"title":"Gold","category":"both","excerpt":"e"},"paragraphs":["One"]}','x')$q$,'22023','analysis section must be known');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-gold','analysis',null,null,'{"metadata":{"title":"Gold","category":"technical","excerpt":"e"},"paragraphs":[]}','x')$q$,'22023','analysis needs paragraphs');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-gold','analysis',null,null,'{"metadata":{"title":"Gold","category":"technical"},"paragraphs":["One"]}','x')$q$,'22023','analysis needs an excerpt');
select pg_temp.ed_ok((public.pipstart_editorial_create('mp04-gold','analysis',null,null,'{"metadata":{"title":"Gold outlook","category":"technical","excerpt":"Levels to watch"},"paragraphs":["One"]}','first'))->>'state'='draft','owner creates technical analysis');
select pg_temp.ed_denied($q$select public.pipstart_editorial_create('mp04-under-post','lesson','forex','mp04-gold','{"metadata":{"title":"L"},"blocks":[{"type":"paragraph","children":"x"}]}','x')$q$,'22023','analysis accepts no children');
select pg_temp.ed_ok((select x->>'category'='technical' and x->>'learning_path' is null from jsonb_array_elements(public.pipstart_editorial_list()) x where x->>'id'='mp04-gold'),'list shows the single section');
select pg_temp.ed_ok((public.pipstart_editorial_save('mp04-gold',1,'{"metadata":{"title":"Gold outlook","category":"fundamental","excerpt":"Rates and gold"},"paragraphs":["One","Two"]}','moved to fundamental'))->>'revision_no'='2','edit may move a post to the other section');
select pg_temp.ed_ok((public.pipstart_editorial_approve_single_person('mp04-gold',2,pg_temp.ed_sha('mp04-gold'),null))->>'state'='approved','owner publishes analysis');
select pg_temp.ed_ok((select x->>'category'='fundamental' from jsonb_array_elements(public.pipstart_editorial_list()) x where x->>'id'='mp04-gold'),'section follows the latest revision');
reset role;

-- Immutability holds even for the database owner role used by migrations.
select pg_temp.ed_ok(not pipstart_editorial_private.body_ok('quiz','{"metadata":{"title":"Q"},"questions":[{"choices":[{"id":"a"},{"id":"b"}]}]}'),'quiz question needs an answer key');
-- BEGIN generated shape fixtures (src/lib/content/shape-parity.test.ts)
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('course',$fx${"metadata":{"title":"Course"}}$fx$::jsonb) is true,'shape fixture: course minimal');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('module',$fx${"metadata":{"title":"Module"}}$fx$::jsonb) is true,'shape fixture: module minimal');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('course',$fx${"metadata":{"title":"  Course  "}}$fx$::jsonb) is true,'shape fixture: title padded with spaces');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('course',$fx${"metadata":{"title":"\t"}}$fx$::jsonb) is true,'shape fixture: title of only a tab is not blank to btrim');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('course',$fx${"metadata":{}}$fx$::jsonb) is false,'shape fixture: title missing');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('course',$fx${"metadata":{"title":"   "}}$fx$::jsonb) is false,'shape fixture: title only spaces');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('course',$fx${"metadata":{"title":7}}$fx$::jsonb) is false,'shape fixture: title not a string');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('module',$fx${}$fx$::jsonb) is false,'shape fixture: metadata missing');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('module',$fx$[]$fx$::jsonb) is false,'shape fixture: body is a list');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('lesson',$fx${"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"One"}]}$fx$::jsonb) is true,'shape fixture: lesson minimal');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('lesson',$fx${"metadata":{"title":"Lesson"},"blocks":[{"type":"heading","children":"One"}],"sections":[]}$fx$::jsonb) is true,'shape fixture: lesson with sections');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('lesson',$fx${"metadata":{"title":"Lesson"}}$fx$::jsonb) is false,'shape fixture: lesson blocks missing');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('lesson',$fx${"metadata":{"title":"Lesson"},"blocks":[]}$fx$::jsonb) is false,'shape fixture: lesson blocks empty');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('lesson',$fx${"metadata":{"title":"Lesson"},"blocks":[{"type":"script","children":"x"}]}$fx$::jsonb) is false,'shape fixture: lesson unsupported block');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('lesson',$fx${"metadata":{"title":"Lesson"},"blocks":[{"children":"x"}]}$fx$::jsonb) is false,'shape fixture: lesson block without type');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('lesson',$fx${"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"x"}],"sections":{}}$fx$::jsonb) is false,'shape fixture: lesson sections not a list');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('quiz',$fx${"metadata":{"title":"Quiz"},"questions":[{"choices":[{"id":"a"},{"id":"b"}],"correctChoiceIds":["a"]}]}$fx$::jsonb) is true,'shape fixture: quiz minimal');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('quiz',$fx${"metadata":{"title":"Quiz"},"questions":[]}$fx$::jsonb) is false,'shape fixture: quiz without questions');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('quiz',$fx${"metadata":{"title":"Quiz"},"questions":[{"choices":[{"id":"a"},{"id":"b"}]}]}$fx$::jsonb) is false,'shape fixture: quiz question without answer key');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('quiz',$fx${"metadata":{"title":"Quiz"},"questions":[{"choices":[{"id":"a"}],"correctChoiceIds":["a"]}]}$fx$::jsonb) is false,'shape fixture: quiz question with one choice');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('quiz',$fx${"metadata":{"title":"Quiz"},"questions":[{"choices":[{"id":"a"},{"id":"b"}],"correctChoiceIds":[]}]}$fx$::jsonb) is false,'shape fixture: quiz empty answer key');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('analysis',$fx${"metadata":{"title":"Gold","category":"technical","excerpt":"Levels"},"paragraphs":["One"]}$fx$::jsonb) is true,'shape fixture: analysis technical');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('analysis',$fx${"metadata":{"title":"Rates","category":"fundamental","excerpt":"Rates"},"paragraphs":["One","Two"]}$fx$::jsonb) is true,'shape fixture: analysis fundamental');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('analysis',$fx${"metadata":{"title":"Gold","excerpt":"e"},"paragraphs":["One"]}$fx$::jsonb) is false,'shape fixture: analysis without a section');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('analysis',$fx${"metadata":{"title":"Gold","category":["fundamental","technical"],"excerpt":"e"},"paragraphs":["One"]}$fx$::jsonb) is false,'shape fixture: analysis in both sections');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('analysis',$fx${"metadata":{"title":"Gold","category":"both","excerpt":"e"},"paragraphs":["One"]}$fx$::jsonb) is false,'shape fixture: analysis unknown section');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('analysis',$fx${"metadata":{"title":"Gold","category":"technical"},"paragraphs":["One"]}$fx$::jsonb) is false,'shape fixture: analysis without excerpt');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('analysis',$fx${"metadata":{"title":"Gold","category":"technical","excerpt":"e"},"paragraphs":[]}$fx$::jsonb) is false,'shape fixture: analysis without paragraphs');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('analysis',$fx${"metadata":{"title":"Gold","category":"technical","excerpt":"e"},"paragraphs":["One","  "]}$fx$::jsonb) is false,'shape fixture: analysis blank paragraph');
select pg_temp.ed_ok(pipstart_editorial_private.body_ok('analysis',$fx${"metadata":{"title":"Gold","category":"technical","excerpt":"e"},"paragraphs":[3]}$fx$::jsonb) is false,'shape fixture: analysis paragraph not text');
-- END generated shape fixtures
select pg_temp.ed_denied($q$update pipstart_editorial_private.revisions set body='{}' where item_id='mp04-lesson' and revision_no=1$q$,'42501','revision body immutable');
select pg_temp.ed_denied($q$delete from pipstart_editorial_private.revisions where item_id='mp04-lesson'$q$,'42501','revisions cannot be deleted');
select pg_temp.ed_denied($q$update pipstart_editorial_private.revisions set state='approved' where item_id='mp04-lesson' and revision_no=1$q$,'55000','superseded cannot be re-approved');
select pg_temp.ed_denied($q$delete from pipstart_editorial_private.items where id='mp04-lesson'$q$,'42501','identities are permanent');
select pg_temp.ed_denied($q$update pipstart_editorial_private.items set learning_path='crypto' where id='mp04-lesson'$q$,'42501','identity fields immutable');
select pg_temp.ed_denied($q$insert into pipstart_editorial_private.items(id,family,learning_path,created_by) values('mp04-bad-post','analysis','forex','f4000000-0000-4000-8000-000000000001')$q$,'23514','analysis rows never carry a path');
select pg_temp.ed_denied($q$delete from pipstart_editorial_private.decisions$q$,'42501','decisions append-only');
select pg_temp.ed_denied($q$update pipstart_editorial_private.audit set detail='x'$q$,'42501','audit append-only');
select pg_temp.ed_ok((select bool_and(body_sha256=encode(sha256(convert_to(body::text,'UTF8')),'hex')) from pipstart_editorial_private.revisions),'stored hash equals the body');

-- Audit is complete and minimized, and an audit failure rolls the change back.
-- 4 creates, 5 saves, 3 submits, 4 decisions, 2 policy changes, hold, release, trash, restore.
select pg_temp.ed_ok((select count(*) from pipstart_editorial_private.audit)=22,'every change audited exactly once');
select pg_temp.ed_ok((select count(*) from pipstart_editorial_private.audit where operation='approve_single_person')=2 and (select count(*) from pipstart_editorial_private.audit where operation='review_approve')=1
  and (select count(*) from pipstart_editorial_private.audit where operation='policy')=2 and (select count(*) from pipstart_editorial_private.audit where operation in ('hold','release'))=2,'each decision and policy change audited');
select pg_temp.ed_ok((select coalesce(max(char_length(detail)),0)<=200 and bool_and(detail is null or detail not like '%"blocks"%') from pipstart_editorial_private.audit),'audit holds no content bodies');
create function pg_temp.ed_fail_audit() returns trigger language plpgsql as $$ begin raise exception using errcode='P0001',message='Injected audit failure'; end $$;
create trigger ed_fail_audit before insert on pipstart_editorial_private.audit for each row execute function pg_temp.ed_fail_audit();
set local role authenticated;
select pg_temp.ed_as(1);
select pg_temp.ed_denied($q$select public.pipstart_editorial_save('mp04-course',2,'{"metadata":{"title":"Course v3"}}','x')$q$,'P0001','audit failure aborts the save');
reset role;
drop trigger ed_fail_audit on pipstart_editorial_private.audit;
select pg_temp.ed_ok((select latest_revision from pipstart_editorial_private.items where id='mp04-course')=2 and (select count(*) from pipstart_editorial_private.revisions where item_id='mp04-course')=2,'no revision survives a failed audit');
rollback;
