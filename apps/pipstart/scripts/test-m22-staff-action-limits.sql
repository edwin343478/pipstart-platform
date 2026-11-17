-- Marked disposable SQL/Auth-stub database only. Never the application DB. All fixture writes roll back.
-- M22 audit follow-up, Package 4: per-actor hourly limits on consequential staff actions. Driven through the
-- real RPCs as the Owner and an Author: one past the limit is refused with PT429 and a retry_after hint, and
-- the refused call changes nothing; two actors are counted apart; emergency and recovery actions still work at
-- the limit; server-side and owner-run SQL writes are never refused; the rolling hour releases on time; every
-- journal operation is classified and an unknown one is refused; nothing is reachable by an API role.
begin;
create function pg_temp.al_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Action limit assertion: %',label; end if; end $$;
create function pg_temp.uid(n integer) returns uuid language sql immutable as $$ select ('f4000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.op(n integer) returns uuid language sql immutable as $$ select ('f4900000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.al_as(n integer) returns void language plpgsql security definer set search_path='' as $$
declare s uuid:=('f4200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid; t bigint;
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
-- Runs one call as the actor under the authenticated role; returns 'ok', the SQLSTATE, or 'PT429:<hint>'.
create function pg_temp.try(n integer,c text) returns text language plpgsql as $$
declare st text; h text;
begin
  perform pg_temp.al_as(n);
  begin execute 'set local role authenticated'; execute c; execute 'reset role';
  exception when others then get stacked diagnostics st=returned_sqlstate,h=pg_exception_hint;
    return case when st='PT429' then st||':'||coalesce(h,'') else st end; end;
  return 'ok';
end $$;
-- Sets one class's limit to exactly what the actor has used in the rolling hour (so the next one is refused).
create function pg_temp.cap(p_class text,n integer,extra integer default 0) returns integer language plpgsql security definer set search_path='' as $$
declare used integer; since timestamptz:=clock_timestamp()-interval '1 hour';
begin
  select count(*) into used from (
    select 1 from pipstart_editorial_private.audit a where a.actor_id=pg_temp.uid(n) and a.created_at>since
      and pipstart_staff_private.action_class('editorial',a.operation) is not distinct from p_class
    union all select 1 from pipstart_staff_private.audit a where a.actor_id=pg_temp.uid(n) and a.created_at>since
      and pipstart_staff_private.action_class('staff',a.operation) is not distinct from p_class) x;
  update pipstart_staff_private.action_limits set per_hour=greatest(1,used+extra) where class=p_class;
  return used;
end $$;
create function pg_temp.lesson(t text) returns jsonb language sql immutable as $$
  select jsonb_build_object('metadata',jsonb_build_object('title',t,'placement',jsonb_build_object('order',1),
    'sources',jsonb_build_array(jsonb_build_object('title','Guide','url','https://docs.example.org/guide'))),
    'blocks',jsonb_build_array(jsonb_build_object('type','paragraph','children','Body of '||t))) $$;
create function pg_temp.save(p_id text,t text) returns text language sql security definer set search_path='' as $$
  select format('select public.pipstart_editorial_save(%L,%s,%L,%L)',p_id,pg_temp.rev(p_id),pg_temp.lesson(t),'edit') $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;

-- 1. Catalog: six limits with the accepted values, one trigger per journal, nothing open to an API role.
select pg_temp.al_ok((select jsonb_object_agg(class,per_hour) from pipstart_staff_private.action_limits)
  ='{"edit":120,"review":60,"publish":10,"people":30,"upkeep":60,"learner_accounts":10}'::jsonb,'accepted limits');
select pg_temp.al_ok((select array_agg(c.relnamespace::regnamespace::text||'.'||c.relname||'>'||p.proname order by c.relname,c.relnamespace::regnamespace::text)
  from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_proc p on p.oid=t.tgfoid where t.tgname='pipstart_action_limit' and not t.tgisinternal)
  =array['pipstart_editorial_private.audit>limit_editorial_audit','pipstart_staff_private.audit>limit_staff_audit',
         'pipstart_staff_private.learner_requests>limit_learner_request','pipstart_editorial_private.publication_schedule_events>limit_schedule_event'],
  'one before-insert trigger on each journal');
select pg_temp.al_ok((select bool_and(t.tgtype&2=2 and t.tgtype&4=4 and t.tgtype&1=1) from pg_trigger t where t.tgname='pipstart_action_limit'),'row-level before insert');
select pg_temp.al_ok(not has_table_privilege(r,'pipstart_staff_private.action_limits',p),'limits closed to '||r||' '||p)
  from unnest(array['anon','authenticated','service_role'])r,unnest(array['SELECT','INSERT','UPDATE','DELETE'])p;
select pg_temp.al_ok(not has_function_privilege(r,f,'EXECUTE'),f||' closed to '||r)
  from unnest(array['anon','authenticated','service_role'])r,unnest(array['pipstart_staff_private.action_class(text,text)','pipstart_staff_private.action_spend(uuid,text)',
    'pipstart_staff_private.limit_editorial_audit()','pipstart_staff_private.limit_staff_audit()','pipstart_staff_private.limit_schedule_event()',
    'pipstart_staff_private.limit_learner_request()'])f;
select pg_temp.al_ok((select provolatile='v' and prosecdef from pg_proc where oid='pipstart_staff_private.action_spend(uuid,text)'::regprocedure),'spend is volatile definer');
-- Classification: limited classes, exempt (null) actions, and an unknown operation is refused.
select pg_temp.al_ok(pipstart_staff_private.action_class(s,o) is not distinct from c,s||'/'||o||' is '||coalesce(c,'exempt'))
  from (values ('editorial','create','edit'),('editorial','save','edit'),('editorial','trash','edit'),('editorial','policy','edit'),
   ('editorial','submit','review'),('editorial','review_approve','review'),('editorial','review_changes','review'),('editorial','approve_single_person','review'),
   ('editorial','publish','publish'),('editorial','refresh','publish'),('editorial','maintenance','upkeep'),
   ('editorial','hold',null),('editorial','release',null),('editorial','withdraw',null),('editorial','restore',null),('editorial','publication_restore',null),
   ('editorial','import',null),('editorial','publication_baseline',null),
   ('staff','grant_role','people'),('staff','revoke_role','people'),('staff','grant_delegation','people'),('staff','revoke_delegation','people'),
   ('staff','assign','people'),('staff','unassign','people'),('staff','resume','people'),('staff','bootstrap',null),('staff','control',null),('staff','suspend',null),
   ('schedule','scheduled','publish'),('schedule','cancelled','publish'),('schedule','published',null),('schedule','failed',null),
   ('learner','auth_suspend','learner_accounts'),('learner','auth_resume','learner_accounts')) v(s,o,c);
do $$ begin perform pipstart_staff_private.action_class('editorial','bulk_delete'); raise exception 'Action limit assertion: unknown operation accepted';
exception when sqlstate '55000' then null; end $$;

-- 2. Fixture: 1 Owner, 2 Author (assigned the lessons), 3 Moderator.
update pipstart_staff_private.members set active=false where active;
insert into auth.users(id,raw_user_meta_data) select pg_temp.uid(n),jsonb_build_object('display_name','Limits '||n) from generate_series(1,3)n;
insert into auth.mfa_factors(id,user_id,factor_type,status) select ('f4100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),'totp','verified' from generate_series(1,3)n;
insert into auth.sessions(id,user_id,factor_id,aal) select ('f4200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),('f4100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,3)n;
insert into auth.mfa_amr_claims(id,session_id,authentication_method,updated_at) select ('f4300000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('f4200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'totp',clock_timestamp()-interval '1 minute' from generate_series(1,3)n;
insert into pipstart_staff_private.members(user_id) select pg_temp.uid(n) from generate_series(1,3)n;
insert into pipstart_staff_private.roles values(pg_temp.uid(1),'owner'),(pg_temp.uid(2),'author'),(pg_temp.uid(3),'moderator');
insert into pipstart_staff_private.assignments values(pg_temp.uid(2),'lesson','fl-lesson');
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
select pg_temp.al_ok(pg_temp.try(1,$$select public.pipstart_editorial_create('fl-course','course','forex',null,'{"metadata":{"title":"Limits course","placement":{"order":1}}}','first')$$)='ok'
  and pg_temp.try(1,$$select public.pipstart_editorial_create('fl-module','module','forex','fl-course','{"metadata":{"title":"Limits module","placement":{"order":1}}}','first')$$)='ok'
  and pg_temp.try(1,format('select public.pipstart_editorial_create(%L,%L,%L,%L,%L,%L)','fl-lesson','lesson','forex','fl-module',pg_temp.lesson('Limits lesson'),'first'))='ok'
  and pg_temp.try(1,format('select public.pipstart_editorial_create(%L,%L,%L,%L,%L,%L)','fl-spare','lesson','forex','fl-module',pg_temp.lesson('Spare'),'first'))='ok'
  and pg_temp.try(1,format('select public.pipstart_editorial_create(%L,%L,%L,%L,%L,%L)','fl-trash','lesson','forex','fl-module',pg_temp.lesson('Trash'),'first'))='ok','content created');
select pg_temp.al_ok(pg_temp.try(1,format('select public.pipstart_editorial_approve_single_person(%L,1,%L,null)',i,pg_temp.sha(i)))='ok','approved '||i)
  from unnest(array['fl-course','fl-module','fl-lesson'])i;
-- Works from whatever generation is live (the consolidated verifier stages this suite after committed scheduler
-- stages): a fresh store takes the baseline (exempt); otherwise the fixture's course, module and lesson are published.
do $$
declare g bigint:=pg_temp.gen(); n integer:=10; i text;
begin
  if g is null then
    perform pg_temp.al_ok(pg_temp.try(1,format('select public.pipstart_publication_baseline(%L,%L)',pg_temp.op(1),'Limits baseline'))='ok' and pg_temp.gen()=1,'baseline (exempt)');
  else
    foreach i in array array['fl-course','fl-module','fl-lesson'] loop
      n:=n+1;
      perform pg_temp.al_ok(pg_temp.try(1,format('select public.pipstart_publication_publish(%L,%s,%L,1,%L,%L)',pg_temp.op(n),pg_temp.gen(),i,pg_temp.sha(i),'Publish fixture'))='ok','published '||i);
    end loop;
  end if;
end $$;
select pg_temp.al_ok(pg_temp.try(1,format('select public.pipstart_editorial_approve_single_person(%L,1,%L,null)','fl-spare',pg_temp.sha('fl-spare')))='ok'
  and pg_temp.try(1,format('select public.pipstart_publication_publish(%L,%s,%L,1,%L,%L)',pg_temp.op(2),pg_temp.gen(),'fl-spare',pg_temp.sha('fl-spare'),'Publish spare'))='ok'
  and pg_temp.try(1,$$select public.pipstart_editorial_trash('fl-trash','Not needed')$$)='ok','spare published, draft trashed');
create temporary table al_g as select pg_temp.gen() g;
select pg_temp.al_ok(pg_temp.try(1,pg_temp.save('fl-spare','Spare v2'))='ok'
  and pg_temp.try(1,format('select public.pipstart_editorial_approve_single_person(%L,2,%L,null)','fl-spare',pg_temp.sha('fl-spare')))='ok','spare v2 approved');

-- 3. Owner at the edit, review and publish limits: one more of each is refused with a retry hint and changes nothing.
select pg_temp.al_ok(pg_temp.cap('edit',1)=7 and pg_temp.cap('review',1)=5 and pg_temp.cap('publish',1) in (1,4),'owner usage counted (7 edit, 5 review, 1 or 4 publish)');
create temporary table al_s0 as select pg_temp.state() d;
select pg_temp.al_ok(r ~ '^PT429:retry_after=[0-9]+$' and substr(r,19)::integer between 3000 and 3600,'owner save refused with retry_after ('||r||')')
  from (select pg_temp.try(1,pg_temp.save('fl-lesson','Owner v2')) r) x;
select pg_temp.al_ok(pg_temp.try(1,format('select public.pipstart_editorial_create(%L,%L,%L,%L,%L,%L)','fl-extra','lesson','forex','fl-module',pg_temp.lesson('Extra'),'first')) like 'PT429:%','owner create refused');
select pg_temp.al_ok(pg_temp.try(1,format('select public.pipstart_publication_publish(%L,%s,%L,2,%L,%L)',pg_temp.op(3),pg_temp.gen(),'fl-spare',pg_temp.sha('fl-spare'),'Publish spare v2')) like 'PT429:%','next publish refused');
select pg_temp.al_ok((select d from al_s0)=pg_temp.state() and pg_temp.gen()=(select g from al_g),'refusals changed nothing');
select pg_temp.al_ok(pg_temp.try(2,pg_temp.save('fl-trash','x')) !~ '^PT429','another actor is not refused by the owner''s limit (any refusal here is its own rule)');

-- 4. The Author is counted apart: saves succeed while the Owner is at the limit, until the Author's own limit.
update pipstart_staff_private.action_limits set per_hour=8 where class='edit';
select pg_temp.al_ok(pg_temp.try(1,pg_temp.save('fl-lesson','Owner v2')) ~ '^ok$','owner has room again (limit 8)');
select pg_temp.al_ok(pg_temp.try(2,pg_temp.save('fl-lesson','Author v'||n))='ok','author save '||n) from generate_series(1,8)n;
select pg_temp.al_ok(pg_temp.try(2,pg_temp.save('fl-lesson','Author v9')) like 'PT429:%' and pg_temp.rev('fl-lesson')=10,'author refused at own limit; revision unchanged');
select pg_temp.al_ok(pg_temp.try(1,pg_temp.save('fl-lesson','Owner v3')) like 'PT429:%','owner at 8 too');

-- 5. Emergency and recovery actions are never limited (Owner at every limit).
select pg_temp.al_ok(pg_temp.try(1,$$select public.pipstart_editorial_hold('fl-course','Legal review')$$)='ok'
  and pg_temp.try(1,$$select public.pipstart_editorial_hold('fl-course',null)$$)='ok','hold and release at the limit');
select pg_temp.al_ok(pg_temp.try(1,format('select public.pipstart_publication_withdraw(%L,%s,%L,%L)',pg_temp.op(4),pg_temp.gen(),'fl-spare','Withdraw spare'))='ok'
  and pg_temp.gen()=(select g+1 from al_g),'withdraw at the limit');
select pg_temp.al_ok(pg_temp.try(1,format('select public.pipstart_publication_restore(%L,%s,%s,%L)',pg_temp.op(5),pg_temp.gen(),(select g from al_g),'Restore the generation before the withdrawal'))='ok'
  and pg_temp.gen()=(select g+2 from al_g),'publication restore at the limit');
select pg_temp.al_ok(pg_temp.try(1,$$select public.pipstart_editorial_restore('fl-trash','Needed after all')$$)='ok','editorial restore at the limit');

-- 6. Server-side and owner-run SQL are never refused: no claims, or claims for someone else.
select set_config('request.jwt.claims','',true);
insert into pipstart_editorial_private.audit(actor_id,operation,item_id,revision_no,detail) values(pg_temp.uid(1),'save','fl-lesson',1,'owner-run SQL');
select pipstart_staff_private.action_spend(pg_temp.uid(1),'edit');
select set_config('request.jwt.claims',jsonb_build_object('role','service_role')::text,true);
select pipstart_staff_private.action_spend(pg_temp.uid(1),'publish');
select pg_temp.al_ok(true,'no-claims and service writes not refused');

-- 7. The rolling hour: rows older than an hour no longer count; the hint names when the oldest counted row leaves.
update pipstart_staff_private.action_limits set per_hour=2 where class='upkeep';
select set_config('request.jwt.claims','',true);
insert into pipstart_editorial_private.audit(actor_id,operation,created_at,detail) select pg_temp.uid(3),'maintenance',clock_timestamp()-interval '61 minutes','old' from generate_series(1,3);
select pg_temp.al_as(3);
select pipstart_staff_private.action_spend(pg_temp.uid(3),'upkeep');
select set_config('request.jwt.claims','',true);
insert into pipstart_editorial_private.audit(actor_id,operation,created_at,detail) values(pg_temp.uid(3),'maintenance',clock_timestamp()-interval '59 minutes','recent'),(pg_temp.uid(3),'maintenance',clock_timestamp()-interval '10 minutes','recent');
do $$ declare h text; begin
  perform pg_temp.al_as(3); perform pipstart_staff_private.action_spend(pg_temp.uid(3),'upkeep');
  raise exception 'Action limit assertion: window not enforced';
exception when sqlstate 'PT429' then get stacked diagnostics h=pg_exception_hint;
  perform pg_temp.al_ok(h ~ '^retry_after=[0-9]+$' and substr(h,13)::integer between 30 and 90,'retry_after follows the oldest counted row ('||h||')');
end $$;

-- 8. The staff audit journal: people changes are limited; suspend and control are not (direct journal writes).
update pipstart_staff_private.action_limits set per_hour=1 where class='people';
select set_config('request.jwt.claims','',true);
insert into pipstart_staff_private.audit(actor_id,request_id,operation,target_id,value,reason_code,outcome) values(pg_temp.uid(1),gen_random_uuid(),'grant_role',pg_temp.uid(3),'reviewer','access_change','changed');
select pg_temp.al_as(1);
do $$ begin
  insert into pipstart_staff_private.audit(actor_id,request_id,operation,target_id,value,reason_code,outcome) values(pg_temp.uid(1),gen_random_uuid(),'revoke_role',pg_temp.uid(3),'reviewer','access_change','changed');
  raise exception 'Action limit assertion: people change not limited';
exception when sqlstate 'PT429' then null; end $$;
insert into pipstart_staff_private.audit(actor_id,request_id,operation,target_id,value,reason_code,outcome) values(pg_temp.uid(1),gen_random_uuid(),'suspend',pg_temp.uid(3),'true','security_response','changed');
insert into pipstart_staff_private.audit(actor_id,request_id,operation,value,reason_code,outcome) values(pg_temp.uid(1),gen_random_uuid(),'control','true','enablement','unchanged');
select pg_temp.al_ok(true,'suspend and control recorded at the people limit');
rollback;
