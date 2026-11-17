-- Marked disposable SQL/Auth-stub database only. Never the application DB. All fixture writes roll back.
-- MP11c1 (AT04, important actions are logged): every M22 API function is classified, and each audited
-- writer is driven through the real RPC three ways: refused by a role without the capability (nothing
-- changes, no audit row), with its audit insert made to fail (the whole change rolls back), and accepted
-- (exactly one audit row). A new API function fails this suite until it is classified.
begin;
create function pg_temp.cv_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Audit coverage assertion: %',label; end if; end $$;
create function pg_temp.uid(n integer) returns uuid language sql immutable as $$ select ('fe000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.op(n integer) returns uuid language sql immutable as $$ select ('fe900000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.cv_as(n integer) returns void language plpgsql security definer set search_path='' as $$
declare s uuid:=('fe200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid; t bigint;
begin
  select floor(extract(epoch from updated_at))::bigint into t from auth.mfa_amr_claims where session_id=s and authentication_method='totp';
  perform set_config('request.jwt.claims',jsonb_build_object('sub',pg_temp.uid(n),'session_id',s,'role','authenticated','aal','aal2',
    'user_metadata',jsonb_build_object('role','owner'),'app_metadata',jsonb_build_object('role','owner'),
    'amr',jsonb_build_array(jsonb_build_object('method','totp','timestamp',t)))::text,true);
end $$;
-- Read-only helpers for the fixture values (definer: they read the private store directly).
create function pg_temp.rev(p_id text) returns integer language sql security definer set search_path='' as $$
  select max(revision_no) from pipstart_editorial_private.revisions where item_id=p_id $$;
create function pg_temp.sha(p_id text) returns text language sql security definer set search_path='' as $$
  select body_sha256 from pipstart_editorial_private.revisions where item_id=p_id order by revision_no desc limit 1 $$;
create function pg_temp.gen() returns bigint language sql security definer set search_path='' as $$
  select generation from pipstart_editorial_private.publication_pointer where singleton $$;
create function pg_temp.live_rev(p_id text) returns integer language sql security definer set search_path='' as $$
  select (e.revision_no) from pipstart_editorial_private.generation_entries e
  where e.generation=(select generation from pipstart_editorial_private.publication_pointer where singleton) and e.item_id=p_id $$;
create function pg_temp.audits() returns bigint language sql security definer set search_path='' as $$
  select (select count(*) from pipstart_editorial_private.audit)+(select count(*) from pipstart_staff_private.audit) $$;
-- Every row of every table in the three private stores, as one digest.
create function pg_temp.state() returns text language plpgsql security definer set search_path='' as $$
declare q text; d text;
begin
  select string_agg(format('select %L as t,coalesce(jsonb_agg(to_jsonb(x) order by to_jsonb(x)::text),''[]'') as r from %I.%I x',n.nspname||'.'||c.relname,n.nspname,c.relname),' union all ' order by n.nspname,c.relname)
    into q from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname in ('pipstart_editorial_private','pipstart_staff_private','pipstart_maintenance_private') and c.relkind='r';
  execute 'select encode(sha256(convert_to(jsonb_agg(jsonb_build_array(t,r) order by t)::text,''UTF8'')),''hex'') from ('||q||') s' into d;
  return d;
end $$;
create function pg_temp.cv_fault() returns trigger language plpgsql as $$
begin raise exception using errcode='FA001',message='Controlled audit append failure'; end $$;
-- Runs one call as the given actor under the authenticated role; returns 'ok' or the SQLSTATE.
create function pg_temp.try(n integer,c text) returns text language plpgsql as $$
begin
  perform pg_temp.cv_as(n);
  begin execute 'set local role authenticated'; execute c; execute 'reset role';
  exception when others then return sqlstate; end;
  return 'ok';
end $$;
create temporary table cv_steps(label text primary key,refused text,faulted text,audit_rows bigint);
-- One audited writer: refused (no change), audit fault (no change, the fault surfaces), accepted (+1 audit row).
create function pg_temp.step(label text,ok_actor integer,ok_sql text,bad_actor integer,bad_sql text) returns void language plpgsql as $$
declare s0 text; a0 bigint; r text; f text;
begin
  s0:=pg_temp.state();a0:=pg_temp.audits();
  r:=pg_temp.try(bad_actor,bad_sql);
  perform pg_temp.cv_ok(r in ('42501','22023','PT409','55000'),label||': refusal raised '||r);
  perform pg_temp.cv_ok(pg_temp.state()=s0 and pg_temp.audits()=a0,label||': refusal changed nothing');
  execute 'create trigger cv_fault_e before insert on pipstart_editorial_private.audit for each row execute function pg_temp.cv_fault()';
  execute 'create trigger cv_fault_s before insert on pipstart_staff_private.audit for each row execute function pg_temp.cv_fault()';
  f:=pg_temp.try(ok_actor,ok_sql);
  execute 'drop trigger cv_fault_e on pipstart_editorial_private.audit';
  execute 'drop trigger cv_fault_s on pipstart_staff_private.audit';
  perform pg_temp.cv_ok(f='FA001',label||': audit failure surfaced as '||f);
  perform pg_temp.cv_ok(pg_temp.state()=s0,label||': audit failure rolled the change back');
  r:=pg_temp.try(ok_actor,ok_sql);
  perform pg_temp.cv_ok(r='ok',label||': accepted call raised '||r);
  perform pg_temp.cv_ok(pg_temp.audits()=a0+1,label||': exactly one audit row (got '||(pg_temp.audits()-a0)||')');
  perform pg_temp.cv_ok(pg_temp.state()<>s0,label||': accepted call changed the store');
  insert into cv_steps values(label,'refused','rolled back',pg_temp.audits()-a0);
end $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;
grant all on cv_steps to authenticated;

-- 1. Classification: every M22 API function (and the three learner progress calls) is in exactly one class.
create temporary table cv_class(fn text primary key,class text not null check(class in ('audited','schedule_ledger','learner_self','staged_proof','service_system','reader')));
insert into cv_class values
 ('pipstart_editorial_approve_single_person','audited'),('pipstart_editorial_create','audited'),('pipstart_editorial_hold','audited'),
 ('pipstart_editorial_restore','audited'),('pipstart_editorial_review','audited'),('pipstart_editorial_save','audited'),
 ('pipstart_editorial_set_review_policy','audited'),('pipstart_editorial_submit','audited'),('pipstart_editorial_trash','audited'),
 ('pipstart_maintenance_acknowledge','audited'),('pipstart_maintenance_allowlist_change','audited'),('pipstart_maintenance_assign','audited'),
 ('pipstart_maintenance_interval_set','audited'),('pipstart_maintenance_record_result','audited'),('pipstart_maintenance_reschedule','audited'),
 ('pipstart_maintenance_unassign','audited'),('pipstart_partner_policy_set','audited'),('pipstart_publication_baseline','audited'),
 ('pipstart_publication_publish','audited'),('pipstart_publication_restore','audited'),('pipstart_publication_withdraw','audited'),
 ('pipstart_staff_change','audited'),
 -- Logged in the immutable schedule ledger, not the editorial audit (F3, accepted by the owner while scheduling is paused).
 ('pipstart_publication_schedule','schedule_ledger'),('pipstart_publication_cancel_schedule','schedule_ledger'),
 -- A learner's own progress; not a staff action.
 ('pipstart_record_lesson_visit','learner_self'),('pipstart_set_lesson_completion','learner_self'),('pipstart_import_anonymous_progress','learner_self'),
 -- Proof, receipt and claim steps; the completing call writes the audit or the provider journal.
 ('pipstart_staff_account_receipt','staged_proof'),('pipstart_staff_learner_claim','staged_proof'),('pipstart_staff_learner_inspection_receipt','staged_proof'),
 ('pipstart_staff_learner_prepare','staged_proof'),('pipstart_staff_learner_receipt','staged_proof'),('pipstart_staff_maintenance_claim','staged_proof'),
 ('pipstart_staff_receipt','staged_proof'),
 -- Server-only (service role) delivery and provider steps, recorded in their own state tables.
 ('pipstart_publication_refresh','service_system'),('pipstart_publication_scheduler_claim','service_system'),('pipstart_publication_scheduler_finish','service_system'),
 ('pipstart_publication_verify_observed','service_system'),('pipstart_staff_learner_provider_result','service_system'),('pipstart_staff_learner_provider_take','service_system'),
 ('pipstart_staff_maintenance_result','service_system'),('pipstart_staff_maintenance_take','service_system'),
 ('pipstart_content_audit_page','reader'),('pipstart_editorial_history','reader'),('pipstart_editorial_item','reader'),('pipstart_editorial_list','reader'),
 ('pipstart_editorial_revision','reader'),('pipstart_maintenance_allowlist','reader'),('pipstart_maintenance_check_allowed','reader'),
 ('pipstart_maintenance_intervals','reader'),('pipstart_maintenance_results','reader'),('pipstart_maintenance_worklist','reader'),
 ('pipstart_partner_policy','reader'),('pipstart_publication_schedule_status','reader'),('pipstart_publication_snapshot','reader'),
 ('pipstart_publication_status','reader'),('pipstart_staff_access','reader'),('pipstart_staff_audit_page','reader'),
 ('pipstart_staff_audit_page_filtered','reader'),('pipstart_staff_enrolment_allowed','reader'),('pipstart_staff_governance','reader'),
 ('pipstart_staff_learner_delivery_state','reader'),('pipstart_staff_learner_request','reader'),('pipstart_staff_maintenance_review','reader'),
 ('pipstart_staff_people','reader');
create temporary table cv_api as
 select distinct p.proname::text as fn from pg_proc p where p.pronamespace='public'::regnamespace
  and (p.proname ~ '^pipstart_(editorial|publication|partner|maintenance|staff|content_audit)_' or p.proname in ('pipstart_record_lesson_visit','pipstart_set_lesson_completion','pipstart_import_anonymous_progress'))
  and (has_function_privilege('authenticated',p.oid,'EXECUTE') or has_function_privilege('service_role',p.oid,'EXECUTE') or has_function_privilege('anon',p.oid,'EXECUTE'));
select pg_temp.cv_ok(not exists(select 1 from cv_api a where not exists(select 1 from cv_class c where c.fn=a.fn)),
  'unclassified API function(s): '||coalesce((select string_agg(fn,', ' order by fn) from cv_api a where not exists(select 1 from cv_class c where c.fn=a.fn)),''));
select pg_temp.cv_ok(not exists(select 1 from cv_class c where not exists(select 1 from cv_api a where a.fn=c.fn)),
  'classified function(s) not in the API: '||coalesce((select string_agg(fn,', ' order by fn) from cv_class c where not exists(select 1 from cv_api a where a.fn=c.fn)),''));
select pg_temp.cv_ok(not exists(select 1 from pg_proc p join cv_class c on c.fn=p.proname where p.pronamespace='public'::regnamespace and has_function_privilege('anon',p.oid,'EXECUTE')),'no M22 API function is anonymous');
-- Readers write nothing themselves (the MP11a inventory also checked the functions they call).
select pg_temp.cv_ok(not exists(select 1 from pg_proc p join cv_class c on c.fn=p.proname and c.class='reader' where p.pronamespace='public'::regnamespace
  and lower(p.prosrc) ~ '(insert\s+into|update\s+[a-z_]+\.[a-z_]+\s+set|delete\s+from)\s'),'readers contain no insert, update or delete');
select pg_temp.cv_ok((select count(*) from cv_class where class='audited')=22,'twenty-two audited writers');

-- 2. Fixture: 1 Owner, 2 Author and 5 Reviewer (assigned the lesson), 3 Moderator, 4 learner (receives a role).
update pipstart_staff_private.members set active=false where active;
insert into auth.users(id,raw_user_meta_data) select pg_temp.uid(n),jsonb_build_object('display_name','Coverage '||n) from generate_series(1,5)n;
insert into auth.mfa_factors(id,user_id,factor_type,status) select ('fe100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),'totp','verified' from generate_series(1,5)n;
insert into auth.sessions(id,user_id,factor_id,aal) select ('fe200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),('fe100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,5)n;
insert into auth.mfa_amr_claims(id,session_id,authentication_method,updated_at) select ('fe300000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('fe200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp',clock_timestamp()-interval '1 minute' from generate_series(1,5)n;
insert into pipstart_staff_private.members(user_id) select pg_temp.uid(n) from unnest(array[1,2,3,5])n;
insert into pipstart_staff_private.roles values(pg_temp.uid(1),'owner'),(pg_temp.uid(2),'author'),(pg_temp.uid(3),'moderator'),(pg_temp.uid(5),'reviewer');
insert into pipstart_staff_private.assignments values(pg_temp.uid(2),'lesson','fe-lesson'),(pg_temp.uid(5),'lesson','fe-lesson');
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
create function pg_temp.lesson(t text) returns jsonb language sql immutable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title',t,'placement',jsonb_build_object('order',1),
    'sources',jsonb_build_array(jsonb_build_object('title','Guide','url','https://docs.example.org/guide'))),
    'blocks',jsonb_build_array(jsonb_build_object('type','paragraph','children','Body of '||t))) $$;

-- 3. Content and publication writers.
select pg_temp.step('editorial_create',1,$$select public.pipstart_editorial_create('fe-course','course','forex',null,'{"metadata":{"title":"Coverage course","placement":{"order":1}}}','first')$$,
  3,$$select public.pipstart_editorial_create('fe-bad','course','forex',null,'{"metadata":{"title":"Bad","placement":{"order":2}}}','first')$$);
select pg_temp.cv_ok(pg_temp.try(1,$$select public.pipstart_editorial_create('fe-module','module','forex','fe-course','{"metadata":{"title":"Coverage module","placement":{"order":1}}}','first')$$)='ok'
  and pg_temp.try(1,format('select public.pipstart_editorial_create(%L,%L,%L,%L,%L,%L)','fe-lesson','lesson','forex','fe-module',pg_temp.lesson('Coverage lesson'),'first'))='ok'
  and pg_temp.try(1,format('select public.pipstart_editorial_create(%L,%L,%L,%L,%L,%L)','fe-spare','lesson','forex','fe-module',pg_temp.lesson('Spare lesson'),'first'))='ok','module and lessons created');
select pg_temp.step('editorial_save',2,format('select public.pipstart_editorial_save(%L,1,%L,%L)','fe-lesson',pg_temp.lesson('Coverage lesson v2'),'edit'),
  3,format('select public.pipstart_editorial_save(%L,1,%L,%L)','fe-lesson',pg_temp.lesson('Moderator edit'),'edit'));
select pg_temp.step('editorial_submit',2,format('select public.pipstart_editorial_submit(%L,2,%L)','fe-lesson',pg_temp.sha('fe-lesson')),
  3,format('select public.pipstart_editorial_submit(%L,2,%L)','fe-lesson',pg_temp.sha('fe-lesson')));
select pg_temp.step('editorial_review',5,format('select public.pipstart_editorial_review(%L,2,%L,true,null)','fe-lesson',pg_temp.sha('fe-lesson')),
  2,format('select public.pipstart_editorial_review(%L,2,%L,true,null)','fe-lesson',pg_temp.sha('fe-lesson')));
select pg_temp.step('editorial_approve_single_person',1,format('select public.pipstart_editorial_approve_single_person(%L,1,%L,null)','fe-course',pg_temp.sha('fe-course')),
  3,format('select public.pipstart_editorial_approve_single_person(%L,1,%L,null)','fe-course',pg_temp.sha('fe-course')));
select pg_temp.cv_ok(pg_temp.try(1,format('select public.pipstart_editorial_approve_single_person(%L,1,%L,null)','fe-module',pg_temp.sha('fe-module')))='ok','module approved');
select pg_temp.step('publication_baseline',1,format('select public.pipstart_publication_baseline(%L,%L)',pg_temp.op(1),'Coverage baseline'),
  3,format('select public.pipstart_publication_baseline(%L,%L)',pg_temp.op(2),'Coverage baseline'));
select pg_temp.cv_ok(pg_temp.gen()=1 and pg_temp.live_rev('fe-lesson')=2,'baseline is generation 1 with the reviewed lesson');
select pg_temp.cv_ok(pg_temp.try(1,format('select public.pipstart_editorial_approve_single_person(%L,1,%L,null)','fe-spare',pg_temp.sha('fe-spare')))='ok','spare lesson approved');
select pg_temp.step('publication_publish',1,format('select public.pipstart_publication_publish(%L,1,%L,1,%L,%L)',pg_temp.op(3),'fe-spare',pg_temp.sha('fe-spare'),'Publish spare'),
  3,format('select public.pipstart_publication_publish(%L,1,%L,1,%L,%L)',pg_temp.op(4),'fe-spare',pg_temp.sha('fe-spare'),'Publish spare'));
select pg_temp.step('publication_withdraw',1,format('select public.pipstart_publication_withdraw(%L,2,%L,%L)',pg_temp.op(5),'fe-spare','Withdraw spare'),
  3,format('select public.pipstart_publication_withdraw(%L,2,%L,%L)',pg_temp.op(6),'fe-spare','Withdraw spare'));
select pg_temp.step('publication_restore',1,format('select public.pipstart_publication_restore(%L,3,2,%L)',pg_temp.op(7),'Restore generation 2'),
  3,format('select public.pipstart_publication_restore(%L,3,2,%L)',pg_temp.op(8),'Restore generation 2'));
select pg_temp.step('editorial_hold',1,$$select public.pipstart_editorial_hold('fe-course','Legal review')$$,3,$$select public.pipstart_editorial_hold('fe-course','Legal review')$$);
select pg_temp.cv_ok(pg_temp.try(1,$$select public.pipstart_editorial_hold('fe-course',null)$$)='ok','hold released (release is the same audited call)');
select pg_temp.cv_ok(pg_temp.try(1,format('select public.pipstart_editorial_create(%L,%L,%L,%L,%L,%L)','fe-trash','lesson','forex','fe-module',pg_temp.lesson('Trash lesson'),'first'))='ok','draft for trash');
select pg_temp.step('editorial_trash',1,$$select public.pipstart_editorial_trash('fe-trash','Not needed')$$,3,$$select public.pipstart_editorial_trash('fe-trash','Not needed')$$);
select pg_temp.step('editorial_restore',1,$$select public.pipstart_editorial_restore('fe-trash','Needed after all')$$,3,$$select public.pipstart_editorial_restore('fe-trash','Needed after all')$$);
select pg_temp.step('editorial_set_review_policy',1,format('select public.pipstart_editorial_set_review_policy(true,%s)',(select version from pipstart_editorial_private.policy)),
  3,format('select public.pipstart_editorial_set_review_policy(true,%s)',(select version from pipstart_editorial_private.policy)));
select pg_temp.cv_ok(pg_temp.try(1,format('select public.pipstart_editorial_set_review_policy(false,%s)',(select version from pipstart_editorial_private.policy)))='ok','policy restored');
select pg_temp.step('partner_policy_set',1,$$select public.pipstart_partner_policy_set('partner:fe-p','partner',0,'{"riskNotice":"Trading involves risk."}','Risk notice')$$,
  3,$$select public.pipstart_partner_policy_set('partner:fe-p','partner',0,'{"riskNotice":"Moderator text."}','Risk notice')$$);

-- 4. Maintenance writers on the live lesson.
select pg_temp.step('maintenance_assign',1,format('select public.pipstart_maintenance_assign(%L,%L,%L)','fe-lesson',pg_temp.uid(3),'Moderator looks after this'),
  3,format('select public.pipstart_maintenance_assign(%L,%L,%L)','fe-lesson',pg_temp.uid(3),'Self-assign'));
select pg_temp.step('maintenance_acknowledge',3,format('select public.pipstart_maintenance_acknowledge(%L,%s,%L)','fe-lesson',pg_temp.live_rev('fe-lesson'),'Seen'),
  2,format('select public.pipstart_maintenance_acknowledge(%L,%s,%L)','fe-lesson',pg_temp.live_rev('fe-lesson'),'Seen'));
select pg_temp.step('maintenance_reschedule',3,format('select public.pipstart_maintenance_reschedule(%L,%s,%L,%L)','fe-lesson',pg_temp.live_rev('fe-lesson'),(now() at time zone 'utc')::date+30,'Waiting for a source'),
  2,format('select public.pipstart_maintenance_reschedule(%L,%s,%L,%L)','fe-lesson',pg_temp.live_rev('fe-lesson'),(now() at time zone 'utc')::date+30,'Waiting for a source'));
select pg_temp.step('maintenance_record_result',3,format('select public.pipstart_maintenance_record_result(%L,%s,%L,%L,%L,%L)','fe-lesson',pg_temp.live_rev('fe-lesson'),'https://docs.example.org/guide','manual','manual_ok','Checked by hand'),
  2,format('select public.pipstart_maintenance_record_result(%L,%s,%L,%L,%L,%L)','fe-lesson',pg_temp.live_rev('fe-lesson'),'https://docs.example.org/guide','manual','manual_ok','Checked by hand'));
select pg_temp.step('maintenance_unassign',1,$$select public.pipstart_maintenance_unassign('fe-lesson','Back to the Owner')$$,3,$$select public.pipstart_maintenance_unassign('fe-lesson','Drop it')$$);
select pg_temp.step('maintenance_interval_set',1,format('select public.pipstart_maintenance_interval_set(%L,%s,300,%L)','lesson',(select max(version) from pipstart_maintenance_private.intervals where family='lesson'),'Faster cycle'),
  3,format('select public.pipstart_maintenance_interval_set(%L,%s,300,%L)','lesson',(select max(version) from pipstart_maintenance_private.intervals where family='lesson'),'Faster cycle'));
select pg_temp.step('maintenance_allowlist_change',1,$$select public.pipstart_maintenance_allowlist_change('docs.example.org','add','Documentation host')$$,
  3,$$select public.pipstart_maintenance_allowlist_change('docs.example.org','add','Documentation host')$$);

-- 5. Staff access: a fresh receipt (staged proof) then the audited change; the receipt survives an audit failure.
select pg_temp.cv_ok(pg_temp.try(1,format('select public.pipstart_staff_receipt(%L,%L,%L,%L,%L,%L)',pg_temp.uid(4),'grant_role','author','','',repeat('e',64)))='ok','fresh receipt issued');
select pg_temp.step('staff_change',1,format('select public.pipstart_staff_change(%L,%L,%L,%L,%L,%L,%L,%L)',pg_temp.uid(4),'grant_role','author','','',repeat('e',64),pg_temp.op(9),'staff_onboarding'),
  3,format('select public.pipstart_staff_change(%L,%L,%L,%L,%L,%L,%L,%L)',pg_temp.uid(4),'grant_role','author','','',repeat('f',64),pg_temp.op(10),'staff_onboarding'));
select pg_temp.cv_ok(exists(select 1 from pipstart_staff_private.roles where user_id=pg_temp.uid(4) and role_name='author'),'role granted once');

-- 6. Every audited writer ran all three ways.
select pg_temp.cv_ok((select count(*) from cv_steps where audit_rows=1)=(select count(*) from cv_class where class='audited')
  and not exists(select 1 from cv_class c where c.class='audited' and not exists(select 1 from cv_steps s where 'pipstart_'||s.label=c.fn)),
  'every audited writer covered: missing '||coalesce((select string_agg(c.fn,', ') from cv_class c where c.class='audited' and not exists(select 1 from cv_steps s where 'pipstart_'||s.label=c.fn)),''));
rollback;
