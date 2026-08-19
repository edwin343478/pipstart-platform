-- Skillcima atomic lead persistence.
--
-- Completes a previously reserved lead_submissions row by:
--   1. locking and validating the submission ledger row
--   2. creating/reusing the normalized lead
--   3. creating/reusing the Forex Foundations enrolment
--   4. appending the server-built consent evidence
--   5. marking the submission completed
--
-- The function is intentionally SECURITY INVOKER.
-- The calling service_role already has the minimum required
-- table privileges from the M4C.1 grants migration.

create or replace function public.skillcima_complete_lead_submission(
  p_submission_id uuid,
  p_request_fingerprint text,
  p_first_name text,
  p_email text,
  p_course_slug text,
  p_consent_events jsonb
)
returns table (
  result_lead_id uuid,
  result_enrolment_id uuid,
  result_status text,
  result_replayed boolean
)
language plpgsql
volatile
security invoker
set search_path = ''
as $function$
declare
  v_stored_fingerprint text;
  v_submission_status text;
  v_lead_id uuid;
  v_enrolment_id uuid;
begin
  if p_submission_id is null then
    raise exception 'SUBMISSION_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  if p_request_fingerprint is null
     or p_request_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'INVALID_REQUEST_FINGERPRINT'
      using errcode = 'P0001';
  end if;

  if p_email is null
     or p_email <> lower(btrim(p_email)) then
    raise exception 'EMAIL_NOT_NORMALIZED'
      using errcode = 'P0001';
  end if;

  if p_course_slug is null
     or char_length(btrim(p_course_slug)) = 0 then
    raise exception 'COURSE_SLUG_REQUIRED'
      using errcode = 'P0001';
  end if;

  if p_consent_events is null
     or jsonb_typeof(p_consent_events) <> 'array'
     or jsonb_array_length(p_consent_events) = 0 then
    raise exception 'CONSENT_EVENTS_REQUIRED'
      using errcode = 'P0001';
  end if;

  -- Every supplied consent item must contain the evidence fields
  -- required by public.consent_events.
  if exists (
    select 1
    from jsonb_array_elements(p_consent_events) as event
    where jsonb_typeof(event) <> 'object'
       or nullif(btrim(event ->> 'category'), '') is null
       or nullif(btrim(event ->> 'action'), '') is null
       or nullif(btrim(event ->> 'privacy_notice_version'), '') is null
       or nullif(btrim(event ->> 'consent_wording'), '') is null
       or nullif(btrim(event ->> 'consent_wording_version'), '') is null
       or nullif(btrim(event ->> 'landing_page_version'), '') is null
  ) then
    raise exception 'INVALID_CONSENT_EVENT'
      using errcode = 'P0001';
  end if;

  -- Current Skillcima microsite contract:
  -- course delivery is requested by submitting the enrolment;
  -- newsletter consent exists only when explicitly granted.
  -- Partner communications are not collected by this form.
  if exists (
    select 1
    from jsonb_to_recordset(p_consent_events) as event(
      category text,
      action text
    )
    where not (
      (
        event.category = 'course_delivery'
        and event.action = 'requested'
      )
      or
      (
        event.category = 'educational_newsletter'
        and event.action = 'granted'
      )
    )
  ) then
    raise exception 'UNSUPPORTED_CONSENT_EVENT'
      using errcode = 'P0001';
  end if;

  -- One event per consent category for one submission.
  if exists (
    select event.category
    from jsonb_to_recordset(p_consent_events) as event(
      category text
    )
    group by event.category
    having count(*) > 1
  ) then
    raise exception 'DUPLICATE_CONSENT_CATEGORY'
      using errcode = 'P0001';
  end if;

  -- Course delivery evidence must always exist exactly once.
  if not exists (
    select 1
    from jsonb_to_recordset(p_consent_events) as event(
      category text,
      action text
    )
    where event.category = 'course_delivery'
      and event.action = 'requested'
  ) then
    raise exception 'COURSE_DELIVERY_EVENT_REQUIRED'
      using errcode = 'P0001';
  end if;

  -- Lock the idempotency row. Concurrent requests using the same
  -- submission ID will serialize here.
  select
    submission.request_fingerprint,
    submission.status,
    submission.lead_id,
    submission.enrolment_id
  into
    v_stored_fingerprint,
    v_submission_status,
    v_lead_id,
    v_enrolment_id
  from public.lead_submissions as submission
  where submission.submission_id = p_submission_id
  for update;

  if not found then
    raise exception 'SUBMISSION_NOT_RESERVED'
      using errcode = 'P0001';
  end if;

  if v_stored_fingerprint <> p_request_fingerprint then
    raise exception 'SUBMISSION_CONFLICT'
      using errcode = 'P0001';
  end if;

  -- A completed identical submission is a safe replay.
  if v_submission_status = 'completed' then
    if v_lead_id is null or v_enrolment_id is null then
      raise exception 'COMPLETED_SUBMISSION_MISSING_RESULT'
        using errcode = 'P0001';
    end if;

    return query
    select
      v_lead_id,
      v_enrolment_id,
      'completed'::text,
      true;

    return;
  end if;

  if v_submission_status = 'rejected' then
    raise exception 'SUBMISSION_REJECTED'
      using errcode = 'P0001';
  end if;

  if v_submission_status not in (
    'received',
    'verified',
    'failed'
  ) then
    raise exception 'INVALID_SUBMISSION_STATUS'
      using errcode = 'P0001';
  end if;

  -- The RPC is only reached after successful Turnstile verification.
  -- If a later statement fails, this status update rolls back with it.
  update public.lead_submissions
  set
    status = 'verified',
    verified_at = coalesce(verified_at, now()),
    error_code = null
  where submission_id = p_submission_id;

  -- Reuse the normalized email identity.
  --
  -- If the existing lead has no name and the new request provides one,
  -- fill the missing value. Never overwrite an already stored name here.
  insert into public.leads as lead (
    first_name,
    email,
    source
  )
  values (
    nullif(btrim(p_first_name), ''),
    p_email,
    'skillcima'
  )
  on conflict (email)
  do update
  set
    first_name = coalesce(
      lead.first_name,
      excluded.first_name
    ),
    updated_at = now()
  returning lead.id
  into v_lead_id;

  -- Reuse the existing course enrolment if one already exists.
  -- Existing confirmed/unsubscribed/suppressed state is deliberately
  -- not reset by a duplicate or later lead-capture submission.
  insert into public.course_enrolments as enrolment (
    lead_id,
    course_slug,
    status
  )
  values (
    v_lead_id,
    p_course_slug,
    'pending_confirmation'
  )
  on conflict (lead_id, course_slug)
  do update
  set updated_at = now()
  returning enrolment.id
  into v_enrolment_id;

  -- Append the consent evidence assembled by the trusted Worker.
  insert into public.consent_events (
    lead_id,
    enrolment_id,
    category,
    action,
    privacy_notice_version,
    consent_wording,
    consent_wording_version,
    landing_page_version
  )
  select
    v_lead_id,
    v_enrolment_id,
    event.category,
    event.action,
    event.privacy_notice_version,
    event.consent_wording,
    event.consent_wording_version,
    event.landing_page_version
  from jsonb_to_recordset(p_consent_events) as event(
    category text,
    action text,
    privacy_notice_version text,
    consent_wording text,
    consent_wording_version text,
    landing_page_version text
  );

  update public.lead_submissions
  set
    status = 'completed',
    lead_id = v_lead_id,
    enrolment_id = v_enrolment_id,
    completed_at = now(),
    error_code = null
  where submission_id = p_submission_id;

  return query
  select
    v_lead_id,
    v_enrolment_id,
    'completed'::text,
    false;
end;
$function$;

comment on function public.skillcima_complete_lead_submission(
  uuid,
  text,
  text,
  text,
  text,
  jsonb
) is
  'Atomically completes a reserved Skillcima lead submission and returns the durable lead/enrolment result.';

-- Functions can receive broad EXECUTE privileges by default.
-- This RPC is server-only.
revoke all
on function public.skillcima_complete_lead_submission(
  uuid,
  text,
  text,
  text,
  text,
  jsonb
)
from public;

revoke all
on function public.skillcima_complete_lead_submission(
  uuid,
  text,
  text,
  text,
  text,
  jsonb
)
from anon, authenticated;

grant execute
on function public.skillcima_complete_lead_submission(
  uuid,
  text,
  text,
  text,
  text,
  jsonb
)
to service_role;
