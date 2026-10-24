# M21 stale-run and alert-backlog health

The sweep evaluates a service-role-only, read-only database health snapshot after
its bounded alert-draining loop. It records three nullable counts on each run and
returns them in the authenticated response summary:

- `manual_alerts`: unresolved/unaccepted alerts whose first attempt is strictly
  more than 23 hours old, matching the existing claim retry cutoff.
- `overdue_alerts`: unresolved/unaccepted alerts created at least 15 minutes ago.
- `stale_runs`: rows still marked `running` that started at least ten minutes ago.
  Completed or partial historical runs are not counted.

Any nonzero count makes the current run **partial (503)** and withholds its success
heartbeat. Missing, unavailable or malformed health evidence fails closed too. A
manual outcome seen during a claim remains flagged even if a subsequent snapshot
returns zero. The ordinary due queue is still drained to allow safe recovery.
No new digest is sent through the same unhealthy mail pipeline; the configured
independent Healthchecks timeout supplies the missed-heartbeat alert.

NULL counts mean not assessed: historical rows, older deployed code and failures
before a successful snapshot. Zero is only meaningful with a completed run.
Counts overlap: a manual alert is usually overdue too. The health RPC returns no
message IDs, addresses, provider bodies or credentials.

The RPC never modifies alerts, leases, retry timestamps or sweep runs. Stale rows
remain flagged until an owner reviews exact IDs and explicitly changes status.
No automatic unlock, cleanup or resend occurs. Do not mark alerts accepted just
to turn the heartbeat green: verify provider evidence and use the existing owner
workflow. Investigate uncertain live requests before changing stale rows. This
patch adds no incident-resolution API.

## Rollout and evidence

Apply additive migration `20261024120000` before deploying the new route. Older
code remains compatible because new columns are nullable. Authorized hosted
read-only acceptance must report current health counts before publication:
existing incidents may immediately withhold heartbeat after deployment and need
owner review. No hosted fixtures or automatic incident repair are needed.

The new SQL suite runs in a disposable database alongside the existing head suites
and real two-session race. Unit tests cover invalid/unavailable health and
heartbeat suppression; direct route tests use the real Supabase SDK with fake
network responses. No provider send or worker activation is needed for acceptance.

## Limits

An empty ledger during idle periods is not a failure. Without an expected-send
signal or authorized canary, this gate and scheduler pings cannot prove webhook
ingestion or inbox delivery. Recency/canary and failure-rate monitoring remain
separate work. Sender separation, recipient policy, provider/watchdog body
deadlines, retention and audience/privacy decisions are unchanged. Optional
sending remains disabled.

Audit mapping: W5 abandoned/manual-alert visibility and stale-running detection
in W12, plus backlog health visibility. This does not fully close W4 or the audit.
