-- Skillcima server-only Data API privileges.
--
-- Browser-facing roles intentionally receive no privileges.
-- The Cloudflare Worker authenticates through Supabase's
-- protected server-side secret and operates as service_role.
--
-- RLS remains enabled on all Skillcima lead tables.

grant usage on schema public to service_role;

-- Lead identity lifecycle:
-- Worker needs to find, create and update normalized leads.
grant select, insert, update
on table public.leads
to service_role;

-- Course enrolment lifecycle:
-- Worker needs to create, inspect and update enrolment state.
grant select, insert, update
on table public.course_enrolments
to service_role;

-- Durable submission/idempotency ledger:
-- Worker needs to create, inspect and update submission state.
grant select, insert, update
on table public.lead_submissions
to service_role;

-- Consent evidence is append-oriented.
-- Worker may insert and retrieve records, but does not need
-- update or delete privileges.
grant select, insert
on table public.consent_events
to service_role;

-- Defence in depth:
-- browser API roles must not have direct table privileges.
revoke all privileges
on table public.leads
from anon, authenticated;

revoke all privileges
on table public.course_enrolments
from anon, authenticated;

revoke all privileges
on table public.lead_submissions
from anon, authenticated;

revoke all privileges
on table public.consent_events
from anon, authenticated;
