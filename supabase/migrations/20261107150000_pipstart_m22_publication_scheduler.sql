-- MP08c2. Restricted SQL executor, durable delivery claims, no activation or credentials.
begin;
do $$begin
 if to_regclass('pipstart_editorial_private.publication_schedules') is null
  or exists(select 1 from pg_roles where rolname='pipstart_publication_scheduler') then
  raise exception 'Accepted c1 and unused restricted scheduler role required';end if;
end$$;
create role pipstart_publication_scheduler nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
grant pipstart_publication_scheduler to postgres;
grant usage on schema pipstart_editorial_private to pipstart_publication_scheduler;
create table pipstart_editorial_private.publication_scheduler_deliveries(
 generation bigint primary key references pipstart_editorial_private.generation_seals(generation) on delete restrict,
 token uuid not null unique default gen_random_uuid(),
 state text not null default 'claimed' check(state in ('claimed','sent','unknown')),
 created_at timestamptz not null default clock_timestamp(),finished_at timestamptz,
 check((state='claimed')=(finished_at is null))
);
alter table pipstart_editorial_private.publication_scheduler_deliveries enable row level security;
revoke all on pipstart_editorial_private.publication_scheduler_deliveries from public,anon,authenticated,service_role,pipstart_publication_scheduler;
-- Shared mutation kernel: no identity/session impersonation; only checked entrypoints call it.
create function pipstart_editorial_private.publication_apply(p_actor uuid,p_operation uuid,p_action text,cur bigint,p_id text,p_revision integer,p_sha text,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=p_actor; i pipstart_editorial_private.items; r pipstart_editorial_private.revisions;
 e pipstart_editorial_private.generation_entries; nxt bigint;
begin
 if u is null or p_action is null or p_action not in ('publish','withdraw') then raise exception using errcode='22023',message='Invalid private transition';end if;
 perform pipstart_editorial_private.reason_ok(p_reason);
 if p_action='publish' then
  i:=pipstart_editorial_private.locked_item(p_id);
  if i.trashed_at is not null then raise exception using errcode='55000',message='Content is in trash'; end if;
  select * into r from pipstart_editorial_private.revisions where item_id=i.id and revision_no=p_revision;
  if not found or r.body_sha256 is distinct from p_sha then raise exception using errcode='PT409',message='Revision content changed'; end if;
  if not pipstart_editorial_private.revision_approved(i.id,r.revision_no,r.body_sha256) then
    raise exception using errcode='55000',message='Only an approved revision can be published'; end if;
  select * into e from pipstart_editorial_private.generation_entries where generation=cur and item_id=i.id;
  if found and e.body_sha256=r.body_sha256 then raise exception using errcode='55000',message='This revision is already published'; end if;
  if found and i.family='quiz' and (r.body->'metadata'->>'version')::integer<=
     (select (x.body->'metadata'->>'version')::integer from pipstart_editorial_private.revisions x where x.item_id=i.id and x.revision_no=e.revision_no) then
    raise exception using errcode='55000',message='A quiz can only be published at a later version'; end if;
  if found and r.revision_no<e.revision_no then raise exception using errcode='55000',message='A newer revision is already published; use restore to go back'; end if;
  nxt:=cur+1;
  insert into pipstart_editorial_private.generations(generation,kind,operation_id,actor_id,reason,item_id,revision_no,previous_generation)
    values(nxt,'publish',p_operation,u,p_reason,i.id,r.revision_no,cur);
  insert into pipstart_editorial_private.generation_entries(generation,item_id,family,learning_path,parent_id,revision_no,body_sha256)
  select nxt,item_id,family,learning_path,parent_id,revision_no,body_sha256 from pipstart_editorial_private.generation_entries where generation=cur and item_id<>i.id
  union all select nxt,i.id,i.family,i.learning_path,i.parent_id,r.revision_no,r.body_sha256;
  return pipstart_editorial_private.complete_generation(nxt,u,'publish',i.id,r.revision_no,p_reason);
 else
  i:=pipstart_editorial_private.locked_item(p_id);
  if not exists(select 1 from pipstart_editorial_private.generation_entries where generation=cur and item_id=i.id) then
    raise exception using errcode='55000',message='This content is not published'; end if;
  if exists(select 1 from pipstart_editorial_private.generation_entries where generation=cur and parent_id=i.id) then
    raise exception using errcode='55000',message='Withdraw the published contents first'; end if;
  nxt:=cur+1;
  insert into pipstart_editorial_private.generations(generation,kind,operation_id,actor_id,reason,item_id,previous_generation)
    values(nxt,'withdraw',p_operation,u,p_reason,i.id,cur);
  insert into pipstart_editorial_private.generation_entries(generation,item_id,family,learning_path,parent_id,revision_no,body_sha256)
  select nxt,item_id,family,learning_path,parent_id,revision_no,body_sha256 from pipstart_editorial_private.generation_entries where generation=cur and item_id<>i.id;
  return pipstart_editorial_private.complete_generation(nxt,u,'withdraw',i.id,null,p_reason);
 end if;
end$$;
create or replace function public.pipstart_publication_publish(p_operation uuid,p_expected_generation bigint,p_id text,p_revision integer,p_sha text,p_reason text) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare u uuid; cur bigint; prior jsonb; i pipstart_editorial_private.items;
begin
 perform 1 from pipstart_staff_private.control where singleton for share;
 u:=pipstart_editorial_private.actor_required();
 perform pipstart_editorial_private.reason_ok(p_reason);cur:=pipstart_editorial_private.locked_pointer();
 prior:=pipstart_editorial_private.replayed(p_operation,'publish',p_id,p_revision,null);
 if prior is not null then return prior;end if;
 if cur is null then raise exception using errcode='55000',message='Create the baseline generation first';end if;
 if p_expected_generation is distinct from cur then raise exception using errcode='PT409',message='A newer publication exists';end if;
 i:=pipstart_editorial_private.locked_item(p_id);
 perform pipstart_editorial_private.require('content.publish',i.family,i.id);
 return pipstart_editorial_private.publication_apply(u,p_operation,'publish',cur,p_id,p_revision,p_sha,p_reason);
end $fn$;
create or replace function public.pipstart_publication_withdraw(p_operation uuid,p_expected_generation bigint,p_id text,p_reason text) returns jsonb language plpgsql security definer set search_path='' as $fn$
declare u uuid; cur bigint; prior jsonb; i pipstart_editorial_private.items;
begin
 perform 1 from pipstart_staff_private.control where singleton for share;
 u:=pipstart_editorial_private.actor_required();
 perform pipstart_editorial_private.reason_ok(p_reason);cur:=pipstart_editorial_private.locked_pointer();
 prior:=pipstart_editorial_private.replayed(p_operation,'withdraw',p_id,null,null);
 if prior is not null then return prior;end if;
 if cur is null then raise exception using errcode='55000',message='Nothing is published';end if;
 if p_expected_generation is distinct from cur then raise exception using errcode='PT409',message='A newer publication exists';end if;
 i:=pipstart_editorial_private.locked_item(p_id);
 perform pipstart_editorial_private.require('content.withdraw',i.family,i.id);
 return pipstart_editorial_private.publication_apply(u,p_operation,'withdraw',cur,p_id,null,null,p_reason);
end $fn$;

-- Current account, verified factor and current object capability, without any saved human session.
create function pipstart_editorial_private.schedule_actor_allowed(p_actor uuid,p_family text,p_item text) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from auth.users a join pipstart_staff_private.members m on m.user_id=a.id
  where a.id=p_actor and m.active and a.deleted_at is null and (a.banned_until is null or a.banned_until<=clock_timestamp()) for share of a,m;
 if not found then return false;end if;
 perform 1 from auth.mfa_factors where user_id=p_actor and factor_type::text='totp' and status::text='verified' limit 1 for share;
 if not found then return false;end if;
 perform 1 from pipstart_staff_private.roles where user_id=p_actor and role_name='owner' for share;
 if found then return true;end if;
 if p_family not in ('course','module','lesson','quiz') then return false;end if;
 perform 1 from pipstart_staff_private.roles r join pipstart_staff_private.assignments a using(user_id)
  where r.user_id=p_actor and r.role_name='editor' and a.resource_kind=p_family and a.resource_id=p_item for share of r,a;
 return found;
end$$;
create function pipstart_editorial_private.scheduler_tick() returns jsonb
language plpgsql security definer set search_path='' as $$
declare s pipstart_editorial_private.publication_schedules; i pipstart_editorial_private.items;
 cur bigint; pv bigint; code text; result jsonb; processed integer:=0; published integer:=0; failed integer:=0;
 started timestamptz:=clock_timestamp();
begin
 if current_setting('role',true) is distinct from 'pipstart_publication_scheduler' then raise exception using errcode='42501',message='Restricted scheduler identity required';end if;
 if not pg_try_advisory_xact_lock(870022,8082) then return jsonb_build_object('state','busy','processed',0,'published',0,'failed',0);end if;
 perform 1 from pipstart_staff_private.control where singleton and enabled for share;
 if not found then return jsonb_build_object('state','disabled','processed',0,'published',0,'failed',0);end if;
 perform 1 from pipstart_editorial_private.publication_scheduler_control where singleton and enabled for share;
 if not found then return jsonb_build_object('state','disabled','processed',0,'published',0,'failed',0);end if;
 cur:=pipstart_editorial_private.locked_pointer();
 started:=clock_timestamp();
 for s in select * from pipstart_editorial_private.publication_schedules where state='scheduled' and due_at<=clock_timestamp() order by due_at,id limit 5 for update loop
  exit when clock_timestamp()>started+interval '1500 milliseconds';
  code:=null;processed:=processed+1;
  i:=pipstart_editorial_private.locked_item(s.item_id);
  if not pipstart_editorial_private.schedule_actor_allowed(s.actor_id,i.family,i.id) then code:='revoked';end if;
  select version into pv from pipstart_editorial_private.policy where singleton for share;
  if code is null and pv is distinct from s.policy_version then code:='approval';end if;
  if code is null and (cur is null or exists(select 1 from pipstart_editorial_private.generations
   where operation_id=s.id or (generation>s.base_generation and (item_id=s.item_id or kind='restore')))) then code:='superseded';end if;
  if code is null and s.action='publish' and not pipstart_editorial_private.revision_approved(s.item_id,s.revision_no,s.body_sha256) then code:='approval';end if;
  if code is null then
   begin
    result:=pipstart_editorial_private.publication_apply(s.actor_id,s.id,s.action,cur,s.item_id,s.revision_no,s.body_sha256,s.reason);
    cur:=(result->>'generation')::bigint;
   exception when sqlstate '55000' or sqlstate 'PT409' or sqlstate '22023' then code:='dependency';end;
  end if;
  if code is null then
   update pipstart_editorial_private.publication_schedules set state='published',outcome_generation=cur,completed_at=clock_timestamp() where id=s.id;
   insert into pipstart_editorial_private.publication_schedule_events(schedule_id,actor_id,executor,kind,reason) values(s.id,s.actor_id,'scheduler','published',s.reason);
   published:=published+1;
  else
   update pipstart_editorial_private.publication_schedules set state='failed',failure_code=code,completed_at=clock_timestamp() where id=s.id;
   insert into pipstart_editorial_private.publication_schedule_events(schedule_id,actor_id,executor,kind,reason) values(s.id,s.actor_id,'scheduler','failed',code);
   failed:=failed+1;
  end if;
 end loop;
 return jsonb_build_object('state','done','processed',processed,'published',published,'failed',failed);
end$$;
-- Endpoint has no caller-selected generation. At most one pending scheduled generation is claimed.
create function public.pipstart_publication_scheduler_claim() returns jsonb
language plpgsql security definer set search_path='' as $$
declare cur bigint; j pipstart_editorial_private.refresh_jobs; t uuid;
begin
 perform 1 from pipstart_staff_private.control where singleton and enabled for share;
 if not found then return jsonb_build_object('state','disabled');end if;
 perform 1 from pipstart_editorial_private.publication_scheduler_control where singleton and enabled for share;
 if not found then return jsonb_build_object('state','disabled');end if;
 cur:=pipstart_editorial_private.locked_pointer();
 select * into j from pipstart_editorial_private.refresh_jobs where generation=cur for update;
 if not found or j.state<>'pending' or j.attempts<>0
  or exists(select 1 from pipstart_editorial_private.publication_scheduler_deliveries where generation=cur)
  or not exists(select 1 from pipstart_editorial_private.publication_schedules where outcome_generation=cur and state='published') then return jsonb_build_object('state','idle');end if;
 update pipstart_editorial_private.refresh_jobs set state='processing',attempts=attempts+1,updated_at=clock_timestamp(),note='Scheduled deployment claimed; uncertain requests require review.' where generation=cur;
 insert into pipstart_editorial_private.publication_scheduler_deliveries(generation) values(cur) returning token into t;
 return jsonb_build_object('state','claimed','generation',cur,'token',t);
end$$;
create function public.pipstart_publication_scheduler_finish(p_generation bigint,p_token uuid,p_sent boolean) returns boolean
language plpgsql security definer set search_path='' as $$
declare d pipstart_editorial_private.publication_scheduler_deliveries;
begin
 if p_token is null or p_generation is null or p_sent is null then return false;end if;
 select * into d from pipstart_editorial_private.publication_scheduler_deliveries where generation=p_generation for update;
 if not found or d.token<>p_token then return false;end if;
 if d.state<>'claimed' then return d.state=case when p_sent then 'sent' else 'unknown' end;end if;
 update pipstart_editorial_private.publication_scheduler_deliveries set state=case when p_sent then 'sent' else 'unknown' end,finished_at=clock_timestamp() where generation=p_generation;
 if not p_sent then update pipstart_editorial_private.refresh_jobs set state='failed',note='Scheduled deployment not confirmed; check before any manual retry.',updated_at=clock_timestamp() where generation=p_generation and state='processing';end if;
 return true;
end$$;
-- Wake carries no content. No extension/Vault access happens while disabled. A missing setup fails
-- visibly in Cron; a durable pending job remains available to the next tick.
create function pipstart_editorial_private.scheduler_wake() returns boolean
language plpgsql security definer set search_path='' as $$
declare t text; request_id bigint;
begin
 if current_setting('role',true) is distinct from 'pipstart_publication_scheduler' then raise exception using errcode='42501',message='Restricted scheduler identity required';end if;
 if not exists(select 1 from pipstart_staff_private.control where singleton and enabled)
  or not exists(select 1 from pipstart_editorial_private.publication_scheduler_control where singleton and enabled)
  or not exists(select 1 from pipstart_editorial_private.refresh_jobs j join pipstart_editorial_private.publication_pointer p using(generation)
   join pipstart_editorial_private.publication_schedules s on s.outcome_generation=j.generation
   where j.state='pending' and j.attempts=0 and s.state='published') then return false;end if;
 if to_regclass('vault.decrypted_secrets') is null or to_regprocedure('net.http_post(text,jsonb,jsonb,jsonb,integer)') is null then raise exception 'Scheduler wake prerequisites unavailable';end if;
 execute 'select decrypted_secret from vault.decrypted_secrets where name=$1' into strict t using 'pipstart_publication_scheduler_token';
 if t is null or t !~ '^[A-Za-z0-9_-]{32,128}$' then raise exception 'Scheduler wake credential unavailable';end if;
 execute 'select net.http_post(url:=$1,body:=$2,headers:=$3,timeout_milliseconds:=8000)' into request_id
  using 'https://pipstart.net/api/internal/publication/scheduled-delivery','{}'::jsonb,jsonb_build_object('Authorization','Bearer '||t,'Content-Type','application/json');
 return request_id is not null;
end$$;
revoke all on function pipstart_editorial_private.publication_apply(uuid,uuid,text,bigint,text,integer,text,text),pipstart_editorial_private.schedule_actor_allowed(uuid,text,text),
 pipstart_editorial_private.scheduler_tick(),pipstart_editorial_private.scheduler_wake(),public.pipstart_publication_scheduler_claim(),public.pipstart_publication_scheduler_finish(bigint,uuid,boolean)
 from public,anon,authenticated,service_role,pipstart_publication_scheduler;
grant execute on function pipstart_editorial_private.scheduler_tick(),pipstart_editorial_private.scheduler_wake() to pipstart_publication_scheduler;
grant execute on function public.pipstart_publication_scheduler_claim(),public.pipstart_publication_scheduler_finish(bigint,uuid,boolean) to service_role;
commit;
