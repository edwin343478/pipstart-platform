# M21 account-email delivery monitoring — step 1

Prepared 19 October 2026. Code patch only; not deployed or connected.

## Scope and current acceptance

The owner has confirmed real-inbox password recovery, old-password rejection/new-password acceptance, and receipt of the native password-changed notice. Keep Supabase custom SMTP and the enabled native notice unchanged. Keep signup confirmation and welcome emails disabled. No learner UI or templates change in this patch.

This step adds a signed Resend webhook on PipStart's Vercel app, a private append-only event ledger and leased, idempotent operator alerts to **pipstartalert2026@gmail.com**. It does not repurpose Skillcima's webhook or tables: those correlate events to Skillcima jobs, not Supabase Auth SMTP sends.

Only sender `no-reply@account.pipstart.net` is monitored. Other brands and the distinct alert sender `ops-alerts@account.pipstart.net` are ignored to prevent alert recursion. Do not change the SMTP sender without updating this boundary and tests. Tracking/open/click events are ignored; enabling email tracking is unnecessary.

Recorded events: sent, delivered, delivery_delayed, failed, bounced, complained, suppressed. Immediate alert attempts occur for the last four. Delays are evidence for review, not immediate failure alerts. `sent` is not `delivered`; `delivered` means the receiving server accepted the message, not that Gmail placed it in the inbox. Each event remains separate, so out-of-order callbacks cannot erase a failure with an older success.

## Apply and verify locally first

1. Apply the supplied patch with `git apply --check` then `git apply`. No existing source files are replaced. Do not commit yet.
2. Run `pnpm --filter pipstart test -- src/lib/email-monitor/monitor.test.ts`, `pnpm --filter pipstart lint`, `pnpm --filter pipstart typecheck`, and `pnpm --filter pipstart build`.
3. Start local Supabase. Apply only the new migration locally through your usual migration workflow. Do not run a database reset or blindly push every pending migration to hosted Supabase.
4. Execute `apps/pipstart/scripts/test-m21-email-monitor.sql` on the LOCAL database with `psql -v ON_ERROR_STOP=1`. The test rolls back its fixtures. Separately check concurrent connections: one claim must return `leased`, the other `busy`.
5. Review results before applying this exact additive migration to hosted Supabase. No recipient emails, HTML, subjects, passwords, recovery links, raw payloads, provider errors or auth tokens enter the monitoring tables/logs. Table access and RPC execution are service-role only, with RLS and no learner policies.

## Production activation (not done by preparing this patch)

1. After database verification, apply `20261019130000_pipstart_account_email_monitor.sql` to the correct hosted PipStart project. Keep an audit of the migration result.
2. In Resend create a **new endpoint**, preserving any existing Skillcima endpoint:
   `https://pipstart.net/api/webhooks/resend`
   Subscribe to the seven events listed above. Initially disabled if the dashboard allows; otherwise failures will be retried while configuration is completed. Copy its `whsec_...` signing secret privately.
3. In Resend create a dedicated **sending-only**, domain-restricted API key for `account.pipstart.net` for operational alerts. Do not replace the SMTP API key or share either secret in chat.
4. Add these Vercel **Production** environment variables:

   | Name                             | Value/type                            |
   | -------------------------------- | ------------------------------------- |
   | `PIPSTART_RESEND_WEBHOOK_SECRET` | New endpoint signing secret; Secret   |
   | `PIPSTART_ALERT_RESEND_API_KEY`  | Dedicated sending key; Secret         |
   | `PIPSTART_OPERATIONAL_ALERT_TO`  | `pipstartalert2026@gmail.com`; Config |

   Existing Supabase URL and server-only secret remain necessary. Never prefix server secrets with `NEXT_PUBLIC_`. Do not attach real provider credentials/webhooks to preview deployments.

5. Deploy the reviewed patch. The handler uses the Node runtime and a 30-second maximum. No paid Vercel cron is required for this event-driven step. Do not exempt the webhook from its signature check or place it behind an interactive login/challenge. Check Vercel deployment protection/firewall if Resend cannot reach it.
6. Enable the endpoint and perform the acceptance drills below. Do not call this live until they pass.

## Acceptance drills

- Real reset request from pipstart.net: Gmail receives it; Resend's sent and delivered callbacks appear in `pipstart_account_email_events` under the same provider message ID. Do not use Mailpit as evidence of production delivery.
- Password change: native notice arrives, and its delivery callbacks are recorded too.
- Send an isolated Resend **test bounce** from the exact monitored no-reply sender to `bounced@resend.dev` ([official test addresses](https://resend.com/docs/dashboard/emails/send-test-emails)), never a learner address. Confirm one failure event and one operator alert in the configured Gmail inbox. Dashboard sample payloads may use another sender and will then be ignored deliberately.
- Replay that authenticated failure in Resend. Confirm no second alert row/send. Use a fresh delivery signature, not an old signed request (five-minute tolerance).
- Send/inspect a delivered success: recorded, no failure alert.
- Bad/missing signatures: HTTP 401, no evidence row or send. Malformed signed payload: 400. Oversized actual stream: 413.
- Simulate an alert-provider failure with injected dependencies in tests, not by breaking the live SMTP key. The callback returns 503; the event/alert remain durable; replay after the one-minute lease recovers safely.
- Alert delivery events are ignored; no recursive alert storm. Verify the operator alert's delivery manually in Resend and Gmail.
- Re-run signup acceptance: still no verification/welcome email. No marketing or consent changes.

## Recovery and visibility

Each failure message/type has a single durable alert row. Recording the event and queuing that row are one transaction. A row lock gives one caller a one-minute lease. HTTP 503 requests provider retries; crashes and timeouts leave recoverable evidence. A stable Resend idempotency key and fixed body protect retries when the provider accepted an alert but the database acknowledgement was lost. The database records **provider acceptance**, not operator-inbox delivery.

Retries stop sending automatically 23 hours after the first attempt, before Resend's 24-hour idempotency window expires. Such a row requires manual investigation. Resend retries are finite; this patch does **not** run a background queue drainer. Inspect pending rows and failed webhook deliveries, then manually replay through Resend while within the safe window. After that, check the provider's Sending log for the alert ID/subject before authorizing a fresh manual alert. Never clear leases or edit timestamps to force a retry without checking provider evidence.

Private SQL review (Supabase SQL editor/admin only):

```sql
select message_id, event_type, created_at, first_attempt_at, attempts,
       lease_until, accepted_at, provider_id
from public.pipstart_account_email_alerts
where accepted_at is null
order by created_at;

select message_id, event_type, occurred_at, received_at
from public.pipstart_account_email_events
where received_at > now() - interval '24 hours'
order by received_at desc;
```

Vercel errors are redacted to `PIPSTART_EMAIL_MONITOR_RETRY_REQUIRED`; HTTP response codes also expose retries/manual-review conditions to Resend. Do not enable request-body logging. Review ledger size monthly. Suggested retention after owner approval: prune events older than 30 days and accepted alert rows older than 90 days; preserve unresolved rows. No automatic deletion is included.

Rollback: disable only the new webhook in Resend and roll back the Vercel deployment. Leave evidence tables in place for review. Existing SMTP password reset/changed notices are unaffected. Do not drop tables or undo unrelated migrations.

## Not covered yet — M21 is not complete

- Requests rejected **before Resend accepts them** (e.g. Supabase Auth validation, rate limits, SMTP authentication) may produce no provider event. Continue reviewing Supabase Auth logs. A 200 from the neutral reset UI is not proof that mail was sent.
- No absence-of-delivery timeout, hourly failure-rate threshold, autonomous canary, monitoring-heartbeat watchdog, external uptime check, provider failover, recovery-email resend, engagement suppression engine, or admin dashboard is implemented here.
- The operator alert uses Resend too. A Resend outage or Gmail delivery problem can block the alert itself. An independent alert/watchdog channel is required before claiming outage coverage. This patch records failures and relies on provider retries/manual review; it does not guarantee delivery.
- Native SMTP emails lack application outbox correlation. Provider IDs correlate provider events only; no user ID/type inference from subjects or sensitive content.
- Synthetic Auth canary tests need a separate approved test account and schedule. Never use a learner's account or trigger real resets on a timer without that explicit setup.

## Sources checked 19 October 2026

- [Resend webhook verification](https://resend.com/docs/webhooks/verify-webhooks-requests): verify raw request body.
- [Svix manual verification](https://docs.svix.com/receiving/verifying-payloads/how-manual): HMAC, constant-time compare, timestamp check; independent published test vector included in unit tests.
- [Resend event types](https://resend.com/docs/webhooks/event-types): lifecycle meanings and supported events.
- [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys): 24-hour window.
