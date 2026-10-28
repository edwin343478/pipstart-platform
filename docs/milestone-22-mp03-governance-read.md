# MP03 governance details read foundation

This additive source bundle prepares the current-state read needed by delegation
and assignment forms. It does not expose new UI or perform a governance write.
It adds an Owner-capability RPC, strict minimized DTO, rollback SQL acceptance
and source/provenance manifest. Applying source does not execute SQL.

`pipstart_staff_governance(target, after_kind, after_id, limit)` requires live
`roles.manage` through the existing staff/MFA authority. This is Owner-only in
the accepted model. Neither `people.read`, a delegated `roles.delegate`, nor
`audit.read` grants access to this detail. Anonymous and service roles have no
execution grant. No raw table/API exposure or new staff capability is added.

A single SQL statement returns the exact target profile's membership state,
fixed roles, three possible Administrator delegations, and at most 50 resource
assignments. Default page size is 25, with one internal lookahead and a paired
kind/id cursor. Explicit C collation makes ASCII scope pagination deterministic
across database locales and identical to the DTO comparison. No counts, email,
provider state, credentials, profile metadata or unrelated target is returned.

The parser checks the expected target, exact keys, sorted unique fixed lists,
bounded valid assignments, strict cursor advancement and a last-visible-item
next cursor. It copies output and rejects malformed or extended responses. It
does not authorize or initiate a request. Staff membership status is not Auth
account suspension. Suspended staff details may be read by an authorized Owner;
a non-staff profile returns empty governance lists and null membership state.

## Gates

Preparation checks cover TypeScript DTO behavior, production types and scoped
lint/format. SQL has **not** been executed by source preparation. Owner-run
isolated migration/rollback acceptance, real Auth/PostgREST denial/revocation
and hosted review remain separate. No existing migration or RPC is replaced.
No hosted migration, role grant, account change, activation, commit or push is
authorized by applying this source. The approved audit visuals and native-zoom
limitation remain recorded in the external acceptance evidence.

Next within MP03: isolated acceptance of this read model, then the bounded
delegation/assignment management UI with exact fresh-verification binding and
uncertain-outcome reconciliation. MP04 follows full MP03; nine main packages
follow MP03.
