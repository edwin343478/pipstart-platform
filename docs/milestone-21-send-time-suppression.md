# M21 optional-email send-time suppression foundation

Prepared against 94da341. No production optional-email sender/queue currently
exists in PipStart. Skillcima's separate queue is not changed. This foundation
does not enable campaigns, add a transport, public send route, job or scheduler.
Auth/password reset/security notices and operational alerts are unaffected.

## Dispatch boundary

Future trusted server workers call dispatchOptionalEmail for EVERY attempt,
including queue retries. Jobs contain only jobId, userId, kind, subject, html and
text. kind is learning_lesson, learning_weekly or partner_offer. Runtime validation
rejects unknown fields (including to/cc/bcc, cached preferences, headers or an
already-prepared envelope). No caller-supplied recipient can bypass the guard.
Freeze a copy before asynchronous work so later job-object mutation cannot change
the checked category/content. This guard does not sanitize trusted email content.

The service-only RPC reads the current confirmed Auth email and preference row.
Missing/deleted/unconfirmed/currently banned accounts are inactive. Learning and
partner OFF suppress their respective categories. Learning lessons require all
frequency; weekly digests require weekly; partner offers have no learning-frequency
dependency. A queued lesson does not become an automatic digest after a change.

The guard first checks current state, prepares mandatory category/all unsubscribe
links and RFC headers, then RE-READS current state after preparation. The last read
controls recipient and eligibility immediately before invoking the supplied trusted
transport. No other awaited work intervenes. A queue-time ON snapshot grants no
authority at dispatch. Account deletion, opt-out, frequency change or store error
during preparation prevents dispatch. Only current confirmed Auth email is used;
a pending email_change is never used. RPC responses are shape-validated, errors
fail closed, and no learner address, capability or provider exception is logged.

This is NOT an atomic database/provider transaction. A change after final check or
provider handoff cannot recall an in-flight email. Future workers must not delay,
schedule or cache the checked message inside transport. If they do queue again,
the new consumer must re-enter this guard. There is no deployed optional sender
to integrate yet, so end-to-end queue enforcement is NOT certified by this patch.

## Result handling and remaining send gates

- suppressed: terminal no-send for this job (inactive, OFF or cadence changed).
- unavailable: no transport invoked; investigate dependency/store/preparation or
  malformed job. Retry policy/backoff is the future worker's responsibility.
- accepted: transport returned an accepted provider ID, NOT proof of inbox delivery.
- uncertain: transport may already have accepted the message. NEVER blindly retry.
  Future transport/outbox must implement durable stable idempotency, correlation,
  immutable prepared body, attempt accounting and reconciliation before retries.
  This function neither persists jobs nor claims exactly-once delivery.

Token issuance may leave unused hashes if the final check suppresses a message;
they contain no raw capability and cascade on account deletion. Token retention
and growth limits remain a separate operational decision.

The current account-email monitoring ledger intentionally stores no recipient
mapping, so it cannot prove address-level bounce/complaint suppression. This patch
does NOT invent such mapping or modify Resend's suppression lists. Actual optional
sender integration must also enforce provider/address suppression, content/frequency
caps, stable retries and outbound unsubscribe header/DKIM acceptance. Campaigns
remain disabled until those gates are completed. No country eligibility gate is
introduced and no default setting is described as express consent.

## Data and verification

Migration adds one read-only SECURITY DEFINER function with empty search_path,
EXECUTE for service_role only. No table/default/preference/Auth/secret changes.
It returns both optional booleans and frequency only to the trusted service;
anon/authenticated cannot use it to enumerate addresses or preferences.

Unit tests use spy transports only. Isolated SQL tests use generated fixtures in
a temporary database and prove current state, current email, missing/unconfirmed/
banned/deleted denial, unsubscribe interaction, unchanged real application data
and service-only grants. No provider email is sent. Local application migration,
hosted migration, commit/push and production acceptance remain separate gates.
