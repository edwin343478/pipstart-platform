-- Skillcima six-email course contract.
--
-- Days 1-5 remain the educational foundation.
-- Day 6 is the final course-journey invitation to continue on PipStart.
-- It is sent to every confirmed, deliverable learner and does not depend
-- on educational-newsletter consent.
--
-- Historical migrations remain unchanged.

alter table public.email_jobs
  drop constraint email_jobs_job_type_check;

alter table public.email_jobs
  add constraint email_jobs_job_type_check
  check (
    job_type in (
      'course_confirmation',
      'course_day_1',
      'course_day_2',
      'course_day_3',
      'course_day_4',
      'course_day_5',
      'course_day_6'
    )
  );

comment on column public.email_jobs.job_type is
  'Closed Skillcima email workflow type: course confirmation or course day 1 through day 6.';

-- Skillcima five-day course lesson delivery read model.
--
-- Recipient information is released only for a processing
-- course_day_1..course_day_6 job whose enrolment is currently
-- confirmed and has durable confirmed_at evidence.
--
-- This migration deliberately does NOT:
-- - create course-day jobs
-- - schedule course-day jobs
-- - send email
-- - change enrolment state
-- - infer newsletter or partner-marketing consent
-- - modify the existing confirmation delivery read model
--
-- Historical migrations remain unchanged.

create or replace function public.skillcima_prepare_course_lesson_email(
  p_job_id uuid
)
returns table (
  result_status text,
  result_email text,
  result_first_name text,
  result_course_slug text,
  result_enrolment_id uuid,
  result_confirmed_at timestamptz
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_job record;
begin
  if p_job_id is null then
    raise exception 'EMAIL_JOB_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  select
    ej.job_type,
    ej.status as job_status,
    ej.enrolment_id,

    ce.status as enrolment_status,
    ce.course_slug,
    ce.confirmed_at,

    l.email,
    l.first_name
  into v_job
  from public.email_jobs ej
  join public.course_enrolments ce
    on ce.id = ej.enrolment_id
  join public.leads l
    on l.id = ce.lead_id
  where ej.id = p_job_id;

  if not found then
    return query
    select
      'not_found'::text,
      null::text,
      null::text,
      null::text,
      null::uuid,
      null::timestamptz;

    return;
  end if;

  if v_job.job_type not in (
    'course_day_1',
    'course_day_2',
    'course_day_3',
    'course_day_4',
    'course_day_5',
    'course_day_6'
  ) then
    return query
    select
      'invalid_job_type'::text,
      null::text,
      null::text,
      v_job.course_slug::text,
      v_job.enrolment_id::uuid,
      v_job.confirmed_at::timestamptz;

    return;
  end if;

  if v_job.job_status <> 'processing' then
    return query
    select
      'invalid_job_state'::text,
      null::text,
      null::text,
      v_job.course_slug::text,
      v_job.enrolment_id::uuid,
      v_job.confirmed_at::timestamptz;

    return;
  end if;

  if v_job.enrolment_status in (
    'suppressed',
    'unsubscribed'
  ) then
    return query
    select
      'not_deliverable'::text,
      null::text,
      null::text,
      v_job.course_slug::text,
      v_job.enrolment_id::uuid,
      v_job.confirmed_at::timestamptz;

    return;
  end if;

  if v_job.enrolment_status = 'pending_confirmation' then
    return query
    select
      'not_confirmed'::text,
      null::text,
      null::text,
      v_job.course_slug::text,
      v_job.enrolment_id::uuid,
      null::timestamptz;

    return;
  end if;

  if v_job.enrolment_status <> 'confirmed' then
    return query
    select
      'invalid_enrolment_state'::text,
      null::text,
      null::text,
      v_job.course_slug::text,
      v_job.enrolment_id::uuid,
      v_job.confirmed_at::timestamptz;

    return;
  end if;

  if v_job.confirmed_at is null then
    return query
    select
      'invalid_confirmation_state'::text,
      null::text,
      null::text,
      v_job.course_slug::text,
      v_job.enrolment_id::uuid,
      null::timestamptz;

    return;
  end if;

  return query
  select
    'prepared'::text,
    v_job.email::text,
    v_job.first_name::text,
    v_job.course_slug::text,
    v_job.enrolment_id::uuid,
    v_job.confirmed_at::timestamptz;
end;
$$;

comment on function
  public.skillcima_prepare_course_lesson_email(uuid) is
  'Releases recipient data for a processing six-email course lesson only when the owning enrolment is currently confirmed and deliverable.';

revoke all
  on function public.skillcima_prepare_course_lesson_email(uuid)
  from public, anon, authenticated;

grant execute
  on function public.skillcima_prepare_course_lesson_email(uuid)
  to service_role;

create or replace function public.skillcima_schedule_six_email_course(
  p_enrolment_id uuid
)
returns table(
  result_status text,
  result_created_count integer,
  result_total_count integer,
  result_confirmed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_enrolment record;
  v_submission_id uuid;
  v_created_count integer := 0;
  v_total_count integer := 0;
begin
  if p_enrolment_id is null then
    raise exception 'COURSE_ENROLMENT_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  select
    ce.id,
    ce.course_slug,
    ce.status,
    ce.confirmed_at
  into v_enrolment
  from public.course_enrolments ce
  where ce.id = p_enrolment_id
  for update;

  if not found then
    return query
    select
      'not_found'::text,
      0::integer,
      0::integer,
      null::timestamptz;
    return;
  end if;

  if v_enrolment.course_slug <> 'forex-foundations' then
    return query
    select
      'unsupported_course'::text,
      0::integer,
      0::integer,
      v_enrolment.confirmed_at::timestamptz;
    return;
  end if;

  if v_enrolment.status in (
    'unsubscribed',
    'suppressed'
  ) then
    return query
    select
      'not_deliverable'::text,
      0::integer,
      0::integer,
      null::timestamptz;
    return;
  end if;

  if v_enrolment.status <> 'confirmed' then
    return query
    select
      'not_confirmed'::text,
      0::integer,
      0::integer,
      null::timestamptz;
    return;
  end if;

  if v_enrolment.confirmed_at is null then
    return query
    select
      'invalid_confirmation_state'::text,
      0::integer,
      0::integer,
      null::timestamptz;
    return;
  end if;

  select ej.initial_submission_id
  into v_submission_id
  from public.email_jobs ej
  where ej.enrolment_id = p_enrolment_id
    and ej.job_type = 'course_confirmation'
  limit 1;

  if not found then
    return query
    select
      'confirmation_job_not_found'::text,
      0::integer,
      0::integer,
      v_enrolment.confirmed_at::timestamptz;
    return;
  end if;

  insert into public.email_jobs (
    enrolment_id,
    initial_submission_id,
    job_type,
    status,
    available_at
  )
  values
    (
      p_enrolment_id,
      v_submission_id,
      'course_day_1',
      'pending',
      v_enrolment.confirmed_at
    ),
    (
      p_enrolment_id,
      v_submission_id,
      'course_day_2',
      'pending',
      v_enrolment.confirmed_at + interval '1 day'
    ),
    (
      p_enrolment_id,
      v_submission_id,
      'course_day_3',
      'pending',
      v_enrolment.confirmed_at + interval '2 days'
    ),
    (
      p_enrolment_id,
      v_submission_id,
      'course_day_4',
      'pending',
      v_enrolment.confirmed_at + interval '3 days'
    ),
    (
      p_enrolment_id,
      v_submission_id,
      'course_day_5',
      'pending',
      v_enrolment.confirmed_at + interval '4 days'
    ),
    (
      p_enrolment_id,
      v_submission_id,
      'course_day_6',
      'pending',
      v_enrolment.confirmed_at + interval '5 days'
    )
  on conflict (enrolment_id, job_type)
  do nothing;

  get diagnostics
    v_created_count = row_count;

  select count(*)::integer
  into v_total_count
  from public.email_jobs ej
  where ej.enrolment_id = p_enrolment_id
    and ej.job_type in (
      'course_day_1',
      'course_day_2',
      'course_day_3',
      'course_day_4',
      'course_day_5',
      'course_day_6'
    );

  if v_total_count <> 6 then
    raise exception 'COURSE_LESSON_SCHEDULE_INCOMPLETE'
      using errcode = 'P0001';
  end if;

  return query
  select
    case
      when v_created_count = 0
        then 'already_scheduled'::text
      else 'scheduled'::text
    end,
    v_created_count,
    v_total_count,
    v_enrolment.confirmed_at::timestamptz;
end;
$function$;

revoke all
on function public.skillcima_schedule_six_email_course(uuid)
from public;

revoke all
on function public.skillcima_schedule_six_email_course(uuid)
from anon;

revoke all
on function public.skillcima_schedule_six_email_course(uuid)
from authenticated;

grant execute
on function public.skillcima_schedule_six_email_course(uuid)
to service_role;

create or replace function public.skillcima_confirm_course(
  p_confirmation_token_hash text
)
returns table(
  result_status text,
  result_enrolment_id uuid,
  result_course_slug text,
  result_confirmed_at timestamptz
)
language plpgsql
set search_path = ''
as $function$
declare
  v_enrolment record;
  v_now timestamptz := now();

  v_schedule_status text;
  v_schedule_created integer;
  v_schedule_total integer;
begin
  if p_confirmation_token_hash is null
    or p_confirmation_token_hash !~ '^[0-9a-f]{64}$'
  then
    raise exception 'CONFIRMATION_TOKEN_HASH_INVALID'
      using errcode = 'P0001';
  end if;

  select
    ce.id,
    ce.course_slug,
    ce.status,
    ce.confirmation_expires_at,
    ce.confirmed_at
  into v_enrolment
  from public.course_enrolments ce
  where ce.confirmation_token_hash =
    p_confirmation_token_hash
  for update;

  if not found then
    return query
    select
      'not_found'::text,
      null::uuid,
      null::text,
      null::timestamptz;
    return;
  end if;

  /*
   * Preserve the existing replay contract.
   *
   * Important:
   * existing confirmed enrolments are NOT
   * retroactively enrolled into the six-email
   * sequence by a confirmation replay.
   */
  if v_enrolment.status = 'confirmed' then
    return query
    select
      'already_confirmed'::text,
      v_enrolment.id::uuid,
      v_enrolment.course_slug::text,
      v_enrolment.confirmed_at::timestamptz;
    return;
  end if;

  if v_enrolment.status in (
    'unsubscribed',
    'suppressed'
  ) then
    return query
    select
      'not_deliverable'::text,
      v_enrolment.id::uuid,
      v_enrolment.course_slug::text,
      null::timestamptz;
    return;
  end if;

  if v_enrolment.status <>
    'pending_confirmation'
  then
    return query
    select
      'invalid_enrolment_state'::text,
      v_enrolment.id::uuid,
      v_enrolment.course_slug::text,
      null::timestamptz;
    return;
  end if;

  if v_enrolment.confirmation_expires_at is null
    or v_enrolment.confirmation_expires_at <= v_now
  then
    return query
    select
      'expired'::text,
      v_enrolment.id::uuid,
      v_enrolment.course_slug::text,
      null::timestamptz;
    return;
  end if;

  /*
   * First perform the existing confirmation
   * transition.
   */
  update public.course_enrolments
  set
    status = 'confirmed',
    confirmed_at = v_now,
    updated_at = v_now
  where id = v_enrolment.id;

  /*
   * Then schedule all six lesson jobs inside
   * this SAME PostgreSQL transaction.
   *
   * For a fresh confirmation we require all
   * five rows to be newly created.
   *
   * Any partial/pre-existing schedule therefore
   * fails closed instead of silently accepting
   * potentially incorrect timing.
   */
  select
    schedule_result.result_status,
    schedule_result.result_created_count,
    schedule_result.result_total_count
  into
    v_schedule_status,
    v_schedule_created,
    v_schedule_total
  from public.skillcima_schedule_six_email_course(
    v_enrolment.id
  ) as schedule_result;

  if v_schedule_status <> 'scheduled'
    or v_schedule_created <> 6
    or v_schedule_total <> 6
  then
    raise exception
      'COURSE_LESSON_SCHEDULE_FAILED:%',
      coalesce(
        v_schedule_status,
        'unknown'
      )
      using errcode = 'P0001';
  end if;

  return query
  select
    'confirmed'::text,
    v_enrolment.id::uuid,
    v_enrolment.course_slug::text,
    v_now::timestamptz;
end;
$function$;

-- The confirmation function now calls the six-email scheduler.
drop function public.skillcima_schedule_five_day_course_emails(uuid);
