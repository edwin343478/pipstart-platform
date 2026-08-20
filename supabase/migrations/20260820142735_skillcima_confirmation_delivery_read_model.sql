create or replace function public.skillcima_prepare_confirmation_email(
  p_job_id uuid,
  p_confirmation_token_hash text,
  p_confirmation_expires_at timestamptz
)
returns table (
  result_status text,
  result_email text,
  result_first_name text,
  result_course_slug text,
  result_enrolment_id uuid,
  result_confirmation_expires_at timestamptz
)
language plpgsql
volatile
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

  if p_confirmation_token_hash is null
     or p_confirmation_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'CONFIRMATION_TOKEN_HASH_INVALID'
      using errcode = 'P0001';
  end if;

  if p_confirmation_expires_at is null
     or p_confirmation_expires_at <= now() then
    raise exception 'CONFIRMATION_EXPIRY_INVALID'
      using errcode = 'P0001';
  end if;

  select
    ej.job_type,
    ej.status as job_status,
    ej.enrolment_id,

    ce.status as enrolment_status,
    ce.course_slug,
    ce.confirmation_token_hash,
    ce.confirmation_expires_at,
    ce.confirmation_sent_at,

    l.email,
    l.first_name
  into v_job
  from public.email_jobs ej
  join public.course_enrolments ce
    on ce.id = ej.enrolment_id
  join public.leads l
    on l.id = ce.lead_id
  where ej.id = p_job_id
  for update of ej, ce;

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

  if v_job.job_type <> 'course_confirmation' then
    return query
    select
      'invalid_job_type'::text,
      null::text,
      null::text,
      null::text,
      v_job.enrolment_id,
      null::timestamptz;

    return;
  end if;

  if v_job.job_status <> 'processing' then
    return query
    select
      'invalid_job_state'::text,
      null::text,
      null::text,
      null::text,
      v_job.enrolment_id,
      v_job.confirmation_expires_at;

    return;
  end if;

  if v_job.enrolment_status = 'confirmed' then
    return query
    select
      'already_confirmed'::text,
      null::text,
      null::text,
      v_job.course_slug,
      v_job.enrolment_id,
      v_job.confirmation_expires_at;

    return;
  end if;

  if v_job.enrolment_status in (
    'unsubscribed',
    'suppressed'
  ) then
    return query
    select
      'not_deliverable'::text,
      null::text,
      null::text,
      v_job.course_slug,
      v_job.enrolment_id,
      v_job.confirmation_expires_at;

    return;
  end if;

  if v_job.enrolment_status <> 'pending_confirmation' then
    return query
    select
      'invalid_enrolment_state'::text,
      null::text,
      null::text,
      v_job.course_slug,
      v_job.enrolment_id,
      v_job.confirmation_expires_at;

    return;
  end if;

  if v_job.confirmation_token_hash is null then
    update public.course_enrolments
    set
      confirmation_token_hash =
        p_confirmation_token_hash,
      confirmation_expires_at =
        p_confirmation_expires_at,
      updated_at = now()
    where id = v_job.enrolment_id;

    v_job.confirmation_token_hash :=
      p_confirmation_token_hash;

    v_job.confirmation_expires_at :=
      p_confirmation_expires_at;

  elsif v_job.confirmation_token_hash
        <> p_confirmation_token_hash then
    return query
    select
      'token_mismatch'::text,
      null::text,
      null::text,
      v_job.course_slug,
      v_job.enrolment_id,
      v_job.confirmation_expires_at;

    return;

  elsif v_job.confirmation_expires_at is null then
    update public.course_enrolments
    set
      confirmation_expires_at =
        p_confirmation_expires_at,
      updated_at = now()
    where id = v_job.enrolment_id;

    v_job.confirmation_expires_at :=
      p_confirmation_expires_at;
  end if;

  return query
  select
    'prepared'::text,
    v_job.email::text,
    v_job.first_name::text,
    v_job.course_slug::text,
    v_job.enrolment_id::uuid,
    v_job.confirmation_expires_at::timestamptz;
end;
$$;

comment on function public.skillcima_prepare_confirmation_email(
  uuid,
  text,
  timestamptz
) is
  'Prepares server-side delivery data for a claimed Skillcima course-confirmation email. The first confirmation-token hash is preserved across retries and raw tokens are never stored.';

revoke all
  on function public.skillcima_prepare_confirmation_email(
    uuid,
    text,
    timestamptz
  )
  from public, anon, authenticated;

grant execute
  on function public.skillcima_prepare_confirmation_email(
    uuid,
    text,
    timestamptz
  )
  to service_role;
