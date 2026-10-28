# MP03: paused Owner staff-maintenance transport and UI

Prepared source only; this packet does not apply or execute a migration, change a
provider account, grant a role, supply credentials, enable a flag, commit or push.
Full MP03 readiness and the preceding release checks remain separate gates.

## Scope and authority

`/admin/maintenance` is a separate signed-in shell because ordinary staff access
must stay closed while control is paused. The shell exposes no protected account
record. A current active Owner must verify an existing TOTP factor against one
exact operator-prepared request and mode before the database permits any review.
Only Auth suspension/resumption and read-only inspection are supported. A learner,
Administrator/delegated Administrator, AAL1 identity, banned/revoked Owner or
service credential alone cannot authorize the SQL path. The ordinary capability
and learner account pathways are unchanged.

The immutable operator-prepared journal remains the source of target/action/end
time/reason. This page cannot create or cancel that intent, remove a factor,
retire staff, resolve uncertainty, bootstrap an Owner or enable general staff.
The operator must prepare the exact request using the existing reviewed process;
its five-minute journal expiry remains enforced at dispatch. The review displays
request UUID, target UUID, operation, UTC expiry, reason and journal state. The
Owner explicitly confirms the frozen request after fresh verification.

After an outcome, the review is relabelled as captured before the action, so its
journal state is never presented as current; outcome notices carry a text label
as well as a tone. While paused, the staff frame links only to this page, never to
the closed ordinary staff entry.

A user-context claim binds the proof to the actual JWT actor/session and mints an
opaque short-lived execution permit. The service-only take rechecks paused control
and its version, live Owner/session/factor/AMR, target, self/last-Owner protection,
expiry and receipt binding before atomically consuming the permit and claiming
one dispatch. Suspending another account is blocked while another staff dispatch
is unresolved; another usable Owner must remain when the target has an Owner role.
Permit history retains the authorizing actor, session and proof hash. Private
primitives and raw tables remain inaccessible to API roles, with RLS and immutable
permit bindings. No raw proof or permit is stored in the database.

There is one bounded provider update, with no automatic claim/provider/result
retry. A missing or timed-out response remains uncertain. Separately verified
inspection only reads the provider; observation cannot resolve an in-flight call
or prove causality. Late matching success/unknown acknowledgments can still be
recorded after authorization/control changes, without authorizing more work.
Suspension does not immediately invalidate every existing Auth token. Protected
staff requests independently check live Auth ban state.

## Default-off configuration (not supplied by this patch)

Both `PIPSTART_M22_STAFF_MAINTENANCE_ENABLED=true` and
`PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED=true` plus a dedicated server-only
`PIPSTART_M22_STAFF_MAINTENANCE_SECRET_KEY` are required. There is no fallback to
shared administration or learner credentials. The new route does not depend on
the ordinary staff UI flag, so paused maintenance is not accidentally gated by
normal staff entry. These flags are neither set nor enabled by application.

## Acceptance and limitations

Accepted evidence:

- Isolated SQL `5c046bebc229e9856c739a946ff3cda6`: 21 inputs, 33 gate checks and
  cleanup, including observed two-session permit contention (single dispatch).
  Refusals assert the refusing guard's message, not only its SQLSTATE. SQL Auth
  stubs only. One earlier run failed on a test-suite defect and is preserved.
- Real local Auth/provider/controller/browser `1dcb904dff2be4abc7a28373c4b37652`:
  33 gates, four disposable provider updates, three read-only inspections, 16 axe
  states with 0 violations, computed notice colours and cleanup. Owner approved the
  visuals. Earlier passing runs before the visual corrections are superseded.
- Hosted wrapper rehearsal `4e126e976c6e3bc000b2fa36c8a159f8`: eight gates and
  cleanup. Owner-reported hosted schema acceptance on `knsmqtmfizkkrthhpujm`
  (default-closed, source SHA
  `df97d6dcf696ffa142f209a3765765e60a0e725f3a04de2ba4cae6e4497f1719`). A repeated
  pre-migration stage was refused by the replay guard. The exact migration history
  for `20261028180000` is verified in Local and Remote.

Limits: no independent remote inspection, no live hosted identity or provider
action, and no native browser zoom or physical screen-reader acceptance. A definite
SQL refusal at the service take is shown to the Owner as uncertain (fail-safe). Any
clearer wording is an open owner decision.

Next: publication approval, exact-commit CI and deployment verification. Real
Owner bootstrap, recovery custody, dedicated credential/flag setup and live rollout
remain separate reviewed gates. No real staff maintenance action is authorized by
publishing this default-off source.
