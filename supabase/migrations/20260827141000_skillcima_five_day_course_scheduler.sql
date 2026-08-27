create or replace function public.skillcima_schedule_five_day_course_emails(
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
      'course_day_5'
    );

  if v_total_count <> 5 then
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
on function public.skillcima_schedule_five_day_course_emails(uuid)
from public;

revoke all
on function public.skillcima_schedule_five_day_course_emails(uuid)
from anon;

revoke all
on function public.skillcima_schedule_five_day_course_emails(uuid)
from authenticated;

grant execute
on function public.skillcima_schedule_five_day_course_emails(uuid)
to service_role;
