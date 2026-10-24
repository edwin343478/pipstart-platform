# M21 closeout C02: monitoring failure diagnostics

The account webhook previously logged the same retry constant for record, claim,
provider-send/acknowledgement and database acceptance errors. The sweep likewise
grouped failures. A successful provider response followed by an unavailable
database acknowledgement could not be distinguished from a provider rejection
using those logs alone. A route without an admin client had no stage diagnostic.

C02 adds `PIPSTART_EMAIL_MONITOR_FAILURE_STAGE` with exactly three fixed-vocabulary
fields: `source` (webhook/sweep), `stage` and `provider_status_class`. Existing
generic error constants are retained for compatibility. One additional bounded
diagnostic line is emitted per caught failure/configuration condition, not for
every healthy request. Failure of the sweep's fallback finalization is separately
labelled `recovery_finish`; it does not replace the original failure.

## Meaning

- `configuration`: missing route/admin-client or handler configuration. The exact
  approved recipient fence remains deliberate anti-misconfiguration protection.
  This patch neither makes the recipient arbitrary nor changes that mailbox.
- `payload`: a signed account payload failed existing parsing. Its HTTP 400
  remains unchanged; no blanket 200 acknowledgement or event discard is added.
- `record`, `start`, `queue`, `due`, `claim`, `health`, `finish`, `recovery_finish`:
  the database/orchestration phase active when the operation failed.
- `send`: fetching, reading, validating the provider acknowledgement. `2xx` here
  can mean an invalid acknowledgement; it is not a success/delivery assertion.
- `accept`: a validated provider ID was obtained, but persisting acceptance failed.
  This remains uncertain and must not cause an automatic replacement send.

Provider classes are `2xx`, `3xx`, `4xx`, `5xx`, `unavailable` or `not_attempted`.
`unavailable` means no completed bounded response was available; headers might
have arrived before a body timeout, so do not infer connection failure or rejection.
`not_attempted` means the current phase is not a provider attempt; in a later
health/finalization phase it does not assert that the entire run sent nothing.
Classes/stages reset between alerts and before health/finalization so an earlier
provider failure cannot be misattributed to a later database error.

Fields never include an exception/message, numeric provider status, provider body,
address, message/run ID, token, signed URL, header or credential. Even unexpected
runtime values are mapped back to a safe vocabulary. No webhook input selects a
logged stage/class. Platform access logs require their own separate privacy review.

## Compatibility and verification

HTTP responses, retries, idempotency keys, provider payload bytes, persistence,
health thresholds, alert recipients and watchdog semantics are unchanged. No
schema/index, digest, fairness scheduler, canary, new configuration system,
dependency or worker activation is added. No query/index tuning is claimed:
there was no measured performance evidence requiring a schema change in C02.
Pre-auth configuration disclosure is not changed by a logging-only patch.

Tests exercise every database phase, HTTP 4xx/5xx, transport/body failure, invalid
acknowledgement, signed malformed payload, per-alert status reset, fallback finish,
unchanged healthy/busy responses and both actual unavailable-client routes. They
assert redaction using generated private markers; no credentials, external
provider sends or database changes are needed. Existing input/output bounds and
idempotency tests remain required. Candidate CI/build/browser gates still apply
after publication; logs alone do not prove real provider or inbox delivery.

Audit coverage: the failure-stage/status-class portion of W22 and focused W20
coverage. W11 is explicitly documented, not generalized. W14 fairness/digests,
W21 public auth/configuration response changes, W23 acknowledgement redesign and
W24 retention/index tuning are not silently implemented. Their final fixed/deferred
dispositions belong in C05 against the approved default-off scope.

Next closeout package: **C03 - current privacy and operations**. Three packages
remain after C02: C03, C04 preferences accessibility and C05 final reconciliation.
No statement that all closeout patches are applied is made here.
