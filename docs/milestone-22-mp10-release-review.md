# MP10 acceptance and release review

This is the handover entry point for MP10 (maintenance and link reports). The evidence index is `milestone-22-mp10-release-evidence.json`. The per-patch guides:

- `milestone-22-mp10a-maintenance-store.md`
- `milestone-22-mp10b-reference-check.md`
- `milestone-22-mp10c-maintenance-pages.md`
- `milestone-22-mp10d-safe-link-check.md`
- `milestone-22-mp10f-audit-filters.md`

## Current status: MP10 accepted (16 November 2026)

| Commit    | Delivered                                                                              | CI                                                                             |
| --------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `952eec1` | Maintenance store: due dates, ownership, acknowledgement, results, allowlist (6 files) | CI, M21 SQL and M22 SQL (49 inputs) passed; live learner release gates skipped |
| `1755060` | Internal reference check and the Make live gate (11 files)                             | CI, M21 SQL and M22 SQL passed; live learner release gates skipped             |
| `9674b77` | Staff Maintenance pages (14 files)                                                     | CI, M21 SQL and M22 SQL passed; live learner release gates skipped             |
| `6be9fb0` | Safe single-link check, off by default (7 files)                                       | CI, M21 SQL and M22 SQL passed; live learner release gates skipped             |
| `8213869` | Staff audit filters and the content audit view (12 files)                              | CI, M21 SQL and M22 SQL (51 inputs) passed; live learner release gates skipped |

**What is live:**

- **The maintenance store** (hosted migration `20261118090000`) and **the audit views** (hosted migration `20261119090000`): each applied by the owner, accepted read-only and recorded in history.
  - **118 maintained items** are computed on read from generation 10.
  - **89 lessons are "No review on record".** Lessons carry no review date yet, and the import date is never presented as a review.
  - **29 are current:** 21 quizzes, 6 analysis posts, and Deriv's partner and link.
  - **Review intervals** are Owner policy: analysis posts 180 days, lessons 365 days.
- **Maintenance pages** (`/admin/staff/maintenance`):
  - Assigned to me;
  - Due and overdue (Owner and Editors);
  - Link report;
  - Review policy.
- **Actions:**
  - The Owner assigns by name, and an Editor can assign to themselves.
  - The assignee or the Owner acknowledges (never a review), reschedules within 90 days (365 for the Owner) and records manual checks.
- **Make live** refuses a revision that points at a `/tools` page or a public image this deployment does not have, listing each problem before anything is sent.
- **The automatic single-link check** is built but **off** (`PIPSTART_MAINTENANCE_PROBE_ENABLED` is not set). The allowlist is empty.
- **The Staff audit page** filters staff access changes, or content and maintenance changes, by action, actor, item and UTC days. The content view never shows free-text reasons.
- **No reminder email, no Cron and no background crawl.** Scheduled publishing stays off (scheduler paused at version 8).

## Gate disposition

| Gate                                                                                                       | Disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Assigned due/overdue worklist; acknowledgement and reassignment; no new email (`content-review-reminders`) | **Accepted.** SQL suite and connected local rehearsal (18 gates). Hosted walkthrough on 16 November: the Owner assigned the lesson `crypto-start-here` to themselves, acknowledged it and recorded a manual check. The read-only check confirmed exactly those three actions, three audit rows, the lesson still "No review on record", and generation 10 and the lesson's revision unchanged.                                                                                                                                                                     |
| Acknowledgement does not fabricate a fresh factual review                                                  | **Accepted.** Acknowledge and reschedule never change content dates; the SQL suite, the connected run and the walkthrough check each assert that the stored review date and revision are untouched.                                                                                                                                                                                                                                                                                                                                                                |
| Internal reference, dependency and asset checks, including before publication (`broken-link-reports`)      | **Accepted.** The first report over today's content (the generation 10 items) found **no** missing pages, images, parents or quiz targets in 162 items. The check reached 152 diagrams, 154 tool links and 21 quizzes; 70 of 70 planted breaks were caught. Make live is gated on the same check.                                                                                                                                                                                                                                                                  |
| Known-broken versus unknown; 404/410, redirect, forbidden, throttled, timeout, not checked, manual         | **Accepted.** The classifications are stored separately for manual and automatic results; the automatic classification is unit-tested for each case.                                                                                                                                                                                                                                                                                                                                                                                                               |
| Safe selective external probes                                                                             | **Accepted with a stated limit.** The rules are implemented and fault-tested with simulated DNS and transport: HTTPS on 443, allowlisted non-affiliate hosts, every address public (IPv4 and IPv6), the connection pinned to the checked address, no redirects, no cookies, no body, bounded, one at a time. **The real network transport has not been exercised against the internet:** the owner chose to skip the optional Part 2 of the walkthrough, and the check stays off. Turning it on later needs the flag, one allowlisted host and one observed check. |
| Audit (`audit-logs`, AT04)                                                                                 | **Accepted.** Every maintenance change writes exactly one audit row in the same transaction. Refusals and unchanged calls write none (SQL suite, connected run: 7 rows, walkthrough: 3 rows).                                                                                                                                                                                                                                                                                                                                                                      |
| Bounded pagination and performance                                                                         | **Accepted.** Cursor pages of at most 50, filtered by status and type; 118 items are computed on read.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Audit filters on the Staff audit page (owner decision D7)                                                  | **Accepted, delivered late as MP10f.** MP10c shipped without it; this was found at the exit review and built at the owner's request. SQL suite (gating, every filter, paging, no reasons), consolidated proof (51 inputs), hosted migration `20261119090000` accepted (catalog `8a197c3f…`/`0249f9eb…`) and recorded.                                                                                                                                                                                                                                              |

## Operator rules

- **A real review** is a new approved revision with an updated review date. Acknowledging only records that someone has seen the item.
- **Reschedule** only with a reason and within the limits. A new live revision starts a fresh cycle, and the maintenance owner stays.
- **Assets:** after adding a public image or a `/tools` page, run `node scripts/reference-targets.mjs --write`. CI fails if the list is stale.
- **To enable automatic checks:**
  1. Add hosts to the allowlist first.
  2. Set `PIPSTART_MAINTENANCE_PROBE_ENABLED=true` and redeploy.
  3. Check one link and confirm the recorded result.
  4. Affiliate hosts and token-like links are always refused.

## Next

MP11 (pre-audit and integrated drills), then MP12 (final reconciliation and handover).
