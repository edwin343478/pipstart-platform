alter type public.pipstart_learning_event_type add value if not exists 'quiz_attempted';
alter type public.pipstart_learning_event_type add value if not exists 'quiz_passed';
alter type public.pipstart_learning_event_type add value if not exists 'module_completed';
alter type public.pipstart_learning_event_type add value if not exists 'course_completed';

begin;

alter table public.pipstart_learning_events
  add column if not exists quiz_id text;

create table public.pipstart_assessment_rate_limits (
  client_key_hash bigint primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now()
);

alter table public.pipstart_assessment_rate_limits enable row level security;
revoke all on table public.pipstart_assessment_rate_limits
  from public, anon, authenticated;

create or replace function public.pipstart_consume_assessment_rate_limit(
  requested_client_key text,
  requested_limit integer,
  requested_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  change_time timestamptz := now();
  current_count integer;
  current_window timestamptz;
  key_hash bigint;
begin
  if requested_client_key is null
    or length(requested_client_key) < 3
    or length(requested_client_key) > 1024
    or requested_limit not between 1 and 1000
    or requested_window_seconds not between 1 and 86400
  then
    raise exception 'Invalid assessment rate-limit request.' using errcode = '22023';
  end if;

  key_hash := pg_catalog.hashtextextended(requested_client_key, 73113);
  current_window := pg_catalog.to_timestamp(
    floor(extract(epoch from change_time) / requested_window_seconds)
      * requested_window_seconds
  );

  insert into public.pipstart_assessment_rate_limits (
    client_key_hash,
    window_started_at,
    request_count,
    updated_at
  ) values (
    key_hash,
    current_window,
    1,
    change_time
  )
  on conflict (client_key_hash) do update set
    request_count = case
      when public.pipstart_assessment_rate_limits.window_started_at = current_window
        then public.pipstart_assessment_rate_limits.request_count + 1
      else 1
    end,
    window_started_at = current_window,
    updated_at = change_time
  returning request_count into current_count;

  delete from public.pipstart_assessment_rate_limits
   where updated_at < change_time - interval '1 day';

  return current_count <= requested_limit;
end;
$$;

revoke all on function public.pipstart_consume_assessment_rate_limit(
  text, integer, integer
) from public, anon, authenticated;
grant execute on function public.pipstart_consume_assessment_rate_limit(
  text, integer, integer
) to service_role;

drop function public.pipstart_submit_assessment_attempt(
  uuid, uuid, uuid, jsonb, integer, integer, boolean, jsonb
);

create function public.pipstart_submit_assessment_attempt(
  requested_user_id uuid,
  requested_attempt_id uuid,
  requested_submission_token uuid,
  requested_answers jsonb,
  requested_score integer,
  requested_max_score integer,
  requested_passed boolean,
  requested_review_snapshot jsonb,
  requested_course_id text,
  requested_module_id text
)
returns setof public.pipstart_assessment_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_attempt public.pipstart_assessment_attempts%rowtype;
  change_time timestamptz := now();
  expected_passed boolean;
begin
  if requested_user_id is null
    or requested_attempt_id is null
    or requested_course_id is null
    or requested_course_id !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or (requested_module_id is not null
      and requested_module_id !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
  then
    raise exception 'Invalid assessment submission.' using errcode = '22023';
  end if;

  select *
    into current_attempt
    from public.pipstart_assessment_attempts
   where id = requested_attempt_id
     and user_id = requested_user_id
   for update;

  if not found then
    raise exception 'Assessment attempt not found.' using errcode = 'P0002';
  end if;

  if current_attempt.status = 'submitted' then
    return next current_attempt;
    return;
  end if;

  if requested_submission_token is null
    or jsonb_typeof(requested_answers) <> 'object'
    or requested_score < 0
    or requested_max_score <= 0
    or requested_score > requested_max_score
    or requested_max_score <> jsonb_array_length(current_attempt.question_order)
    or requested_passed is null
    or jsonb_typeof(requested_review_snapshot) <> 'object'
  then
    raise exception 'Invalid assessment submission.' using errcode = '22023';
  end if;

  expected_passed :=
    requested_score * 100 >= current_attempt.passing_percentage * requested_max_score;
  if requested_passed <> expected_passed then
    raise exception 'Assessment pass result is inconsistent.' using errcode = '22023';
  end if;

  update public.pipstart_assessment_attempts
     set status = 'submitted',
         draft_answers = requested_answers,
         submitted_answers = requested_answers,
         score = requested_score,
         max_score = requested_max_score,
         passed = requested_passed,
         submission_token = requested_submission_token,
         review_snapshot = requested_review_snapshot,
         updated_at = change_time,
         submitted_at = change_time
   where id = requested_attempt_id
  returning * into current_attempt;

  insert into public.pipstart_learning_events (
    user_id,
    event_type,
    course_id,
    module_id,
    quiz_id,
    metadata
  ) values (
    requested_user_id,
    'quiz_attempted',
    requested_course_id,
    requested_module_id,
    current_attempt.quiz_id,
    jsonb_build_object(
      'attempt_number', current_attempt.attempt_number,
      'quiz_version', current_attempt.quiz_version,
      'score', requested_score,
      'max_score', requested_max_score,
      'passed', requested_passed
    )
  );

  if requested_passed then
    insert into public.pipstart_assessment_completions (
      user_id,
      quiz_id,
      earned_at,
      highest_passed_version,
      last_passed_at
    ) values (
      requested_user_id,
      current_attempt.quiz_id,
      change_time,
      current_attempt.quiz_version,
      change_time
    )
    on conflict (user_id, quiz_id) do update set
      earned_at = least(
        public.pipstart_assessment_completions.earned_at,
        excluded.earned_at
      ),
      highest_passed_version = greatest(
        public.pipstart_assessment_completions.highest_passed_version,
        excluded.highest_passed_version
      ),
      last_passed_at = greatest(
        public.pipstart_assessment_completions.last_passed_at,
        excluded.last_passed_at
      );

    insert into public.pipstart_learning_events (
      user_id,
      event_type,
      course_id,
      module_id,
      quiz_id,
      metadata
    ) values (
      requested_user_id,
      'quiz_passed',
      requested_course_id,
      requested_module_id,
      current_attempt.quiz_id,
      jsonb_build_object(
        'attempt_number', current_attempt.attempt_number,
        'quiz_version', current_attempt.quiz_version,
        'score', requested_score,
        'max_score', requested_max_score
      )
    );
  end if;

  return next current_attempt;
end;
$$;

revoke all on function public.pipstart_submit_assessment_attempt(
  uuid, uuid, uuid, jsonb, integer, integer, boolean, jsonb, text, text
) from public, anon, authenticated;
grant execute on function public.pipstart_submit_assessment_attempt(
  uuid, uuid, uuid, jsonb, integer, integer, boolean, jsonb, text, text
) to service_role;

create or replace function public.pipstart_reconcile_module_completion(
  requested_user_id uuid,
  requested_course_id text,
  requested_module_id text,
  requested_lesson_ids text[],
  requested_assessment_ids text[]
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  module_complete boolean;
begin
  if requested_user_id is null
    or requested_course_id is null
    or requested_module_id is null
    or requested_lesson_ids is null
    or requested_assessment_ids is null
    or cardinality(requested_lesson_ids) > 500
    or cardinality(requested_assessment_ids) > 100
  then
    raise exception 'Invalid module completion request.' using errcode = '22023';
  end if;

  module_complete :=
    not exists (
      select 1
        from unnest(requested_lesson_ids) as required_lesson(lesson_id)
       where not exists (
         select 1
           from public.pipstart_lesson_progress as progress
          where progress.user_id = requested_user_id
            and progress.course_id = requested_course_id
            and progress.module_id = requested_module_id
            and progress.lesson_id = required_lesson.lesson_id
            and progress.is_complete
       )
    )
    and not exists (
      select 1
        from unnest(requested_assessment_ids) as required_assessment(quiz_id)
       where not exists (
         select 1
           from public.pipstart_assessment_completions as completion
          where completion.user_id = requested_user_id
            and completion.quiz_id = required_assessment.quiz_id
       )
    );

  if module_complete then
    insert into public.pipstart_learning_events (
      user_id, event_type, course_id, module_id
    )
    select requested_user_id, 'module_completed', requested_course_id,
      requested_module_id
    where not exists (
      select 1 from public.pipstart_learning_events
       where user_id = requested_user_id
         and event_type = 'module_completed'
         and course_id = requested_course_id
         and module_id = requested_module_id
    );
  end if;

  return module_complete;
end;
$$;

revoke all on function public.pipstart_reconcile_module_completion(
  uuid, text, text, text[], text[]
) from public, anon, authenticated;
grant execute on function public.pipstart_reconcile_module_completion(
  uuid, text, text, text[], text[]
) to service_role;

create or replace function public.pipstart_reconcile_course_completion(
  requested_user_id uuid,
  requested_course_id text,
  requested_lesson_ids text[],
  requested_assessment_ids text[]
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  change_time timestamptz := now();
  course_complete boolean;
  lessons_complete boolean;
  assessments_complete boolean;
  was_complete boolean := false;
begin
  if requested_user_id is null
    or requested_course_id is null
    or requested_course_id !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or requested_lesson_ids is null
    or requested_assessment_ids is null
    or cardinality(requested_lesson_ids) > 500
    or cardinality(requested_assessment_ids) > 100
  then
    raise exception 'Invalid course completion request.' using errcode = '22023';
  end if;

  select status = 'completed'
    into was_complete
    from public.pipstart_enrollments
   where user_id = requested_user_id and course_id = requested_course_id;

  lessons_complete := not exists (
    select 1
      from unnest(requested_lesson_ids) as required_lesson(lesson_id)
     where not exists (
       select 1
         from public.pipstart_lesson_progress as progress
        where progress.user_id = requested_user_id
          and progress.course_id = requested_course_id
          and progress.lesson_id = required_lesson.lesson_id
          and progress.is_complete
     )
  );

  assessments_complete := not exists (
    select 1
      from unnest(requested_assessment_ids) as required_assessment(quiz_id)
     where not exists (
       select 1
         from public.pipstart_assessment_completions as completion
        where completion.user_id = requested_user_id
          and completion.quiz_id = required_assessment.quiz_id
     )
  );

  course_complete := lessons_complete and assessments_complete;

  insert into public.pipstart_enrollments (
    user_id, course_id, status, started_at, last_activity_at, completed_at
  ) values (
    requested_user_id,
    requested_course_id,
    case when course_complete then 'completed'::public.pipstart_enrollment_status
      else 'active'::public.pipstart_enrollment_status end,
    change_time,
    change_time,
    case when course_complete then change_time else null end
  )
  on conflict (user_id, course_id) do update set
    status = case when course_complete then 'completed'::public.pipstart_enrollment_status
      else 'active'::public.pipstart_enrollment_status end,
    completed_at = case when course_complete
      then coalesce(public.pipstart_enrollments.completed_at, change_time)
      else null end,
    last_activity_at = change_time;

  if course_complete and not coalesce(was_complete, false) then
    insert into public.pipstart_learning_events (
      user_id, event_type, course_id
    ) values (
      requested_user_id, 'course_completed', requested_course_id
    );
  end if;

  return course_complete;
end;
$$;

revoke all on function public.pipstart_reconcile_course_completion(
  uuid, text, text[], text[]
) from public, anon, authenticated;
grant execute on function public.pipstart_reconcile_course_completion(
  uuid, text, text[], text[]
) to service_role;

drop function if exists public.pipstart_set_enrollment_completion(text, boolean);

commit;
