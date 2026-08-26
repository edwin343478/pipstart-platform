-- Skillcima newsletter unsubscribe-token read model.
--
-- A token belongs to one exact educational_newsletter/granted consent event.
-- Raw unsubscribe tokens are never stored. Only SHA-256 token hashes are kept.
--
-- Old grant tokens must never withdraw consent granted again later.
-- skillcima_withdraw_newsletter_by_token therefore verifies the token's
-- grant is still the latest newsletter grant while holding the lead lock.

create table public.newsletter_unsubscribe_tokens (
  consent_event_id uuid primary key
    references public.consent_events(id)
    on delete restrict,

  token_hash text not null,

  prepared_at timestamptz not null default now(),

  constraint newsletter_unsubscribe_tokens_token_hash_check
    check (token_hash ~ '^[0-9a-f]{64}$')
);

create unique index newsletter_unsubscribe_tokens_token_hash_unique
  on public.newsletter_unsubscribe_tokens (token_hash);

comment on table public.newsletter_unsubscribe_tokens is
  'Server-only hashed unsubscribe-token bindings for exact Skillcima educational-newsletter grant events.';

alter table public.newsletter_unsubscribe_tokens
  enable row level security;

revoke all
  on table public.newsletter_unsubscribe_tokens
  from public, anon, authenticated;

grant select, insert
  on table public.newsletter_unsubscribe_tokens
  to service_role;


create or replace function public.skillcima_prepare_newsletter_unsubscribe_token(
  p_consent_event_id uuid,
  p_token_hash text
)
returns table (
  result_status text,
  result_lead_id uuid,
  result_enrolment_id uuid,
  result_consent_event_id uuid,
  result_prepared_at timestamptz
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_grant public.consent_events%rowtype;
  v_token public.newsletter_unsubscribe_tokens%rowtype;
begin
  if p_consent_event_id is null then
    raise exception 'NEWSLETTER_UNSUBSCRIBE_CONSENT_EVENT_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  if p_token_hash is null
     or p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'NEWSLETTER_UNSUBSCRIBE_TOKEN_HASH_INVALID'
      using errcode = 'P0001';
  end if;

  select ce.*
  into v_grant
  from public.consent_events ce
  where ce.id = p_consent_event_id;

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

  if v_grant.category <> 'educational_newsletter'
     or v_grant.action <> 'granted' then
    return query
    select
      'invalid_grant'::text,
      v_grant.lead_id,
      v_grant.enrolment_id,
      v_grant.id,
      null::timestamptz;

    return;
  end if;

  begin
    insert into public.newsletter_unsubscribe_tokens (
      consent_event_id,
      token_hash
    )
    values (
      v_grant.id,
      p_token_hash
    )
    on conflict (consent_event_id) do nothing
    returning *
    into v_token;
  exception
    when unique_violation then
      return query
      select
        'token_conflict'::text,
        v_grant.lead_id,
        v_grant.enrolment_id,
        v_grant.id,
        null::timestamptz;

      return;
  end;

  if v_token.consent_event_id is not null then
    return query
    select
      'prepared'::text,
      v_grant.lead_id,
      v_grant.enrolment_id,
      v_grant.id,
      v_token.prepared_at;

    return;
  end if;

  select nut.*
  into v_token
  from public.newsletter_unsubscribe_tokens nut
  where nut.consent_event_id = v_grant.id;

  if not found then
    return query
    select
      'unavailable'::text,
      v_grant.lead_id,
      v_grant.enrolment_id,
      v_grant.id,
      null::timestamptz;

    return;
  end if;

  if v_token.token_hash <> p_token_hash then
    return query
    select
      'token_mismatch'::text,
      v_grant.lead_id,
      v_grant.enrolment_id,
      v_grant.id,
      v_token.prepared_at;

    return;
  end if;

  return query
  select
    'already_prepared'::text,
    v_grant.lead_id,
    v_grant.enrolment_id,
    v_grant.id,
    v_token.prepared_at;
end;
$$;

comment on function public.skillcima_prepare_newsletter_unsubscribe_token(
  uuid,
  text
) is
  'Idempotently stores the hash of a deterministic unsubscribe token for one exact Skillcima newsletter grant event.';

revoke all
  on function public.skillcima_prepare_newsletter_unsubscribe_token(
    uuid,
    text
  )
  from public, anon, authenticated;

grant execute
  on function public.skillcima_prepare_newsletter_unsubscribe_token(
    uuid,
    text
  )
  to service_role;


create or replace function public.skillcima_withdraw_newsletter_by_token(
  p_token_hash text,
  p_privacy_notice_version text,
  p_consent_wording text,
  p_consent_wording_version text,
  p_landing_page_version text
)
returns table (
  result_status text,
  result_lead_id uuid,
  result_enrolment_id uuid,
  result_grant_consent_event_id uuid,
  result_withdrawal_consent_event_id uuid,
  result_withdrawn_at timestamptz
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_grant public.consent_events%rowtype;
  v_latest_grant public.consent_events%rowtype;
  v_latest_event public.consent_events%rowtype;

  v_withdrawal_event_id uuid;
  v_withdrawn_at timestamptz;
begin
  if p_token_hash is null
     or p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'NEWSLETTER_UNSUBSCRIBE_TOKEN_HASH_INVALID'
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

  select ce.*
  into v_grant
  from public.newsletter_unsubscribe_tokens nut
  join public.consent_events ce
    on ce.id = nut.consent_event_id
  where nut.token_hash = p_token_hash;

  if not found then
    return query
    select
      'not_found'::text,
      null::uuid,
      null::uuid,
      null::uuid,
      null::uuid,
      null::timestamptz;

    return;
  end if;

  if v_grant.category <> 'educational_newsletter'
     or v_grant.action <> 'granted' then
    return query
    select
      'invalid_token_state'::text,
      v_grant.lead_id,
      v_grant.enrolment_id,
      v_grant.id,
      null::uuid,
      null::timestamptz;

    return;
  end if;

  -- Serialize consent-state transitions for this lead.
  perform 1
  from public.leads l
  where l.id = v_grant.lead_id
  for update;

  if not found then
    return query
    select
      'not_found'::text,
      null::uuid,
      null::uuid,
      null::uuid,
      null::uuid,
      null::timestamptz;

    return;
  end if;

  -- Critical stale-token protection:
  -- the token's grant must still be the latest newsletter grant.
  select ce.*
  into v_latest_grant
  from public.consent_events ce
  where ce.lead_id = v_grant.lead_id
    and ce.category = 'educational_newsletter'
    and ce.action = 'granted'
  order by ce.occurred_at desc, ce.id desc
  limit 1;

  if not found
     or v_latest_grant.id <> v_grant.id then
    return query
    select
      'stale'::text,
      v_grant.lead_id,
      v_grant.enrolment_id,
      v_grant.id,
      null::uuid,
      null::timestamptz;

    return;
  end if;

  select ce.*
  into v_latest_event
  from public.consent_events ce
  where ce.lead_id = v_grant.lead_id
    and ce.category = 'educational_newsletter'
  order by ce.occurred_at desc, ce.id desc
  limit 1;

  if not found then
    return query
    select
      'invalid_consent_state'::text,
      v_grant.lead_id,
      v_grant.enrolment_id,
      v_grant.id,
      null::uuid,
      null::timestamptz;

    return;
  end if;

  if v_latest_event.action = 'withdrawn' then
    return query
    select
      'already_withdrawn'::text,
      v_grant.lead_id,
      v_grant.enrolment_id,
      v_grant.id,
      v_latest_event.id,
      v_latest_event.occurred_at;

    return;
  end if;

  if v_latest_event.action <> 'granted'
     or v_latest_event.id <> v_grant.id then
    return query
    select
      'invalid_consent_state'::text,
      v_grant.lead_id,
      v_grant.enrolment_id,
      v_grant.id,
      v_latest_event.id,
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
    v_grant.lead_id,
    v_grant.enrolment_id,
    'educational_newsletter',
    'withdrawn',
    btrim(p_privacy_notice_version),
    btrim(p_consent_wording),
    btrim(p_consent_wording_version),
    btrim(p_landing_page_version),
    v_grant.source_campaign,
    v_withdrawn_at,
    'unsubscribe_link'
  )
  returning id
  into v_withdrawal_event_id;

  return query
  select
    'withdrawn'::text,
    v_grant.lead_id,
    v_grant.enrolment_id,
    v_grant.id,
    v_withdrawal_event_id,
    v_withdrawn_at;
end;
$$;

comment on function public.skillcima_withdraw_newsletter_by_token(
  text,
  text,
  text,
  text,
  text
) is
  'Atomically withdraws Skillcima newsletter consent only when the supplied hashed unsubscribe token still belongs to the latest newsletter grant. Old subscription-cycle tokens fail as stale.';

revoke all
  on function public.skillcima_withdraw_newsletter_by_token(
    text,
    text,
    text,
    text,
    text
  )
  from public, anon, authenticated;

grant execute
  on function public.skillcima_withdraw_newsletter_by_token(
    text,
    text,
    text,
    text,
    text
  )
  to service_role;
