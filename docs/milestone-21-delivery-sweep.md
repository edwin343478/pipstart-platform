# M21 monitoring step 2 — delivery-confirmation timeout and alert recovery

Prepared 19 October 2026 against `5a46810eebf93d2f42b132221e19096261a4ba5b`.
This patch is a foundation for a scheduled sweep. Preparing/applying it locally does not activate any schedule or change hosted settings.

## Verified step-one baseline

Commit `5a46810` is deployed on Vercel Production. Hosted migration `20261019130000` is recorded, and history was verified up to date. The owner confirmed reset/password-changed mail, production signed `sent`/`delivered` callback recording, an operational bounce alert at `pipstartalert2026@gmail.com`, replay response `already_alerted`, and only one Gmail alert. Operator-mail callbacks correctly return `ignored`. Preserve the current SMTP settings, webhook signing secret, sending key, and seven selected webhook events.

## What this adds

- A separate server-only POST endpoint: `https://pipstart.net/api/internal/email-monitor/sweep`.
- A dedicated bearer secret, `PIPSTART_EMAIL_MONITOR_SWEEP_SECRET`, consisting of exactly 64 lowercase hexadecimal characters (32 random bytes). Do not reuse the Resend webhook secret, API key or Supabase key. Missing/invalid configuration fails closed; wrong/missing authorization is rejected before database activity.
- A 15-minute **observation** threshold for messages with a recorded `email.sent` or `email.delivery_delayed` callback but no terminal callback. The clock starts at database receipt, not a provider-controlled/replayed event timestamp.
- A warning named `email.delivery_missing`, stored in the private alert queue, not fabricated as a provider event. Terminal events are `delivered`, `failed`, `bounced`, `complained` and `suppressed`; any excludes a missing-delivery warning.
- Pending timeout warnings are resolved when terminal evidence arrives. The claim function rechecks evidence before leasing; the next sweep also marks already-alerted warnings resolved. A callback arriving after the final claim check can race with a send already in flight, so no system can retroactively prevent that warning. Nothing automatically resends a learner email or sends a recovery notification.
- A bounded queue drainer for pending alerts of all five types, including failed/ambiguous sends from step one. It keeps the original one-minute lease and 23-hour automatic retry cutoff. Retry bodies and idempotency keys for existing alert types match the deployed webhook byte for byte; regression tests enforce this contract.
- Private `pipstart_email_monitor_sweeps` run records with aggregate counters only, plus `resolved_at` on alerts. RLS and service-role-only access remain required.

No existing application file is edited by this additive patch. The new migration replaces only the existing claim RPC to add timeout-resolution handling; four failure types retain their original behavior. The working webhook handler, templates, SMTP, learner UI, consent, course data and Skillcima pipeline are unchanged.

## Limits and interpretation

Each invocation queues at most 100 new timeout warnings and examines at most five pending alerts. It stops starting sends after 35 seconds, uses an eight-second send timeout, and has a 60-second route ceiling. Deferred or failed rows remain durable for a later sweep. This is intentionally bounded for launch traffic; sustained failure bursts can create a backlog and require review, not a guarantee of instant alerts.

A completed sweep may skip rows that another callback/process already leased or accepted. A partial sweep returns 503 and records partial counters when possible. If the process crashes, an unfinished run and the existing expiring row leases remain evidence. Manual-review alerts older than the 23-hour retry window are not automatically sent again.

Missing delivery evidence is **not proof of failed email delivery**: callbacks can be delayed or lost. Inspect provider Sending logs and webhook attempts before acting. An eventual `delivered` event means receiving-server acceptance, not inbox placement; the operator's Gmail receipt remains a separate acceptance check.

The detector examines the existing retained ledger, so activation may find older unresolved messages. Review candidates before first activation. It does not see SMTP/Auth failures with no provider callback, and cannot detect emails whose `sent` AND terminal callbacks are both lost. It does not implement synthetic password resets, canaries, provider fallback, hourly-rate alarms, independent monitoring-outage alerts or complete M21 engagement sending.

The same Resend provider still sends operational alerts. A provider outage can block those alerts. Run records enable inspection, but a stopped scheduler/database cannot email an alert about itself. An independently hosted watchdog remains a later requirement; this patch must not be described as full outage coverage.

## Local acceptance

Use the supplied external application script. It checks and applies only this patch, runs the two monitoring suites, the full unit suite with two workers (unchanged assertions/timeouts), lint, type-check, normal production build and the isolated database harness. The harness creates a strictly named temporary local database, applies both monitoring migrations, runs step-one and step-two SQL assertions, and removes only that temporary database. It sends no emails and does not touch the local PipStart database, hosted database or migration history. Docker and local Supabase must be running.

Review the output before a hosted push. Do not reset databases or run history repair. Do not commit/push this second patch until separately authorized. Any failure leaves the applied source intact; stop and share output rather than reapplying blindly.

## Hosted activation — separate gated steps, NOT performed by this patch

1. Confirm only `20261019160000_pipstart_email_delivery_sweep.sql` is pending using CLI migration list and `db push --dry-run`. Apply through the CLI after review, not as an untracked SQL Editor schema change. Verify history and permissions after application.
2. Generate a new 32-byte random secret locally. Store it in Vercel Production as `PIPSTART_EMAIL_MONITOR_SWEEP_SECRET` (Secret) and in Supabase Vault under `pipstart_email_monitor_sweep_secret`. Do not put its value in Git, chat, screenshots, scheduler SQL text, `.env` examples, query history or logs. The setup helper will be provided separately; do not invent/paste a secret into this document.
3. Obtain separate commit/push authorization, then deploy the six reviewed step-two files. Preserve the existing webhook, provider API key and alert destination. No Vercel cron configuration is added.
4. Check GET returns 405 and an unsigned/wrong-bearer POST returns 401 when the new configuration is present. Use one authenticated manual sweep, inspecting database counters first; never create fake production provider events to force a warning.
5. After explicit activation review, enable `pg_cron` and `pg_net` in the existing hosted project. Read-only inspection confirmed both are available but disabled; Vault is already enabled. Use their supported extension schemas (`pg_net` in `extensions`) and do not drop/recreate existing extensions or schedules.
6. Create one distinct cron job, planned name `pipstart-email-delivery-sweep-v1`, running `*/5 * * * *`. Its SQL should call `net.http_post` on the exact production endpoint, using a Vault lookup at execution for the bearer header and an empty JSON body. Set an HTTP timeout compatible with the 60-second endpoint. Review a conflicting job name instead of overwriting it. The activation script is deliberately not included or run yet.
7. Verify cron history AND HTTP response AND application run counters. A successful `pg_net` SQL enqueue is not proof that the HTTP callback ran or succeeded. Confirm runs at five-minute intervals, then repeat real-email delivery and duplicate-alert regressions. Timeout/retry fault scenarios should first be exercised in isolated local tests, not by disabling the live learner webhook or breaking SMTP credentials.

Vercel Hobby's native cron is limited to daily invocation, hence the separate Supabase schedule. Scheduling is production configuration, not a new recurring chat automation. No user-facing reminders are created.

## Safe operational queries (admin SQL Editor, read only)

```sql
select started_at, finished_at, status, queued, accepted, skipped, failed, deferred
from public.pipstart_email_monitor_sweeps
order by started_at desc limit 20;

select event_type, count(*) as pending,
       count(*) filter(where first_attempt_at < now()-interval '23 hours') as manual_review
from public.pipstart_account_email_alerts
where accepted_at is null and resolved_at is null
group by event_type;
```

Do not share `net.http_request_queue` contents: they can include Authorization headers. Do not print Vault values or full cron command text with embedded secrets. Run records and cron history grow over time; review storage monthly. No automatic deletion/retention change is included.

## Rollback

If activated, disable only the named PipStart sweep job; do not disable `pg_cron` itself (that deletes all jobs). Revert the step-two application deployment if needed. Keep the additive database structures and existing step-one migration in place for evidence and working webhook compatibility. Do not delete alert rows, clear leases, or alter retry timestamps to force sends. Never remove or modify the existing Skillcima webhook/job as part of rollback.

## References checked 19 October 2026

- [Vercel cron limits](https://vercel.com/docs/cron-jobs/usage-and-pricing).
- [Supabase Cron](https://supabase.com/docs/guides/cron) and [quickstart](https://supabase.com/docs/guides/cron/quickstart).
- [Supabase scheduling with pg_net and Vault](https://supabase.com/docs/guides/functions/schedule-functions).
- [pg_net permissions, timeouts and response retention](https://supabase.com/docs/guides/database/extensions/pg_net).
