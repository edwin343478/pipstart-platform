-- Marked disposable SQL/Auth-stub database only. Never the application DB. All fixture writes roll back.
-- M22 audit Package 5 (D6): a new quiz through its whole life on the real RPCs, with no store change.
-- Create at version 1 (any other version refused, nothing recorded); approve and publish v1; save, approve
-- and publish v2, the generation keeping both versions for grading; archive refused while live and
-- recording nothing; withdraw, archive, restore as a draft that keeps version 2, identical re-approval and
-- publish again; an assigned Reviewer reads every revision but cannot write. Works from whatever generation
-- is live (the consolidated verifier stages it after committed scheduler stages).
begin;
create function pg_temp.ql_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Quiz lifecycle assertion: %',label; end if; end $$;
create function pg_temp.uid(n integer) returns uuid language sql immutable as $$ select ('f2000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.op(n integer) returns uuid language sql immutable as $$ select ('f2900000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.ql_as(n integer) returns void language plpgsql security definer set search_path='' as $$
declare s uuid:=('f2200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid; t bigint;
begin
  select floor(extract(epoch from updated_at))::bigint into t from auth.mfa_amr_claims where session_id=s and authentication_method='totp';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',pg_temp.uid(n),'session_id',s,'role','authenticated','aal','aal2',
    'user_metadata',jsonb_build_object('role','owner'),'app_metadata',jsonb_build_object('role','owner'),
    'amr',jsonb_build_array(jsonb_build_object('method','totp','timestamp',t)))::text,true);
end $$;
create function pg_temp.rev(p_id text) returns integer language sql security definer set search_path='' as $$
  select max(revision_no) from pipstart_editorial_private.revisions where item_id=p_id $$;
create function pg_temp.sha(p_id text) returns text language sql security definer set search_path='' as $$
  select body_sha256 from pipstart_editorial_private.revisions where item_id=p_id order by revision_no desc limit 1 $$;
create function pg_temp.gen() returns bigint language sql security definer set search_path='' as $$
  select generation from pipstart_editorial_private.publication_pointer where singleton $$;
create function pg_temp.versions(g bigint) returns text language sql security definer set search_path='' as $$
  select coalesce(string_agg(version::text,',' order by version),'') from pipstart_editorial_private.generation_quiz_versions where generation=g and item_id='fq-quiz' $$;
create function pg_temp.live(p_id text) returns boolean language sql security definer set search_path='' as $$
  select exists(select 1 from pipstart_editorial_private.generation_entries e where e.generation=pg_temp.gen() and e.item_id=p_id) $$;
create function pg_temp.audits() returns bigint language sql security definer set search_path='' as $$
  select count(*) from pipstart_editorial_private.audit $$;
create function pg_temp.item(p_id text) returns jsonb language sql security definer set search_path='' as $$
  select to_jsonb(i) from pipstart_editorial_private.items i where id=p_id $$;
-- Runs one call as the actor under the authenticated role; returns 'ok' or the SQLSTATE.
create function pg_temp.try(n integer,c text) returns text language plpgsql as $$
begin
  perform pg_temp.ql_as(n);
  begin execute 'set local role authenticated'; execute c; execute 'reset role';
  exception when others then return sqlstate; end;
  return 'ok';
end $$;
-- The body the staff create flow writes (lib/content/quiz-draft-contract.ts newQuizBody), at a version.
create function pg_temp.qbody(v integer,prompt text) returns jsonb language sql immutable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title','Lifecycle quiz','assessmentId','fq-quiz','version',v,'scope','module',
      'learningPath','crypto','courseId','fq-course','moduleId','fq-module','passingPercentage',70,'retakeCooldownSeconds',0,'status','draft',
      'governance',jsonb_build_object('author','PipStart editorial team (see audit record)','reviewer','PipStart content review (see decision record)',
        'reviewedAt','2026-11-18','nextReviewAt','2027-11-18','sources',jsonb_build_array('PipStart: Wallet security')),
      'placement',jsonb_build_object('order',2,'estimatedMinutes',5,'objectives','[]'::jsonb,'prerequisites','[]'::jsonb,'relatedLessonIds','[]'::jsonb,'relatedTermSlugs','[]'::jsonb)),
    'questions',jsonb_build_array(jsonb_build_object('id','question-1','type','true-false','prompt',prompt,'explanation','Never share it.',
      'choices',jsonb_build_array(jsonb_build_object('id','true','label','True'),jsonb_build_object('id','false','label','False')),
      'correctChoiceIds',jsonb_build_array('false')))) $$;
create function pg_temp.approve(n integer,p_id text) returns text language sql as $$
  select pg_temp.try(n,format('select public.pipstart_editorial_approve_single_person(%L,%s,%L,null)',p_id,pg_temp.rev(p_id),pg_temp.sha(p_id))) $$;
create function pg_temp.publish(n integer,k integer,p_id text) returns text language sql as $$
  select pg_temp.try(n,format('select public.pipstart_publication_publish(%L,%s,%L,%s,%L,%L)',pg_temp.op(k),pg_temp.gen(),p_id,pg_temp.rev(p_id),pg_temp.sha(p_id),'Publish '||p_id)) $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;

-- 1. Fixture: 1 Owner, 3 Reviewer (assigned the quiz).
update pipstart_staff_private.members set active=false where active;
insert into auth.users(id,raw_user_meta_data) select pg_temp.uid(n),jsonb_build_object('display_name','Lifecycle '||n) from unnest(array[1,3])n;
insert into auth.mfa_factors(id,user_id,factor_type,status) select ('f2100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),'totp','verified' from unnest(array[1,3])n;
insert into auth.sessions(id,user_id,factor_id,aal) select ('f2200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),('f2100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from unnest(array[1,3])n;
insert into auth.mfa_amr_claims(id,session_id,authentication_method,updated_at) select ('f2300000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('f2200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp',clock_timestamp()-interval '1 minute' from unnest(array[1,3])n;
insert into pipstart_staff_private.members(user_id) select pg_temp.uid(n) from unnest(array[1,3])n;
insert into pipstart_staff_private.roles values(pg_temp.uid(1),'owner'),(pg_temp.uid(3),'reviewer');
insert into pipstart_staff_private.assignments values(pg_temp.uid(3),'quiz','fq-quiz');
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
select pg_temp.ql_ok(pg_temp.try(1,$$select public.pipstart_editorial_create('fq-course','course','crypto',null,'{"metadata":{"title":"Lifecycle course","placement":{"order":1}}}','first')$$)='ok'
  and pg_temp.try(1,$$select public.pipstart_editorial_create('fq-module','module','crypto','fq-course','{"metadata":{"title":"Lifecycle module","placement":{"order":1}}}','first')$$)='ok'
  and pg_temp.approve(1,'fq-course')='ok' and pg_temp.approve(1,'fq-module')='ok','course and module approved');
do $$ begin
  if pg_temp.gen() is null then
    perform pg_temp.ql_ok(pg_temp.try(1,format('select public.pipstart_publication_baseline(%L,%L)',pg_temp.op(1),'Lifecycle baseline'))='ok','baseline');
  else
    perform pg_temp.ql_ok(pg_temp.publish(1,2,'fq-course')='ok' and pg_temp.publish(1,3,'fq-module')='ok','course and module live');
  end if;
end $$;

-- 2. Create: version 1 only; any other version is refused and records nothing.
create temporary table ql_a0 as select pg_temp.audits() n;
select pg_temp.ql_ok(pg_temp.try(1,format('select public.pipstart_editorial_create(%L,%L,%L,%L,%L,%L)','fq-quiz','quiz','crypto','fq-module',pg_temp.qbody(2,'Share it?'),'New quiz'))='22023'
  and pg_temp.item('fq-quiz') is null and pg_temp.audits()=(select n from ql_a0),'a new quiz at version 2 is refused, recording nothing');
select pg_temp.ql_ok(pg_temp.try(1,format('select public.pipstart_editorial_create(%L,%L,%L,%L,%L,%L)','fq-quiz','quiz','crypto','fq-module',pg_temp.qbody(1,'Share it?'),'New quiz'))='ok'
  and pg_temp.rev('fq-quiz')=1 and pg_temp.item('fq-quiz')->>'parent_id'='fq-module','created at version 1 under the module');
select pg_temp.ql_ok(pg_temp.try(1,format('select public.pipstart_editorial_create(%L,%L,%L,%L,%L,%L)','fq-quiz','quiz','crypto','fq-module',pg_temp.qbody(1,'Again'),'Again'))<>'ok','the identity cannot be created twice');

-- 3. Version 1 approved and published; the generation freezes it for grading.
select pg_temp.ql_ok(pg_temp.approve(1,'fq-quiz')='ok' and pg_temp.publish(1,4,'fq-quiz')='ok' and pg_temp.live('fq-quiz')
  and pg_temp.versions(pg_temp.gen())='1','v1 published and frozen');
-- The assigned Reviewer reads every revision of it, and cannot write.
select pg_temp.ql_ok(pg_temp.try(3,$$select public.pipstart_editorial_item('fq-quiz')$$)='ok'
  and pg_temp.try(3,$$select public.pipstart_editorial_revision('fq-quiz',1)$$)='ok','the assigned Reviewer reads the quiz and its revision');
select pg_temp.ql_ok(pg_temp.try(3,format('select public.pipstart_editorial_save(%L,1,%L,%L)','fq-quiz',pg_temp.qbody(2,'Reviewer edit'),'edit'))='42501','the Reviewer cannot save');

-- 4. Version 2: saved, approved, published; the generation keeps both versions, so v1 attempts still grade.
select pg_temp.ql_ok(pg_temp.try(1,format('select public.pipstart_editorial_save(%L,1,%L,%L)','fq-quiz',pg_temp.qbody(1,'Same version'),'edit'))='22023','a save keeping the approved version is refused');
select pg_temp.ql_ok(pg_temp.try(1,format('select public.pipstart_editorial_save(%L,1,%L,%L)','fq-quiz',pg_temp.qbody(2,'Should you share a seed phrase?'),'v2'))='ok'
  and pg_temp.approve(1,'fq-quiz')='ok' and pg_temp.publish(1,5,'fq-quiz')='ok' and pg_temp.versions(pg_temp.gen())='1,2','v2 published; v1 kept for grading');

-- 5. Archive is refused while the quiz is live, recording nothing.
create temporary table ql_a1 as select pg_temp.audits() n,pg_temp.gen() g;
select pg_temp.ql_ok(pg_temp.try(1,$$select public.pipstart_editorial_trash('fq-quiz','Retire')$$)='55000'
  and pg_temp.item('fq-quiz')->>'trashed_at' is null and pg_temp.audits()=(select n from ql_a1),'archive refused while live, nothing recorded');

-- 6. Withdraw, archive, restore as a draft keeping version 2, identical re-approval, publish again.
select pg_temp.ql_ok(pg_temp.try(1,format('select public.pipstart_publication_withdraw(%L,%s,%L,%L)',pg_temp.op(6),pg_temp.gen(),'fq-quiz','Withdraw quiz'))='ok'
  and not pg_temp.live('fq-quiz') and pg_temp.versions(pg_temp.gen())='' and pg_temp.gen()=(select g+1 from ql_a1),'withdrawn: no longer live or offered for grading');
select pg_temp.ql_ok(pg_temp.try(1,$$select public.pipstart_editorial_trash('fq-quiz','Retire')$$)='ok' and pg_temp.item('fq-quiz')->>'trashed_at' is not null,'archived after withdrawal');
select pg_temp.ql_ok(pg_temp.publish(1,7,'fq-quiz')='55000','an archived quiz cannot be published');
create temporary table ql_r as select pg_temp.try(1,$$select public.pipstart_editorial_restore('fq-quiz','Needed again')$$) r;
select pg_temp.ql_ok((select r from ql_r)='ok','restore call succeeds ('||(select r from ql_r)||')');
select pg_temp.ql_ok(pg_temp.item('fq-quiz')->>'trashed_at' is null and pg_temp.rev('fq-quiz')=3,'restored as revision 3 (latest '||coalesce(pg_temp.rev('fq-quiz')::text,'none')||')');
select pg_temp.ql_ok((select state='draft' and (body->'metadata'->>'version')::integer=2 from pipstart_editorial_private.revisions where item_id='fq-quiz' and revision_no=pg_temp.rev('fq-quiz')),'restored as a draft that keeps version 2');
select pg_temp.ql_ok(pg_temp.approve(1,'fq-quiz')='ok' and pg_temp.publish(1,8,'fq-quiz')='ok' and pg_temp.live('fq-quiz')
  and pg_temp.versions(pg_temp.gen())='1,2','identical re-approval and publish again, both versions kept');
select pg_temp.ql_ok(pg_temp.try(3,$$select public.pipstart_editorial_revision('fq-quiz',3)$$)='ok','the Reviewer reads the restored revision');
rollback;
