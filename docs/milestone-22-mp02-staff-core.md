# MP02: dormant staff authorization and transactional audit core

Prepared 26 October 2026 under the owner-run patch workflow. No owner seed,
activation, hosted change, account grant, commit or push occurs on source apply.
The migration is additive and **disabled by default**. It does not alter the
existing learner role enum, profile role, login, preview or M21 functions.

## Delivered boundary

- A private schema with RLS and no raw table/function access for anonymous,
  authenticated or service API roles. Only three bounded public RPCs are exposed
  to `authenticated`: own access, fixed governance commands and minimized audit
  paging. A service key by itself is not staff authorization.
- Seven fixed roles, exact object assignments and three explicit Administrator
  delegations. Unlisted capabilities are denied, including infrastructure secrets
  and arbitrary disclosure/host-policy edits. Grants come from private DB records,
  never profile `admin` or editable JWT metadata.
- Verified authenticated/AAL2 DB context, a matching current Auth session and an
  active member/role are required. PostgREST is responsible for verifying JWT
  signatures/expiry. SQL request-setting tests simulate that context, not crypto.
- Governance writes serialize on the control row before reading live permissions.
  A stale session cannot retain revoked membership. A delegated Administrator
  cannot promote self or grant/change Owner/Administrator access, or modify those
  principals through the non-owner delegation path.
- Sensitive writes consume a hashed, five-minute, single-use receipt bound to
  actor, session, operation, target, role/value and exact assignment. No browser
  or service API role can mint receipts. MP03 must attach the operator-only
  issuance primitive to freshly verified provider challenges before live use.
- Last-active-owner role removal/suspension is refused under the same lock.
  Removing Administrator clears its delegations; removing the last role also
  clears assignments/delegations and deactivates that membership. Regranting a
  role does not silently resume a deactivated membership.
- Role/assignment/member change, receipt consumption and minimized audit insert
  are one transaction. Faulting the audit append must roll all three back.
  Request IDs support exact read-only retries; conflicting reuse is rejected.
- Audit entries contain fixed action/reason codes and IDs, not free-form user
  payloads, passwords, tokens or MFA secrets. App/API callers cannot update/delete
  entries; a trusted DB operator can still disable triggers, so this is not an
  assertion of protection from the database owner. Paging uses time/UUID keysets,
  with at most 100 rows. Audit-retention review remains the MP01 policy, no purge.
- A strict typed response parser rejects malformed, foreign-user, duplicate or
  unknown capability payloads. It does not grant roles, perform an RPC or replace
  the authoritative mutation check.

## Integration obligations, not silently completed features

MP03 will replace the legacy preview-only administrator gate through a compatible
transition. Until then it remains unchanged for the sample gallery; no live M22
mutation trusts it. No actual account was bootstrapped, elevated or suspended here.
The private bootstrap/transition primitives are not public endpoints, and require
a separately approved exact-account/verified-factor recovery plan before use.

Membership foreign keys restrict deleting an Auth account that has a staff record.
Before live activation MP03 must define audited retirement/anonymization and the
learner-facing deletion result for current/former staff. Do not bypass that FK or
delete audit history to force account deletion.

Capabilities are necessary but not sufficient for later content mutations. MP04–
MP09 must validate object existence, authorship, distinct reviewer, exact revision,
approval/dependency fingerprints, current delegation and mandatory policy under
the shared control lock. Generic `content.trash` does not authorize deleting
someone else's draft or learner history. `partner.write` does not allow editing
fixed disclosures or destination-host policy. No content mutation is added here.

MP03's account operations also need the separate intent/result/unknown ledger:
staff membership can fail closed locally, but remote Auth effects are not atomic
with this SQL transaction. This patch does not claim those operations implemented.

## Owner-run isolated acceptance

After applying the source bundle, this command is **read-only preflight**:

```powershell
node apps/pipstart/scripts/verify-m22-staff-core.mjs --preflight
```

After separate authorization, with the existing local Supabase container running:

```powershell
node apps/pipstart/scripts/verify-m22-staff-core.mjs --run-isolated
```

The runner accepts no hosted URL, arbitrary container/database, reset, migration
push or credential arguments. It requires a local Docker socket/pipe and pins the
existing `supabase_db_pipstart-platform` container ID. It creates one fresh random
database, with a unique name/owner/comment receipt, within that local PostgreSQL
cluster. It never resets/stops the application database or alters global roles.
It verifies the three-file ordered checksum manifest before any Docker call.

The new DB has minimal Auth users/session/JWT/UID stubs and the original learner
account dependency. It runs the new migration and rolled-back behavior suite,
then verifies the head is empty/default-closed. A second fixture uses two actual
connections attempting self-demotion: one holds the governance lock while the
other is observed waiting on a DB lock. Exactly one succeeds, one is denied, one
active Owner remains and one demotion audit exists. Fixtures are disposable only.
Cleanup drops only the exact generated DB after verifying its owner/comment.
Budget: three minutes plus bounded cleanup; the sanitized report records each
stage. On uncertain cleanup, preserve the marked DB and report for review.

This SQL test is **not full Supabase Auth/PostgREST/MFA acceptance**. Those real
API tests remain MP03 prerequisites before live staff operations, as the owner
will create test accounts when setup becomes available. No credentials are
requested by this runner. Local execution is not hosted migration acceptance.

## Failure, rollback and handoff

### Confirmed local acceptance and continuous checks

The owner ran the original isolated runner successfully. Report
`pipstart-m22-mp02-c57147d0896ec4771750bdf2d0e84785.json` records staged/head checks,
observed contention, last-owner result and cleanup all true. The source files
matched the reviewed eight-file bundle when the report was inspected. That report
does not embed input hashes or a commit SHA, so it is local execution evidence,
not exact-release CI or hosted acceptance.

The separate `M22 staff SQL acceptance` workflow keeps M21's workflow intact and
uses a fresh labelled PostgreSQL 17.6 service with no published ports or production
secrets. Its bootstrap tests use Node built-ins only. Explicit `--run-isolated
--ci` requires the Actions context, a fixed different container name and the
expected isolation label. Local mode still targets only the existing local
Supabase container and never initializes global roles. New reports carry input
checksums, runner checksum, mode and the CI revision when available, and CI saves
them as a bounded-retention artifact.

No GitHub run has been started by source preparation. Exact published-commit CI
must pass after separate commit/push authorization. The unchanged SQL migration
and behavior suite retain the owner's accepted fingerprints; CI integration
changes runner targeting/reporting and tests, not staff permissions or schema.

If source preflight finds a collision or changed dependency, it stops before
copying. If DB acceptance fails, share the sanitized stage/report; do not bootstrap,
activate or edit assertions to force a pass. Inspect a partially executed schema
read-only before retrying; the migration is transactional and no destructive down
migration is supplied. Existing M21 SQL gates remain unchanged.

### Accepted hosted state and migration history — 26 October 2026

The owner reran the updated isolated runner successfully: report
`f221c8db70cb302f4db082b6da0609d5` records input and runner fingerprints,
behavior/head checks, observed last-owner contention and successful cleanup.

The first SQL Editor attempt stopped on a function-body fingerprint mismatch.
Read-only diagnostics confirmed the transaction had rolled back and Windows
clipboard CRLF conversion was the cause. The external hosted verifier now
normalizes only CRLF to LF before body hashing; expected source hashes, ownership,
security-definer, search-path and privilege checks remain unchanged. Thirty-two
regression checks passed. The owner also ran the real CRLF isolated rehearsal
`d097bef88a874c86d2b595627844d910`: behavior, head, contention and cleanup passed.
This clipboard correction changes the external verification bundle, not this
migration or its permissions.

The owner then reported `MP02_HOSTED_MIGRATED_VERIFIED_DEFAULT_CLOSED` with
source SHA-256
`173fbdbc7fd690a129b72b0b484a2a1404f7015b793a377b143946fd206af3e8`.
The marker follows transactional installation and committed read-only checks of
function fingerprints, privileges, empty staff tables and disabled control. This
is owner-observed hosted SQL Editor evidence, not independent remote inspection
by the agent or live Auth/PostgREST/MFA acceptance.

The owner reconciled only migration version `20261026120000` through the
supported linked-project CLI history repair. The subsequent history list showed
all 50 versions matching between Local and Remote. No migration SQL was replayed
by the repair, and no other history entry was repaired.

Staff remains disabled, without an Owner bootstrap, membership/role grants or
live receipt issuance. The MP01 signed-in administrator/learner checks and full
real Auth/PostgREST/MFA acceptance remain explicit MP03 gates before live staff
features. SQL claim stubs and anonymous preview checks do not satisfy those gates.

MP01 and MP02 remain unpublished until separate commit/push authorization and
successful exact-commit CI. Local receipts do not establish a GitHub workflow
result or production application release. Keep visual-preview acceptance,
hosted SQL acceptance and release evidence distinct.

Next main patch: **MP03 — staff MFA, shell and people management**. Ten main
packages follow MP02; no extra main patch is introduced by these acceptance steps.
