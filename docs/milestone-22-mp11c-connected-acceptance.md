# M22 MP11c: connected acceptance and accessibility fixes

Part of the MP11 **internal** pre-audit; this is not an independent audit. MP11c1 (SQL suites, `7646254`) is described in `milestone-22-mp11c1-audit-coverage.md`. This page covers the connected run (MP11c2) and the two fixes it led to.

## The connected run

- **Code:** the published main `a0ce155`, served by a production build made inside the run.
- **Stack:** a run-owned isolated stack with the cached Postgres, Auth and PostgREST images, internal network only, tmpfs, removed afterwards.
- **Accounts:** seven generated staff accounts with real TOTP.
- **Browser:** headless Chromium.
- **Hosting:** none.

| Gate                              | Result (run 3, 17 November 2026)                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **AT01:** roles cannot be changed | **Passed.** Each non-Owner role (Administrator, Author, Reviewer, Editor, Moderator, Affiliate Manager) had `role: owner` forged into the user and app metadata of its real token. All 180 role, delegation and assignment attempts were refused (RPC `42501`; private tables `PGRST106`). Staff state was unchanged. Positive control: the Owner's same call was issued |
| **AT02:** disclosures protected   | **Passed.** All 10 Moderator and Affiliate Manager attempts were refused: RPC, page, and a replay of the Owner's captured policy action with their own sessions. Positive control: the Owner's replay saved                                                                                                                                                              |
| **AT03:** no secret exposure      | **Passed.** 0 hits in 1,878 responses (pages, RSC payloads, action replies, error bodies, 50 static assets) across all roles and an anonymous learner, plus the server and build logs. Searched for: the service key, JWT secret, deploy hook, TOTP secrets, passwords and other members' emails                                                                         |
| **Query budget**                  | **Passed.** On 2,007 items, 20,019 audit rows and 5,001 maintenance events: worst p95 14.2 ms (maintenance worklist); at most 5 RPCs per page render                                                                                                                                                                                                                     |
| **Accessibility**                 | 19 views (15 staff, 4 learner) at 1440, 390 and 320, with 200% text and keyboard reach. One real contrast defect, and a date-field focus gap found on the recheck. **Both fixed below**                                                                                                                                                                                  |

**Stated limits:**

- **Security policy:** the test browser bypassed the CSP. The production CSP correctly refuses the plain-HTTP local API bridge, and the CSP itself is CI's runtime-security gate.
- **Timings:** query timings are database time in the isolated stack, not hosted latency.
- **Date-field fix:** verified in the same Chromium with screenshots, and not re-run through the full harness (owner's lean-path decision, 17 November).

Runs 1 and 2 stopped on harness problems (a wrong column name in my query, then the Next development server timing out). Neither was a product defect.

## Fixes

1. **`/analysis` category tabs** (`app/analysis/page.module.css`). The inactive tab's text was `#667085` on `#eef1f3`, a contrast of 4.38:1, below the 4.5:1 required for 13 px text. It is now `#596579`: 5.20:1 on the tab track and 5.90:1 on white. Verified with axe on the real page (recheck 1).
2. **Date fields in the staff editors** (`components/staff/staff-curriculum-editor.module.css`). A Chromium date field has a fourth Tab stop, its calendar button. There the field matches neither `:focus` nor `:focus-visible`, so the editor's focus ring disappeared and only a faint native box remained. `.editor input[type="date"]:focus-within` now keeps the same 3 px ring.

## For MP12

The keyboard sweep found no other gap. The audit page's date fields already showed a ring at every stop.
