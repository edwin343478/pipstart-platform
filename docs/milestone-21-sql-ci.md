# M21 reproducible SQL acceptance

This gate reconstructs the learner-account dependency and all 19 M21 migrations
through `20261024120000` in a randomly named **disposable database**. It runs the
committed begin-v2, stop-control and monitor-health SQL suites against the final schema, verifies
their fixture rows roll back, then exercises a real two-connection cadence-deferral
race. It does not run every historical migration-stage suite, replace full
Supabase integration/browser checks, or prove hosted delivery.

## Commands and isolation

Safety checks (Node built-ins only, no dependencies or database access):

```sh
node --test scripts/verify-m21-sql.test.mjs
```

After explicit local test authorization, with existing local Supabase running:

```sh
node scripts/verify-m21-sql.mjs --run
```

The local target is fixed to `supabase_db_pipstart-platform`. There is no connection
URL, arbitrary container/database override, Supabase reset/start command, credential
prompt, provider client or hosted mode. The runner requires existing `anon`,
`authenticated`, and `service_role` roles; it never creates global roles locally.
Only the generated database contains fixtures and temporary armed worker controls.
The application's schema, migration history and default-closed controls are untouched.

The independent `m21-sql` CI job runs on pushes, pull requests and manual CI runs,
alongside existing quality gates. It uses an ephemeral PostgreSQL 17.6 service with
no published ports and no production secrets. CI initializes roles in that service,
then runs exactly the same acceptance code with `--run --ci`. No dependency install
or full Supabase startup is needed for this job. Minimal `auth.users`/`auth.uid()`
stubs model the SQL dependency, not the complete Supabase Auth service.

## Required evidence

- All 20 migrations (one dependency plus 19 M21) execute with `ON_ERROR_STOP`.
- Monitor-health SQL checks idle, age boundaries, manual/overdue alerts, stale
  runs, nullable historical counts, service-only access and no mutation.
- The committed v2 suite checks permissions, safe cadence deferral/refund, future
  availability, stale tokens, malformed envelopes, closed windows, replay and
  unresolved SENDING retaining worker admission.
- The committed stop-control suite verifies owner-only controls, default closure,
  expiry, pause, exact-job gating, consumed permits and durable uncertain handoffs.
- Every public/auth table's row snapshot is identical before and after each suite.
- The first connection defers while holding its transaction. PostgreSQL's
  `pg_blocking_pids` must show the second connection waiting on that exact holder
  before the harness permits COMMIT; the contender must then return `lease_lost`.
  Final state must be one
  refunded pending attempt, no prepared message/provider ID/job reservation, future
  availability and successful safe worker finish.
- The run-created database is removed and its absence verified. Success requires
  cleanup, not merely successful assertions.

The report records input SQL fingerprints, suite results, race and cleanup status.
It is written to the OS temporary directory (or `RUNNER_TEMP` in CI) and retained
as a sanitized CI artifact for 14 days. A Ready deployment alone is not proof that
this or the existing quality job passed. Requiring the new job in protected-branch
settings is an owner/repository-settings decision, not changed by this patch.

## Bounds and failure handling

Each subprocess is bounded to 30 seconds, SQL statements to 15 seconds, lock waits
to eight seconds and normal SQL work to two minutes between bounded calls. The
two race connections have independent 20-second watchdogs, with five-second
observation windows and a 20-second idle-transaction limit. The CI job has a
six-minute cap.
Failures are nonzero and never automatically retried or converted into success.

Cleanup runs in `finally` and on SIGINT/SIGTERM. Before DROP, it validates the exact
generated name, postgres ownership and this run's random database comment marker.
DROP uses FORCE only for that identified disposable database. An identity mismatch
refuses deletion. A crash, power loss, SIGKILL or unavailable Docker daemon can
prevent cleanup; inspect the generated-name report and confirm ownership/marker
before manually removing anything. Never reset/delete the app database to fix this
gate. CI tears down its ephemeral service after the job, including failed jobs.

This patch adds no migrations, changes no application behavior, sends no emails
and does not enable the optional worker or campaigns.
