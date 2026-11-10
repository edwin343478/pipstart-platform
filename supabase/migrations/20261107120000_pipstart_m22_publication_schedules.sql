-- MP08c1 durable scheduling foundation. No executor, Cron role/job, provider call or activation.
-- Future worker execution must recheck the recorded authorizer's current grants/account,
-- exact approval/policy/dependencies and later decisions; it must not replay a human JWT.
begin;
do $$ begin
 if to_regprocedure('public.pipstart_publication_publish(uuid,bigint,text,integer,text,text)') is null
  or to_regclass('pipstart_editorial_private.publication_schedules') is not null then
  raise exception 'Accepted MP08a publication store required; schedules must not already exist';end if;
end $$;
create table pipstart_editorial_private.publication_scheduler_control(
 singleton boolean primary key default true check(singleton),
 enabled boolean not null default false,
 version bigint not null default 0 check(version>=0)
);
insert into pipstart_editorial_private.publication_scheduler_control(singleton) values(true);
create table pipstart_editorial_private.publication_schedules(
 id uuid primary key,
 actor_id uuid not null references auth.users(id) on delete restrict,
 action text not null check(action in ('publish','withdraw')),
 item_id text not null references pipstart_editorial_private.items(id) on delete restrict,
 revision_no integer,
 body_sha256 text check(body_sha256 is null or body_sha256 ~ '^[0-9a-f]{64}$'),
 base_generation bigint not null references pipstart_editorial_private.generation_seals(generation) on delete restrict,
 policy_version bigint not null check(policy_version>=0),
 due_at timestamptz not null,
 time_zone text not null check(char_length(time_zone) between 1 and 100),
 local_input text not null check(local_input ~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$'),
 reason text not null check(char_length(reason) between 1 and 200 and reason=btrim(reason)),
 state text not null default 'scheduled' check(state in ('scheduled','cancelled','failed','published')),
 outcome_generation bigint references pipstart_editorial_private.generation_seals(generation) on delete restrict,
 failure_code text check(failure_code is null or failure_code in ('revoked','approval','dependency','superseded','unavailable')),
 created_at timestamptz not null default clock_timestamp(),
 completed_at timestamptz,
 foreign key(item_id,revision_no) references pipstart_editorial_private.revisions(item_id,revision_no) on delete restrict,
 check((action='publish' and revision_no is not null and revision_no>=1 and body_sha256 is not null) or (action='withdraw' and revision_no is null and body_sha256 is null)),
 check((state='scheduled' and completed_at is null and outcome_generation is null and failure_code is null)
  or (state='cancelled' and completed_at is not null and outcome_generation is null and failure_code is null)
  or (state='failed' and completed_at is not null and outcome_generation is null and failure_code is not null)
  or (state='published' and completed_at is not null and outcome_generation is not null and failure_code is null))
);
create unique index pipstart_publication_one_schedule on pipstart_editorial_private.publication_schedules(item_id) where state='scheduled';
create index pipstart_publication_due on pipstart_editorial_private.publication_schedules(due_at,id) where state='scheduled';
create table pipstart_editorial_private.publication_schedule_events(
 id uuid primary key default gen_random_uuid(),
 schedule_id uuid not null references pipstart_editorial_private.publication_schedules(id) on delete restrict,
 actor_id uuid references auth.users(id) on delete restrict,
 executor text not null check(executor in ('staff','scheduler')),
 kind text not null check(kind in ('scheduled','cancelled','failed','published')),
 reason text not null check(char_length(reason) between 1 and 200),
 created_at timestamptz not null default clock_timestamp()
);
create trigger pipstart_publication_schedule_event_immutable before update or delete on pipstart_editorial_private.publication_schedule_events
 for each row execute function pipstart_staff_private.immutable_audit();
alter table pipstart_editorial_private.publication_scheduler_control enable row level security;
alter table pipstart_editorial_private.publication_schedules enable row level security;
alter table pipstart_editorial_private.publication_schedule_events enable row level security;
revoke all on pipstart_editorial_private.publication_scheduler_control,pipstart_editorial_private.publication_schedules,pipstart_editorial_private.publication_schedule_events from public,anon,authenticated,service_role;

-- Exhaustive UTC-minute candidates within the explicit supported 26-hour offset bound.
-- No presumed one-hour DST transition, ambiguous-offset guessing or trust in browser conversion.
create function pipstart_editorial_private.schedule_time(p_local text,p_zone text,p_due timestamptz)
returns timestamptz language plpgsql stable security definer set search_path='' as $$
declare l timestamp; n integer; exact_due timestamptz;
begin
 if p_local is null or p_zone is null or p_due is null
  or p_local !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$'
  or char_length(p_zone)>100 or p_zone !~ '^(UTC|[A-Za-z][A-Za-z0-9_+-]*(/[A-Za-z0-9_+-]+)+)$'
  or p_zone ~ '^(posix|right)/' or not exists(select 1 from pg_catalog.pg_timezone_names where name=p_zone) then
  raise exception using errcode='22023',message='Invalid original local time or IANA zone';end if;
 begin l:=p_local::timestamp;
 exception when invalid_datetime_format or datetime_field_overflow then
  raise exception using errcode='22023',message='Invalid calendar date or time';end;
 if to_char(l,'YYYY-MM-DD"T"HH24:MI')<>p_local then
  raise exception using errcode='22023',message='Local time must not normalize';end if;
 select count(*),min(candidate) into n,exact_due from generate_series((l at time zone 'UTC')-interval '26 hours',
  (l at time zone 'UTC')+interval '26 hours',interval '1 minute') candidate where candidate at time zone p_zone=l;
 if n=0 then raise exception using errcode='22023',message='Local time does not exist in this zone';end if;
 if n<>1 then raise exception using errcode='22023',message='Local time is ambiguous; choose another time';end if;
 if exact_due is distinct from p_due then raise exception using errcode='22023',message='UTC instant does not match the unique original local time';end if;
 return exact_due;
end $$;
create function pipstart_editorial_private.schedule_guard() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_op='DELETE' then raise exception using errcode='42501',message='Schedule history cannot be deleted';end if;
 if (new.id,new.actor_id,new.action,new.item_id,new.revision_no,new.body_sha256,new.base_generation,new.policy_version,
   new.due_at,new.time_zone,new.local_input,new.reason,new.created_at)
  is distinct from (old.id,old.actor_id,old.action,old.item_id,old.revision_no,old.body_sha256,old.base_generation,old.policy_version,
   old.due_at,old.time_zone,old.local_input,old.reason,old.created_at)
  or old.state<>'scheduled' or new.state not in ('cancelled','failed','published') then
  raise exception using errcode='42501',message='Schedule request is immutable; terminal state cannot be changed';end if;
 return new;
end $$;
create trigger pipstart_publication_schedule_guard before update or delete on pipstart_editorial_private.publication_schedules
 for each row execute function pipstart_editorial_private.schedule_guard();
create function pipstart_editorial_private.schedule_result(p_schedule uuid) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',s.id,'item_id',s.item_id,'action',s.action,'state',s.state,'revision_no',s.revision_no,
  'body_sha256',s.body_sha256,'base_generation',s.base_generation,'policy_version',s.policy_version,
  'due_at',to_char(s.due_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'time_zone',s.time_zone,'local_input',s.local_input,
  'outcome_generation',s.outcome_generation,'failure_code',s.failure_code)
 from pipstart_editorial_private.publication_schedules s where s.id=p_schedule
$$;

-- Accepted AAL2 caller, current scope, exact revision and UTC/time-zone mapping. No activation.
create function public.pipstart_publication_schedule(p_operation uuid,p_expected_generation bigint,p_action text,p_id text,
 p_revision integer,p_sha text,p_local_input text,p_time_zone text,p_due_at timestamptz,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid; cur bigint; i pipstart_editorial_private.items; s pipstart_editorial_private.publication_schedules; pv bigint;
begin
 perform 1 from pipstart_staff_private.control where singleton for share;
 u:=pipstart_editorial_private.actor_required();
 if p_operation is null or p_id is null or p_id !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$' or p_action is null or p_action not in ('publish','withdraw') then raise exception using errcode='22023',message='Schedule identity and action required';end if;
 perform pipstart_editorial_private.reason_ok(p_reason);
 perform pipstart_editorial_private.schedule_time(p_local_input,p_time_zone,p_due_at);
 cur:=pipstart_editorial_private.locked_pointer();
 select * into s from pipstart_editorial_private.publication_schedules where id=p_operation for update;
 i:=pipstart_editorial_private.locked_item(p_id);
 perform pipstart_editorial_private.require(case when p_action='publish' then 'content.publish' else 'content.withdraw' end,i.family,i.id);
 if s.id is not null then
  if (s.actor_id,s.action,s.item_id,s.revision_no,s.body_sha256,s.base_generation,s.due_at,s.time_zone,s.local_input,s.reason)
    is distinct from (u,p_action,p_id,p_revision,p_sha,p_expected_generation,p_due_at,p_time_zone,p_local_input,p_reason) then
   raise exception using errcode='22023',message='Schedule identity belongs to different arguments';end if;
  return pipstart_editorial_private.schedule_result(s.id);
 end if;
 if cur is null then raise exception using errcode='55000',message='Create a live baseline before scheduling';end if;
 if cur is distinct from p_expected_generation then raise exception using errcode='PT409',message='A newer publication exists';end if;
 if p_due_at<clock_timestamp()+interval '1 minute' or p_due_at>clock_timestamp()+interval '366 days' then
  raise exception using errcode='22023',message='Due time must be at least one minute and at most 366 days ahead';end if;
 if i.trashed_at is not null then raise exception using errcode='55000',message='Content is in trash';end if;
 if p_action='publish' then
  if p_revision is null or p_revision<1 or p_sha is null or p_sha !~ '^[0-9a-f]{64}$' then raise exception using errcode='22023',message='Exact revision and hash required';end if;
  if not exists(select 1 from pipstart_editorial_private.revisions where item_id=p_id and revision_no=p_revision and body_sha256=p_sha)
   then raise exception using errcode='PT409',message='Revision content changed';end if;
  if not pipstart_editorial_private.revision_approved(p_id,p_revision,p_sha) then raise exception using errcode='55000',message='Only an approved revision can be scheduled';end if;
  if exists(select 1 from pipstart_editorial_private.generation_entries where generation=cur and item_id=p_id and body_sha256=p_sha)
   then raise exception using errcode='55000',message='This revision is already published';end if;
  if i.parent_id is not null and not exists(select 1 from pipstart_editorial_private.generation_entries where generation=cur and item_id=i.parent_id)
   then raise exception using errcode='55000',message='Published parent required';end if;
 else
  if p_revision is not null or p_sha is not null then raise exception using errcode='22023',message='Withdraw schedules do not take a revision';end if;
  if not exists(select 1 from pipstart_editorial_private.generation_entries where generation=cur and item_id=p_id) then raise exception using errcode='55000',message='Content is not published';end if;
  if exists(select 1 from pipstart_editorial_private.generation_entries where generation=cur and parent_id=p_id) then raise exception using errcode='55000',message='Withdraw published contents first';end if;
 end if;
 if exists(select 1 from pipstart_editorial_private.publication_schedules where item_id=p_id and state='scheduled') then
  raise exception using errcode='55000',message='Cancel the existing schedule before replacing it';end if;
 select version into pv from pipstart_editorial_private.policy where singleton for share;
 insert into pipstart_editorial_private.publication_schedules(id,actor_id,action,item_id,revision_no,body_sha256,base_generation,policy_version,due_at,time_zone,local_input,reason)
  values(p_operation,u,p_action,p_id,p_revision,p_sha,cur,pv,p_due_at,p_time_zone,p_local_input,p_reason);
 insert into pipstart_editorial_private.publication_schedule_events(schedule_id,actor_id,executor,kind,reason) values(p_operation,u,'staff','scheduled',p_reason);
 return pipstart_editorial_private.schedule_result(p_operation);
end $$;
create function public.pipstart_publication_cancel_schedule(p_schedule uuid,p_reason text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid; s pipstart_editorial_private.publication_schedules; i pipstart_editorial_private.items;
begin
 perform 1 from pipstart_staff_private.control where singleton for share;
 u:=pipstart_editorial_private.actor_required();perform pipstart_editorial_private.reason_ok(p_reason);
 perform pipstart_editorial_private.locked_pointer();
 select * into s from pipstart_editorial_private.publication_schedules where id=p_schedule for update;
 if not found then raise exception using errcode='22023',message='Unknown schedule';end if;
 i:=pipstart_editorial_private.locked_item(s.item_id);
 perform pipstart_editorial_private.require(case when s.action='publish' then 'content.publish' else 'content.withdraw' end,i.family,i.id);
 if s.state='cancelled' then return pipstart_editorial_private.schedule_result(s.id);end if;
 if s.state<>'scheduled' then raise exception using errcode='55000',message='Completed publication work cannot be cancelled';end if;
 update pipstart_editorial_private.publication_schedules set state='cancelled',completed_at=clock_timestamp() where id=s.id;
 insert into pipstart_editorial_private.publication_schedule_events(schedule_id,actor_id,executor,kind,reason) values(s.id,u,'staff','cancelled',p_reason);
 return pipstart_editorial_private.schedule_result(s.id);
end $$;
create function public.pipstart_publication_schedule_status(p_id text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid; i pipstart_editorial_private.items; enabled boolean;
begin
 u:=pipstart_editorial_private.actor_required();
 if p_id is null or p_id !~ '^[a-z0-9][a-z0-9_:/.-]{0,199}$' then raise exception using errcode='22023',message='Invalid content identity';end if;
 select * into i from pipstart_editorial_private.items where id=p_id;
 if not found then raise exception using errcode='22023',message='Unknown content identity';end if;
 perform pipstart_editorial_private.require('content.read',i.family,i.id);
 select c.enabled into enabled from pipstart_editorial_private.publication_scheduler_control c where singleton;
 return jsonb_build_object('execution_enabled',enabled,'schedules',(select coalesce(jsonb_agg(pipstart_editorial_private.schedule_result(id) order by created_at desc,id desc),'[]'::jsonb)
  from (select id,created_at from pipstart_editorial_private.publication_schedules where item_id=p_id order by created_at desc,id desc limit 10) recent));
end $$;
revoke all on function pipstart_editorial_private.schedule_time(text,text,timestamptz),pipstart_editorial_private.schedule_guard(),pipstart_editorial_private.schedule_result(uuid),
 public.pipstart_publication_schedule(uuid,bigint,text,text,integer,text,text,text,timestamptz,text),public.pipstart_publication_cancel_schedule(uuid,text),public.pipstart_publication_schedule_status(text)
 from public,anon,authenticated,service_role;
grant execute on function public.pipstart_publication_schedule(uuid,bigint,text,text,integer,text,text,text,timestamptz,text),public.pipstart_publication_cancel_schedule(uuid,text),public.pipstart_publication_schedule_status(text) to authenticated;
commit;
