# MP03 connected people and role-change UI

This bounded source bundle connects the approved People hierarchy to the accepted
minimized read RPC and exposes grant/remove-role only. It is not a new main patch
and does not complete MP03. The existing staff flag and database control remain
closed by default. No migration, role grant, account creation, Auth operation,
hosted activation, commit or push is performed by applying source.

## Data and authorization

`/admin/staff/people` first checks the existing default-off flag and live staff
gate, then requires `people.read`. The server and subsequent client reads use
the signed-in user context and bounded RPCs. Search is a literal display-name
prefix, 2–60 characters or empty; pagination uses 25-item UUID keyset pages and
the accepted strict parser. A failed read clears the displayed page rather than
showing sample or stale data as a current result. Email, Auth factors, activity,
learning progress and provider account status are not fetched or fabricated.

The approved shell, heading, cards, avatars, tags, status badges and responsive
table are reused. Sample-only invitation controls, MFA/status columns and global
counts are absent because no corresponding accepted API exists. Staff membership
is explicitly distinguished from the learner/provider account.

UI capability checks are guidance. Each next read, receipt issuance and role
mutation rechecks identity/live grants, and SQL remains authoritative, including
delegated ceilings, protected targets, self-grants and concurrent last-Owner
protection. The UI never sends an actor, assurance, verification timestamp or
service key to a mutation. Current signed-in actor ID is used only to reject a
session switch and validate the minimized access DTO.

## Exact action and uncertainty

The operator selects a person, fixed role, grant/remove action and fixed reason.
The controller freezes that exact command before a fresh provider challenge and
verification. It rechecks live access, generates a 32-byte in-memory random token
and obtains a provider-bound receipt for that command. No role change occurs at
this stage. A separate summary and explicit confirmation sends the one audited
mutation with an independent request UUID. The accepted SQL supplies freshness,
single-use/replay control and atomic audit/role commit; the browser clock never
authorizes an action. Verification within the same signed second as an already
used event can be refused; wait for a new authenticator code before a new action.

No code, token, factor key, trace or payload is logged or stored in browser
persistence. The entered code is cleared on submission; receipt state stays only
in component memory and is discarded on success/cancel/navigation. A synchronous
UI lock prevents double submission. There are no automatic provider or mutation
retries. Known DB authorization/input exceptions mean a transactional refusal;
timeout, malformed success and transport errors remain uncertain.

An uncertain mutation keeps the exact request reference visible and blocks new
actions in that panel. "Check recorded outcome only" submits the same exact
request with an empty receipt token: the accepted SQL may acknowledge an existing
audit record, but cannot initiate a new change. A refusal is still unknown, since
the original in-flight request might finish later. Do not create another request
after navigation loses the in-memory context; retain the displayed reference and
have the Owner review audit before restarting. No absence of an audit record is
misrepresented as proof that the original request cannot commit.

## Evidence and acceptance limits

Real isolated Auth run `065dde8cc048ee2b4eff20fa3f8131cd` passed actual provider
enrollment/verification, current role/AAL denials, minimized people reads, JWT
signature rejection, observed two-request receipt contention/single winner,
audited mutation, backup-factor recovery, paused sole-Owner recovery and final
closed control. All exact owned resources were removed, with zero host ports.
That evidence covers the earlier accepted RPC/MFA implementation, not these new
controllers or UI, hosted compatibility, identity-vetting policy or a browser.

This bundle's preparation covers scoped controller/route/render tests, production
TypeScript, changed-file lint/format and build where separately recorded in the
tied validation report. Mocks and SSR markup do not prove browser focus, real
signed-in role changes or accessibility. Browser acceptance must exercise the
actual components at 1440/390/320 widths and 200% zoom, keyboard order, live status,
focus into/out of the inline review panel, busy/double-click handling, uncertainty
and denied states, and axe. Inline review uses native form controls, not an
unimplemented modal, so it requires no simulated dialog/focus trap.

Next within MP03: owner apply; isolated real-stack/browser acceptance of these
controllers and UI; remaining delegation/assignment/audit views, durable remote
account-operation intent/reconciliation and compatible legacy-entry transition.
No live staff account/role bootstrap or hosted activation is included. MP04
follows full MP03 acceptance; nine main packages follow MP03.
