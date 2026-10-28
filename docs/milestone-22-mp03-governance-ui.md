# MP03 bounded delegation and assignment UI

This source-only bundle connects the accepted Owner-only governance read to the
People screen. It adds no SQL, capability, role, remote account operation or
activation. The global staff flag and database control remain default closed.

Only `roles.manage` displays Governance controls and authorizes the controller's
live read/prepare/complete calls. A delegated role manager retains the existing
role form and ceiling; no delegation or assignment authority is added for them.
The database remains authoritative for every read, proof and mutation.

The current-state panel shows target-bound roles, Administrator delegations and
25-item assignment pages. Reads recheck the same identity/current capability,
clear stale data on failure and reject malformed or non-advancing DTO pages.
Internal resource references are plain text, never destination links. Assignment
does not create, validate existence, publish a resource or grant a role. Future
resource lifecycle patches must validate resource compatibility independently.

Entering the change form removes the parent's reload/pagination/close controls.
The form exposes exactly grant/remove delegation and assign/remove assignment.
Delegations use the three existing fixed Administrator capabilities; assignments
use the seven existing kinds and bounded internal ID grammar. Non-staff targets
cannot prepare governance actions. Self-delegation grants are refused by the UI
controller. Current target membership and Administrator eligibility are read
before MFA; receipt/mutation RPCs independently recheck all database conditions.

The new controller preserves the accepted exact-command lifecycle: copy/freeze
the target, operation, delegation/scope and reason; current Owner authorization;
fresh provider challenge; current authorization again; random in-memory token
and request UUID; one bound receipt; explicit independent review/confirm. No
mutation occurs during preparation. The UI clears the code at submission and
prevents duplicate activation with a synchronous lock. No token/code is logged
or persisted. Expiry is decided by the database, not the browser clock.

Unknown completion keeps its exact intent/reference and blocks closing or
starting another form. Check-only reconciliation sends that same command/request
with an empty token, which cannot initiate a new mutation. It accepts only the
RPC's exact `already_recorded` acknowledgement. Known authorization/input refusal
blocks the form; no blind retries or false failure/cancellation claims occur.

## Acceptance boundaries

Preparation covers new controller validation/binding/denial/reconciliation tests,
prior role/people/audit regressions, static presentation, production types,
scoped lint/format and a default-off webpack build. Mocks do not prove real
Auth/DTO/provider/browser behavior. New action/browser/visual acceptance still
requires a separately owner-run isolated stack with the corrected governance
read migration. The existing application/hosted database is not migrated here.
Prior successful SQL run `41c3c24a57cbca171bd6fd3f259043c4` covers SQL Auth stubs,
not these new UI/controllers. Previously approved audit visuals remain approved;
native browser zoom is still a separate unverified manual gate.

Next within MP03: isolated real Auth/DTO/controller and browser/accessibility/
visual acceptance of these four actions, then durable remote account-operation
reconciliation and the compatible legacy-entry transition. Hosted review,
identity-vetted Owner bootstrap/recovery and activation gates remain explicit.
Nine main packages follow full MP03.
