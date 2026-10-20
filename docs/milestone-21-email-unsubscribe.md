# M21 optional email unsubscribe

Prepared against 664af5975aa8a7d79ac672706ca60ad3e1cbb13b. PipStart only.

## Scope and owner direction

The owner removed the separate selected-country eligibility implementation step.
No country lookup, country gate, ad-targeting consent record, or IP-geolocation
assumption is added. Defaults and campaign exposure are not proof of consent.
Applicable sending requirements remain separate from this technical feature.
This patch does not send optional emails, activate campaigns or create jobs.

Learning emails, partner offers sent by PipStart, and all optional emails are
the three unsubscribe scopes. Auth/password reset/security notices and operator
alerts are unaffected. Existing OFF choices are not migrated or overwritten.

## Recipient flow

Future optional emails must be prepared through prepareOptionalEmail. It adds
category and all-optional links to both HTML and text bodies, plus the category
List-Unsubscribe and List-Unsubscribe-Post headers. Its production URLs are
fixed HTTPS pipstart.net URLs, not a user-controlled host. It refuses disabled
preferences or failed token issuance. It is NOT a sender or a complete send-time
suppression engine. All future actual optional senders must use this envelope
and recheck preferences/suppression immediately before provider dispatch; queued
work must not bypass an opt-out. No existing auth message is passed through it.

GET /unsubscribe?token=... shows a confirmation form without changing state.
HEAD also never changes state. A human confirms with a native HTML POST; email
clients may directly POST List-Unsubscribe=One-Click with URL-encoded or multipart
form data, with no login, cookie or Authorization requirement and no redirect.
This follows the endpoint/header pattern in RFC 8058:
https://www.rfc-editor.org/rfc/rfc8058
Actual email one-click visibility/deliverability is not certified here: the
production provider must DKIM-sign the relevant headers and controlled outbound
message headers must be checked before optional sending launches.

The exact public route bypasses session refresh in the existing proxy so it
cannot require login or alter browser Auth. All other routes retain existing
session handling. Static HTML uses no script or third-party asset. Responses
are no-store, no-referrer, noindex/nofollow, nosniff and frame-denied. Bodies are
stream-limited to 2 KiB; invalid/ambiguous tokens, extra fields, duplicate keys,
unsupported types, malformed UTF-8 and unsupported methods fail before mutation.
Failures never report success, redirect a one-click POST, reveal email addresses,
or log raw tokens/database errors in application code.

## Capabilities and database

Each link uses a random 256-bit opaque token. Only SHA-256 hashes are stored;
tokens contain no email, user ID or category. Service-only security-definer RPCs
issue, look up and apply capabilities. Anonymous/authenticated roles cannot
execute them or access the token table directly; the public route is the only
supported token-to-RPC boundary. The service role has RPC execution but no direct
token-table grant. No new signing key or environment secret is introduced.

URLs are bearer capabilities: anyone holding a forwarded link can opt out the
original recipient for its bound scope. Account deletion cascades tokens/history.
Tokens intentionally do not expire while the account exists, so old email links
remain useful. They must be treated as secrets in provider/access logs and kept
out of analytics, screenshots and support transcripts. App code does not log
them, but hosting access logs may contain request URLs; this patch does not claim
to redact third-party platform logs or implement their retention/access policy.
There is no public token-issue endpoint and no email/address enumeration API.

Unsubscribe locks the learner's preference row. Category scope preserves the
other category and frequency; all scope turns both categories OFF. A no-op replay
returns success without duplicate change history. If a learner later explicitly
resubscribes in account settings, an old link still opts out on a new request;
tokens are not marked consumed in a way that ignores the latest OFF request.
Settings updates, the existing settings history trigger, and a dedicated
unsubscribe event commit atomically or roll back together. Existing history
accurately labels this backend change system_change; the new owner-readable
event records the unsubscribe scope/time, not a fabricated human consent event.
Concurrent duplicate tokens/scopes serialize through the same preference row.

## Validation and release

Run pure protocol, envelope and adapter tests; full regressions; lint; production
typecheck/build; isolated generated-fixture SQL assertions; and two-connection
locking/idempotence tests. A real local browser/API gate must prove GET leaves
preferences unchanged, confirmation POST persists OFF without login, category
isolation, all-optional behavior, repeated POST success and account security
remaining usable. No existing/hosted learner fixtures are required for preparation.

The migration creates two new tables and three service-only functions. It does
not change existing preference defaults, values, auth email templates, providers,
Skillcima schema, monitoring jobs or secrets. Apply through CLI, preserve migration
history, separately authorize hosted application and commit/push, deploy only
reviewed files, then verify live with generated or operator-owned test accounts.
Do not reset databases or auto-roll back settings/history after a timeout.

Remaining after this patch: send-time suppression/queued-job enforcement, first
optional sender integration, provider DKIM/header checks, rate/abuse monitoring,
token-table growth/retention decisions, content/frequency caps and wider M21 work.
Until those send prerequisites are accepted, optional campaigns remain disabled.
