begin;

create table public.pipstart_assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null,
  quiz_version integer not null check (quiz_version > 0),
  attempt_number integer not null check (attempt_number > 0),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'submitted')),
  passing_percentage integer not null
    check (passing_percentage between 1 and 100),
  question_order jsonb not null check (jsonb_typeof(question_order) = 'array'),
  choice_order jsonb not null check (jsonb_typeof(choice_order) = 'object'),
  draft_answers jsonb not null default '{}'::jsonb
    check (jsonb_typeof(draft_answers) = 'object'),
  public_snapshot jsonb not null check (jsonb_typeof(public_snapshot) = 'object'),
  submitted_answers jsonb,
  score integer,
  max_score integer,
  passed boolean,
  submission_token uuid,
  review_snapshot jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  constraint pipstart_assessment_attempt_number_unique
    unique (user_id, quiz_id, quiz_version, attempt_number),
  constraint pipstart_assessment_score_valid
    check (
      score is null
      or (score >= 0 and max_score is not null and max_score > 0 and score <= max_score)
    ),
  constraint pipstart_assessment_submission_state_valid
    check (
      (
        status = 'in_progress'
        and submitted_answers is null
        and score is null
        and max_score is null
        and passed is null
        and submission_token is null
        and review_snapshot is null
        and submitted_at is null
      )
      or
      (
        status = 'submitted'
        and submitted_answers is not null
        and score is not null
        and max_score is not null
        and passed is not null
        and submission_token is not null
        and review_snapshot is not null
        and submitted_at is not null
      )
    )
);

create unique index pipstart_assessment_one_active_attempt_idx
  on public.pipstart_assessment_attempts (user_id, quiz_id, quiz_version)
  where status = 'in_progress';

create unique index pipstart_assessment_submission_token_idx
  on public.pipstart_assessment_attempts (user_id, submission_token)
  where submission_token is not null;

create index pipstart_assessment_history_idx
  on public.pipstart_assessment_attempts (user_id, quiz_id, started_at desc);

alter table public.pipstart_assessment_attempts enable row level security;

create policy "Learners can read their own assessment attempts"
  on public.pipstart_assessment_attempts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.pipstart_assessment_attempts
  from public, anon, authenticated;
grant select (
  id,
  user_id,
  quiz_id,
  quiz_version,
  attempt_number,
  status,
  passing_percentage,
  question_order,
  choice_order,
  draft_answers,
  public_snapshot,
  submitted_answers,
  score,
  max_score,
  passed,
  review_snapshot,
  started_at,
  updated_at,
  submitted_at
) on public.pipstart_assessment_attempts to authenticated;

create or replace function public.pipstart_guard_submitted_assessment_attempt()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'submitted' then
    raise exception 'Submitted assessment attempts are immutable.'
      using errcode = '55000';
  end if;
  return new;
end;
$$;

create trigger pipstart_guard_submitted_assessment_attempt
before update on public.pipstart_assessment_attempts
for each row execute function public.pipstart_guard_submitted_assessment_attempt();

revoke all on function public.pipstart_guard_submitted_assessment_attempt()
  from public, anon, authenticated;

create or replace function public.pipstart_start_assessment_attempt(
  requested_user_id uuid,
  requested_quiz_id text,
  requested_quiz_version integer,
  requested_passing_percentage integer,
  requested_question_order jsonb,
  requested_choice_order jsonb,
  requested_public_snapshot jsonb
)
returns setof public.pipstart_assessment_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_attempt public.pipstart_assessment_attempts%rowtype;
  next_attempt_number integer;
begin
  if requested_user_id is null
    or requested_quiz_id is null
    or length(requested_quiz_id) = 0
    or requested_quiz_version <= 0
    or requested_passing_percentage not between 1 and 100
    or jsonb_typeof(requested_question_order) <> 'array'
    or jsonb_array_length(requested_question_order) = 0
    or jsonb_typeof(requested_choice_order) <> 'object'
    or jsonb_typeof(requested_public_snapshot) <> 'object'
  then
    raise exception 'Invalid assessment attempt request.' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      requested_user_id::text || ':' || requested_quiz_id || ':' || requested_quiz_version::text,
      0
    )
  );

  select *
    into current_attempt
    from public.pipstart_assessment_attempts
   where user_id = requested_user_id
     and quiz_id = requested_quiz_id
     and quiz_version = requested_quiz_version
     and status = 'in_progress'
   for update;

  if found then
    return next current_attempt;
    return;
  end if;

  select coalesce(max(attempt_number), 0) + 1
    into next_attempt_number
    from public.pipstart_assessment_attempts
   where user_id = requested_user_id
     and quiz_id = requested_quiz_id
     and quiz_version = requested_quiz_version;

  insert into public.pipstart_assessment_attempts (
    user_id,
    quiz_id,
    quiz_version,
    attempt_number,
    passing_percentage,
    question_order,
    choice_order,
    public_snapshot
  ) values (
    requested_user_id,
    requested_quiz_id,
    requested_quiz_version,
    next_attempt_number,
    requested_passing_percentage,
    requested_question_order,
    requested_choice_order,
    requested_public_snapshot
  )
  returning * into current_attempt;

  return next current_attempt;
end;
$$;

create or replace function public.pipstart_save_assessment_draft(
  requested_user_id uuid,
  requested_attempt_id uuid,
  requested_answers jsonb
)
returns setof public.pipstart_assessment_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_attempt public.pipstart_assessment_attempts%rowtype;
  change_time timestamptz := now();
begin
  if requested_user_id is null
    or requested_attempt_id is null
    or jsonb_typeof(requested_answers) <> 'object'
  then
    raise exception 'Invalid assessment draft request.' using errcode = '22023';
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
  if current_attempt.status <> 'in_progress' then
    raise exception 'Submitted assessment attempts are immutable.'
      using errcode = '55000';
  end if;

  update public.pipstart_assessment_attempts
     set draft_answers = requested_answers,
         updated_at = change_time
   where id = requested_attempt_id
  returning * into current_attempt;

  return next current_attempt;
end;
$$;

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

  return next current_attempt;
end;
$$;

revoke all on function public.pipstart_start_assessment_attempt(
  uuid, text, integer, integer, jsonb, jsonb, jsonb
) from public, anon, authenticated;
revoke all on function public.pipstart_save_assessment_draft(
  uuid, uuid, jsonb
) from public, anon, authenticated;
revoke all on function public.pipstart_submit_assessment_attempt(
  uuid, uuid, uuid, jsonb, integer, integer, boolean, jsonb
) from public, anon, authenticated;

grant execute on function public.pipstart_start_assessment_attempt(
  uuid, text, integer, integer, jsonb, jsonb, jsonb
) to service_role;
grant execute on function public.pipstart_save_assessment_draft(
  uuid, uuid, jsonb
) to service_role;
grant execute on function public.pipstart_submit_assessment_attempt(
  uuid, uuid, uuid, jsonb, integer, integer, boolean, jsonb
) to service_role;

commit;
