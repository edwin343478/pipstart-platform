-- Skillcima active educational-newsletter grant read model.
--
-- Resolves the latest newsletter consent state for one lead.
-- If the latest state is an active grant, returns the exact grant event
-- together with the recipient data needed by the trusted Worker.
--
-- This function never mutates consent state and never exposes data to
-- anonymous or authenticated browser roles.

create or replace function public.skillcima_get_active_newsletter_grant(
  p_lead_id uuid
)
returns table (
  result_status text,
  result_lead_id uuid,
  result_enrolment_id uuid,
  result_grant_consent_event_id uuid,
  result_email text,
  result_first_name text,
  result_granted_at timestamptz
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_lead public.leads%rowtype;
  v_latest public.consent_events%rowtype;
begin
  if p_lead_id is null then
    raise exception 'NEWSLETTER_LEAD_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  select l.*
  into v_lead
  from public.leads l
  where l.id = p_lead_id;

  if not found then
    return query
    select
      'not_found'::text,
      null::uuid,
      null::uuid,
      null::uuid,
      null::text,
      null::text,
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

  if not found then
    return query
    select
      'not_subscribed'::text,
      v_lead.id,
      null::uuid,
      null::uuid,
      null::text,
      null::text,
      null::timestamptz;

    return;
  end if;

  if v_latest.action = 'withdrawn' then
    return query
    select
      'not_subscribed'::text,
      v_lead.id,
      v_latest.enrolment_id,
      null::uuid,
      null::text,
      null::text,
      null::timestamptz;

    return;
  end if;

  if v_latest.action <> 'granted' then
    return query
    select
      'invalid_consent_state'::text,
      v_lead.id,
      v_latest.enrolment_id,
      v_latest.id,
      null::text,
      null::text,
      null::timestamptz;

    return;
  end if;

  return query
  select
    'active'::text,
    v_lead.id,
    v_latest.enrolment_id,
    v_latest.id,
    v_lead.email,
    v_lead.first_name,
    v_latest.occurred_at;
end;
$$;

comment on function public.skillcima_get_active_newsletter_grant(
  uuid
) is
  'Returns the exact currently active Skillcima educational-newsletter grant event and recipient data for trusted server-side delivery preparation.';

revoke all
  on function public.skillcima_get_active_newsletter_grant(
    uuid
  )
  from public, anon, authenticated;

grant execute
  on function public.skillcima_get_active_newsletter_grant(
    uuid
  )
  to service_role;
