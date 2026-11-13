# MP08 check-only reconciliation of observed deployment

A deployment hook request may time out after the provider accepted it. The scheduled pilot produced generation5, Vercel reported Ready and public GET observation matched its exact generation/seal/groups and fixture HTTP200. The historical scheduler receipt correctly remains unknown, while refresh is failed/attempt1. Do not resolve this by sending another deployment request.

This patch extends the existing authorized Check live site flow. After the public marker matches the authoritative private snapshot and configured groups, the server calls the service-role-only pipstart_publication_verify_observed RPC. SQL locks the publication pointer before the refresh row, requires the current exact generation and seal, and compares expected refresh state and attempt count. A concurrent retry or publication therefore cannot be silently overwritten. A repeated successful check is idempotent.

The RPC permits processing or failed to become verified. Attempts do not increment, including at the 20-attempt cap. The fixed note records observed live verification. The historical scheduler delivery receipt, token and finish timestamp are untouched: unknown means the request acknowledgement was not confirmed, even when a later independent check establishes that the content is live. No hook, scheduler wake, Cron activation, publication, credential or content edit occurs on this path.

Existing owner/editor authorization, current session checks, private snapshot read, public GET limits and exact group/marker validation remain in place. The RPC is not accessible to anon, authenticated or the restricted scheduler role. Its grants, security-definer owner and empty search path require hosted acceptance. The existing general refresh RPC is unchanged.

Validation: focused application and scheduled-delivery tests, typecheck, scoped lint and exact SQL CI input checks. The disposable SQL rehearsal applies the accepted predecessor migrations, runs rollback-only grant/input/state/attempt/receipt tests, checks empty rollback head, and observes two-session idempotent verification and stale-head refusal. SQL/Auth stubs and synthetic sealed heads isolate transition behavior; they do not constitute new hosted acceptance or real browser verification. Existing snapshot production and scheduled provider tests remain covered separately.

Owner rollout order:

1. Apply the fingerprinted eight-file source packet. This executes no migration and performs no hosted operation.
2. Separately approve the additive hosted migration and read-only acceptance/history recording. Do not run the rollback-only test suite in hosted SQL Editor.
3. Review and approve commit/push, then verify exact-commit CI and Ready Production deployment.
4. On the deployed patch, use Content library -> Check live site once for current generation5; inspect that refresh becomes verified while attempts remain1 and the scheduler receipt remains unknown. Do not use Retry delivery.
5. Separately authorize baseline restoration to the next generation and exact pilot fixture archive/verification. Scheduler remains paused and Cron inactive throughout.

The new migration/suite are included in the existing consolidated SQL CI ordered manifest and runner. Earlier migrations and archived pilot evidence are preserved.
