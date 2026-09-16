begin;

create type public.pipstart_enrollment_status as enum ('active', 'completed');
create type public.pipstart_learning_event_type as enum (
  'course_enrolled', 'lesson_started', 'lesson_completed',
  'lesson_reopened', 'progress_imported'
);

create table public.pipstart_enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null check (course_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status public.pipstart_enrollment_status not null default 'active',
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, course_id),
  check ((status = 'completed') = (completed_at is not null))
);

create table public.pipstart_lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null check (course_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  module_id text not null check (module_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  lesson_id text not null check (lesson_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  started_at timestamptz not null default now(),
  last_visited_at timestamptz not null default now(),
  completed_at timestamptz,
  is_complete boolean not null default false,
  revision bigint not null default 1 check (revision > 0),
  primary key (user_id, lesson_id),
  check (is_complete = (completed_at is not null))
);

create table public.pipstart_learning_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type public.pipstart_learning_event_type not null,
  course_id text,
  module_id text,
  lesson_id text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  check (jsonb_typeof(metadata) = 'object')
);

create table public.pipstart_progress_imports (
  user_id uuid not null references auth.users(id) on delete cascade,
  import_fingerprint text not null check (char_length(import_fingerprint) between 16 and 128),
  imported_at timestamptz not null default now(),
  primary key (user_id, import_fingerprint)
);

create index pipstart_lesson_progress_course_idx
  on public.pipstart_lesson_progress (user_id, course_id, last_visited_at desc);
create index pipstart_learning_events_user_date_idx
  on public.pipstart_learning_events (user_id, occurred_at desc);

alter table public.pipstart_enrollments enable row level security;
alter table public.pipstart_lesson_progress enable row level security;
alter table public.pipstart_learning_events enable row level security;
alter table public.pipstart_progress_imports enable row level security;

create policy "Learners read their own PipStart enrollments"
on public.pipstart_enrollments for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Learners read their own PipStart lesson progress"
on public.pipstart_lesson_progress for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Learners read their own PipStart learning events"
on public.pipstart_learning_events for select to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.pipstart_enrollments from anon, authenticated;
revoke all on public.pipstart_lesson_progress from anon, authenticated;
revoke all on public.pipstart_learning_events from anon, authenticated;
revoke all on public.pipstart_progress_imports from anon, authenticated;
grant select on public.pipstart_enrollments to authenticated;
grant select on public.pipstart_lesson_progress to authenticated;
grant select on public.pipstart_learning_events to authenticated;

create function public.pipstart_record_lesson_visit(
  requested_course_id text, requested_module_id text, requested_lesson_id text
) returns void language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := (select auth.uid());
  visit_time timestamptz := now();
  previous_visit timestamptz;
begin
  if current_user_id is null then raise exception 'authentication required'; end if;
  insert into public.pipstart_enrollments (user_id, course_id)
  values (current_user_id, requested_course_id)
  on conflict (user_id, course_id) do update
    set last_activity_at = excluded.last_activity_at;
  insert into public.pipstart_learning_events (user_id, event_type, course_id)
  select current_user_id, 'course_enrolled', requested_course_id
  where not exists (
    select 1 from public.pipstart_learning_events
    where user_id = current_user_id and event_type = 'course_enrolled'
      and course_id = requested_course_id
  );
  select last_visited_at into previous_visit
  from public.pipstart_lesson_progress
  where user_id = current_user_id and lesson_id = requested_lesson_id;
  insert into public.pipstart_lesson_progress
    (user_id, course_id, module_id, lesson_id, last_visited_at)
  values (current_user_id, requested_course_id, requested_module_id,
    requested_lesson_id, visit_time)
  on conflict (user_id, lesson_id) do update set
    course_id = excluded.course_id, module_id = excluded.module_id,
    last_visited_at = excluded.last_visited_at;
  if previous_visit is null or previous_visit < visit_time - interval '5 minutes' then
    insert into public.pipstart_learning_events
      (user_id, event_type, course_id, module_id, lesson_id)
    values (current_user_id, 'lesson_started', requested_course_id,
      requested_module_id, requested_lesson_id);
  end if;
end;
$$;

create function public.pipstart_set_lesson_completion(
  requested_course_id text, requested_module_id text, requested_lesson_id text,
  requested_complete boolean, expected_revision bigint default null
) returns table (lesson_id text, is_complete boolean, revision bigint)
language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := (select auth.uid());
  current_record public.pipstart_lesson_progress%rowtype;
  change_time timestamptz := now();
begin
  if current_user_id is null then raise exception 'authentication required'; end if;
  perform public.pipstart_record_lesson_visit(
    requested_course_id, requested_module_id, requested_lesson_id);
  select * into current_record from public.pipstart_lesson_progress
  where user_id = current_user_id
    and public.pipstart_lesson_progress.lesson_id = requested_lesson_id for update;
  if expected_revision is not null and current_record.revision <> expected_revision then
    raise exception 'progress conflict' using errcode = '40001';
  end if;
  if current_record.is_complete <> requested_complete then
    update public.pipstart_lesson_progress set
      is_complete = requested_complete,
      completed_at = case when requested_complete then change_time else null end,
      last_visited_at = change_time, revision = current_record.revision + 1
    where user_id = current_user_id
      and public.pipstart_lesson_progress.lesson_id = requested_lesson_id
    returning * into current_record;
    insert into public.pipstart_learning_events
      (user_id, event_type, course_id, module_id, lesson_id)
    values (current_user_id,
      case when requested_complete then 'lesson_completed'::public.pipstart_learning_event_type
        else 'lesson_reopened'::public.pipstart_learning_event_type end,
      requested_course_id, requested_module_id, requested_lesson_id);
  end if;
  return query select current_record.lesson_id, current_record.is_complete,
    current_record.revision;
end;
$$;

create function public.pipstart_import_anonymous_progress(
  requested_course_id text, requested_module_id text,
  requested_lesson_ids text[], requested_fingerprint text
) returns integer language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := (select auth.uid());
  imported_count integer := 0;
  lesson text;
  import_time timestamptz := now();
begin
  if current_user_id is null then raise exception 'authentication required'; end if;
  if coalesce(array_length(requested_lesson_ids, 1), 0) > 100 then
    raise exception 'too many lessons';
  end if;
  insert into public.pipstart_progress_imports (user_id, import_fingerprint)
  values (current_user_id, requested_fingerprint) on conflict do nothing;
  if not found then return 0; end if;
  insert into public.pipstart_enrollments (user_id, course_id)
  values (current_user_id, requested_course_id)
  on conflict (user_id, course_id) do update
    set last_activity_at = excluded.last_activity_at;
  foreach lesson in array requested_lesson_ids loop
    insert into public.pipstart_lesson_progress
      (user_id, course_id, module_id, lesson_id, is_complete, completed_at)
    values (current_user_id, requested_course_id, requested_module_id,
      lesson, true, import_time)
    on conflict (user_id, lesson_id) do nothing;
    if found then imported_count := imported_count + 1; end if;
  end loop;
  insert into public.pipstart_learning_events
    (user_id, event_type, course_id, module_id, metadata)
  values (current_user_id, 'progress_imported', requested_course_id,
    requested_module_id, jsonb_build_object('lesson_count', imported_count));
  return imported_count;
end;
$$;

create function public.pipstart_set_enrollment_completion(
  requested_course_id text, requested_complete boolean
) returns void language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then raise exception 'authentication required'; end if;
  update public.pipstart_enrollments set
    status = case when requested_complete then 'completed'::public.pipstart_enrollment_status
      else 'active'::public.pipstart_enrollment_status end,
    completed_at = case when requested_complete then coalesce(completed_at, now()) else null end,
    last_activity_at = now()
  where user_id = current_user_id and course_id = requested_course_id;
end;
$$;

revoke all on function public.pipstart_record_lesson_visit(text, text, text)
  from public, anon, authenticated;
revoke all on function public.pipstart_set_lesson_completion(text, text, text, boolean, bigint)
  from public, anon, authenticated;
revoke all on function public.pipstart_import_anonymous_progress(text, text, text[], text)
  from public, anon, authenticated;
revoke all on function public.pipstart_set_enrollment_completion(text, boolean)
  from public, anon, authenticated;
grant execute on function public.pipstart_record_lesson_visit(text, text, text)
  to authenticated;
grant execute on function public.pipstart_set_lesson_completion(text, text, text, boolean, bigint)
  to authenticated;
grant execute on function public.pipstart_import_anonymous_progress(text, text, text[], text)
  to authenticated;
grant execute on function public.pipstart_set_enrollment_completion(text, boolean)
  to authenticated;

commit;
