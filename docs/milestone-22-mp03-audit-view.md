# MP03 bounded staff audit view

This owner-run source bundle adds `/admin/staff/audit` using the existing
`pipstart_staff_audit_page` RPC. No SQL, permission, account, provider, activation
or hosted configuration changes are included. Staff UI stays off by default.

The server first checks the existing UI flag, verified live staff gate and
`audit.read`. Owner has this capability; Administrator needs explicit delegation.
Every actual read independently requires the capability in the database. No
legacy profile-admin flag, posted actor or service-role fallback is used.

Each read requests at most 26 rows with an eight-second abort deadline: 25 visible
events plus one lookahead. Older-page cursors use the exact timestamp and UUID of
the last visible event, preserving PostgreSQL microseconds and UUID tie ordering.
Cursor query parameters must be absent or exactly paired, singular and valid.
Native GET forms navigate to newest/older pages through a new server request,
without client-router prefetch or a cached in-memory audit list. No export,
totals, write controls, event editing, provider retry or sensitive-action receipt
is introduced. Revocation affects the next request; already rendered browser
content cannot be remotely erased by this view.

The DTO rejects an excessive, unordered, repeated, extended or malformed page,
including events not strictly older than its cursor. It accepts only current
fixed governance operations, reasons, outcomes and bounded value/scope bindings.
It renders plain text through React, never HTML or resource destination links.
Operator actions retain null actor/target meaning. Audit references are internal
identifiers; no email/name lookup, Auth export, factor/code/token or raw error is
shown. A new future audit operation needs an explicit parser update.

The view clearly distinguishes recorded staff-membership suspension from remote
Auth account suspension. This is governance history, not a complete security log
or proof of provider account state. Invalid input, provider failure and empty
results have different messages. An older page with no entries is an end-of-list
result, not a claim that no events have ever occurred.

## Evidence boundary

Preparation includes focused DTO/cursor, route-gate/denial, rendering/navigation
tests, production types, scoped lint/format and a default-off webpack build.
These are preparation checks, not new real Auth/PostgREST/browser acceptance.
The previously accepted people/role screenshots and source-matched browser
report remain evidence for that earlier bundle; they do not approve these new
audit screens or demonstrate audit delegation/revocation in a live provider.

After owner application, the next acceptance must cover actual Owner and
delegated-Administrator reads; ordinary Administrator/Author/learner denial;
multi-page ties/microseconds; open-tab delegation removal; desktop/mobile,
keyboard, native zoom and axe. It must use isolated generated fixtures, not
hosted people or production audit data. Hosted activation and publication still
require their own gates. Existing manual native-zoom acceptance remains open.

Next within MP03: delegation/assignment read models and management, then durable
remote account-operation reconciliation and compatible legacy-entry transition.
MP04 follows full MP03 acceptance; nine main packages follow MP03.
