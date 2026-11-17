# M22 audit follow-up (Packages 1, 2, 4 and 5)

An implementation review of the accepted M22 (17 November 2026, reviewed commit `0961665`) found:

- three defects in the automatic single-link check, which is switched off;
- an unused `service_role` grant;
- two documentation errors.

This change fixes all of them. **The automatic link check stays off** (`PIPSTART_MAINTENANCE_PROBE_ENABLED` unset); nothing is enabled by this change.

## Fixes

| Finding                                                                       | Fix                                                                                                                                                                                                                                  | Proof                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F1:** the check contacted the host before the item and link were authorized | New `pipstart_maintenance_probe_intent` (migration `20261121090000`) authorizes the exact person, item, live revision, link and host **before** any DNS or HTTP. `record_result` keeps its own checks                                | SQL suite: unassigned, unknown item, stale revision, link not in the content, unlisted host and affiliate host are all refused with **nothing written**. Unit tests: **no DNS or HTTP** for every refusal |
| **F2:** the 8 s deadline was only a socket inactivity timer                   | One 8 s deadline across DNS (itself 3 s), connection, headers and the HEAD-to-GET fallback. On expiry the real request is aborted through an `AbortSignal`; all timers are cleared                                                   | Fake-timer tests: a send that never answers ends at exactly 8 s with the request aborted; the fallback stays inside the same 8 s; a hanging DNS ends at 3 s with no contact                               |
| **F3:** encoded paths like `/%72eset/` bypassed the deny list                 | The path is decoded once before the deny test. Malformed encodings, double encoding, encoded `/` or `\` and backslashes are refused                                                                                                  | Tests for `%72eset`, `%75nsubscribe`, `%2572eset`, `%2F`, `%5C`, a malformed `%E0%A4%A` and `LOG%49N`                                                                                                     |
| **F5:** unused grant; no limit on the expensive action                        | `service_role` EXECUTE on `pipstart_set_lesson_completion` is revoked. The intent allows at most **20 checks per person per rolling hour**, counted in the store so every server instance shares the limit; the 21st answers `PT429` | Negative grant test (authenticated keeps EXECUTE); quota test (21st refused, nothing written, another person unaffected)                                                                                  |
| **F10:** stale evidence status; runbook role rule                             | The evidence status now records acceptance. `milestone-22-release-receipt.json` cites the green `0961665` checks and deployment. The runbook states the real delegated-role rule. A5 is reworded as a clarification                  | Docs                                                                                                                                                                                                      |

**Proof that the tests bite:**

- The new unit tests fail (20 of them) against the previous probe code, and pass against the fixed code.
- The SQL suite fails on a planted intent that skips the permission check, and on a re-added `service_role` grant.

## Hosted step

Migration `20261121090000` adds one table, one function and one revoke. It is applied by the owner through the usual fingerprinted packet: preflight, migration, read-only acceptance, history.

## Not changed

- The automatic check is still off; turning it on still needs one controlled real-network check (A3).
- Broader staff rate limits (beyond this check) and the other audit packages (backups, quiz gaps, connected journey) are separate.

# Package 4: staff action limits

The audit asked for bounded per-person limits on consequential staff writes before a second staff member is added. Owner decisions D1–D8 were accepted on 17 November 2026.

## What changed

- **Store (migration `20261122090000`):**
  - A `before insert` trigger on each action journal (editorial audit, staff audit, schedule events, learner requests) classifies the action.
  - It takes one lock per person, counts that person's actions of the same class in the rolling hour, and raises `PT429` with `retry_after=<seconds>` once the limit is reached.
  - The whole call rolls back, so nothing is kept. No RPC body changed.
  - Only actions made in the person's own staff session are checked. The scheduler, migrations and owner-run SQL are never refused.
  - An action the classifier does not know is refused (`55000`), so any future journal operation must be classified on purpose.
- **Limits and exemptions:** see the runbook's "Staff action limits". They are kept in `pipstart_staff_private.action_limits`, which is closed to every API role.
- **App:**
  - `PT429` becomes a definite "limited" outcome, never "uncertain".
  - Editors, decisions, archive and restore, publication, scheduling, partners and maintenance show the limit message with a retry estimate, and keep the work.
  - Role, governance and learner-account changes map it to their existing "refused, nothing changed" outcome (a stated limit).

## Proof

- **SQL suite `test-m22-staff-action-limits.sql`** (verifier inputs 58 → 60, staged last). It checks:
  - one past the edit, review and publish limits is refused through the real RPCs with a retry hint, and changes nothing;
  - two people are counted apart;
  - hold, release, withdraw, publication restore and editorial restore all work at the limit;
  - writes with no session or another session are never refused;
  - the rolling hour releases on time;
  - the people limit and its exemptions behave correctly on the staff journal;
  - every journal operation is classified;
  - no API role has access.
- **The SQL suite bites:** it fails with the journal trigger disabled, with withdraw misclassified as publish, and with the session check removed.
- **A two-session race at limit 1:** the second session is refused. A planted lock-free limiter lets it through, which shows the race test is meaningful.
- **Unit tests:** 9 new tests, all failing against the previous code, where `PT429` fell through to "uncertain".

## Hosted step

Migration `20261122090000` adds one table, six functions, four triggers and four indexes. It changes no existing function and grants nothing. It is applied through the owner-run packet: preflight, migration, read-only structure acceptance, history. No limit is exercised on the live project.

# Package 5: quiz product gaps

Closes amendment A4 and finding F6. Owner decisions D1–D8 were accepted on 17 November 2026. **No store change:** the store already creates quizzes at version 1, lets assigned Reviewers read them, and archives or restores them after withdrawal. The gaps were in the staff app.

## What changed

- **New quiz (D1, D2):**
  - "New quiz" on module rows opens the quiz editor in create mode (`/admin/staff/content/quiz?parent=…&path=…`).
  - The server reads the module and its course and refuses a module that already has its module quiz, since each module has one module quiz URL.
  - It takes the next position among the children it can read, writes version 1 with the derived course, module, scope and review record, and sends the create once.
  - The created quiz passes the same rules as the grading registry, so it cannot break the learner build.
- **Read-only view (D4):** `/admin/staff/content/quiz/view?id=…[&revision=…]` for Owner, Author, Editor and Reviewer.
  - It shows the editable projection of one exact revision: questions, answer key, explanations, review record and sandbox preview.
  - Every call re-checks Auth and live roles, and the store still decides item access.
  - The route is dynamic, and the public-bundle check confirms no key or explanation reaches a browser chunk or a prerendered page.
- **Archive, restore and hold (D5):** the lifecycle panel now appears for quizzes, and the app no longer refuses them. The store rules are unchanged. The panel states that withdrawing ends unfinished attempts while completed results stay recorded.
- **Shared rendering (D8):** the editor's comparison and the new view use one `QuizSummary` component.

## Proof

- **SQL suite `test-m22-quiz-lifecycle.sql`** (verifier inputs 60 → 61, staged last; it works from any live generation). It covers:
  - create only at version 1, with a refusal recording nothing;
  - v1 published and frozen;
  - v2 published, with both versions kept for grading;
  - archive refused while live, recording nothing;
  - withdraw, archive, then restore as a draft that keeps version 2;
  - identical re-approval and a second publish;
  - an assigned Reviewer reading every revision but unable to save.
- **The suite bites:** it fails when a planted store lets a live quiz be archived, and when the frozen quiz versions are dropped.
- **Unit tests** cover:
  - create (derived fields, refusals, roles, one send);
  - the view (access, exact revision, no hidden attributes);
  - both routes, the editor's create mode, the view, the lifecycle panel and the library links;
  - a created quiz loading into the learner snapshot as a draft that learners do not see.

  Every new test fails against the previous code. Version continuity (an attempt on v1 still grades after v2) is covered by the MP07a snapshot test.

## Stated limits

- **Not visible to learners:** like a new lesson, a new quiz is created with `status: draft`, so learners do not see it even after Make live. No editor changes that status yet; this is the same for lessons since MP06.
- **Optional practice:** module completion requirements are not editable (D3).
- **Author line:** it reads "PipStart editorial team (see audit record)", because staff access carries no display name. The audit record names the person.
- **One module quiz per module:** the check covers the module children the caller can read. The Owner reads all of them.
