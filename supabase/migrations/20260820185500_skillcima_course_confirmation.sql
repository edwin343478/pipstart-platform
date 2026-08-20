create or replace function public.skillcima_confirm_course(
  p_confirmation_token_hash text
)
returns table (
  result_status text,
  result_enrolment_id uuid,
  result_course_slug text,
  result_confirmed_at timestamptz
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_enrolment record;
  v_now timestamptz := now();
begin
  if p_confirmation_token_hash is null
     or p_confirmation_token_hash !~ '^[0-9a-f]{64}$' then
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

  if v_enrolment.status <> 'pending_confirmation' then
    return query
    select
      'invalid_enrolment_state'::text,
      v_enrolment.id::uuid,
      v_enrolment.course_slug::text,
      null::timestamptz;

    return;
  end if;

  if v_enrolment.confirmation_expires_at is null
     or v_enrolment.confirmation_expires_at <= v_now then
    return query
    select
      'expired'::text,
      v_enrolment.id::uuid,
      v_enrolment.course_slug::text,
      null::timestamptz;

    return;
  end if;

  update public.course_enrolments
  set
    status = 'confirmed',
    confirmed_at = v_now,
    updated_at = v_now
  where id = v_enrolment.id;

  return query
  select
    'confirmed'::text,
    v_enrolment.id::uuid,
    v_enrolment.course_slug::text,
    v_now::timestamptz;
end;
$$;

comment on function public.skillcima_confirm_course(
  text
) is
  'Atomically confirms a pending Skillcima course enrolment from its server-computed confirmation-token hash. Expired or non-deliverable enrolments fail closed, and confirmed enrolments remain idempotently recognizable. Raw confirmation tokens are never stored.';

revoke all
  on function public.skillcima_confirm_course(
    text
  )
  from public, anon, authenticated;

grant execute
  on function public.skillcima_confirm_course(
    text
  )
  to service_role;
