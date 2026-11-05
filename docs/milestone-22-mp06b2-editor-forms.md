# MP06b2 — connected course/module draft forms

Source preparation only until real Auth/PostgREST/browser rehearsal and Owner
application are recorded. MP06b1 is the write boundary; this connects it under the
existing staff UI flag. Production continues reading code; no publication is added.

The library exposes native editor entry links only to writer roles, with course
creation Owner-only. The editor route repeats the live staff gate, and every
action uses the actual cookie session and the existing verified write boundary.
A read or navigation flag is never a substitute for SQL's current scoped grants.

Forms expose only the accepted named text/presentation fields and per-item numeric
placement rank. Existing identity/path/parent/course level are immutable.
A new module does not inherit its parent's staff assignment: the Owner may need
to assign the created item before its author can read/edit it. No implicit grant
is performed. Saving returns a new draft; it never submits or approves a revision.

Values remain in memory after validation errors/conflicts. A conflict or uncertain
outcome blocks another write. Explicit latest-read comparison does not rebase or
overwrite entered values. Using latest requires discard confirmation when needed.
Successful saves must be reloaded before another save. There is no automatic
mutation retry or inference that matching fields prove a previous save succeeded.

Editor entries and exits use document navigation. Native beforeunload protects
refresh, close and Back; in-app anchor exits ask before discarding work. No local
storage, credentials, full private body, assessments or arbitrary metadata are
sent to or persisted by the form. An existing read-only revision view remains
available for other families; lesson editing is MP06c.

Preparation includes meaningful reducer/route/action/render tests, types/lint/
format, platform tests/build/leak scans, and disposable installer rehearsal.
Real hydrated validation/save/reload, two-tab conflict, post-commit uncertainty,
leave/cancel/Back, role revocation, native keyboard, mobile/320px/CSS zoom and axe
must be rehearsed against generated local Auth/PostgREST before claiming acceptance.
Hosted write fixtures, activation, migration, commit and push are not included.

Next: separately authorized isolated write/browser rehearsal, Owner application
and visual acceptance; then MP06c supported lesson editing. Full MP06 remains open.
