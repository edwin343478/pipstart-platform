# M21 durable optional-email queue foundation

Prepared against a001890. PipStart only; Skillcima is untouched. Dormant foundation:
no campaign, real provider adapter, public enqueue/send route, batch producer or
scheduler is added. processOptionalEmailJob is disabled by default. Tests explicitly
enable it with in-memory transports only. Existing Auth/security and operator
messages do not enter this queue and existing monitoring remains enabled.

## Durable identity and duplicate protection

Service-only enqueue accepts userId, logical dedupe key, kind, subject, HTML, text
and schedule. The first eligible enqueue owns a generated UUID. A repeat of the
same user/key/content returns the same UUID without editing content or schedule;
different content/kind returns conflict. Reusing a logical key is not a way to send
a new campaign. Future producers must choose stable logical recipient/job keys.
Current OFF/inactive/wrong learning frequency is rejected at initial enqueue,
but queue-time eligibility never grants send-time authorization.

No queue-time email address or preference snapshot is accepted. The server-only
consumer invokes the existing suppression/envelope guard on every claimed job.
Claim/transition RPCs take row locks and fence mutations with a random lease token.
Only pending or expired PREPARING work can be claimed. Preparation leases last
two minutes; harmless preflight failures back off 30 seconds times attempts, with
at most five claims. An expired old owner cannot start, release or finish a newer
claim. Competing owners see busy, not a second transport invocation.

The transport wrapper commits a SENDING marker plus the immutable prepared
recipient, subject, HTML/text and unsubscribe headers BEFORE invoking any external
transport. It then re-reads current account/preferences again, after that awaited
database write. OFF, frequency change or deletion suppresses handoff; eligibility
failure or a different current address is manual, never an automatic body/recipient
substitution. No awaited work occurs between the final check and transport call.
The prepared object/headers are frozen. The stable provider key is
pipstart-opt-v1-<job UUID>, with no learner email in the key.

SENDING jobs are NEVER automatically reclaimed or re-sent, regardless of age.
A crash after the marker but before a provider call may mean no email was sent;
we deliberately prefer investigation to a possible duplicate. An uncertain
provider response becomes manual. A lost checkpoint acknowledgment remains safe:
the next claim sees sending/manual/terminal and cannot send again. Successful
provider acknowledgment records accepted, not delivered or inbox placement.

This is at-most-one AUTOMATED transport invocation per job under the RPC/consumer
protocol, not an exactly-once or guaranteed-delivery claim. No reconciliation or
manual-resend RPC exists yet. Never reset sending/manual to pending, change a
prepared body, or blindly replay a provider call. A future real adapter must use
the persisted immutable body/key and implement provider correlation/reconciliation
before any explicit resend policy. Creating a NEW logical key can create a new
job, so producer correctness and cadence/content caps remain essential.

Account changes after final check/handoff cannot recall an in-flight message;
there is no atomic PostgreSQL/provider transaction. A trusted transport MUST send
immediately and must not add another delayed queue behind this authorization.
If it queues again, that consumer must run a new fresh authorization check.

## Storage and security

One RLS table and five private-search-path SECURITY DEFINER RPCs, executable only
by service_role. No direct API table grants (including service_role), anonymous or
learner job enumeration. Job content, prepared recipients and bearer URLs are
sensitive service-only data, never logged by the consumer. Account deletion
cascades jobs. Retention, token/job growth, service-access auditing and operational
manual-review tooling must be decided before enabling a sender. This patch does
not establish platform-log redaction or an infinite retention policy.

Implementation uses PostgreSQL row-lock and definer-function semantics:
https://www.postgresql.org/docs/17/explicit-locking.html
https://www.postgresql.org/docs/current/sql-createfunction.html

## Validation and remaining gates

Unit tests exercise disabled-by-default behavior, stale/malformed claims, persistence
ordering, final-state changes, stable key, uncertain handoff/provider outcomes,
checkpoint loss and no automatic resend. Isolated generated-fixture SQL tests
cover dedupe conflicts, atomic claim/nonce fencing, immutable payload, retries,
terminal states, grants/RLS, account cascade and two-connection contention.
No existing application database is migrated during patch preparation.

Local migration/acceptance, hosted migration/acceptance and commit/push remain
separate authorizations. Real provider/address bounce/complaint suppression,
provider transport and webhook correlation/reconciliation, production enqueue/
scheduling, cadence/content caps, rate/abuse limits and actual outbound unsubscribe
header/DKIM acceptance are NOT complete here. Campaigns remain disabled.
