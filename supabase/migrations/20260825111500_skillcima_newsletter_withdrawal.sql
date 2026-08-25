-- Skillcima educational-newsletter consent withdrawal.
--
-- Newsletter consent is independent from requested course delivery.
-- This function records an append-only withdrawal event and never
-- changes course_enrolments.status.
--
-- The lead row is locked first so concurrent unsubscribe requests
-- serialize safely and cannot create duplicate withdrawal events.

create or replace function public.skillcima_withdraw_newsletter_consent(
  p_lead_id uuid,
  p_withdrawal_method text,
  p_privacy_notice_version text,
  p_consent_wording text,
  p_consent_wording_version text,
  p_landing_page_version text
)
returns table (
  result_status text,
  result_lead_id uuid,
  result_enrolment_id uuid,
  result_consent_event_id uuid,
  result_withdrawn_at timestamptz
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_lead_id uuid;
  v_latest public.consent_events%rowtype;
  v_event_id uuid;
  v_withdrawn_at timestamptz;
begin
  if p_lead_id is null then
    raise exception 'NEWSLETTER_LEAD_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  if p_withdrawal_method is null
     or p_withdrawal_method not in (
       'unsubscribe_link',
       'preference_center',
       'support_request'
     ) then
    raise exception 'NEWSLETTER_WITHDRAWAL_METHOD_INVALID'
      using errcode = 'P0001';
  end if;

  if p_privacy_notice_version is null
     or char_length(btrim(p_privacy_notice_version)) = 0 then
    raise exception 'NEWSLETTER_PRIVACY_VERSION_REQUIRED'
      using errcode = 'P0001';
  end if;

  if p_consent_wording is null
     or char_length(btrim(p_consent_wording)) = 0 then
    raise exception 'NEWSLETTER_WITHDRAWAL_WORDING_REQUIRED'
      using errcode = 'P0001';
  end if;

  if p_consent_wording_version is null
     or char_length(btrim(p_consent_wording_version)) = 0 then
    raise exception 'NEWSLETTER_WITHDRAWAL_WORDING_VERSION_REQUIRED'
      using errcode = 'P0001';
  end if;

  if p_landing_page_version is null
     or char_length(btrim(p_landing_page_version)) = 0 then
    raise exception 'NEWSLETTER_LANDING_PAGE_VERSION_REQUIRED'
      using errcode = 'P0001';
  end if;

  -- Serialize newsletter-state transitions for this lead.
  select l.id
  into v_lead_id
  from public.leads l
  where l.id = p_lead_id
  for update;

  if not found then
    return query
    select
      'not_found'::text,
      null::uuid,
      null::uuid,
      null::uuid,
      null::timestamptz;

    return;
  end if;

  select ce.*
  into v_latest
  from public.consent_events ce
  where ce.lead_id = p_lead_id
    and ce.category = 'educational_newsletter'
  order by ce.occurred_at desc, ce.id desc
  limit 1;

  if not found
     or v_latest.action = 'requested' then
    return query
    select
      'not_subscribed'::text,
      v_lead_id,
      null::uuid,
      null::uuid,
      null::timestamptz;

    return;
  end if;

  if v_latest.action = 'withdrawn' then
    return query
    select
      'already_withdrawn'::text,
      v_lead_id,
      v_latest.enrolment_id,
      v_latest.id,
      v_latest.occurred_at;

    return;
  end if;

  if v_latest.action <> 'granted' then
    return query
    select
      'invalid_consent_state'::text,
      v_lead_id,
      v_latest.enrolment_id,
      v_latest.id,
      null::timestamptz;

    return;
  end if;

  v_withdrawn_at := now();

  insert into public.consent_events (
    lead_id,
    enrolment_id,
    category,
    action,
    privacy_notice_version,
    consent_wording,
    consent_wording_version,
    landing_page_version,
    source_campaign,
    occurred_at,
    withdrawal_method
  )
  values (
    v_lead_id,
    v_latest.enrolment_id,
    'educational_newsletter',
    'withdrawn',
    btrim(p_privacy_notice_version),
    btrim(p_consent_wording),
    btrim(p_consent_wording_version),
    btrim(p_landing_page_version),
    v_latest.source_campaign,
    v_withdrawn_at,
    p_withdrawal_method
  )
  returning id
  into v_event_id;

  return query
  select
    'withdrawn'::text,
    v_lead_id,
    v_latest.enrolment_id,
    v_event_id,
    v_withdrawn_at;
end;
$$;

comment on function public.skillcima_withdraw_newsletter_consent(
  uuid,
  text,
  text,
  text,
  text,
  text
) is
  'Atomically records an append-only withdrawal of Skillcima educational-newsletter consent. Replays are idempotently recognizable and course-delivery enrolment state is never modified.';

revoke all
  on function public.skillcima_withdraw_newsletter_consent(
    uuid,
    text,
    text,
    text,
    text,
    text
  )
  from public, anon, authenticated;

grant execute
  on function public.skillcima_withdraw_newsletter_consent(
    uuid,
    text,
    text,
    text,
    text,
    text
  )
  to service_role;