-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Rolled back: no fixture survives.
begin;
create function pg_temp.im_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Import assertion: %',label; end if; end $$;
create function pg_temp.im_denied(command text,expected text,label text) returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then if sqlstate=expected then return; end if;
    raise exception 'Import %: expected SQLSTATE % but got % (%)',label,expected,sqlstate,sqlerrm; end;
  raise exception 'Import %: expected refusal %',label,expected;
end $$;
create function pg_temp.im_sha(b jsonb) returns text language sql immutable as $$ select encode(sha256(convert_to(b::text,'UTF8')),'hex') $$;
create function pg_temp.im(p_id text,p_family text,p_path text,p_parent text,p_body jsonb,p_ref text) returns text language sql as $$
  select pipstart_editorial_private.import_item(p_id,p_family,p_path,p_parent,p_body,p_ref,pg_temp.im_sha(p_body)) $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;

-- Grants: no API role may import or read provenance.
select pg_temp.im_ok(not has_function_privilege(r,'pipstart_editorial_private.import_item(text,text,text,text,jsonb,text,text)','EXECUTE'),'no import for '||r) from unnest(array['anon','authenticated','service_role'])r;
select pg_temp.im_ok(not has_table_privilege(r,'pipstart_editorial_private.imports','SELECT'),'no provenance read for '||r) from unnest(array['anon','authenticated','service_role'])r;

-- Earlier runner stages leave staff fixtures behind; start from no active member (rolled back).
update pipstart_staff_private.members set active=false where active;
select pg_temp.im_ok(not exists(select 1 from pipstart_staff_private.members where active),'no active member at start');

-- No Owner yet: refused.
select pg_temp.im_denied($q$select pg_temp.im('im-course','course','forex',null,'{"metadata":{"title":"Course"}}','curriculum:forex/level-9/im-course')$q$,'55000','import without an Owner');

-- 1 Owner, 2 second Owner (added later). Only membership grants the Owner role.
insert into auth.users(id,raw_user_meta_data) select ('f8000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'{}' from generate_series(1,2)n;
insert into auth.mfa_factors(id,user_id,factor_type,status) values('f8100000-0000-4000-8000-000000000001','f8000000-0000-4000-8000-000000000001','totp','verified');
insert into auth.sessions(id,user_id,factor_id,aal) values('f8200000-0000-4000-8000-000000000001','f8000000-0000-4000-8000-000000000001','f8100000-0000-4000-8000-000000000001','aal2');
insert into pipstart_staff_private.members(user_id) values('f8000000-0000-4000-8000-000000000001');
insert into pipstart_staff_private.roles values('f8000000-0000-4000-8000-000000000001','owner');

-- Created, in hierarchy order; imported content is already approved.
select pg_temp.im_ok(pg_temp.im('im-course','course','forex',null,'{"metadata":{"title":"Course","level":"level-9"}}','curriculum:forex/level-9/im-course')='created','course created');
select pg_temp.im_denied($q$select pg_temp.im('im-lesson','lesson','forex','im-module','{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"one"}]}','lesson-registry:forex/im-lesson')$q$,'22023','child before its parent');
select pg_temp.im_ok(pg_temp.im('im-module','module','forex','im-course','{"metadata":{"title":"Module"}}','curriculum:forex/level-9/im-course/im-module')='created','module created');
select pg_temp.im_ok(pg_temp.im('im-lesson','lesson','forex','im-module','{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"one"}]}','lesson-registry:forex/im-lesson')='created','lesson created');
select pg_temp.im_ok(pg_temp.im('im-quiz','quiz','forex','im-module','{"metadata":{"title":"Quiz","version":1},"questions":[{"id":"q1","choices":[{"id":"a"},{"id":"b"}],"correctChoiceIds":["a"]}]}','assessment-registry:im-quiz@v1')='created','quiz created');
select pg_temp.im_ok(pg_temp.im('im-post','analysis',null,null,'{"metadata":{"title":"Gold","category":"technical","excerpt":"Levels"},"paragraphs":["One"]}','analysis:im-post')='created','analysis created');
select pg_temp.im_ok((select state='approved' and author_id='f8000000-0000-4000-8000-000000000001' from pipstart_editorial_private.revisions where item_id='im-lesson' and revision_no=1),'imported revision is approved and attributed to the Owner');
select pg_temp.im_ok((select count(*) from pipstart_editorial_private.decisions where kind='imported')=5,'one imported decision per item');

-- Repeat: unchanged, nothing written.
select pg_temp.im_ok(pg_temp.im('im-lesson','lesson','forex','im-module','{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"one"}]}','lesson-registry:forex/im-lesson')='unchanged','repeat is a no-op');
select pg_temp.im_ok((select count(*) from pipstart_editorial_private.revisions)=5 and (select count(*) from pipstart_editorial_private.imports)=5,'repeat writes nothing');

-- Refusals.
select pg_temp.im_denied($q$select pipstart_editorial_private.import_item('im-x','course','forex',null,'{"metadata":{"title":"X"}}','curriculum:forex/x',repeat('0',64))$q$,'22023','body hash differs from the manifest');
select pg_temp.im_denied($q$select pg_temp.im('im-lesson','quiz','forex','im-module','{"metadata":{"title":"Q"},"questions":[{"choices":[{},{}],"correctChoiceIds":["a"]}]}','assessment-registry:im-lesson@v1')$q$,'22023','identity differs from the store');
select pg_temp.im_denied($q$select pg_temp.im('im-bad','lesson','forex','im-module','{"metadata":{"title":"L"},"blocks":[{"type":"script"}]}','lesson-registry:forex/im-bad')$q$,'22023','invalid body');
select pg_temp.im_denied($q$select pg_temp.im('im-post2','analysis','forex',null,'{"metadata":{"title":"G","category":"technical","excerpt":"e"},"paragraphs":["One"]}','analysis:im-post2')$q$,'22023','analysis with a path');
select pg_temp.im_denied($q$select pg_temp.im('Bad ID','course','forex',null,'{"metadata":{"title":"C"}}','curriculum:forex/bad')$q$,'22023','invalid identity');

-- Drift: code changed and nobody edited the item: a new imported revision.
select pg_temp.im_ok(pg_temp.im('im-lesson','lesson','forex','im-module','{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"two"}]}','lesson-registry:forex/im-lesson')='updated','drift updates');
select pg_temp.im_ok((select latest_revision=2 from pipstart_editorial_private.items where id='im-lesson')
  and (select state from pipstart_editorial_private.revisions where item_id='im-lesson' and revision_no=1)='superseded'
  and (select state from pipstart_editorial_private.revisions where item_id='im-lesson' and revision_no=2)='approved','drift supersedes the earlier import');

-- A store edit is never overwritten: the next import reports a conflict and writes nothing.
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub','f8000000-0000-4000-8000-000000000001','session_id','f8200000-0000-4000-8000-000000000001','role','authenticated','aal','aal2')::text,true);
select pg_temp.im_ok((public.pipstart_editorial_save('im-lesson',2,'{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"staff edit"}]}','staff edit'))->>'state'='draft','staff edits the imported lesson');
select pg_temp.im_ok((public.pipstart_editorial_trash('im-post','retired'))->>'trashed'='true','staff trashes the imported post');
reset role;
select pg_temp.im_ok(pg_temp.im('im-lesson','lesson','forex','im-module','{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"three"}]}','lesson-registry:forex/im-lesson')='conflict','edited item is not overwritten');
select pg_temp.im_ok(pg_temp.im('im-lesson','lesson','forex','im-module','{"metadata":{"title":"Lesson"},"blocks":[{"type":"paragraph","children":"two"}]}','lesson-registry:forex/im-lesson')='conflict','even an unchanged source reports the conflict');
select pg_temp.im_ok(pg_temp.im('im-post','analysis',null,null,'{"metadata":{"title":"Gold","category":"technical","excerpt":"Levels"},"paragraphs":["One"]}','analysis:im-post')='conflict','trashed item is not resurrected');
select pg_temp.im_ok((select latest_revision=3 from pipstart_editorial_private.items where id='im-lesson')
  and (select body->'blocks'->0->>'children' from pipstart_editorial_private.revisions where item_id='im-lesson' and revision_no=3)='staff edit','staff work survives');

-- Exactly one active Owner is required.
insert into pipstart_staff_private.members(user_id) values('f8000000-0000-4000-8000-000000000002');
insert into pipstart_staff_private.roles values('f8000000-0000-4000-8000-000000000002','owner');
select pg_temp.im_denied($q$select pg_temp.im('im-course','course','forex',null,'{"metadata":{"title":"Course","level":"level-9"}}','curriculum:forex/level-9/im-course')$q$,'55000','two active Owners');

-- Provenance is append-only, and audit records exactly the successful imports.
select pg_temp.im_denied($q$update pipstart_editorial_private.imports set source_ref='curriculum:x'$q$,'42501','provenance immutable');
select pg_temp.im_denied($q$delete from pipstart_editorial_private.imports$q$,'42501','provenance cannot be deleted');
select pg_temp.im_ok((select count(*) from pipstart_editorial_private.audit where operation='import')=6
  and (select count(*) from pipstart_editorial_private.imports)=6
  and (select count(*) from pipstart_editorial_private.decisions where kind='imported')=6,'six imports audited, recorded and decided');
select pg_temp.im_ok((select bool_and(i.body_sha256=r.body_sha256 and d.body_sha256=r.body_sha256) from pipstart_editorial_private.imports i join pipstart_editorial_private.revisions r using(item_id,revision_no) join pipstart_editorial_private.decisions d using(item_id,revision_no) where d.kind='imported'),'provenance, decision and revision hashes agree');
rollback;
