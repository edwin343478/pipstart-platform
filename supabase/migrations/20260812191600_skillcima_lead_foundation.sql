-- Skillcima lead-capture database foundation.
--
-- This migration creates the durable data layer for:
--   1. leads
--   2. course enrolments
--   3. submission idempotency
--   4. consent audit events
--
-- Public browser access is intentionally denied by enabling RLS
-- without creating anon/authenticated policies.

create table public.leads (
  id uuid primary key default gen_random_uuid(),

  first_name text,
  email text not null,
  source text not null default 'skillcima',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint leads_first_name_length_check
    check (
      first_name is null
      or char_length(first_name) between 2 and 50
    ),

  constraint leads_email_length_check
    check (char_length(email) between 3 and 254),

  constraint leads_email_normalized_check
    check (email = lower(btrim(email))),

  constraint leads_source_check
    check (source = 'skillcima'),

  constraint leads_email_unique
    unique (email)
);

comment on table public.leads is
  'Normalized Skillcima lead identities. One row per normalized email address.';

comment on column public.leads.email is
  'Normalized lowercase email address. Raw unnormalized email is not stored.';


create table public.course_enrolments (
  id uuid primary key default gen_random_uuid(),

  lead_id uuid not null
    references public.leads(id)
    on delete cascade,

  course_slug text not null,

  status text not null default 'pending_confirmation',

  confirmation_token_hash text,
  confirmation_sent_at timestamptz,
  confirmation_expires_at timestamptz,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint course_enrolments_course_slug_length_check
    check (
      char_length(course_slug) between 1 and 100
    ),

  constraint course_enrolments_status_check
    check (
      status in (
        'pending_confirmation',
        'confirmed',
        'unsubscribed',
        'suppressed'
      )
    ),

  constraint course_enrolments_lead_course_unique
    unique (lead_id, course_slug)
);

comment on table public.course_enrolments is
  'One enrolment state per lead and course. Supports double opt-in confirmation.';

create unique index course_enrolments_confirmation_token_hash_unique
  on public.course_enrolments (confirmation_token_hash)
  where confirmation_token_hash is not null;

create index course_enrolments_status_index
  on public.course_enrolments (status);

create index course_enrolments_lead_id_index
  on public.course_enrolments (lead_id);


create table public.lead_submissions (
  submission_id uuid primary key,

  request_fingerprint text not null,

  status text not null default 'received',

  lead_id uuid
    references public.leads(id)
    on delete set null,

  enrolment_id uuid
    references public.course_enrolments(id)
    on delete set null,

  source_campaign text,

  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,

  error_code text,

  created_at timestamptz not null default now(),
  verified_at timestamptz,
  completed_at timestamptz,

  constraint lead_submissions_fingerprint_check
    check (
      request_fingerprint ~ '^[0-9a-f]{64}$'
    ),

  constraint lead_submissions_status_check
    check (
      status in (
        'received',
        'verified',
        'completed',
        'rejected',
        'failed'
      )
    )
);

comment on table public.lead_submissions is
  'Durable idempotency ledger keyed by the client-generated submission UUID.';

comment on column public.lead_submissions.request_fingerprint is
  'SHA-256 fingerprint of stable request data. Turnstile tokens must not be included.';

create index lead_submissions_created_at_index
  on public.lead_submissions (created_at);

create index lead_submissions_status_index
  on public.lead_submissions (status);


create table public.consent_events (
  id uuid primary key default gen_random_uuid(),

  lead_id uuid not null
    references public.leads(id)
    on delete cascade,

  enrolment_id uuid
    references public.course_enrolments(id)
    on delete set null,

  category text not null,
  action text not null,

  privacy_notice_version text not null,
  consent_wording text not null,
  consent_wording_version text not null,
  landing_page_version text not null,

  source_campaign text,

  occurred_at timestamptz not null default now(),

  withdrawal_method text,

  constraint consent_events_category_check
    check (
      category in (
        'course_delivery',
        'educational_newsletter',
        'partner_communications'
      )
    ),

  constraint consent_events_action_check
    check (
      action in (
        'requested',
        'granted',
        'withdrawn'
      )
    ),

  constraint consent_events_withdrawal_method_check
    check (
      withdrawal_method is null
      or withdrawal_method in (
        'unsubscribe_link',
        'preference_center',
        'support_request'
      )
    ),

  constraint consent_events_withdrawal_consistency_check
    check (
      (
        action = 'withdrawn'
        and withdrawal_method is not null
      )
      or
      (
        action <> 'withdrawn'
        and withdrawal_method is null
      )
    ),

  constraint consent_events_privacy_version_not_blank
    check (char_length(btrim(privacy_notice_version)) > 0),

  constraint consent_events_wording_not_blank
    check (char_length(btrim(consent_wording)) > 0),

  constraint consent_events_wording_version_not_blank
    check (char_length(btrim(consent_wording_version)) > 0),

  constraint consent_events_landing_page_version_not_blank
    check (char_length(btrim(landing_page_version)) > 0)
);

comment on table public.consent_events is
  'Append-only-style audit evidence for Skillcima consent and withdrawal events.';

create index consent_events_lead_id_index
  on public.consent_events (lead_id);

create index consent_events_enrolment_id_index
  on public.consent_events (enrolment_id);

create index consent_events_category_occurred_at_index
  on public.consent_events (category, occurred_at desc);


-- Enable Row Level Security on every table containing lead,
-- enrolment, submission or consent information.
--
-- No anon/authenticated policies are intentionally created here.

alter table public.leads
  enable row level security;

alter table public.course_enrolments
  enable row level security;

alter table public.lead_submissions
  enable row level security;

alter table public.consent_events
  enable row level security;