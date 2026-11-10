-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Rolled back: no fixture survives. Concurrency (two sessions) is the runner's separate stage.
begin;
create function pg_temp.pb_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Publication assertion: %',label; end if; end $$;
create function pg_temp.pb_denied(command text,expected text,label text) returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then if sqlstate=expected then return; end if;
    raise exception 'Publication %: expected SQLSTATE % but got % (%)',label,expected,sqlstate,sqlerrm; end;
  raise exception 'Publication %: expected refusal %',label,expected;
end $$;
create function pg_temp.pb_as(n integer) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform set_config('request.jwt.claims',jsonb_build_object('sub',('fe000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
    'session_id',('fe200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'role','authenticated','aal','aal2',
    'user_metadata',jsonb_build_object('role','owner'))::text,true);
end $$;
create function pg_temp.pb_sha(p_id text) returns text language sql as $$ select public.pipstart_editorial_item(p_id)->'revision'->>'body_sha256' $$;
create function pg_temp.pb_rev(p_id text) returns integer language sql as $$ select (public.pipstart_editorial_item(p_id)->'item'->>'latest_revision')::integer $$;
create function pg_temp.op(n integer) returns uuid language sql immutable as $$ select ('fe900000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.gen() returns bigint language sql security definer set search_path='' as $$ select generation from pipstart_editorial_private.publication_pointer $$;
create function pg_temp.qz(v integer,correct text) returns jsonb language sql immutable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title','Quiz','version',v),
    'questions',jsonb_build_array(jsonb_build_object('id','q1','choices',jsonb_build_array(jsonb_build_object('id','a'),jsonb_build_object('id','b')),'correctChoiceIds',jsonb_build_array(correct)))) $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;

-- Grants and volatility: private helpers are reachable by no API role; staff RPCs by authenticated
-- only; the build read and delivery tracking by service_role only.
select pg_temp.pb_ok(not has_function_privilege(r,f::regprocedure,'EXECUTE'),'private '||f||' for '||r)
  from unnest(array['anon','authenticated','service_role'])r,
  unnest(array['pipstart_editorial_private.revision_approved(text,integer,text)','pipstart_editorial_private.freeze_quiz_versions(bigint)',
    'pipstart_editorial_private.generation_snapshot(bigint)','pipstart_editorial_private.locked_pointer()',
    'pipstart_editorial_private.replayed(uuid,text,text,integer,bigint)','pipstart_editorial_private.generation_result(bigint,boolean)',
    'pipstart_editorial_private.complete_generation(bigint,uuid,text,text,integer,text)','pipstart_editorial_private.reason_ok(text)'])f;
select pg_temp.pb_ok(has_function_privilege('authenticated',f,'EXECUTE') and not has_function_privilege('anon',f,'EXECUTE') and not has_function_privilege('service_role',f,'EXECUTE'),'staff grant '||f)
  from unnest(array['public.pipstart_publication_baseline(uuid,text)','public.pipstart_publication_publish(uuid,bigint,text,integer,text,text)',
    'public.pipstart_publication_withdraw(uuid,bigint,text,text)','public.pipstart_publication_restore(uuid,bigint,bigint,text)',
    'public.pipstart_publication_status(text)','public.pipstart_editorial_trash(text,text)'])f;
select pg_temp.pb_ok(has_function_privilege('service_role',f,'EXECUTE') and not has_function_privilege('authenticated',f,'EXECUTE') and not has_function_privilege('anon',f,'EXECUTE'),'service grant '||f)
  from unnest(array['public.pipstart_publication_snapshot()','public.pipstart_publication_refresh(bigint,text,text)'])f;
select pg_temp.pb_ok((select count(*) from pg_proc where pronamespace='public'::regnamespace and proname in
  ('pipstart_publication_baseline','pipstart_publication_publish','pipstart_publication_withdraw','pipstart_publication_restore','pipstart_publication_status','pipstart_publication_refresh') and provolatile<>'v')=0,'staff and delivery RPCs are volatile');
select pg_temp.pb_ok(not has_table_privilege(r,t,'SELECT'),'table '||t||' for '||r)
  from unnest(array['anon','authenticated','service_role'])r,
  unnest(array['pipstart_editorial_private.generations','pipstart_editorial_private.generation_entries','pipstart_editorial_private.generation_seals',
    'pipstart_editorial_private.generation_quiz_versions','pipstart_editorial_private.publication_pointer','pipstart_editorial_private.refresh_jobs'])t;

-- Earlier runner stages leave staff fixtures behind; start from no active member (rolled back).
update pipstart_staff_private.members set active=false where active;
-- 1 Owner, 2 author (assigned to the curriculum fixtures; analysis posts are not assignable), 3 reviewer.
insert into auth.users(id,raw_user_meta_data) select ('fe000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'{}' from generate_series(1,3)n;
insert into auth.mfa_factors(id,user_id,factor_type,status)
select ('fe100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fe000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp','verified' from generate_series(1,3)n;
insert into auth.sessions(id,user_id,factor_id,aal)
select ('fe200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fe000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fe100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,3)n;
insert into pipstart_staff_private.members(user_id) select ('fe000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid from generate_series(1,3)n;
insert into pipstart_staff_private.roles values
 ('fe000000-0000-4000-8000-000000000001','owner'),('fe000000-0000-4000-8000-000000000002','author'),('fe000000-0000-4000-8000-000000000003','reviewer');
insert into pipstart_staff_private.assignments(user_id,resource_kind,resource_id)
select 'fe000000-0000-4000-8000-000000000002'::uuid,k,id from (values('course','pb-course'),('module','pb-module'),('quiz','pb-quiz')) v(k,id);
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
set local role authenticated;

-- Fixture content, approved by the Owner (single-person policy), plus one never-approved draft.
select pg_temp.pb_as(1);
select pg_temp.pb_ok((public.pipstart_editorial_approve_single_person(x.id,1,(public.pipstart_editorial_create(x.id,x.family,x.path,x.parent,x.body::jsonb,'first'))->>'body_sha256',null))->>'state'='approved','approved '||x.id)
  from (values
    (1,'pb-course','course','forex',null,'{"metadata":{"title":"Course"}}'),
    (2,'pb-module','module','forex','pb-course','{"metadata":{"title":"Module"}}'),
    (3,'pb-quiz','quiz','forex','pb-module',(pg_temp.qz(1,'a'))::text),
    (4,'pb-post','analysis',null,null,'{"metadata":{"title":"Post","category":"fundamental","excerpt":"Short"},"paragraphs":["Text"]}')
  ) x(n,id,family,path,parent,body) order by x.n;
select pg_temp.pb_ok((public.pipstart_editorial_create('pb-draft','course','forex',null,'{"metadata":{"title":"Draft"}}','first'))->>'state'='draft','unapproved draft');

-- Nothing is published until the Owner creates the baseline.
select pg_temp.pb_denied(format('select public.pipstart_publication_publish(%L,null,''pb-post'',1,%L,''x'')',pg_temp.op(90),pg_temp.pb_sha('pb-post')),'55000','publish before baseline');
select pg_temp.pb_as(2);
select pg_temp.pb_denied(format('select public.pipstart_publication_baseline(%L,''first'')',pg_temp.op(1)),'42501','author baseline');
select pg_temp.pb_as(1);
select pg_temp.pb_denied(format('select public.pipstart_publication_baseline(%L,'' padded'')',pg_temp.op(1)),'22023','reason with spaces');
select pg_temp.pb_ok((public.pipstart_publication_baseline(pg_temp.op(1),'first'))->>'entries'='4','baseline holds the four approved items, not the draft');
select pg_temp.pb_ok((public.pipstart_publication_baseline(pg_temp.op(1),'first'))->>'replayed'='true','baseline replay returns its result');
select pg_temp.pb_denied(format('select public.pipstart_publication_baseline(%L,''again'')',pg_temp.op(2)),'55000','second baseline');
select pg_temp.pb_ok(pg_temp.gen()=1 and (public.pipstart_publication_status('pb-quiz'))->'published'->>'revision_no'='1','status shows generation 1');

-- The build read is the service role's alone, and it matches the seal.
select pg_temp.pb_denied('select public.pipstart_publication_snapshot()','42501','staff build read');
reset role;
set local role service_role;
select pg_temp.pb_ok((s->>'generation')='1' and s->>'snapshot_sha256'=encode(sha256(convert_to((s->'snapshot')::text,'UTF8')),'hex')
  and jsonb_array_length(s->'snapshot'->'items')=4 and s->'snapshot'->'items'->0->>'id'='pb-course'
  and jsonb_array_length(s->'snapshot'->'quizVersions')=1,'sealed generation 1 snapshot')
  from (select public.pipstart_publication_snapshot() s) x;
select pg_temp.pb_denied('select public.pipstart_publication_baseline(gen_random_uuid(),''x'')','42501','service role cannot act as staff');
reset role;
set local role authenticated;

-- Publish quiz version 2: exact approved revision, compare-and-set, stable operation identity.
select pg_temp.pb_as(1);
select pg_temp.pb_ok((public.pipstart_editorial_save('pb-quiz',1,pg_temp.qz(2,'b'),'v2'))->>'revision_no'='2','quiz v2 draft');
select pg_temp.pb_denied(format('select public.pipstart_publication_publish(%L,1,''pb-quiz'',2,%L,''v2'')',pg_temp.op(3),pg_temp.pb_sha('pb-quiz')),'55000','unapproved revision');
select pg_temp.pb_ok((public.pipstart_editorial_approve_single_person('pb-quiz',2,pg_temp.pb_sha('pb-quiz'),null))->>'state'='approved','quiz v2 approved');
select pg_temp.pb_denied(format('select public.pipstart_publication_publish(%L,1,''pb-quiz'',2,%L,''v2'')',pg_temp.op(3),repeat('0',64)),'PT409','wrong body hash');
select pg_temp.pb_as(2);
select pg_temp.pb_denied(format('select public.pipstart_publication_publish(%L,1,''pb-quiz'',2,%L,''v2'')',pg_temp.op(3),pg_temp.pb_sha('pb-quiz')),'42501','author cannot publish');
select pg_temp.pb_as(1);
select pg_temp.pb_ok((public.pipstart_publication_publish(pg_temp.op(3),1,'pb-quiz',2,pg_temp.pb_sha('pb-quiz'),'v2'))->>'generation'='2','publish quiz v2 as generation 2');
select pg_temp.pb_ok((public.pipstart_publication_publish(pg_temp.op(3),1,'pb-quiz',2,pg_temp.pb_sha('pb-quiz'),'v2'))->>'replayed'='true','repeated click returns the same generation');
select pg_temp.pb_denied(format('select public.pipstart_publication_publish(%L,2,''pb-post'',1,%L,''x'')',pg_temp.op(3),pg_temp.pb_sha('pb-post')),'22023','operation identity reused for another change');
select pg_temp.pb_denied(format('select public.pipstart_publication_publish(%L,1,''pb-post'',1,%L,''x'')',pg_temp.op(4),pg_temp.pb_sha('pb-post')),'PT409','stale expected generation');
select pg_temp.pb_denied(format('select public.pipstart_publication_publish(%L,2,''pb-quiz'',2,%L,''again'')',pg_temp.op(4),pg_temp.pb_sha('pb-quiz')),'55000','same revision again');
select pg_temp.pb_ok(pg_temp.gen()=2,'still generation 2 after refusals');
reset role;
select pg_temp.pb_ok((select array_agg(version order by version) from pipstart_editorial_private.generation_quiz_versions where generation=2 and item_id='pb-quiz')='{1,2}'
  and (select array_agg(version) from pipstart_editorial_private.generation_quiz_versions where generation=1 and item_id='pb-quiz')='{1}','quiz versions frozen per generation');
set local role authenticated;
select pg_temp.pb_as(1);
-- An edit in progress never changes what is published.
select pg_temp.pb_ok((public.pipstart_editorial_save('pb-quiz',2,pg_temp.qz(3,'a'),'v3 draft'))->>'state'='draft','v3 draft open');
select pg_temp.pb_ok((public.pipstart_publication_status('pb-quiz'))->'published'->>'revision_no'='2','published stays revision 2 during the edit');

-- Dependencies: a child needs its published parent.
select pg_temp.pb_ok((public.pipstart_editorial_approve_single_person('pb-course2',1,(public.pipstart_editorial_create('pb-course2','course','forex',null,'{"metadata":{"title":"C2"}}','first'))->>'body_sha256',null))->>'state'='approved','second course approved');
select pg_temp.pb_ok((public.pipstart_editorial_approve_single_person('pb-module2',1,(public.pipstart_editorial_create('pb-module2','module','forex','pb-course2','{"metadata":{"title":"M2"}}','first'))->>'body_sha256',null))->>'state'='approved','second module approved');
select pg_temp.pb_denied(format('select public.pipstart_publication_publish(%L,2,''pb-module2'',1,%L,''x'')',pg_temp.op(5),pg_temp.pb_sha('pb-module2')),'55000','child before parent');
select pg_temp.pb_ok((public.pipstart_publication_publish(pg_temp.op(6),2,'pb-course2',1,pg_temp.pb_sha('pb-course2'),'course 2'))->>'generation'='3','parent published');
select pg_temp.pb_ok((public.pipstart_publication_publish(pg_temp.op(7),3,'pb-module2',1,pg_temp.pb_sha('pb-module2'),'module 2'))->>'generation'='4','child published after parent');

-- Withdraw: contents first; published content cannot go to trash.
select pg_temp.pb_denied(format('select public.pipstart_publication_withdraw(%L,4,''pb-module'',''x'')',pg_temp.op(8)),'55000','withdraw a parent with published contents');
select pg_temp.pb_denied('select public.pipstart_editorial_trash(''pb-post'',''retire'')','55000','trash published content');
select pg_temp.pb_ok((public.pipstart_publication_withdraw(pg_temp.op(9),4,'pb-post','retired post'))->>'generation'='5','withdraw the post');
select pg_temp.pb_ok((public.pipstart_publication_status('pb-post'))->>'published' is null,'post no longer published');
select pg_temp.pb_denied(format('select public.pipstart_publication_withdraw(%L,5,''pb-post'',''x'')',pg_temp.op(10)),'55000','withdraw what is not published');

-- Restore: Owner only, an earlier sealed generation, as a new generation.
select pg_temp.pb_as(2);
select pg_temp.pb_denied(format('select public.pipstart_publication_restore(%L,5,4,''x'')',pg_temp.op(11)),'42501','author restore');
select pg_temp.pb_as(1);
select pg_temp.pb_denied(format('select public.pipstart_publication_restore(%L,5,5,''x'')',pg_temp.op(11)),'22023','restore the live generation');
select pg_temp.pb_denied(format('select public.pipstart_publication_restore(%L,5,9,''x'')',pg_temp.op(11)),'22023','restore a future generation');
select pg_temp.pb_ok((public.pipstart_publication_restore(pg_temp.op(12),5,4,'undo the withdrawal'))->>'generation'='6','restore generation 4 as generation 6');
select pg_temp.pb_ok((public.pipstart_publication_status('pb-post'))->'published'->>'revision_no'='1','post published again by restore');
reset role;
select pg_temp.pb_ok((select array_agg(item_id||':'||revision_no order by item_id) from pipstart_editorial_private.generation_entries where generation=6)
  =(select array_agg(item_id||':'||revision_no order by item_id) from pipstart_editorial_private.generation_entries where generation=4),'restored set equals generation 4');
set local role authenticated;
select pg_temp.pb_as(1);
select pg_temp.pb_ok((public.pipstart_publication_withdraw(pg_temp.op(13),6,'pb-post','retired again'))->>'generation'='7','withdraw the post again');
select pg_temp.pb_ok((public.pipstart_editorial_trash('pb-post','retire'))->>'trashed'='true','withdrawn content can go to trash');
select pg_temp.pb_denied(format('select public.pipstart_publication_restore(%L,7,4,''x'')',pg_temp.op(14)),'55000','restore would republish trashed content');
select pg_temp.pb_ok(pg_temp.gen()=7,'refused restore left generation 7 live');
reset role;

-- Delivery tracking: one job per generation; older open jobs superseded.
set local role service_role;
select pg_temp.pb_ok((public.pipstart_publication_refresh(7,'processing'))->>'attempts'='1','refresh claimed');
select pg_temp.pb_denied('select public.pipstart_publication_refresh(7,''pending'')','55000','refresh cannot go back to pending');
select pg_temp.pb_ok((public.pipstart_publication_refresh(7,'failed','deploy hook timeout'))->>'state'='failed','refresh failed visibly');
select pg_temp.pb_ok((public.pipstart_publication_refresh(7,'processing'))->>'attempts'='2','refresh retried');
select pg_temp.pb_ok((public.pipstart_publication_refresh(7,'verified','anonymous check passed'))->>'state'='verified','refresh verified');
select pg_temp.pb_denied('select public.pipstart_publication_refresh(6,''processing'')','55000','superseded job cannot run');
reset role;
select pg_temp.pb_ok((select string_agg(state,',' order by generation) from pipstart_editorial_private.refresh_jobs)='superseded,superseded,superseded,superseded,superseded,superseded,verified','older jobs superseded');

-- Immutable history and audit.
select pg_temp.pb_denied('update pipstart_editorial_private.generations set reason=''changed'' where generation=1','42501','generations immutable');
select pg_temp.pb_denied('delete from pipstart_editorial_private.generation_entries where generation=1','42501','entries immutable');
select pg_temp.pb_denied('update pipstart_editorial_private.generation_seals set snapshot_sha256=repeat(''0'',64) where generation=1','42501','seals immutable');
select pg_temp.pb_ok((select string_agg(operation,',' order by created_at) from pipstart_editorial_private.audit where operation in ('publication_baseline','publish','withdraw','publication_restore'))
  ='publication_baseline,publish,publish,publish,withdraw,publication_restore,withdraw','audited publication operations');
-- A changed revision body would break the seal: the build read refuses it.
alter table pipstart_editorial_private.revisions disable trigger pipstart_editorial_revision_guard;
update pipstart_editorial_private.revisions set body=jsonb_set(body,'{metadata,title}','"Tampered"') where item_id='pb-course' and revision_no=1;
set local role service_role;
select pg_temp.pb_denied('select public.pipstart_publication_snapshot()','XX001','tampered published body');
reset role;
rollback;
