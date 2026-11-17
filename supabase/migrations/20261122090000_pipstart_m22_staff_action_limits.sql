-- M22 audit follow-up, Package 4 (17 November 2026): per-actor hourly limits on consequential staff actions.
-- Every consequential staff write already appends one row, carrying its actor, to a journal in the same
-- transaction. A BEFORE INSERT trigger on each journal classifies the action, takes one advisory lock for the
-- actor, counts the actor's rows of that class in the rolling hour and raises PT429 (HTTP 429) once the limit
-- is reached, so the whole RPC rolls back and nothing is kept. No RPC body changes; a direct API call is
-- limited the same way because every write path goes through a journal.
-- Only rows written in the actor's own staff session (request.jwt.claims sub = actor) are checked: the
-- scheduler, migrations and owner-run SQL are never refused. Emergency and recovery actions are never limited:
-- staff control, bootstrap and suspend; content hold, release, withdraw, restore and publication restore;
-- import and the publication baseline. An action the classifier does not know is refused (55000), so a future
-- journal operation must be classified on purpose. Never 40001 (PostgREST retries it).
begin;
do $$
begin
 if to_regclass('pipstart_editorial_private.audit') is null
  or to_regclass('pipstart_staff_private.audit') is null
  or to_regclass('pipstart_editorial_private.publication_schedule_events') is null
  or to_regclass('pipstart_staff_private.learner_requests') is null
  or to_regprocedure('public.pipstart_maintenance_probe_intent(text,integer,text)') is null
  or to_regclass('pipstart_staff_private.action_limits') is not null then
  raise exception 'Staff, editorial, schedule, learner request and probe intent schema required; action limits not yet present'; end if;
end $$;

create table pipstart_staff_private.action_limits(
  class text primary key check(class in ('edit','review','publish','people','upkeep','learner_accounts')),
  per_hour integer not null check(per_hour between 1 and 10000)
);
insert into pipstart_staff_private.action_limits(class,per_hour) values
  ('edit',120),('review',60),('publish',10),('people',30),('upkeep',60),('learner_accounts',10);
alter table pipstart_staff_private.action_limits enable row level security;
revoke all on pipstart_staff_private.action_limits from public,anon,authenticated,service_role;

-- Class of one journal row; null = never limited; unknown = refused.
create function pipstart_staff_private.action_class(p_source text,p_operation text) returns text
language plpgsql immutable set search_path='' as $$
begin
  if p_source='editorial' then
    if p_operation in ('create','save','trash','policy') then return 'edit'; end if;
    if p_operation in ('submit','review_approve','review_changes','approve_single_person') then return 'review'; end if;
    if p_operation in ('publish','refresh') then return 'publish'; end if;
    if p_operation='maintenance' then return 'upkeep'; end if;
    if p_operation in ('hold','release','withdraw','restore','publication_restore','import','publication_baseline') then return null; end if;
  elsif p_source='staff' then
    if p_operation in ('grant_role','revoke_role','grant_delegation','revoke_delegation','assign','unassign','resume') then return 'people'; end if;
    if p_operation in ('bootstrap','control','suspend') then return null; end if;
  elsif p_source='schedule' then
    if p_operation in ('scheduled','cancelled') then return 'publish'; end if;
    if p_operation in ('published','failed') then return null; end if;
  elsif p_source='learner' then
    if p_operation in ('auth_suspend','auth_resume') then return 'learner_accounts'; end if;
  end if;
  raise exception using errcode='55000',message='Unclassified staff action '||coalesce(p_source,'?')||'/'||coalesce(p_operation,'?');
end $$;

create function pipstart_staff_private.action_spend(p_actor uuid,p_class text) returns void
language plpgsql volatile security definer set search_path='' as $$
declare lim integer; since timestamptz; used bigint; oldest timestamptz; claims text;
begin
  if p_actor is null or p_class is null then return; end if;
  claims:=nullif(current_setting('request.jwt.claims',true),'');
  if claims is null or (claims::jsonb->>'sub') is distinct from p_actor::text then return; end if;
  select l.per_hour into lim from pipstart_staff_private.action_limits l where l.class=p_class;
  if lim is null then raise exception using errcode='55000',message='Action limit missing for '||p_class; end if;
  -- One lock per actor (not per class), so two classes in one transaction can never deadlock.
  perform pg_advisory_xact_lock(hashtextextended('pipstart_action_limit:'||p_actor::text,0));
  since:=clock_timestamp()-interval '1 hour';
  select count(*),min(t) into used,oldest from (
    select a.created_at t from pipstart_editorial_private.audit a
      where a.actor_id=p_actor and a.created_at>since and pipstart_staff_private.action_class('editorial',a.operation) is not distinct from p_class
    union all
    select a.created_at from pipstart_staff_private.audit a
      where a.actor_id=p_actor and a.created_at>since and pipstart_staff_private.action_class('staff',a.operation) is not distinct from p_class
    union all
    select e.created_at from pipstart_editorial_private.publication_schedule_events e
      where e.actor_id=p_actor and e.created_at>since and e.executor='staff' and pipstart_staff_private.action_class('schedule',e.kind) is not distinct from p_class
    union all
    select r.recorded_at from pipstart_staff_private.learner_requests r
      where r.actor_id=p_actor and r.recorded_at>since and p_class='learner_accounts'
  ) x;
  if used>=lim then
    raise exception using errcode='PT429',message='Too many changes in the last hour; nothing was changed',
      hint='retry_after='||greatest(1,ceil(extract(epoch from oldest+interval '1 hour'-clock_timestamp())))::integer;
  end if;
end $$;

create function pipstart_staff_private.limit_editorial_audit() returns trigger
language plpgsql security definer set search_path='' as $$
begin perform pipstart_staff_private.action_spend(new.actor_id,pipstart_staff_private.action_class('editorial',new.operation)); return new; end $$;
create function pipstart_staff_private.limit_staff_audit() returns trigger
language plpgsql security definer set search_path='' as $$
begin perform pipstart_staff_private.action_spend(new.actor_id,pipstart_staff_private.action_class('staff',new.operation)); return new; end $$;
create function pipstart_staff_private.limit_schedule_event() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.executor='staff' then perform pipstart_staff_private.action_spend(new.actor_id,pipstart_staff_private.action_class('schedule',new.kind));
  else perform pipstart_staff_private.action_class('schedule',new.kind); end if;
  return new;
end $$;
create function pipstart_staff_private.limit_learner_request() returns trigger
language plpgsql security definer set search_path='' as $$
begin perform pipstart_staff_private.action_spend(new.actor_id,pipstart_staff_private.action_class('learner',new.operation)); return new; end $$;

create trigger pipstart_action_limit before insert on pipstart_editorial_private.audit
  for each row execute function pipstart_staff_private.limit_editorial_audit();
create trigger pipstart_action_limit before insert on pipstart_staff_private.audit
  for each row execute function pipstart_staff_private.limit_staff_audit();
create trigger pipstart_action_limit before insert on pipstart_editorial_private.publication_schedule_events
  for each row execute function pipstart_staff_private.limit_schedule_event();
create trigger pipstart_action_limit before insert on pipstart_staff_private.learner_requests
  for each row execute function pipstart_staff_private.limit_learner_request();

create index pipstart_editorial_audit_actor_time on pipstart_editorial_private.audit(actor_id,created_at);
create index pipstart_staff_audit_actor_time on pipstart_staff_private.audit(actor_id,created_at);
create index pipstart_schedule_events_actor_time on pipstart_editorial_private.publication_schedule_events(actor_id,created_at);
create index pipstart_learner_requests_actor_time on pipstart_staff_private.learner_requests(actor_id,recorded_at);

revoke all on function pipstart_staff_private.action_class(text,text),pipstart_staff_private.action_spend(uuid,text),
  pipstart_staff_private.limit_editorial_audit(),pipstart_staff_private.limit_staff_audit(),
  pipstart_staff_private.limit_schedule_event(),pipstart_staff_private.limit_learner_request()
  from public,anon,authenticated,service_role;

do $$
begin
 -- Every operation a journal constraint allows today must be classified (limited or exempt); unknown raises 55000.
 perform pipstart_staff_private.action_class('editorial',o) from unnest(array['create','save','submit','review_approve','review_changes',
   'approve_single_person','trash','restore','hold','release','policy','import','publication_baseline','publish','withdraw',
   'publication_restore','refresh','maintenance']) o;
 perform pipstart_staff_private.action_class('staff',o) from unnest(array['bootstrap','control','grant_role','revoke_role',
   'grant_delegation','revoke_delegation','assign','unassign','suspend','resume']) o;
 perform pipstart_staff_private.action_class('schedule',o) from unnest(array['scheduled','cancelled','failed','published']) o;
 perform pipstart_staff_private.action_class('learner',o) from unnest(array['auth_suspend','auth_resume']) o;
 if (select count(*) from pipstart_staff_private.action_limits)<>6
  or (select count(*) from pg_trigger where tgname='pipstart_action_limit' and not tgisinternal)<>4
  or exists(select 1 from unnest(array['anon','authenticated','service_role']) r
    where has_table_privilege(r,'pipstart_staff_private.action_limits','select')
       or has_table_privilege(r,'pipstart_staff_private.action_limits','insert')
       or has_table_privilege(r,'pipstart_staff_private.action_limits','update')
       or has_function_privilege(r,'pipstart_staff_private.action_spend(uuid,text)','execute')
       or has_function_privilege(r,'pipstart_staff_private.action_class(text,text)','execute')) then
  raise exception 'Staff action limit migration verification failed'; end if;
end $$;
commit;
