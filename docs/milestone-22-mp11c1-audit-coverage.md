# M22 MP11c1: audit coverage and retention drills (SQL)

Part of the MP11 internal pre-audit. Two SQL suites join the consolidated verifier (56 inputs), so CI keeps proving them on every commit. No migration and no app change.

## `test-m22-audit-coverage.sql` (AT04: important actions are logged)

**Classification.** Every M22 API function, and the three learner progress calls, is in exactly one class:

| Class           | Count | What it means                                                                                                    |
| --------------- | ----- | ---------------------------------------------------------------------------------------------------------------- |
| audited         | 22    | A staff change that writes one audit row                                                                         |
| schedule_ledger | 2     | Schedule and cancel; recorded in the immutable schedule ledger (finding F3, accepted while scheduling is paused) |
| learner_self    | 3     | A learner's own progress                                                                                         |
| staged_proof    | 7     | Proof, receipt and claim steps; the completing call writes the audit or the provider journal                     |
| service_system  | 8     | Server-only delivery and provider steps, recorded in their own state tables                                      |
| reader          | 23    | Reads only; none contains an insert, update or delete                                                            |

**A new API function fails the suite until it is classified,** and so does a classified one that disappears. None is anonymous.

**Each audited writer is driven three ways through the real RPC:**

1. Refused by a role without the capability: nothing in the three private stores changes, and no audit row is written.
2. With the audit insert made to fail: the failure surfaces, and the whole change rolls back.
3. Accepted: exactly one audit row.

## `test-m22-retention-restore.sql` (AT05: deleted content recoverable)

A generated lesson and quiz go live, and a learner completes the lesson.

**Quiz versions:** quiz version 2 replaces version 1. Version 1 stays in history, marked superseded, with its body and approval decision intact. Generation 1 still holds it.

**Hold and withdraw:** an Owner hold blocks archiving, and live content must be withdrawn first.

**Archive** (the store's trash) of the lesson and the quiz:

- keeps every revision and decision;
- changes no generation;
- keeps the learner's progress.

**Deletion:** no API role can delete or update the store's history tables, and no function deletes them. Even the database owner cannot delete a revision: the restored draft has no other reference, and the immutability guard still refuses.

**Restore as draft:**

- An Author cannot restore.
- The Editor's restore adds one draft revision with the archived body (its sources and diagram reference included). The earlier approved revision is marked superseded, with its body and decision kept.
- No approval is carried over.
- Nothing is republished.
- Learner progress is unchanged.
- Hold, release, archive and restore are each audited.

**For the AT05 record:** the store archives and restores quizzes. The quiz editor has no archive button for them (an MP07 limit).

## Proof

- **Sabotage proof:** each suite fails on every planted defect (9 of 9) and passes unchanged:
  - an unclassified function;
  - a removed function;
  - an anonymous grant;
  - a writer that stops auditing;
  - a swallowed audit failure;
  - a double audit;
  - unguarded revision deletes;
  - a delete grant;
  - an archive that erases learner progress.
- **CI-style consolidated proof:** 56 inputs, `auditCoverageStaged` and `auditCoverageHead` true.
