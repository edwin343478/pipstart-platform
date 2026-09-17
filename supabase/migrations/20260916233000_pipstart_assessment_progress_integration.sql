begin;

create table public.pipstart_assessment_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null check (quiz_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  earned_at timestamptz not null,
  highest_passed_version integer not null check (highest_passed_version > 0),
  last_passed_at timestamptz not null,
  primary key (user_id, quiz_id),
  check (last_passed_at >= earned_at)
);

alter table public.pipstart_assessment_completions enable row level security;

create policy "Learners read their own assessment completions"
  on public.pipstart_assessment_completions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.pipstart_assessment_completions
  from public, anon, authenticated;
grant select (
  quiz_id,
  earned_at,
  highest_passed_version,
  last_passed_at
) on public.pipstart_assessment_completions to authenticated;

insert into public.pipstart_assessment_completions (
  user_id,
  quiz_id,
  earned_at,
  highest_passed_version,
  last_passed_at
)
select
  user_id,
  quiz_id,
  min(submitted_at),
  max(quiz_version),
  max(submitted_at)
from public.pipstart_assessment_attempts
where status = 'submitted'
  and passed is true
  and submitted_at is not null
group by user_id, quiz_id
on conflict (user_id, quiz_id) do nothing;

create or replace function public.pipstart_submit_assessment_attempt(
  requested_user_id uuid,
  requested_attempt_id uuid,
  requested_submission_token uuid,
  requested_answers jsonb,
  requested_score integer,
  requested_max_score integer,
  requested_passed boolean,
  requested_review_snapshot jsonb
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
  if requested_user_id is null or requested_attempt_id is null then
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
  end if;

  return next current_attempt;
end;
$$;

revoke all on function public.pipstart_submit_assessment_attempt(
  uuid, uuid, uuid, jsonb, integer, integer, boolean, jsonb
) from public, anon, authenticated;
grant execute on function public.pipstart_submit_assessment_attempt(
  uuid, uuid, uuid, jsonb, integer, integer, boolean, jsonb
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
    user_id,
    course_id,
    status,
    started_at,
    last_activity_at,
    completed_at
  ) values (
    requested_user_id,
    requested_course_id,
    case
      when course_complete then 'completed'::public.pipstart_enrollment_status
      else 'active'::public.pipstart_enrollment_status
    end,
    change_time,
    change_time,
    case when course_complete then change_time else null end
  )
  on conflict (user_id, course_id) do update set
    status = case
      when course_complete then 'completed'::public.pipstart_enrollment_status
      else 'active'::public.pipstart_enrollment_status
    end,
    completed_at = case
      when course_complete
        then coalesce(public.pipstart_enrollments.completed_at, change_time)
      else null
    end,
    last_activity_at = change_time;

  return course_complete;
end;
$$;

revoke all on function public.pipstart_reconcile_course_completion(
  uuid, text, text[], text[]
) from public, anon, authenticated;
grant execute on function public.pipstart_reconcile_course_completion(
  uuid, text, text[], text[]
) to service_role;

revoke execute on function public.pipstart_set_enrollment_completion(text, boolean)
  from authenticated;

commit;
