# Milestone 20 — audit closeout and release record

Date: 11 October 2026.
Status: local audit remediation complete through approved Phase 2; Phase 3
candidate awaiting application and validation. Not final deployed release sign-off.
Baseline Git HEAD: 56c25381e88e17c55150747347912f65afb0e765.
Audit patches are currently working-tree changes, not a newly published revision.

## Evidence recorded

- Owner approved Phase 1 and Phase 2 visuals.
- Phase 2 helper: 1,087 unit tests in 111 files; lint, production build,
  TypeScript and all 42 public browser chunks passed.
- Phase 2 browser suite: 20 cases in three Chromium projects, 54 passes and six
  known viewport-specific skips, no failures/retries. Saved report independently
  verified against local commit, source fingerprint, build and runtime.
- Owner reports calendar scrolling works on Samsung/Android Chrome, localhost.
  Exact phone model, browser/OS versions and served build were not supplied.
  This is not acceptance for Safari, deployment or every gesture position.
- Phase 3 results must be added only after its helper completes.

## Audit disposition

| Area                                         | Decision / evidence                                                                                                                                                                                                                          |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phone scrolling and nested panels            | Preserve owner-approved design. Current fixtures pass and the owner reports an actual Android pass. Earlier audit failures remain historical, not disproven for all environments. Safari and deployed checks remain open.                    |
| Fixture tests versus real provider           | CI/report gate explicitly grades integration only. Keep live-device checks separate. No fixture is proof of provider accuracy or accessibility.                                                                                              |
| Lost frame / unavailable calendar            | Phase 2 observes frame and container removal, restores fallback and offers user-triggered document reload. Late insertion can recover. Blank-frame guidance stays visible.                                                                   |
| Generic glossary links                       | Phase 2 uses existing public term anchors with Related term labels. No unpublished exact payroll/CPI/PMI definitions are fabricated.                                                                                                         |
| Repeated lesson links                        | Retained intentionally to preserve approved design and lesson destinations. Not represented as a new exact-event lesson system.                                                                                                              |
| Mobile typography and loading skeleton       | Optional redesign deferred. No approved sizes, lazy-loading privacy timing or panel heights change in audit remediation.                                                                                                                     |
| Scheduled-event matching, search and filters | Not delivered. Static explanations and provider full-calendar link remain the accepted implementation approach; final reduced-scope acceptance still needs recording. Curated weekly events require separately approved editorial ownership. |
| Time zone                                    | Preserve provider-owned time guidance; do not restore Nairobi/GMT or invent controls. Live/DST checks remain open.                                                                                                                           |
| Country wording                              | Keep international copy as explicitly requested. Do not restore Kenya/Tanzania wording from the audit suggestion. Existing filter settings are not a coverage guarantee.                                                                     |
| Shared layout extraction                     | Deferred: broad refactoring would risk previously approved pages and appearance. No new shared component abstraction is needed for closeout.                                                                                                 |
| Mobile navigation source assertions          | Phase 3 replaces source-text checks with rendered active-tab and route-visibility checks. Existing browser tests still cover responsive presentation.                                                                                        |
| Full-document entry / exit                   | Retained security boundary. CSP belongs to the document. Do not replace with client navigation or broaden global CSP. Modified/new-tab and same-page hash behaviour remain unchanged.                                                        |
| Additional discovery links                   | Deferred; existing Calendar menu and Analysis entry remain tested. Home/footer/lesson changes need separate scope approval.                                                                                                                  |
| Terms, privacy and live release              | Not certified by code tests. Owner review, dated evidence and CI are open gates below. No written provider permission is claimed or assumed necessary in every case without examining applicable terms.                                      |

## Manual release checks — pending unless explicitly recorded

For each check record date, tester, URL, committed revision, build/deployment,
device model, OS/browser version, steps, expected/actual outcome and evidence.
Use PASS, FAIL, PENDING, UNAVAILABLE or explicitly ACCEPTED LIMITATION.
An unavailable test is not a pass.

| Gate                             | Current record                                        | Required follow-up                                                                                                                                                                                                              |
| -------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Android Chrome scrolling         | Owner-reported localhost PASS; limited device details | Repeat on deployed candidate: swipe upper/middle/lower event area both ways; explanations, page continuation, tap control, rotate, fallback.                                                                                    |
| iPhone Safari                    | PENDING                                               | Same real-device checks; record unavailable if no device, then obtain an explicit risk decision before release.                                                                                                                 |
| Keyboard / screen reader         | PENDING for live provider                             | Focus order, visible focus, scrolling, disclosures, full calendar, glossary anchors, leave calendar; identify provider limitations separately.                                                                                  |
| 200% enlargement / spacing       | PENDING for M20 live page                             | Check clipping, overlap, reflow and reachable controls without changing approved design silently.                                                                                                                               |
| Live times / date rollover / DST | PENDING                                               | Compare named releases against official source schedule, with source and provider time zones, dates and DST context. Do not infer a universal timezone from one probe.                                                          |
| Live values / missing values     | PENDING                                               | Record units and actual/forecast/prior; missing is not zero. A visible iframe is not a freshness check.                                                                                                                         |
| Provider / privacy review        | PENDING                                               | Record applicable official terms/version, intended commercial/affiliate use, attribution and third-party disclosure decision; retain clarification or correspondence if needed. Do not scrape, cache or redistribute feed data. |
| Reduced-scope acceptance         | PENDING final acknowledgement                         | Explicitly accept provider embed plus static teaching cards; native date/timezone controls, guaranteed local coverage and event-specific matching are not delivered.                                                            |
| Remote CI                        | PENDING commit/push                                   | Record successful run URL, exact pushed commit and M20 artifact after authorized commit/push; stale local reports are not CI.                                                                                                   |
| Deployment / rollback            | PENDING M20-specific reference                        | Record candidate/live URL, last successful deployment and rollback target; smoke-test full-calendar and official-source fallback.                                                                                               |

## Consolidated validation and handoff

The Phase 3 user-run helper guards the current approved files, applies only its
explicit targets, and runs formatting, verifier self-test, full serial unit suite,
lint, production build, TypeScript, public bundles and the M20 browser gate.
The browser contract remains 54 passes / six justified skips. Record actual unit
counts from that run; do not reuse the Phase 2 count as a Phase 3 result.

No staging, commit, push or deployment is authorized by applying the helper.
After explicit authorization, review and stage only the agreed M20 files, including
new scripts/tests/docs; do not include unrelated M15 packages or archives.
After committing, rerun M20 browser tests and verifier since metadata binds to
HEAD. After pushing, inspect fresh CI for the pushed revision and perform the
manual release checks on the actual deployment.

Mark audit code remediation complete only after Phase 3 passes and is approved.
Mark production release complete only after remaining gates are passed or
explicitly accepted as limitations by the owner, with evidence recorded.
