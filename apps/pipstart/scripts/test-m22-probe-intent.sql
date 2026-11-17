-- Marked disposable SQL/Auth-stub database only. Never the application DB. All fixture writes roll back.
-- M22 audit follow-up (F1, F5): the automatic check is authorized for the exact actor, item, live revision,
-- reference and host before any network contact; refusals write nothing; a per-actor hourly quota is shared
-- through the store; the unused service_role grant on learner progress is gone.
begin;
create function pg_temp.pi_ok(v boolean,label text) returns void language plpgsql as $$
begin if v is distinct from true then raise exception 'Probe intent assertion: %',label; end if; end $$;
create function pg_temp.uid(n integer) returns uuid language sql immutable as $$ select ('f9000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid $$;
create function pg_temp.pi_as(n integer) returns void language plpgsql security definer set search_path='' as $$
begin
  perform set_config('request.jwt.claims',jsonb_build_object('sub',pg_temp.uid(n),'session_id',('f9200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
    'role','authenticated','aal','aal2')::text,true);
end $$;
-- Runs one call as the actor under the authenticated role; returns the reply status, or the SQLSTATE.
create function pg_temp.pi_try(n integer,c text) returns text language plpgsql as $$
declare r jsonb;
begin
  perform pg_temp.pi_as(n);
  begin execute 'set local role authenticated'; execute c into r; execute 'reset role';
  exception when others then return sqlstate; end;
  return coalesce(r->>'status','ok');
end $$;
create function pg_temp.intents() returns bigint language sql security definer set search_path='' as $$
  select count(*) from pipstart_maintenance_private.probe_intents $$;
create function pg_temp.live_rev(p text) returns integer language sql security definer set search_path='' as $$
  select pipstart_maintenance_private.live_revision(p) $$;
create function pg_temp.call(item text,rev integer,ref text) returns text language sql immutable as $$
  select format('select public.pipstart_maintenance_probe_intent(%L,%s,%L)',item,coalesce(rev::text,'null'),ref) $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated,service_role',pg_my_temp_schema()::regnamespace::text); end $$;

-- Grants: the intent is authenticated-only and volatile; its table is closed; learner progress no longer
-- grants service_role.
select pg_temp.pi_ok(has_function_privilege('authenticated','public.pipstart_maintenance_probe_intent(text,integer,text)','EXECUTE')
  and not has_function_privilege('anon','public.pipstart_maintenance_probe_intent(text,integer,text)','EXECUTE')
  and not has_function_privilege('service_role','public.pipstart_maintenance_probe_intent(text,integer,text)','EXECUTE')
  and (select provolatile='v' and prosecdef from pg_proc where oid='public.pipstart_maintenance_probe_intent(text,integer,text)'::regprocedure),'intent grant and volatility');
select pg_temp.pi_ok(not has_table_privilege(r,'pipstart_maintenance_private.probe_intents',p),'intent table closed to '||r||' '||p)
  from unnest(array['anon','authenticated','service_role'])r,unnest(array['SELECT','INSERT','UPDATE','DELETE'])p;
select pg_temp.pi_ok(not has_function_privilege('service_role','public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)','EXECUTE')
  and has_function_privilege('authenticated','public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)','EXECUTE')
  and not has_function_privilege('anon','public.pipstart_set_lesson_completion(text,text,text,boolean,bigint)','EXECUTE'),'learner progress: authenticated only');

-- Fixture: 1 Owner, 2 Moderator (assigned the lesson's maintenance), 3 Moderator (not assigned).
update pipstart_staff_private.members set active=false where active;
insert into auth.users(id,raw_user_meta_data) select pg_temp.uid(n),'{}' from generate_series(1,3)n;
insert into auth.mfa_factors(id,user_id,factor_type,status) select ('f9100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),'totp','verified' from generate_series(1,3)n;
insert into auth.sessions(id,user_id,factor_id,aal) select ('f9200000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,pg_temp.uid(n),('f9100000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'aal2' from generate_series(1,3)n;
insert into pipstart_staff_private.members(user_id) select pg_temp.uid(n) from generate_series(1,3)n;
insert into pipstart_staff_private.roles values(pg_temp.uid(1),'owner'),(pg_temp.uid(2),'moderator'),(pg_temp.uid(3),'moderator');
select pipstart_staff_private.transition(true,(select version from pipstart_staff_private.control),gen_random_uuid());
select pg_temp.pi_ok(pg_temp.pi_try(1,format('select public.pipstart_editorial_approve_single_person(x.id,1,(public.pipstart_editorial_create(x.id,x.family,%L,x.parent,x.body,%L))->>%L,null)
 from (values (1,%L,%L,null::text,%L::jsonb),(2,%L,%L,%L,%L::jsonb),(3,%L,%L,%L,%L::jsonb)) x(n,id,family,parent,body) order by x.n',
 'forex','first','body_sha256',
 'pi-course','course','{"metadata":{"title":"Course","placement":{"order":1}}}',
 'pi-module','module','pi-course','{"metadata":{"title":"Module","placement":{"order":1}}}',
 'pi-lesson','lesson','pi-module',jsonb_build_object('metadata',jsonb_build_object('title','Lesson','placement',jsonb_build_object('order',1),
   'sources',jsonb_build_array(jsonb_build_object('title','Guide','url','https://docs.example.org/guide'))),
   'blocks',jsonb_build_array(jsonb_build_object('type','paragraph','children','See https://docs.example.org/guide, https://other.example.org/x and https://go.pi-affiliate.example/y.')))))!~'^[0-9A-Z]{5}$','content live');
select pg_temp.pi_ok(pg_temp.pi_try(1,$$select public.pipstart_publication_baseline('f9900000-0000-4000-8000-000000000001','Probe intent baseline')$$)!~'^[0-9A-Z]{5}$','baseline');
select pg_temp.pi_ok(pg_temp.pi_try(1,$$select public.pipstart_maintenance_allowlist_change('docs.example.org','add','Documentation host')$$)!~'^[0-9A-Z]{5}$'
  and pg_temp.pi_try(1,$$select public.pipstart_maintenance_allowlist_change('go.pi-affiliate.example','add','Listed before it became an affiliate host')$$)!~'^[0-9A-Z]{5}$','allowlist');
-- The host was allowlisted before an affiliate link used it; the intent must still refuse it.
select pg_temp.pi_ok(pg_temp.pi_try(1,$$select public.pipstart_partner_policy_set('link:pi-p','link',0,'{"allowedHosts":["go.pi-affiliate.example"]}','Hosts')$$)!~'^[0-9A-Z]{5}$','the listed host becomes an affiliate host afterwards');
select pg_temp.pi_ok(pg_temp.pi_try(1,format('select public.pipstart_maintenance_assign(%L,%L,%L)','pi-lesson',pg_temp.uid(2),'Moderator looks after this'))!~'^[0-9A-Z]{5}$','assignment');
create temporary table pi_rev(r integer);insert into pi_rev values(pg_temp.live_rev('pi-lesson'));

-- Refusals before any network contact; none writes an intent.
select pg_temp.pi_ok(pg_temp.pi_try(3,pg_temp.call('pi-lesson',(select r from pi_rev),'https://docs.example.org/guide'))='42501' and pg_temp.intents()=0,'unassigned staff refused, nothing written');
select pg_temp.pi_ok(pg_temp.pi_try(2,pg_temp.call('pi-nothing',1,'https://docs.example.org/guide'))='22023' and pg_temp.intents()=0,'unknown item refused, nothing written');
select pg_temp.pi_ok(pg_temp.pi_try(2,pg_temp.call('pi-lesson',(select r+1 from pi_rev),'https://docs.example.org/guide'))='PT409' and pg_temp.intents()=0,'stale revision refused, nothing written');
select pg_temp.pi_ok(pg_temp.pi_try(2,pg_temp.call('pi-lesson',(select r from pi_rev),'https://docs.example.org/not-in-content'))='22023' and pg_temp.intents()=0,'link not in the live revision refused, nothing written');
select pg_temp.pi_ok(pg_temp.pi_try(2,pg_temp.call('pi-lesson',(select r from pi_rev),'https://other.example.org/x'))='not-allowed' and pg_temp.intents()=0,'host not on the allowlist: not allowed, nothing written');
select pg_temp.pi_ok(pg_temp.pi_try(2,pg_temp.call('pi-lesson',(select r from pi_rev),'https://go.pi-affiliate.example/y'))='not-allowed' and pg_temp.intents()=0,'affiliate host never checked even if allowlisted');
select pg_temp.pi_ok(pg_temp.pi_try(2,pg_temp.call('pi-lesson',null,'https://docs.example.org/guide'))='22023' and pg_temp.intents()=0,'missing revision refused');

-- Cleared: the assigned Moderator and the Owner each write exactly one intent per check.
select pg_temp.pi_ok(pg_temp.pi_try(2,pg_temp.call('pi-lesson',(select r from pi_rev),'https://docs.example.org/guide'))='cleared' and pg_temp.intents()=1,'assigned staff cleared, one intent');
select pg_temp.pi_ok(pg_temp.pi_try(1,pg_temp.call('pi-lesson',(select r from pi_rev),'https://docs.example.org/guide'))='cleared' and pg_temp.intents()=2,'Owner cleared, one intent');

-- Quota: 20 cleared checks per actor per rolling hour; the 21st is refused and writes nothing; others unaffected.
select pg_temp.pi_ok(bool_and(pg_temp.pi_try(2,pg_temp.call('pi-lesson',(select r from pi_rev),'https://docs.example.org/guide'))='cleared'),'19 more checks within the quota') from generate_series(1,19);
select pg_temp.pi_ok(pg_temp.pi_try(2,pg_temp.call('pi-lesson',(select r from pi_rev),'https://docs.example.org/guide'))='PT429' and pg_temp.intents()=21,'21st check in the hour refused (PT429), nothing written');
select pg_temp.pi_ok(pg_temp.pi_try(1,pg_temp.call('pi-lesson',(select r from pi_rev),'https://docs.example.org/guide'))='cleared','another actor keeps its own quota');

-- Intents are append-only, even for the database owner.
do $$ begin
  begin update pipstart_maintenance_private.probe_intents set reference='https://docs.example.org/x'; raise exception 'Probe intent assertion: update allowed';
  exception when sqlstate '42501' then null; end;
  begin delete from pipstart_maintenance_private.probe_intents; raise exception 'Probe intent assertion: delete allowed';
  exception when sqlstate '42501' then null; end;
end $$;
rollback;
