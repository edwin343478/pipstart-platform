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
   * retroactively enrolled into the five-day
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
   * Then schedule all five lesson jobs inside
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
  from public.skillcima_schedule_five_day_course_emails(
    v_enrolment.id
  ) as schedule_result;

  if v_schedule_status <> 'scheduled'
    or v_schedule_created <> 5
    or v_schedule_total <> 5
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
