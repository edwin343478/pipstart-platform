# MP03: provider-bound proof issuance and people read model

Source preparation, not migration or live acceptance. Entry remains disabled and
the staff DB control stays closed. This is the second bounded bundle inside MP03,
not another main package. No person is granted access by applying these files.

## Trusted proof boundary

The migration strengthens MP02's shared actor helper so **all** existing staff
RPCs require a current Auth session at AAL2 with a verified TOTP factor belonging
to the same user; timeboxed/removed/downgraded sessions fail closed. Shared row
locks coordinate current session/factor checks with provider updates. Governance
still serializes on the control row and rechecks live staff grants/last Owner.

The authenticated receipt RPC accepts only the command target/operation/value/
scope and a 32-byte client-generated random token encoded as 64 lowercase hex
characters. It accepts no actor, session, assurance or verified-at parameter.
The token is not authorization by itself and is stored only as a hash.

Freshness comes from this session's provider-owned `auth.mfa_amr_claims` TOTP row,
whose update time must be within five minutes and agree exactly (integer seconds)
with the **signed** JWT AMR timestamp. It is not JWT issue time, a browser clock,
editable metadata or a claim from another session. PostgREST remains responsible
for JWT signature/expiry verification; SQL fixtures do not prove that layer.

Supabase's [AMR model](https://github.com/supabase/auth/blob/master/internal/models/amr.go)
updates the session/method row after verification. Its
[session model](https://github.com/supabase/auth/blob/master/internal/models/sessions.go)
issues AMR timestamps from that row's `UpdatedAt.Unix()`. Actual local column names,
types and unique session/method constraint were inspected without reading users,
factor keys, sessions or codes. Hosted compatibility must be checked separately.

A private append-only proof-use ledger makes one signed verification timestamp
usable for one receipt only. Its unique key is session plus integer verification
second, matching JWT precision: two provider updates within one second cannot
reuse the same signed proof. A new action may need verification in a later second.
A retry with the same token and exact binding can
read back an unconsumed current receipt; a different command/token, used receipt,
new provider event, foreign session or stale proof is refused. Issuance and replay
registration commit atomically. Receipt consumption still uses MP02's audited
mutation transaction. An audit failure must leave the role and receipt unchanged.
The operator-only mint helper retains its existing restricted grants; no service
key or browser can call it directly. No raw token/key/code goes in the ledger.

No automatic ledger purge is added. Deletion/retention/recovery policy stays an
explicit later operational gate; this ledger does not introduce Auth deletion
cascades or remove historical governance evidence.

## People read boundary

`pipstart_staff_people` requires current `people.read` capability. It returns only
profile UUID, display name, profile creation time, staff membership active flag
and fixed staff roles. It does not return email, raw Auth metadata, factors,
credentials, IP/device/session details, learner progress or Auth ban state.
Membership suspension is not described as a provider account suspension.

Paging is UUID keyset order, at most 50 records with an explicit next cursor;
search is a literal, trimmed 2–60 character display-name prefix, not SQL wildcards.
Exact UUID detail can be read without a bulk Auth export. The strict TS DTO parser
rejects extra private fields, malformed/duplicate keys, unknown roles, inconsistent
membership and invalid cursors. The future route must enforce the live gate and
use a bounded RPC; these helpers do not yet expose a people UI.

## Entry compatibility correction

The Auth QR generator can prepend an XML declaration and a fixed SVGo comment.
The first entry validator only accepted strings starting at `<svg>`; it would
reject that real provider output. The included two-file correction accepts and
strips those exact optional prefixes, still rejects DOCTYPE/stylesheets/arbitrary
prefixes and remote URLs, and keeps the local encoded image/no-inline-HTML path.
See the [provider generator](https://github.com/supabase/auth/blob/master/internal/api/mfa.go)
and [SVG library](https://github.com/ajstarks/svgo/blob/master/svg.go).
No live enrollment had been authorized or performed; entry remains disabled.

## Acceptance and next work

The SQL test suite uses simulated provider rows/claims in a marked disposable DB,
with fixture rollback, never a hosted/application DB reset. It checks direct
role/AAL/legacy-metadata denials, minimized pagination, exact proof binding,
freshness/replay, current-provider revocation and transactional audit rollback.
The external runner reuses the fingerprinted MP02 isolation/cleanup/race controls,
then clears only its own committed race fixtures in that newly generated DB
before testing this staged migration. Original application data is untouched.

SQL execution, observed replay races, actual Auth/PostgREST AMR behavior and
enrollment/recovery/browser acceptance remain separate gates. Prepared assertions
are not passed results. The migration has not been applied merely because source
or TS tests passed. A future real-Auth compatibility failure must stop activation,
not introduce a timestamp tolerance or client-time fallback.

Next within MP03: owner-authorized isolated SQL acceptance, real local Auth proof
and recovery tests, then connected people/role/assignment/step-up/audit UI and
durable account-operation reconciliation. Bootstrap, factor removal, hosted
migration/enablement and account changes need their exact approvals. MP03 is not
complete. Next main package after full acceptance: **MP04**; nine main packages
follow MP03.
