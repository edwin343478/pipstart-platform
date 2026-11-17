# MP11 acceptance and release review (internal pre-audit)

This is the handover entry point for MP11 (pre-audit and operational rehearsal). **It is an internal review, not an independent audit** (owner decision D1). The evidence index is `milestone-22-mp11-release-evidence.json`.

The per-part guides:

- `milestone-22-mp11b-conflict-codes.md`
- `milestone-22-mp11c1-audit-coverage.md`
- `milestone-22-mp11c-connected-acceptance.md`
- `milestone-22-mp11d-journey-and-drills.md`
- `milestone-22-operations-runbook.md`

## Current status: MP11 accepted (17 November 2026)

| Commit      | Delivered                                                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `41d1474`   | Stale progress saves answer `PT409` instead of retrying (hosted migration `20261120090000` applied, accepted and recorded); no learner ID in a log |
| `7646254`   | SQL CI for audit coverage (AT04) and retention and restore (AT05), 56 verifier inputs                                                              |
| `a0ce155`   | Next.js 16.4.5 (advisory GHSA-mfr8-8qww-v76h)                                                                                                      |
| this commit | Accessibility fixes, MP11c/MP11d evidence, the operations runbook and this review                                                                  |

## Acceptance tests

| Test                                          | Disposition                                                                                                                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AT01: Authors cannot change roles             | **Accepted.** 180 of 180 forged-metadata attempts by six roles refused, with real Auth/PostgREST and no change. Owner positive control passed                                                       |
| AT02: Moderators cannot change disclosures    | **Accepted.** RPC, page and replayed-action attempts refused; Owner replay positive control passed                                                                                                  |
| AT03: Affiliate Managers cannot reach secrets | **Accepted.** No secret or other member's email in any page, payload, action reply, error body, asset or log, as any role                                                                           |
| AT04: Important actions are logged            | **Accepted.** All 22 audited actions: refused calls write nothing, a failed audit rolls back, an accepted call writes exactly one row (CI)                                                          |
| AT05: Deleted content recoverable             | **Accepted, with a note.** Archive and restore keep history, generations and progress, with nothing republished (CI). The store archives and restores quizzes; the quiz editor has no button for it |

## Findings register (MP11a)

| #   | Finding                                                             | Disposition                         |
| --- | ------------------------------------------------------------------- | ----------------------------------- |
| F1  | Learner progress `40001` retry storm                                | **Fixed** (`41d1474`, hosted)       |
| F2  | Staff account claim `40001`                                         | **Fixed** (`41d1474`, hosted)       |
| F3  | Scheduling not in the Staff audit view                              | Accepted while scheduling is paused |
| F4  | Moderator role has no moderation feature                            | For MP12 to reconcile               |
| F5  | Learner ID in a log line                                            | **Fixed** (`41d1474`)               |
| F6  | Service key use                                                     | Confirmed safe (AT03)               |
| F7  | No rate limit on staff calls                                        | Accepted limit (MFA staff only)     |
| F8  | Owner-run SQL raises `40001`                                        | No change needed                    |
| New | `/analysis` tab contrast 4.38:1                                     | **Fixed** (this commit)             |
| New | Staff editor date fields lose the focus ring on the calendar button | **Fixed** (this commit)             |
| New | Next.js advisory                                                    | **Fixed** (`a0ce155`)               |

## Hosted access review (17 November, read-only, counts only)

| Item                                              | Value                                      |
| ------------------------------------------------- | ------------------------------------------ |
| Staff                                             | Enabled (version 3)                        |
| Active members                                    | 1, the Owner (exactly one active Owner)    |
| Inactive members, delegations, unexpired receipts | 0                                          |
| Assignments                                       | 1 maintenance assignment (the walkthrough) |
| Scheduler                                         | Off                                        |
| Live generation                                   | 10                                         |
| Anonymously callable M22 functions                | 0                                          |

**One leftover grant:** `service_role` can still execute `pipstart_set_lesson_completion`. It is a Supabase default the September migration did not revoke. The app never uses it (only the learner's own session calls it). **Recommended for later:** a small hosted migration to revoke it.

## Amendments for MP12 to record

- **Lean path (owner, 17 November):**
  - MP11d is a traced evidence map, not one single-run journey (D2, D6, D7).
  - The date-field fix is verified by a same-browser reproduction, not a further full run.
- **Not verified:** hosted database backups and retention (a Supabase plan fact for the owner to confirm).
- **Open from MP10:** the automatic link check's real network test.

## Next

MP12: final reconciliation and handover.
