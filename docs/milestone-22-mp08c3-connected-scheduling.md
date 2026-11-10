# MP08c3 — connected scheduling controls and acceptance

Builds on the exact applied MP08c2 source. The existing item publication region gains a scheduling section; it does not replace the dashboard design, publish immediately, activate a worker or perform hosted setup.

The current-user controller uses verified Auth and live staff access, then the original c1 RPCs through that user's own client. No service key, actor override, browser-selected UTC instant or implicit retry is accepted. The server independently converts local time and IANA zone, and the database repeats the check. Cancellation first binds the chosen schedule to an authorized bounded item history, then the database rechecks its actual item capability and state. Exact minimized DTOs refuse unexpected fields, mismatched identity, inconsistent states and oversized/duplicate history.

Staff review the original local date/time, zone, exact approved revision or withdrawal, UTC equivalent and reason before Save schedule. Only one pending plan per item is allowed. Cancellation has its own reason and confirmation, and cannot undo completed publication. The paused state is visible, and there is no activation control. Recent plans show at most ten minimized records and separate pending, cancelled, refused and recorded outcomes. A recorded generation still needs delivery verification.

Uncertain writes are never resent. The component blocks further mutations until the operator reloads and reviews the page. Concurrent submissions share a ref lock; changing preview inputs invalidates the preview. Stale reads are ignored, and permission refusals clear schedule details and ask the existing workspace to recheck item access. Native inputs and inline confirmation retain the dashboard styles, keyboard focus and responsive layout.

Acceptance must cover actual local Auth/MFA, PostgREST, Next actions, Owner/scoped Editor success, Author/Reviewer/Learner/anonymous/service/AAL1 refusal, open-tab revocation, replay, server-bound time conversion, cancellation, response loss, paused state, restricted execution and delivery uncertainty. Existing controller, request, account, factor, body and time budgets must remain unchanged. No real user, hosted provider or credential participates. Generated resources and the fake hook must be cleaned up exactly.

Browser evidence covers 1440/390/320 widths, 200% CSS zoom, keyboard focus, overflow, actual response payloads and axe. CSS zoom is not certification of native zoom or screen-reader behavior. Owner visual approval is a separate acceptance decision.

Combined hosted review is prepared after the source/connected evidence. It covers c1 and c2 migrations, restricted SQL role and exact history recording, with controls paused. Inactive Cron installation is separate from extension/secret configuration or activation. Hosted SQL, credentials, runtime settings, real deployments, family cutover, commit and push each remain within their separately authorized scopes. MP08d retains measured production delivery/cache/recovery and approved source-family cutover.

Next: owner source application and visual acceptance, then separately authorized combined hosted MP08c migration/read-only acceptance and exact history. No live activation or full MP08 closeout is implied by this source patch.

Scheduling history is loaded explicitly with Load schedules. Confirmed write DTOs update the local history without redundant authorization reads. Every new action still freshly verifies Auth and live SQL access; no grants or identity are cached between actions.
