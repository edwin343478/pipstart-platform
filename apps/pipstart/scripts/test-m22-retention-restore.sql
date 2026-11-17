-- Marked disposable SQL/Auth-stub database only. Never the application DB. All fixture writes roll back.
-- MP11c1 (AT05, deleted content recoverable during retention): a generated lesson and quiz go live, are held,
-- withdrawn, archived and restored as drafts. History, decisions, old generations and learner progress are kept;
-- nothing is silently republished; no API role and no function can delete revisions or items.
begin;
create function pg_temp.rt_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Retention assertion: %',label; end if; end $$;
create function pg_temp.uid(n integer) returns uuid language sql immutable as $$ select ('ff000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.op(n integer) returns uuid language sql immutable as $$ select ('ff900000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.rt_as(n integer) returns void language plpgsql security definer set search_path='' as $$
begin
  perform set_config('request.jwt.claims',jsonb_build_object('sub',pg_temp.uid(n),'session_id',('ff200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
    'role','authenticated','aal','aal2')::text,true);
end $$;
-- Runs one call as the actor under the authenticated role; returns 'ok' or the SQLSTATE.
create function pg_temp.rt_try(n integer,c text) returns text language plpgsql as $$
begin
  perform pg_temp.rt_as(n);
  begin execute 'set local role authenticated'; execute c; execute 'reset role';
  exception when others then return sqlstate; end;
  return 'ok';
end $$;
create function pg_temp.sha(p_id text) returns text language sql security definer set search_path='' as $$
  select body_sha256 from pipstart_editorial_private.revisions where item_id=p_id order by revision_no desc limit 1 $$;
create function pg_temp.body(p_id text) returns jsonb language sql security definer set search_path='' as $$
  select body from pipstart_editorial_private.revisions where item_id=p_id order by revision_no desc limit 1 $$;
create function pg_temp.rev(p_id text) returns integer language sql security definer set search_path='' as $$
  select latest_revision from pipstart_editorial_private.items where id=p_id $$;
create function pg_temp.gen() returns bigint language sql security definer set search_path='' as $$
  select generation from pipstart_editorial_private.publication_pointer where singleton $$;
create function pg_temp.live(p_id text) returns boolean language sql security definer set search_path='' as $$
  select exists(select 1 from pipstart_editorial_private.generation_entries e join pipstart_editorial_private.publication_pointer p on p.generation=e.generation where e.item_id=p_id) $$;
create function pg_temp.trashed(p_id text) returns boolean language sql security definer set search_path='' as $$
  select trashed_at is not null from pipstart_editorial_private.items where id=p_id $$;
create function pg_temp.history(p_id text) returns text language sql security definer set search_path='' as $$
  select (select string_agg(revision_no||':'||body_sha256||':'||state,',' order by revision_no) from pipstart_editorial_private.revisions where item_id=p_id)
    ||'|'||coalesce((select string_agg(revision_no||':'||kind,',' order by revision_no,kind) from pipstart_editorial_private.decisions where item_id=p_id),'') $$;
create function pg_temp.entries(g bigint) returns text language sql security definer set search_path='' as $$
  select string_agg(to_jsonb(e)::text,',' order by e.item_id) from pipstart_editorial_private.generation_entries e where e.generation=g $$;
create function pg_temp.progress() returns text language sql security definer set search_path='' as $$
  select coalesce(string_agg(to_jsonb(p)::text,',' order by p.lesson_id),'') from public.pipstart_lesson_progress p where p.user_id=pg_temp.uid(4) $$;
create function pg_temp.audit_ops(p_id text) returns text language sql security definer set search_path='' as $$
  select string_agg(operation,',' order by created_at,id) from pipstart_editorial_private.audit where item_id=p_id $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;
create temporary table rt_seen(k text primary key,v text);

-- No deletion path: no API role may delete or update the store's history tables, and no function deletes them.
select pg_temp.rt_ok(not has_table_privilege(r,t,'DELETE') and not has_table_privilege(r,t,'UPDATE') and not has_table_privilege(r,t,'TRUNCATE'),'no '||r||' delete/update on '||t)
  from unnest(array['anon','authenticated','service_role'])r,
  unnest(array['pipstart_editorial_private.items','pipstart_editorial_private.revisions','pipstart_editorial_private.decisions',
    'pipstart_editorial_private.generation_entries','pipstart_editorial_private.generation_seals','pipstart_editorial_private.audit'])t;
select pg_temp.rt_ok(not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where (n.nspname like 'pipstart_%' or (n.nspname='public' and p.proname like 'pipstart_%'))
    and lower(p.prosrc) ~ 'delete\s+from\s+pipstart_editorial_private\.(items|revisions|decisions|generation_entries|generation_seals)\M'),'no function deletes store history');

-- Fixture: 1 Owner, 2 Editor (assigned all items), 3 Author (assigned the lesson), 4 learner.
update pipstart_staff_private.members set active=false where active;
insert into auth.users(id,raw_user_meta_data) select pg_temp.uid(n),'{}' from generate_series(1,4)n;
insert into auth.mfa_factors(id,user_id,factor_type,status) select ('ff100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),'totp','verified' from generate_series(1,3)n;
insert into auth.sessions(id,user_id,factor_id,aal) select ('ff200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),('ff100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,3)n;
insert into pipstart_staff_private.members(user_id) select pg_temp.uid(n) from generate_series(1,3)n;
insert into pipstart_staff_private.roles values(pg_temp.uid(1),'owner'),(pg_temp.uid(2),'editor'),(pg_temp.uid(3),'author');
insert into pipstart_staff_private.assignments values(pg_temp.uid(2),'course','ff-course'),(pg_temp.uid(2),'module','ff-module'),(pg_temp.uid(2),'lesson','ff-lesson'),(pg_temp.uid(2),'quiz','ff-quiz'),(pg_temp.uid(3),'lesson','ff-lesson');
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
create function pg_temp.lesson() returns jsonb language sql immutable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title','Retention lesson','placement',jsonb_build_object('order',1),
    'sources',jsonb_build_array(jsonb_build_object('title','Guide','url','https://docs.example.org/guide'))),
    'blocks',jsonb_build_array(jsonb_build_object('type','paragraph','children','Kept text with its diagram /images/retention-diagram.png'))) $$;
create function pg_temp.quiz(v integer) returns jsonb language sql immutable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title','Retention quiz','version',v,'placement',jsonb_build_object('order',2),
    'governance',jsonb_build_object('reviewedAt','2026-11-01','nextReviewAt','2027-05-01')),
    'questions',jsonb_build_array(jsonb_build_object('id','q'||v,'choices','[{"id":"a"},{"id":"b"}]'::jsonb,'correctChoiceIds','["a"]'::jsonb))) $$;

-- Live: course, module, the lesson and quiz version 1 in generation 1.
select pg_temp.rt_ok(pg_temp.rt_try(1,format('select public.pipstart_editorial_approve_single_person(x.id,1,(public.pipstart_editorial_create(x.id,x.family,%L,x.parent,x.body,%L))->>%L,null)
 from (values (1,%L,%L,null::text,%L::jsonb),(2,%L,%L,%L,%L::jsonb),(3,%L,%L,%L,%L::jsonb),(4,%L,%L,%L,%L::jsonb)) x(n,id,family,parent,body) order by x.n',
 'forex','first','body_sha256',
 'ff-course','course','{"metadata":{"title":"Retention course","placement":{"order":1}}}',
 'ff-module','module','ff-course','{"metadata":{"title":"Retention module","placement":{"order":1}}}',
 'ff-lesson','lesson','ff-module',pg_temp.lesson(),'ff-quiz','quiz','ff-module',pg_temp.quiz(1)))='ok','content approved');
select pg_temp.rt_ok(pg_temp.rt_try(1,format('select public.pipstart_publication_baseline(%L,%L)',pg_temp.op(1),'Retention baseline'))='ok' and pg_temp.gen()=1,'baseline generation 1');
select pg_temp.rt_ok(pg_temp.rt_try(4,$$select * from public.pipstart_set_lesson_completion('ff-course','ff-module','ff-lesson',true,null)$$)='ok','learner completes the lesson');
insert into rt_seen values('progress',pg_temp.progress()),('gen1',pg_temp.entries(1)),('lesson_sha',pg_temp.sha('ff-lesson')),('quiz_v1',pg_temp.sha('ff-quiz'));
select pg_temp.rt_ok((select v from rt_seen where k='progress')<>'','learner progress recorded');

-- Quiz version 2 is approved and published; version 1 stays approved and generation 1 still holds it.
select pg_temp.rt_ok(pg_temp.rt_try(1,format('select public.pipstart_editorial_save(%L,1,%L,%L)','ff-quiz',pg_temp.quiz(2),'version 2'))='ok','quiz version 2 saved');
select pg_temp.rt_ok(pg_temp.rt_try(1,format('select public.pipstart_editorial_approve_single_person(%L,2,%L,null)','ff-quiz',pg_temp.sha('ff-quiz')))='ok','quiz version 2 approved');
select pg_temp.rt_ok(pg_temp.rt_try(1,format('select public.pipstart_publication_publish(%L,1,%L,2,%L,%L)',pg_temp.op(2),'ff-quiz',pg_temp.sha('ff-quiz'),'Quiz v2'))='ok' and pg_temp.gen()=2,'quiz version 2 live in generation 2');
select pg_temp.rt_ok(pg_temp.entries(1)=(select v from rt_seen where k='gen1'),'generation 1 unchanged after a newer quiz version');
select pg_temp.rt_ok(pg_temp.history('ff-quiz') ~ ('^1:'||(select v from rt_seen where k='quiz_v1')||':superseded,2:[0-9a-f]{64}:approved|1:single_person,2:single_person$'),'quiz version 1 kept (superseded, body and approval decision intact) beside version 2');

-- Hold blocks archiving; live content must be withdrawn first; nothing changes on refusal.
select pg_temp.rt_ok(pg_temp.rt_try(1,$$select public.pipstart_editorial_hold('ff-lesson','Legal hold')$$)='ok','Owner holds the lesson');
select pg_temp.rt_ok(pg_temp.rt_try(2,$$select public.pipstart_editorial_trash('ff-lesson','Archive')$$)='55000' and not pg_temp.trashed('ff-lesson'),'hold blocks archiving');
select pg_temp.rt_ok(pg_temp.rt_try(1,$$select public.pipstart_editorial_hold('ff-lesson',null)$$)='ok','hold released');
select pg_temp.rt_ok(pg_temp.rt_try(2,$$select public.pipstart_editorial_trash('ff-lesson','Archive')$$)='55000' and not pg_temp.trashed('ff-lesson'),'live lesson must be withdrawn first');
insert into rt_seen values('lesson_history',pg_temp.history('ff-lesson')),('quiz_history',pg_temp.history('ff-quiz'));

-- Withdraw and archive the lesson and the quiz (the store allows a quiz archive; the editor has no button for it).
select pg_temp.rt_ok(pg_temp.rt_try(2,format('select public.pipstart_publication_withdraw(%L,2,%L,%L)',pg_temp.op(3),'ff-lesson','Retire lesson'))='ok' and pg_temp.gen()=3,'lesson withdrawn (generation 3)');
select pg_temp.rt_ok(pg_temp.rt_try(2,format('select public.pipstart_publication_withdraw(%L,3,%L,%L)',pg_temp.op(4),'ff-quiz','Retire quiz'))='ok' and pg_temp.gen()=4,'quiz withdrawn (generation 4)');
insert into rt_seen values('gen4',pg_temp.entries(4));
select pg_temp.rt_ok(pg_temp.rt_try(2,$$select public.pipstart_editorial_trash('ff-lesson','Archive')$$)='ok' and pg_temp.trashed('ff-lesson'),'lesson archived');
select pg_temp.rt_ok(pg_temp.rt_try(2,$$select public.pipstart_editorial_trash('ff-quiz','Archive')$$)='ok' and pg_temp.trashed('ff-quiz'),'quiz archived');
select pg_temp.rt_ok(pg_temp.history('ff-lesson')=(select v from rt_seen where k='lesson_history') and pg_temp.history('ff-quiz')=(select v from rt_seen where k='quiz_history'),'archive keeps every revision and decision');
select pg_temp.rt_ok(pg_temp.entries(1)=(select v from rt_seen where k='gen1') and pg_temp.gen()=4,'archive changes no generation');
select pg_temp.rt_ok(pg_temp.progress()=(select v from rt_seen where k='progress'),'archive keeps learner progress');
-- Even the database owner cannot remove history: the rows are immutable.
select pg_temp.rt_ok((select count(*) from pg_trigger where tgrelid='pipstart_editorial_private.revisions'::regclass and not tgisinternal)>=1
  and (select count(*) from pg_trigger where tgrelid='pipstart_editorial_private.decisions'::regclass and not tgisinternal)>=1,'immutability triggers present');

-- Restore as drafts: a new draft revision with the same body; no approval reinstated; nothing republished.
select pg_temp.rt_ok(pg_temp.rt_try(3,$$select public.pipstart_editorial_restore('ff-lesson','Needed again')$$)='42501','an Author cannot restore');
select pg_temp.rt_ok(pg_temp.rt_try(2,$$select public.pipstart_editorial_restore('ff-lesson','Needed again')$$)='ok' and not pg_temp.trashed('ff-lesson'),'Editor restores the lesson');
select pg_temp.rt_ok(pg_temp.rt_try(2,$$select public.pipstart_editorial_restore('ff-quiz','Needed again')$$)='ok' and not pg_temp.trashed('ff-quiz'),'Editor restores the quiz');
-- Restoring supersedes the earlier approved revision; its body, hash and approval decision are kept as they were.
select pg_temp.rt_ok(pg_temp.history('ff-lesson')='1:'||(select v from rt_seen where k='lesson_sha')||':superseded,2:'||(select v from rt_seen where k='lesson_sha')||':draft|'||split_part((select v from rt_seen where k='lesson_history'),'|',2)
  and (select v from rt_seen where k='lesson_history')='1:'||(select v from rt_seen where k='lesson_sha')||':approved|1:single_person','lesson history kept exactly, with one new draft revision of the same body');
select pg_temp.rt_ok((select state from pipstart_editorial_private.revisions where item_id='ff-lesson' and revision_no=pg_temp.rev('ff-lesson'))='draft'
  and (select body from pipstart_editorial_private.revisions where item_id='ff-lesson' and revision_no=pg_temp.rev('ff-lesson'))=(select body from pipstart_editorial_private.revisions where item_id='ff-lesson' and revision_no=pg_temp.rev('ff-lesson')-1),
  'restored lesson is a draft with the archived body (sources and diagram reference included)');
select pg_temp.rt_ok(not exists(select 1 from pipstart_editorial_private.decisions d where (d.item_id,d.revision_no) in (('ff-lesson',pg_temp.rev('ff-lesson')),('ff-quiz',pg_temp.rev('ff-quiz'))))
  and (select state from pipstart_editorial_private.revisions where item_id='ff-quiz' and revision_no=pg_temp.rev('ff-quiz'))='draft','no approval carried onto the restored drafts');
select pg_temp.rt_ok(pg_temp.gen()=4 and pg_temp.entries(4)=(select v from rt_seen where k='gen4') and not pg_temp.live('ff-lesson') and not pg_temp.live('ff-quiz'),'restore republishes nothing');
select pg_temp.rt_ok(pg_temp.entries(1)=(select v from rt_seen where k='gen1'),'generation 1 still holds quiz version 1 and the lesson');
select pg_temp.rt_ok(pg_temp.progress()=(select v from rt_seen where k='progress'),'learner progress unchanged through archive and restore');
-- The restored draft has no decision or generation pointing at it, so only the immutability guard can stop its deletion.
do $$ begin
  begin delete from pipstart_editorial_private.revisions where item_id='ff-lesson' and revision_no=pg_temp.rev('ff-lesson');
    raise exception using errcode='P0001',message='Retention assertion: revision delete allowed';
  exception when sqlstate '42501' then null; end;
end $$;
select pg_temp.rt_ok(pg_temp.audit_ops('ff-lesson') ~ 'hold,release,([a-z_]+,)*trash,restore$' and pg_temp.audit_ops('ff-quiz') ~ ',trash,restore$','hold, release, archive and restore each audited');
rollback;
