# M21 step 3: independent delivery-sweep watchdog

Prepared against `00e78b2b5e437d0b600017a8586a516ca5429d3a`.
This patch adds an optional Healthchecks.io heartbeat after a successfully
persisted delivery sweep. It creates no schedule, migration, account or secret.

## What changes

The existing sweep route delegates to `handleWatchedDeliverySweep`, which calls
the unchanged step-two handler. Only its completed HTTP 200 result qualifies for
a success heartbeat. Configuration failures, rejected authorization, database
errors, partial sends and deferred work do not ping. A blank configuration leaves
the integration disabled during rollout; it does not block the working sweep.

Set the server-only Vercel Production secret
`PIPSTART_EMAIL_MONITOR_HEARTBEAT_URL` to the check's canonical
`https://hc-ping.com/<uuid>` URL. Treat the entire URL as a credential. Do not
reuse a Resend key, webhook secret or sweep bearer secret. Do not put it in Git,
SQL Editor, cron commands, public variables, screenshots or chat. Store a copy
in the operator's password manager. No Vault change is required for this patch.

The implementation accepts only the exact HTTPS UUID endpoint on hc-ping.com:
no userinfo, custom host/port, query, fragment, suffix, slug or auto-provisioning.
It sends one empty POST, omits credentials and referrer, refuses redirects, and
uses a three-second timeout. No learner address, user ID, event ID, reset link,
token, email body, API key, sweep secret or run summary is sent. Healthchecks will
still see normal transport metadata such as the Vercel outbound IP and time.

The reply must be HTTP 200 and its bounded body must contain exactly OK after
trimming whitespace. Healthchecks can respond 200 with OK (not found) or
OK (rate limited) without recording a success; those count as heartbeat failure.
Only constant diagnostic codes are logged. A heartbeat error never changes the
already-completed sweep response or database counters and does not retry sending
provider alerts. The external service can alert when these heartbeats stop.

## Healthchecks.io setup (operator-owned; gated separately)

1. Create/use one Hobbyist account and a PipStart project. Current verified
   pricing is $0/month, up to 20 checks and 100 log entries per check. This is not
   a contractual lifetime price guarantee. One check suffices here.
2. Create one check named PipStart production delivery sweep. Use a Simple
   schedule: Period 5 minutes, Grace Time 10 minutes. It goes Down roughly
   15 minutes after the last accepted success ping, allowing minor delays.
3. Attach and verify the email notification integration for
   `pipstartalert2026@gmail.com`. Confirm it is enabled for this check and that
   its test notification reaches Gmail. Do not assume account signup alone
   verifies the alert recipient or attaches an integration.
4. Save the check's UUID-based Ping URL in the password manager and the exact
   Vercel Production secret above. Do not share it with the assistant. If the
   check is automatically pinged by an example or manual test, it can become
   armed before the patch is deployed; keep it paused during setup if needed,
   and explicitly unpause only for the production acceptance steps.
5. Apply the externally saved patch locally and pass all checks. Obtain separate
   commit/push authorization. Redeploy this new commit with the heartbeat URL
   present. Do not change or recreate the existing five-minute Supabase job,
   working sweep bearer secret, Vault value, SMTP key or Resend webhook.
6. Unpause the Healthchecks check and inspect at least three five-minute pings
   together with cron, HTTP and sweep records. Confirm pings have no body data.
   A successful internal sweep does not itself prove the external ping arrived.
7. Test Down and recovery on a separate temporary Healthchecks check: use the
   same verified notification integration, a short test period/grace, send one
   test heartbeat, allow it to lapse, confirm the Down alert in Gmail, then send
   another and confirm recovery. Do NOT pause the real learner webhook or real
   sweep, break SMTP/Resend, leak a production ping URL, or send /fail to the
   production check to force an alert. A separate check is not full end-to-end
   outage proof for the production check; record that boundary honestly.

No live outage drill or account setup is performed by applying this patch.
Do not call all Milestone 21 work complete on heartbeat evidence alone.

## Limits

This is a sweep-completion watchdog, not an inbox test or a provider probe. It
detects missing successful pings, which can result from the scheduler, Vercel,
Supabase, database access, configuration or network failing. Healthchecks failure
can also cause apparent downtime. A completed sweep with zero due alerts can
still ping while Resend is down: no provider call was required. Missing callbacks
for both sent and delivered, and pre-provider Auth/SMTP failures, remain outside
this detector. It is not automatic provider failover or security-email resending.

Completed sweeps may skip already-leased or manual-review work; therefore a ping
is not proof the entire alert queue is empty or every alert reached the operator.
Inspect the existing pending/manual counters separately. Notification delivery
and the operator's Gmail are additional dependencies. The Healthchecks service
sends notifications without using PipStart's Resend credentials; this does not
guarantee that the two vendors have no shared infrastructure dependencies.

The original endpoint has a 60-second maximum. This patch adds at most the
bounded three-second heartbeat request after completion, not a new scheduler.
Database work remains subject to the original route's execution limit. A crash
after completion but before heartbeat can correctly produce a missing ping.

For one success ping every five minutes, the free check's 100-entry log retains
about 8 hours 20 minutes of pings. Older entries roll out; monitoring continues.
Healthchecks history is not a replacement for the existing database run ledger.

## Verification and rollback

Unit tests cover the URL allowlist, no body/credentials, durable completion
ordering, rejection and partial-work boundaries, timeout, redirect refusal,
provider-error isolation, exact response validation and constant-only logging.
All network calls in local tests are mocked. No real check is pinged by tests.
No dependency/lockfile, SQL schema, SMTP, course, UI or existing schedule changes
are included. User-side acceptance must include all monitoring tests, the full
serial unit suite, full lint, type-check and normal production build.

If rolling back, pause the external Healthchecks check first to avoid expected
missing-ping noise, then revert only this watchdog application change through
the normal reviewed patch/deployment workflow. The pre-watchdog 00e78b2 sweep
continues running but does not ping. Do not disable Supabase's working job or
delete monitoring records to roll back an optional heartbeat. Preserve the
secret securely; deleting/rotating a Healthchecks check invalidates its Ping URL.

## Official references checked 19 October 2026

- https://healthchecks.io/docs/http_api/
- https://healthchecks.io/docs/configuring_checks/
- https://healthchecks.io/docs/configuring_notifications/
- https://healthchecks.io/pricing/
- https://healthchecks.io/terms/
