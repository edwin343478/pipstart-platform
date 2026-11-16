-- Marked disposable SQL/Auth-stub database only. Never the application DB.
-- Rolled back: no fixture survives. MP10a maintenance store: grants, due/overdue computed on read,
-- scope and pagination, assignment, acknowledgement and reschedule rules, revision changes, results,
-- the Owner allowlist and intervals, append-only tables and one audit row per change.
begin;
create function pg_temp.mt_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Maintenance assertion: %',label; end if; end $$;
create function pg_temp.mt_denied(command text,expected text,label text) returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then if sqlstate=expected then return; end if;
    raise exception 'Maintenance %: expected SQLSTATE % but got % (%)',label,expected,sqlstate,sqlerrm; end;
  raise exception 'Maintenance %: expected refusal %',label,expected;
end $$;
create function pg_temp.mt_as(n integer) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform set_config('request.jwt.claims',jsonb_build_object('sub',('fb000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
    'session_id',('fb200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'role','authenticated','aal','aal2',
    'user_metadata',jsonb_build_object('role','owner'))::text,true);
end $$;
create function pg_temp.uid(n integer) returns uuid language sql immutable as $$ select ('fb000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.op(n integer) returns uuid language sql immutable as $$ select ('fb900000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.d(n integer) returns date language sql stable as $$ select (now() at time zone 'utc')::date+n $$;
create function pg_temp.sha(p_id text) returns text language sql as $$ select public.pipstart_editorial_item(p_id)->'revision'->>'body_sha256' $$;
create function pg_temp.w(p_scope text,p_status text default null,p_family text default null,p_after text default '',p_limit integer default 50)
  returns jsonb language sql as $$ select public.pipstart_maintenance_worklist(p_scope,p_status,p_family,p_after,p_limit) $$;
create function pg_temp.wi(p_scope text,p_id text) returns jsonb language sql as $$
  select x from jsonb_array_elements(pg_temp.w(p_scope)->'items') x where x->>'id'=p_id $$;
create function pg_temp.lesson(reviewed text) returns jsonb language sql stable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title','Maintained lesson','placement',jsonb_build_object('order',1),'sources',jsonb_build_array(jsonb_build_object('title','Guide','url','https://docs.example.org/guide')))
    ||case when reviewed is null then '{}'::jsonb else jsonb_build_object('reviewedAt',reviewed) end,
    'blocks',jsonb_build_array(jsonb_build_object('type','paragraph','children','See https://docs.example.org/guide for details.'))) $$;
create function pg_temp.partner(expires date) returns jsonb language sql stable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title','Maintained Partner','shortName','Maintained','kind','forex-broker','brand','neutral'),
    'relationship','affiliate','summary','Generated partner for maintenance tests.','facts','[]'::jsonb,'fees','[]'::jsonb,'support','[]'::jsonb,
    'review',jsonb_build_object('status','verified','reviewedAt',(expires-365)::text,'expiresAt',expires::text,'previousListingDate',null,
      'sources',jsonb_build_array(jsonb_build_object('url','https://docs.example.org/partner','checkedAt',(expires-365)::text))),
    'availability',jsonb_build_object('status','unknown','allowed','[]'::jsonb,'blocked','[]'::jsonb,'source',null),
    'entities','[]'::jsonb,'payments','[]'::jsonb,'image',null) $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;

-- Grants: private helpers and tables unreachable; RPCs authenticated only and volatile.
select pg_temp.mt_ok(not has_function_privilege(r,f::regprocedure,'EXECUTE'),'private '||f||' for '||r)
  from unnest(array['anon','authenticated','service_role'])r,
  unnest(array['pipstart_maintenance_private.today()','pipstart_maintenance_private.as_date(text)',
    'pipstart_maintenance_private.live_items()','pipstart_maintenance_private.live_revision(text)',
    'pipstart_maintenance_private.content_dates(text,jsonb)','pipstart_maintenance_private.status(text,date)',
    'pipstart_maintenance_private.assignee(text)','pipstart_maintenance_private.may_act(uuid,text)',
    'pipstart_maintenance_private.may_assign(uuid,text,text)','pipstart_maintenance_private.reason_ok(text)',
    'pipstart_maintenance_private.target(text,integer)','pipstart_maintenance_private.host_listed(text)',
    'pipstart_maintenance_private.affiliate_host(text)'])f;
select pg_temp.mt_ok(has_function_privilege('authenticated',f,'EXECUTE') and not has_function_privilege('anon',f,'EXECUTE') and not has_function_privilege('service_role',f,'EXECUTE'),'staff grant '||f)
  from unnest(array['public.pipstart_maintenance_worklist(text,text,text,text,integer)','public.pipstart_maintenance_assign(text,uuid,text)',
    'public.pipstart_maintenance_unassign(text,text)','public.pipstart_maintenance_acknowledge(text,integer,text)',
    'public.pipstart_maintenance_reschedule(text,integer,date,text)','public.pipstart_maintenance_record_result(text,integer,text,text,text,text)',
    'public.pipstart_maintenance_results(text)','public.pipstart_maintenance_interval_set(text,integer,integer,text)',
    'public.pipstart_maintenance_intervals()','public.pipstart_maintenance_allowlist_change(text,text,text)',
    'public.pipstart_maintenance_allowlist()','public.pipstart_maintenance_check_allowed(text)'])f;
select pg_temp.mt_ok((select count(*) from pg_proc where pronamespace='public'::regnamespace and proname like 'pipstart_maintenance_%' and provolatile<>'v')=0,'maintenance RPCs volatile');
select pg_temp.mt_ok((select count(*) from pg_proc where pronamespace='public'::regnamespace and proname like 'pipstart_maintenance_%')=12,'exactly twelve maintenance RPCs');
select pg_temp.mt_ok(not has_table_privilege(r,t,'SELECT') and not has_table_privilege(r,t,'INSERT'),'table '||t||' for '||r)
  from unnest(array['anon','authenticated','service_role'])r,
  unnest(array['pipstart_maintenance_private.intervals','pipstart_maintenance_private.events',
    'pipstart_maintenance_private.results','pipstart_maintenance_private.allowlist'])t;
select pg_temp.mt_ok(not has_schema_privilege(r,'pipstart_maintenance_private','USAGE'),'schema closed for '||r) from unnest(array['anon','authenticated','service_role'])r;
select pg_temp.mt_ok((select string_agg(family||':'||version||':'||days,',' order by family) from pipstart_maintenance_private.intervals)='analysis:1:180,lesson:1:365','seeded intervals are the owner decision');
select pg_temp.mt_ok(not exists(select 1 from pipstart_maintenance_private.events) and not exists(select 1 from pipstart_maintenance_private.results)
  and not exists(select 1 from pipstart_maintenance_private.allowlist),'store starts empty');

-- 1 Owner, 2 Editor (assigned the lesson ma-lesson-a and its module), 3 Moderator, 4 Author, 5 Administrator, 6 Moderator (inactive).
update pipstart_staff_private.members set active=false where active;
insert into auth.users(id,raw_user_meta_data) select pg_temp.uid(n),'{}' from generate_series(1,6)n;
insert into auth.mfa_factors(id,user_id,factor_type,status)
select ('fb100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),'totp','verified' from generate_series(1,6)n;
insert into auth.sessions(id,user_id,factor_id,aal)
select ('fb200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),('fb100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,6)n;
insert into pipstart_staff_private.members(user_id,active) select pg_temp.uid(n),n<>6 from generate_series(1,6)n;
insert into pipstart_staff_private.roles values
 (pg_temp.uid(1),'owner'),(pg_temp.uid(2),'editor'),(pg_temp.uid(3),'moderator'),(pg_temp.uid(4),'author'),
 (pg_temp.uid(5),'administrator'),(pg_temp.uid(6),'moderator');
insert into pipstart_staff_private.assignments(user_id,resource_kind,resource_id) values
 (pg_temp.uid(2),'lesson','ma-lesson-a');
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
set local role authenticated;

-- Live content: two lessons, a quiz, an analysis post, a partner and its link, in one baseline.
select pg_temp.mt_as(1);
select public.pipstart_partner_policy_set('partner:ma-p','partner',0,'{"riskNotice":"Trading involves risk."}','Risk notice');
select public.pipstart_partner_policy_set('link:ma-p','link',0,'{"allowedHosts":["go.ma-affiliate.example"]}','Hosts');
select public.pipstart_editorial_approve_single_person(x.id,1,(public.pipstart_editorial_create(x.id,x.family,x.path,x.parent,x.body,'first'))->>'body_sha256',null)
from (values
 (1,'ma-course','course','forex',null,'{"metadata":{"title":"Course","placement":{"order":1}}}'::jsonb),
 (2,'ma-module','module','forex','ma-course','{"metadata":{"title":"Module","placement":{"order":1}}}'::jsonb),
 (3,'ma-lesson-a','lesson','forex','ma-module',pg_temp.lesson(pg_temp.d(-400)::text||'T09:00:00.000Z')),
 (4,'ma-lesson-b','lesson','forex','ma-module',pg_temp.lesson(null)),
 (5,'ma-quiz','quiz','forex','ma-module',jsonb_build_object('metadata',jsonb_build_object('title','Quiz','version',1,'placement',jsonb_build_object('order',2),
   'governance',jsonb_build_object('reviewedAt',pg_temp.d(-100)::text,'nextReviewAt',pg_temp.d(20)::text)),
   'questions','[{"id":"q1","choices":[{"id":"a"},{"id":"b"}],"correctChoiceIds":["a"]}]'::jsonb)),
 (6,'ma-post','analysis',null,null,jsonb_build_object('metadata',jsonb_build_object('title','Post','category','technical','excerpt','Short',
   'reviewedAt',pg_temp.d(-10)::text||'T09:00:00.000Z'),'paragraphs',jsonb_build_array('Text with https://docs.example.org/post'))),
 (7,'partner:ma-p','partner',null,null,pg_temp.partner(pg_temp.d(-1))),
 (8,'link:ma-p','link',null,'partner:ma-p',jsonb_build_object('metadata',jsonb_build_object('title','Visit Maintained'),
   'url','https://go.ma-affiliate.example/x?t=1','active',true,'expiresAt',pg_temp.d(10)::text))
) x(n,id,family,path,parent,body) order by x.n;
select pg_temp.mt_ok((public.pipstart_publication_baseline(pg_temp.op(1),'Maintenance baseline'))->>'generation'='1','baseline');

-- Due state computed on read from the content's own dates.
select pg_temp.mt_ok((pg_temp.wi('all',x.id)->>'status')=x.st and (pg_temp.wi('all',x.id)->>'due') is not distinct from x.due,'status '||x.id)
from (values ('ma-lesson-a','overdue',(pg_temp.d(-400)+365)::text),('ma-lesson-b','no_review',null),('ma-quiz','due',pg_temp.d(20)::text),
  ('ma-post','current',(pg_temp.d(-10)+180)::text),('partner:ma-p','overdue',pg_temp.d(-1)::text),('link:ma-p','due',pg_temp.d(10)::text)) x(id,st,due);
select pg_temp.mt_ok(jsonb_array_length(pg_temp.w('all')->'items')=6 and pg_temp.wi('all','ma-course') is null and pg_temp.wi('all','ma-module') is null,'only maintained families listed');
select pg_temp.mt_ok(pg_temp.wi('all','ma-lesson-b')->>'reviewedOn' is null and pg_temp.wi('all','ma-lesson-a')->>'reviewedOn'=pg_temp.d(-400)::text,'no review on record is never presented as reviewed');
select pg_temp.mt_ok((select string_agg(x->>'id',',' order by x->>'id') from jsonb_array_elements(pg_temp.w('all','overdue')->'items') x)='ma-lesson-a,partner:ma-p','status filter');
select pg_temp.mt_ok((select string_agg(x->>'id',',') from jsonb_array_elements(pg_temp.w('all',null,'lesson')->'items') x)='ma-lesson-a,ma-lesson-b','family filter');
-- Cursor pagination: complete, ordered, no repeats.
select pg_temp.mt_ok(jsonb_array_length(pg_temp.w('all',null,null,'',2)->'items')=2 and pg_temp.w('all',null,null,'',2)->>'next'='ma-lesson-a','first page');
select pg_temp.mt_ok((select string_agg(x->>'id',',') from jsonb_array_elements(pg_temp.w('all',null,null,'ma-lesson-a',2)->'items') x)='ma-lesson-b,ma-post' and pg_temp.w('all',null,null,'ma-lesson-a',2)->>'next'='ma-post','second page');
select pg_temp.mt_ok(pg_temp.w('all',null,null,'ma-post',2)->>'next' is null and (select string_agg(x->>'id',',') from jsonb_array_elements(pg_temp.w('all',null,null,'ma-post',2)->'items') x)='ma-quiz,partner:ma-p','last page');
select pg_temp.mt_denied(format('select public.pipstart_maintenance_worklist(%L,%L,%L,%L,%s)',s,st,f,a,l),'22023','bad worklist '||s||'/'||coalesce(st,'-')||'/'||coalesce(f,'-')||'/'||l)
  from (values ('any',null,null,'',10),('all','late',null,'',10),('all',null,'course','',10),('all',null,null,'',0),('all',null,null,'',51)) x(s,st,f,a,l);
-- Scope: Administrator sees nothing to maintain; an unknown identity is refused.
select pg_temp.mt_as(5);
select pg_temp.mt_ok(jsonb_array_length(pg_temp.w('all')->'items')=0 and jsonb_array_length(pg_temp.w('mine')->'items')=0,'administrator has no maintenance scope');
select pg_temp.mt_as(9);
select pg_temp.mt_denied($$select public.pipstart_maintenance_worklist('mine')$$,'42501','unknown identity refused');
select pg_temp.mt_as(6);
select pg_temp.mt_denied($$select public.pipstart_maintenance_worklist('mine')$$,'42501','inactive staff refused');

-- Assignment: the Owner, or an Editor who may publish the item; assignee must be active staff.
select pg_temp.mt_as(3);
select pg_temp.mt_denied(format('select public.pipstart_maintenance_assign(%L,%L,%L)','ma-lesson-a',pg_temp.uid(3),'self'),'42501','moderator cannot assign');
select pg_temp.mt_as(2);
select pg_temp.mt_ok(jsonb_array_length(pg_temp.w('all')->'items')=1 and pg_temp.wi('all','ma-lesson-a')->>'assignee' is null,'editor sees only items in scope, without assignee identities');
select pg_temp.mt_ok((public.pipstart_maintenance_assign('ma-lesson-a',pg_temp.uid(3),'Moderator owns lesson upkeep'))->>'status'='assigned','editor assigns in scope');
select pg_temp.mt_denied(format('select public.pipstart_maintenance_assign(%L,%L,%L)','ma-post',pg_temp.uid(3),'out of scope'),'42501','editor cannot assign outside scope');
select pg_temp.mt_as(1);
select pg_temp.mt_ok((public.pipstart_maintenance_assign('partner:ma-p',pg_temp.uid(3),'First owner'))->>'status'='assigned','owner assigns');
select pg_temp.mt_ok((public.pipstart_maintenance_assign('partner:ma-p',pg_temp.uid(4),'Author takes over'))->>'status'='assigned','owner reassigns');
select pg_temp.mt_ok((public.pipstart_maintenance_assign('partner:ma-p',pg_temp.uid(4),'Again'))->>'status'='unchanged','same assignment unchanged');
reset role;
select pg_temp.mt_ok((select count(*) from pipstart_staff_private.assignments where resource_kind='maintenance' and resource_id='partner:ma-p')=1
  and exists(select 1 from pipstart_staff_private.assignments where resource_kind='maintenance' and resource_id='partner:ma-p' and user_id=pg_temp.uid(4)),'one maintenance owner per item');
select pg_temp.mt_ok((select count(*) from pipstart_maintenance_private.events where item_id='partner:ma-p' and kind='assign')=2,'unchanged assignment adds no event');
set local role authenticated;
select pg_temp.mt_as(1);
select pg_temp.mt_ok(pg_temp.wi('all','partner:ma-p')->>'assignee'=pg_temp.uid(4)::text,'owner sees the assignee');
select pg_temp.mt_denied(format('select public.pipstart_maintenance_assign(%L,%L,%L)','ma-post',pg_temp.uid(u),'bad assignee'),'22023','assignee '||u||' refused')
  from unnest(array[5,6,9])u;
select pg_temp.mt_denied(format('select public.pipstart_maintenance_assign(%L,%L,%L)','ma-course',pg_temp.uid(3),'structure'),'22023','course is not maintained');
select pg_temp.mt_denied(format('select public.pipstart_maintenance_assign(%L,%L,%L)','ma-post',pg_temp.uid(3),r),'22023','bad reason')
  from unnest(array['',' padded'])r;

-- The Moderator's own list.
select pg_temp.mt_as(3);
select pg_temp.mt_ok((select string_agg(x->>'id',',') from jsonb_array_elements(pg_temp.w('mine')->'items') x)='ma-lesson-a'
  and (pg_temp.wi('mine','ma-lesson-a')->>'assignedToMe')::boolean and pg_temp.wi('mine','ma-lesson-a')->>'assignee' is null,'moderator sees only assigned items');
select pg_temp.mt_ok(jsonb_array_length(pg_temp.w('all')->'items')=0,'moderator has no wider scope');

-- Acknowledge: assignee or Owner; the item stays due and no review date changes.
select pg_temp.mt_ok((public.pipstart_maintenance_acknowledge('ma-lesson-a',1,'Seen; review booked'))->>'status'='acknowledged','assignee acknowledges');
select pg_temp.mt_ok(pg_temp.wi('mine','ma-lesson-a')->>'status'='overdue' and pg_temp.wi('mine','ma-lesson-a')->'acknowledged'->>'reason'='Seen; review booked'
  and pg_temp.wi('mine','ma-lesson-a')->>'reviewedOn'=pg_temp.d(-400)::text,'acknowledgement keeps it overdue and the review date');
select pg_temp.mt_denied($$select public.pipstart_maintenance_acknowledge('partner:ma-p',1,'not mine')$$,'42501','only the assignee acts');
select pg_temp.mt_denied($$select public.pipstart_maintenance_acknowledge('ma-lesson-a',2,'stale')$$,'PT409','stale revision');
select pg_temp.mt_denied($$select public.pipstart_maintenance_acknowledge('ma-lesson-a',1,'')$$,'22023','empty reason');
select pg_temp.mt_denied($$select public.pipstart_maintenance_acknowledge('ma-lesson-a',null,'x')$$,'22023','revision required');
-- Reschedule: within 90 days for staff, 365 for the Owner, always after today.
select pg_temp.mt_denied(format('select public.pipstart_maintenance_reschedule(%L,1,%L,%L)','ma-lesson-a',pg_temp.d(n),'too far'),'22023','reschedule '||n||' days refused')
  from unnest(array[0,-1,91])n;
select pg_temp.mt_ok((public.pipstart_maintenance_reschedule('ma-lesson-a',1,pg_temp.d(60),'Waiting for source update'))->>'status'='rescheduled','assignee reschedules');
select pg_temp.mt_ok(pg_temp.wi('mine','ma-lesson-a')->>'due'=pg_temp.d(60)::text and pg_temp.wi('mine','ma-lesson-a')->>'status'='current'
  and (pg_temp.wi('mine','ma-lesson-a')->>'rescheduled')::boolean and pg_temp.wi('mine','ma-lesson-a')->>'contentDue'=(pg_temp.d(-400)+365)::text,'reschedule changes due only');
select pg_temp.mt_as(1);
select pg_temp.mt_denied(format('select public.pipstart_maintenance_reschedule(%L,1,%L,%L)','ma-post',pg_temp.d(366),'too far'),'22023','owner limit 365');
select pg_temp.mt_ok((public.pipstart_maintenance_reschedule('ma-post',1,pg_temp.d(200),'Owner extends'))->>'status'='rescheduled','owner reschedules within 365');
reset role;
select pg_temp.mt_ok((select body#>>'{metadata,reviewedAt}' from pipstart_editorial_private.revisions where item_id='ma-lesson-a' and revision_no=1)=pg_temp.d(-400)::text||'T09:00:00.000Z','stored review date untouched');
set local role authenticated;

-- A new live revision (a genuine review) resets reschedule and acknowledgement; the owner stays.
select pg_temp.mt_as(1);
select public.pipstart_editorial_approve_single_person('ma-lesson-a',2,(public.pipstart_editorial_save('ma-lesson-a',1,pg_temp.lesson(pg_temp.d(0)::text),'Reviewed'))->>'body_sha256',null);
select pg_temp.mt_ok((public.pipstart_publication_publish(pg_temp.op(2),1,'ma-lesson-a',2,pg_temp.sha('ma-lesson-a'),'Reviewed lesson'))->>'generation'='2','reviewed lesson live');
select pg_temp.mt_as(3);
select pg_temp.mt_ok(pg_temp.wi('mine','ma-lesson-a')->>'revision'='2' and pg_temp.wi('mine','ma-lesson-a')->>'status'='current'
  and not (pg_temp.wi('mine','ma-lesson-a')->>'rescheduled')::boolean and pg_temp.wi('mine','ma-lesson-a')->'acknowledged'='null'::jsonb
  and pg_temp.wi('mine','ma-lesson-a')->>'due'=(pg_temp.d(0)+365)::text,'new review resets the cycle');
select pg_temp.mt_denied($$select public.pipstart_maintenance_acknowledge('ma-lesson-a',1,'old revision')$$,'PT409','old revision refused');

-- Results: only references in the live revision; probes only for allowlisted, non-affiliate hosts.
select pg_temp.mt_denied($$select public.pipstart_maintenance_record_result('ma-lesson-a',2,'https://elsewhere.example/x','manual','manual_broken',null)$$,'22023','reference must be in the revision');
select pg_temp.mt_ok((public.pipstart_maintenance_record_result('ma-lesson-a',2,'https://docs.example.org/guide','manual','manual_ok','Opened in a browser'))->>'status'='recorded','manual result');
select pg_temp.mt_ok((public.pipstart_maintenance_record_result('ma-lesson-a',2,'https://docs.example.org/guide','manual','manual_broken','Page now 404'))->>'status'='recorded','second manual result');
select pg_temp.mt_ok(jsonb_array_length(public.pipstart_maintenance_results('ma-lesson-a')->'results')=1
  and public.pipstart_maintenance_results('ma-lesson-a')->'results'->0->>'classification'='manual_broken','latest result per reference');
select pg_temp.mt_denied($$select public.pipstart_maintenance_record_result('ma-lesson-a',2,'https://docs.example.org/guide','probe','ok',null)$$,'42501','probe needs allowlist');
select pg_temp.mt_denied(format('select public.pipstart_maintenance_record_result(%L,2,%L,%L,%L,%L)','ma-lesson-a','https://docs.example.org/guide',s,c,e),'22023','bad result '||s||'/'||c)
  from (values ('manual','ok',null),('probe','manual_ok',null),('guess','ok',null),('manual','manual_ok',repeat('x',2049)),('manual','manual_ok','bell'||chr(7))) x(s,c,e);
select pg_temp.mt_denied($$select public.pipstart_maintenance_allowlist_change('docs.example.org','add','widen')$$,'42501','moderator cannot change allowlist');
select pg_temp.mt_denied($$select public.pipstart_maintenance_allowlist()$$,'42501','moderator cannot read allowlist');
select pg_temp.mt_as(4);
select pg_temp.mt_denied($$select public.pipstart_maintenance_results('ma-lesson-a')$$,'42501','unassigned author cannot read results');
select pg_temp.mt_as(1);
select pg_temp.mt_ok((public.pipstart_maintenance_allowlist_change('docs.example.org','add','Documentation host'))->>'status'='added','owner adds host');
select pg_temp.mt_ok((public.pipstart_maintenance_allowlist_change('docs.example.org','add','again'))->>'status'='unchanged','repeat add unchanged');
select pg_temp.mt_denied(format('select public.pipstart_maintenance_allowlist_change(%L,%L,%L)',h,a,'bad'),'22023','bad allowlist '||h||' '||a)
  from (values ('go.ma-affiliate.example','add'),('Docs.Example.org','add'),('docs.example.org:8443','add'),('localhost','add'),('docs.example.org','block')) x(h,a);
select pg_temp.mt_ok((select string_agg(x->>'host',',') from jsonb_array_elements(public.pipstart_maintenance_allowlist()) x)='docs.example.org','owner reads allowlist');
select pg_temp.mt_ok(public.pipstart_maintenance_check_allowed('https://docs.example.org/guide') and not public.pipstart_maintenance_check_allowed('https://go.ma-affiliate.example/x?t=1')
  and not public.pipstart_maintenance_check_allowed('http://docs.example.org/guide') and not public.pipstart_maintenance_check_allowed('https://other.example/'),'check allowed only for allowlisted HTTPS hosts');
select pg_temp.mt_as(3);
select pg_temp.mt_ok((public.pipstart_maintenance_record_result('ma-lesson-a',2,'https://docs.example.org/guide','probe','not_found','HTTP 404'))->>'status'='recorded','probe result on allowlisted host');
select pg_temp.mt_as(1);
select pg_temp.mt_denied($$select public.pipstart_maintenance_record_result('link:ma-p',1,'https://go.ma-affiliate.example/x?t=1','probe','ok',null)$$,'42501','affiliate link never probed');
select pg_temp.mt_ok((public.pipstart_maintenance_allowlist_change('docs.example.org','remove','No longer checked'))->>'status'='removed','owner removes host');
select pg_temp.mt_ok(not public.pipstart_maintenance_check_allowed('https://docs.example.org/guide'),'removed host not allowed');

-- Intervals: Owner only, compare-and-set, bounded; the worklist follows the newest version.
select pg_temp.mt_as(2);
select pg_temp.mt_denied($$select public.pipstart_maintenance_interval_set('analysis',1,90,'shorter')$$,'42501','editor cannot set interval');
select pg_temp.mt_as(1);
select pg_temp.mt_denied(format('select public.pipstart_maintenance_interval_set(%L,1,%s,%L)',f,d,'bad'),'22023','bad interval '||f||' '||d)
  from (values ('analysis',29),('analysis',731),('quiz',90),('partner',90)) x(f,d);
select pg_temp.mt_ok((public.pipstart_maintenance_interval_set('analysis',1,30,'Faster review cycle'))->>'version'='2','owner sets interval');
select pg_temp.mt_denied($$select public.pipstart_maintenance_interval_set('analysis',1,60,'stale')$$,'PT409','stale interval version');
select pg_temp.mt_ok((select x->>'days' from jsonb_array_elements(public.pipstart_maintenance_intervals()) x where x->>'family'='analysis')='30','intervals read newest');
select pg_temp.mt_ok(pg_temp.wi('all','ma-post')->>'contentDue'=(pg_temp.d(-10)+30)::text and pg_temp.wi('all','ma-post')->>'due'=pg_temp.d(200)::text,'content due follows interval; reschedule still applies');

-- Unassign.
select pg_temp.mt_ok((public.pipstart_maintenance_unassign('ma-lesson-a','Moderator moved on'))->>'status'='unassigned','owner unassigns');
select pg_temp.mt_ok((public.pipstart_maintenance_unassign('ma-lesson-a','again'))->>'status'='unchanged','repeat unassign unchanged');
select pg_temp.mt_as(3);
select pg_temp.mt_ok(jsonb_array_length(pg_temp.w('mine')->'items')=0,'unassigned item leaves the list');
select pg_temp.mt_denied($$select public.pipstart_maintenance_acknowledge('ma-lesson-a',2,'gone')$$,'42501','former assignee cannot act');

-- Append-only tables; one audit row per change and none for refusals or unchanged calls.
reset role;
select pg_temp.mt_denied(format('update %s set reason=reason',t),'42501','append-only update '||t)
  from unnest(array['pipstart_maintenance_private.events','pipstart_maintenance_private.allowlist','pipstart_maintenance_private.intervals'])t;
select pg_temp.mt_denied('update pipstart_maintenance_private.results set evidence=null','42501','append-only update results');
select pg_temp.mt_denied(format('delete from %s',t),'42501','append-only delete '||t)
  from unnest(array['pipstart_maintenance_private.events','pipstart_maintenance_private.results','pipstart_maintenance_private.allowlist','pipstart_maintenance_private.intervals'])t;
select pg_temp.mt_ok((select count(*) from pipstart_editorial_private.audit where operation='maintenance')=
  (select count(*) from pipstart_maintenance_private.events)+(select count(*) from pipstart_maintenance_private.results)
  +(select count(*) from pipstart_maintenance_private.allowlist)+(select count(*) from pipstart_maintenance_private.intervals where set_by is not null),'one audit row per change');
select pg_temp.mt_ok((select count(*) from pipstart_maintenance_private.events)=7 and (select count(*) from pipstart_maintenance_private.results)=3
  and (select count(*) from pipstart_maintenance_private.allowlist)=2,'exact event, result and allowlist counts');
select pg_temp.mt_ok(not exists(select 1 from pipstart_editorial_private.audit where operation='maintenance' and actor_id in (pg_temp.uid(5),pg_temp.uid(6))),'no refused change audited');
rollback;
