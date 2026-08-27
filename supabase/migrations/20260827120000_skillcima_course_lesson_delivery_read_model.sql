-- Skillcima five-day course lesson delivery read model.
--
-- Recipient information is released only for a processing
-- course_day_1..course_day_5 job whose enrolment is currently
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
    'course_day_5'
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
  'Releases recipient data for a processing five-day course lesson email only when the owning enrolment is currently confirmed and deliverable.';

revoke all
  on function public.skillcima_prepare_course_lesson_email(uuid)
  from public, anon, authenticated;

grant execute
  on function public.skillcima_prepare_course_lesson_email(uuid)
  to service_role;