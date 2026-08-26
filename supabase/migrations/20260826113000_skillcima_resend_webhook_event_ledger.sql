-- Skillcima Resend webhook event ledger.
--
-- Stores minimal authenticated provider event evidence so Resend
-- retries and manual replays can be handled idempotently.
--
-- This migration deliberately does NOT:
-- - suppress an email address
-- - change newsletter consent
-- - change course enrolment state
-- - store the full webhook payload
--
-- Historical migrations remain unchanged.


create table public.resend_webhook_events (
  id uuid primary key default gen_random_uuid(),

  provider_event_id text not null,

  event_type text not null,

  provider_message_id text not null,

  email_job_id uuid
    references public.email_jobs(id)
    on delete set null,

  provider_created_at timestamptz,

  received_at timestamptz not null default now(),

  created_at timestamptz not null default now(),

  constraint resend_webhook_events_provider_event_id_check
    check (
      provider_event_id = btrim(provider_event_id)
      and char_length(provider_event_id) between 1 and 200
    ),

  constraint resend_webhook_events_event_type_check
    check (
      event_type in (
        'email.bounced',
        'email.complained'
      )
    ),

  constraint resend_webhook_events_provider_message_id_check
    check (
      provider_message_id = btrim(provider_message_id)
      and char_length(provider_message_id) between 1 and 200
    ),

  constraint resend_webhook_events_provider_event_id_unique
    unique (provider_event_id)
);


comment on table public.resend_webhook_events is
  'Durable minimal ledger of authenticated Resend deliverability webhook events. Provider event identity is unique so retries and manual replays can be processed idempotently.';

comment on column public.resend_webhook_events.provider_event_id is
  'Authenticated Svix message identifier from the svix-id webhook header. Used as the durable event idempotency key.';

comment on column public.resend_webhook_events.event_type is
  'Authenticated Resend event type. This ledger currently accepts only email.bounced and email.complained.';

comment on column public.resend_webhook_events.provider_message_id is
  'Resend email identifier from authenticated event data.email_id. Used to correlate the event to email_jobs.provider_message_id.';

comment on column public.resend_webhook_events.email_job_id is
  'Skillcima email job matched through provider_message_id when correlation is available. Null means authenticated provider evidence exists but no matching Skillcima job was found.';

comment on column public.resend_webhook_events.provider_created_at is
  'Provider event creation timestamp when supplied in the authenticated Resend webhook payload.';

comment on column public.resend_webhook_events.received_at is
  'Timestamp when Skillcima first persisted the authenticated webhook event.';


create index resend_webhook_events_provider_message_id_index
  on public.resend_webhook_events (
    provider_message_id
  );

create index resend_webhook_events_email_job_id_index
  on public.resend_webhook_events (
    email_job_id
  )
  where email_job_id is not null;

create index resend_webhook_events_event_type_received_at_index
  on public.resend_webhook_events (
    event_type,
    received_at desc
  );


alter table public.resend_webhook_events
  enable row level security;

revoke all privileges
  on table public.resend_webhook_events
  from public, anon, authenticated;

grant select, insert
  on table public.resend_webhook_events
  to service_role;


create or replace function public.skillcima_record_resend_webhook_event(
  p_provider_event_id text,
  p_event_type text,
  p_provider_message_id text,
  p_provider_created_at timestamptz
)
returns table (
  result_status text,
  result_event_id uuid,
  result_email_job_id uuid
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_provider_event_id text;
  v_event_type text;
  v_provider_message_id text;

  v_existing record;
  v_email_job_id uuid;
  v_inserted_id uuid;
begin
  if p_provider_event_id is null then
    raise exception 'RESEND_WEBHOOK_EVENT_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  v_provider_event_id :=
    btrim(p_provider_event_id);

  if char_length(v_provider_event_id)
       not between 1 and 200 then
    raise exception 'RESEND_WEBHOOK_EVENT_ID_INVALID'
      using errcode = 'P0001';
  end if;


  if p_event_type is null then
    raise exception 'RESEND_WEBHOOK_EVENT_TYPE_REQUIRED'
      using errcode = 'P0001';
  end if;

  v_event_type :=
    btrim(p_event_type);

  if v_event_type not in (
    'email.bounced',
    'email.complained'
  ) then
    raise exception 'RESEND_WEBHOOK_EVENT_TYPE_INVALID'
      using errcode = 'P0001';
  end if;


  if p_provider_message_id is null then
    raise exception 'RESEND_PROVIDER_MESSAGE_ID_REQUIRED'
      using errcode = 'P0001';
  end if;

  v_provider_message_id :=
    btrim(p_provider_message_id);

  if char_length(v_provider_message_id)
       not between 1 and 200 then
    raise exception 'RESEND_PROVIDER_MESSAGE_ID_INVALID'
      using errcode = 'P0001';
  end if;


  select ej.id
  into v_email_job_id
  from public.email_jobs ej
  where
    ej.provider_message_id =
      v_provider_message_id;


  insert into public.resend_webhook_events (
    provider_event_id,
    event_type,
    provider_message_id,
    email_job_id,
    provider_created_at
  )
  values (
    v_provider_event_id,
    v_event_type,
    v_provider_message_id,
    v_email_job_id,
    p_provider_created_at
  )
  on conflict (provider_event_id)
  do nothing
  returning id
  into v_inserted_id;


  if v_inserted_id is not null then
    return query
    select
      'recorded'::text,
      v_inserted_id,
      v_email_job_id;

    return;
  end if;


  select
    rwe.id,
    rwe.event_type,
    rwe.provider_message_id,
    rwe.email_job_id,
    rwe.provider_created_at
  into v_existing
  from public.resend_webhook_events rwe
  where
    rwe.provider_event_id =
      v_provider_event_id;


  if
    v_existing.event_type
      is distinct from
      v_event_type

    or

    v_existing.provider_message_id
      is distinct from
      v_provider_message_id

    or

    v_existing.provider_created_at
      is distinct from
      p_provider_created_at
  then
    return query
    select
      'event_mismatch'::text,
      v_existing.id,
      v_existing.email_job_id;

    return;
  end if;


  return query
  select
    'already_recorded'::text,
    v_existing.id,
    v_existing.email_job_id;
end;
$$;


comment on function
  public.skillcima_record_resend_webhook_event(
    text,
    text,
    text,
    timestamptz
  ) is
  'Idempotently records minimal authenticated Resend bounce or complaint evidence. The Svix event identifier is the durable replay key. No suppression, consent, or course state is mutated.';


revoke all
  on function
    public.skillcima_record_resend_webhook_event(
      text,
      text,
      text,
      timestamptz
    )
  from public, anon, authenticated;

grant execute
  on function
    public.skillcima_record_resend_webhook_event(
      text,
      text,
      text,
      timestamptz
    )
  to service_role;