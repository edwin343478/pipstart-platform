# Milestone 22: release closeout (roadmap versus delivered)

This is the final reconciliation for M22, the staff content platform, delivered as MP01–MP12. The evidence index is `milestone-22-release-evidence.json`; the owner handover is `milestone-22-handover.md`.

**Status:** all approved scope is delivered or was explicitly amended by the owner before closure (17 November 2026). M22 closes when the owner gives final acceptance after this commit's CI is green. The MP11 pre-audit was internal; **no independent audit has taken place.**

## Package exits

| Package      | Exit commit                               | Scope                                                               |
| ------------ | ----------------------------------------- | ------------------------------------------------------------------- |
| MP01         | (contracts)                               | Feature, acceptance and visual contracts (`milestone-22-mp01-*`)    |
| MP02 to MP03 | see `milestone-22-mp03-release-review.md` | Staff core, roles and MFA entry, people, governance, account safety |
| MP04         | `08f5f84`                                 | Editorial store and contracts                                       |
| MP05         | `e5e68a2`                                 | Import, parity and the content-source bridge                        |
| MP06         | `25c8ace`                                 | Course and lesson editors, review, archive and restore              |
| MP07         | `616ce75`                                 | Quiz versions, quiz editor, sandbox preview                         |
| MP08         | `658e757`                                 | Sealed publication generations, delivery, scheduling (paused)       |
| MP09         | `2e082c2`                                 | Partners and affiliate links (live)                                 |
| MP10         | `25e1fe8`                                 | Maintenance, link reports and audit filters                         |
| MP11         | `ade6019`                                 | Internal pre-audit: AT01–AT05, fixes, runbook                       |
| MP12         | this commit                               | This closeout and the handover                                      |

## The 14 roadmap features

| Feature                   | Disposition                       | Proven by                                                                                                          |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Course editor             | **Delivered**                     | Create, edit, reorder, archive and restore; new routes without per-item code (MP04–MP06, MP08)                     |
| Lesson editor             | **Delivered**                     | MP06 connected runs; restore drill (MP11c1)                                                                        |
| Quiz editor               | **Delivered with an amendment**   | Editing, immutable versions and history (MP07). See amendment A4                                                   |
| Draft review              | **Delivered**                     | Submit, review, changes requested, exact-hash approval; Owner single-person policy (MP06, MP07)                    |
| Publishing                | **Delivered**                     | Sealed generations; learner pages read the store for analysis, curriculum and partners (MP08, MP09)                |
| Scheduling                | **Delivered paused**              | Hosted catch-up pilot (MP08). See amendment A1                                                                     |
| Revision history          | **Delivered**                     | Immutable revisions, diffs, restore as draft (MP04–MP09; MP11c1)                                                   |
| User management           | **Delivered with a stated limit** | People and governance (MP03). The learner account provider and staff account maintenance are published default-off |
| Role management           | **Delivered**                     | Owner-only role changes; AT01 (MP11c2)                                                                             |
| Partner management        | **Delivered, live**               | Partner store, policy and import parity (MP09)                                                                     |
| Affiliate link management | **Delivered, live**               | Links, expiry, revoke, `/go` (MP09)                                                                                |
| Content review reminders  | **Delivered**                     | In-app due and overdue worklists; no reminder email, by decision (MP10)                                            |
| Audit logs                | **Delivered**                     | Every staff change audited atomically; AT04 in CI (MP02–MP11)                                                      |
| Broken-link reports       | **Delivered with an amendment**   | Internal checks gate Make live; manual results (MP10). See amendment A3                                            |

## Acceptance tests

AT01 to AT05 are all **accepted**; see `milestone-22-mp11-release-review.md`.

| Test | Evidence                                                           |
| ---- | ------------------------------------------------------------------ |
| AT01 | 180 of 180 forged-metadata attempts refused                        |
| AT02 | All disclosure attempts refused, including a replayed Owner action |
| AT03 | No secret exposure in any response or log                          |
| AT04 | Audit coverage proven in CI                                        |
| AT05 | Retention and restore proven in CI, with note A4                   |

## MP01 release gates

| Gate                             | Disposition                                                                |
| -------------------------------- | -------------------------------------------------------------------------- |
| `MP01-visual-render`             | Passed (sample components); staff pages also axe-checked through MP06–MP11 |
| `MP03-live-admin-learner`        | **Amended (A2)**                                                           |
| `MP08-hosted-scheduler-capacity` | **Amended (A1)**                                                           |
| `MP01-exact-release-ci`          | This commit's CI on main, confirmed before the owner's final acceptance    |
| `MP01-owner-acceptance`          | The owner's final "Accept M22"                                             |

## Amendments accepted by the owner (17 November 2026)

| #   | Amendment                                                                                                                                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | **Scheduled publishing ships paused** (scheduler version 8, Cron job 2 inactive). Resuming needs the hosted capacity check. Manual publishing is the operating mode         |
| A2  | **The live admin and learner gate is deferred** until test accounts exist. Real Auth and PostgREST were proven locally (MP03, MP11c); CI skips the live learner gates       |
| A3  | **The automatic single-link check ships off.** Its rules are tested with simulated network faults; the real network test was not run                                        |
| A4  | **Quiz editor gaps:** no new-quiz creation, no reviewer read-only view, no archive button. The store archives and restores quizzes, and every version is kept               |
| A5  | **The Moderator role covers assigned maintenance only;** no moderation feature exists                                                                                       |
| A6  | **MP11 lean path:** the integrated journey and failure drills are a traced evidence map, not one single run; the date-field fix was verified by a same-browser reproduction |

**Accepted limits:**

- Scheduling events are kept in their own ledger and are not shown on the Staff audit page.
- Staff calls have no rate limit of their own; each one needs an MFA staff session.
- The connected run bypassed CSP for its local bridge.

## Open items for after M22

- **Revoke the unused `service_role` grant** on `pipstart_set_lesson_completion`: a small hosted migration (deferred by the owner).
- **Hosted database backups and retention:** not verified (owner chose to skip).
- **The amendments above,** if they are taken up in a later milestone.
