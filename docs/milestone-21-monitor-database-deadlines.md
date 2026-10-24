# M21 monitoring database deadlines

The account-email Resend webhook and delivery-sweep route now opt in to a bounded
Supabase transport. Every database request has one **three-second absolute
deadline**, covering connection/headers and the complete response body. Actual
body bytes are limited to 256 KiB and 1,024 chunks; declared Content-Length does
not replace those checks. These monitor adapters expect only small JSON records,
scalar RPC results and at most five due alerts.

The wrapper buffers the bounded reply before handing it to the SDK, so a server
that returns headers and then stalls cannot leave SDK JSON parsing waiting forever.
It forwards request method, headers and body, preserves response bytes/status and
headers, and honors caller cancellation. Cancellation errors or a never-settling
body cancel do not extend the deadline. Logged errors remain redacted constants.
The wrapper does not retry or automatically unlock anything. A timed-out write
may already have committed; existing idempotency and lease fences remain required.

Only the two account-monitor routes opt in through an optional admin-client fetch
argument. Existing no-argument admin clients retain their previous behavior. No
database schema, credentials, sender, recipient, webhook signature rules, alert
payload, worker setting or consent defaults change.

Existing catches return 503 on unavailable database evidence. A failed/partial
sweep cannot produce the completed-run heartbeat. Finalization can still fail
during a real outage, leaving a `running` row: stale-run/manual-alert/backlog
health detection remains a separate migration patch. A successful scheduler
heartbeat is not proof that webhook ingestion or inbox delivery is healthy.

The sweep's existing 35-second admission guard remains: it checks elapsed time
before each alert, reserving time for a bounded claim, provider call and database
acknowledgment/finalization. This is not a formal end-to-end route deadline; provider
and watchdog response-body readers are unchanged and remain follow-up work.

Tests exercise the actual routes and real Supabase SDK with a fake network
transport, as well as direct timeout/body/cancellation boundaries and admin-factory
options. The Vitest `@` alias now matches the application's existing TypeScript
alias so routes can be imported directly instead of source-grepped. Tests send no
provider emails and use no database or production credentials.

Audit mapping: addresses database-response bounding in W12 and part of direct
adapter/timeout coverage in W20. It does not close all operational-assurance or
compliance findings. No migration or hosted acceptance is required for this patch.
