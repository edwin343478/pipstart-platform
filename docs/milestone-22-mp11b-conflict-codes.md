# M22 MP11b: conflicts answer instead of retrying

The MP11a internal pre-audit found two API-reachable functions that raised SQLSTATE `40001` for a refusal that can never succeed on retry. PostgREST retries `40001` itself, so the caller got no answer: MP04a measured 4,422 retries in 8.2 s for the same pattern. The owner chose to fix both, plus one log line, on 16 November 2026.

## Changes

**Migration `20261120090000_pipstart_m22_conflict_codes.sql`:**

- `public.pipstart_set_lesson_completion`: a stale `expected_revision` (the lesson open in two tabs or on two devices) now raises `PT409`, which PostgREST returns once as HTTP 409.
- `pipstart_staff_private.account_operation_claim`: a staff control version change after preparation now raises `PT409`. It is reached only through the default-off staff account maintenance transport, and only while staff is paused.

The function bodies are otherwise unchanged. `create or replace` keeps their signatures, owners and grants, and the migration checks this before it commits.

**App:**

- `lib/progress-conflict.ts`: `PT409` (and the old `40001`) shows "Progress changed on another device. Refresh and try again." Anything else shows "Progress was not saved. Try again." The lesson completion action uses it.
- `app/learn/assessment-actions.ts`: the reconciliation failure log no longer includes the learner's user ID. The attempt ID is enough to trace it.

**Proof:**

- `apps/pipstart/scripts/test-m22-conflict-codes.sql` checks:
  - a stale save answers `PT409` and leaves the lesson and its events unchanged;
  - the current revision saves;
  - a version change answers `PT409` and leaves the request prepared with no event;
  - the grants are unchanged.
- The consolidated verifier loads the learner progress schema (`20260916100000`) as a dependency for this stage, then the migration and the suite: 54 inputs.

## Not changed

`pipstart_staff_private.transition` and `account_operation_prepare` still raise `40001`. Neither can be reached through the API: they run only in owner SQL, and psql does not retry.
