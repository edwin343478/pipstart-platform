# MP06 acceptance and release review

This is the handover entry point for MP06 (staff course and lesson editors). The per-patch guides
describe each part in detail:

- `milestone-22-mp06a-content-workspace.md`
- `milestone-22-mp06b1-write-boundary.md`
- `milestone-22-mp06b2-editor-forms.md`
- `milestone-22-mp06b2a-curriculum-ready.md`
- `milestone-22-mp06c1-lesson-boundary.md`
- `milestone-22-mp06c2-lesson-editor.md`
- `milestone-22-mp06d1-revision-history.md`
- `milestone-22-mp06d2a-lesson-sources.md`
- `milestone-22-mp06d2b-review-publication.md`
- `milestone-22-mp06d3-archive-restore-hold.md`

The evidence index is `milestone-22-mp06-release-evidence.json`, generated from the run receipts.

## Current status: MP06 accepted (5 November 2026)

MP06 is accepted. Its source was applied as eleven owner-run patches (MP06a, b1, b2, c1, c2, c2a,
d1, d2a, d2b, d3 and b2a), each rehearsed before hand-over, and published as one commit, by owner
decision, so that exactly the state that passed the final 61-gate acceptance was released.

| Commit    | Delivered                                                                                          | CI and deployment                                                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `4cae4b8` | MP06: staff content library, course/module and lesson editors, history, review, archive (94 files) | M22 staff SQL CI passed; Vercel deployed. Main CI stopped at the dependency audit on a newly published advisory (below); its later steps did not run for this commit. |
| `4bd1435` | Override the development-only `minimatch` 10 line to 11.0.3 (2 files)                              | Main CI fully green, including the build and every browser check; M22 staff SQL CI passed; Vercel deployed.                                                           |

What is live:

- **Staff content library** at `/admin/staff/content`: bounded, resource-scoped reads of every permitted item and its exact latest revision, with minimized data and no private body in the browser.
- **Course and module editor** (`/admin/staff/content/editor`) and **lesson editor** (`/admin/staff/content/lesson`): structured controls for all 22 lesson block types, sections and movement, protected disclosures, a safe preview, structured HTTPS sources, explicit save with revision and hash conflict checks, unsaved-change protection, and controls that stay inert until the page has hydrated.
- **Revision history and comparison**: newest-first history and a server-side comparison of any earlier revision with the latest, through the editors' own projections.
- **Review and publication**: Send to reviewer, Approve or Request changes by a different reviewer, and Owner Publish while review is optional. A lesson needs 1 to 50 HTTPS sources before it can be submitted, approved or published, enforced in the database and checked first in the app.
- **Archive, restore as a new draft, and Owner hold.**
- **Hosted migrations `20261102090000` (revision reads) and `20261105090000` (publication sources)**, both hosted-accepted and listed in the migration history. The store still holds the 160 imported items and 201 revisions; the migrations changed no rows.

What is not live: approval does not change learner pages. Production keeps reading code, and the
public read path from the store is MP08. The staff features are behind the existing staff UI flag.

## Master-plan exit gate

| Gate                                                                                                                 | Evidence                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Structured create, edit, order, archive and restore; explicit Save draft; safe preview                               | Owner connected acceptances on a real local Auth, PostgREST and browser stack: MP06b2 (48 gates), MP06c (57), MP06d1 (58), MP06d2a (58), MP06d2b (59), MP06d3 (60) and the final journey (61, run `a43e9e82`), each with exact cleanup.                                                                                                            |
| Review and changes requested; the exact review and disclosure rules enforced                                         | The SQL suites run in the consolidated verifier (31 inputs): the different-person rule, the sources rule on submit, approve and publish, changes requests always allowed, and refusals that record nothing. In the browser, a sourceless lesson's Publish is refused with no write, an author sends a lesson to review and the Owner publishes it. |
| Revision comparison, conflict handling and unsaved-change handling                                                   | History and comparison read through the editors' projections; stale revisions and hashes are refused as conflicts; uncertain writes are never resent; the native leave guard protects unsaved work.                                                                                                                                                |
| Existing and new content saved, reloaded and reviewed with real browser, error, keyboard, mobile and 200%-text tests | Each acceptance includes axe scans at 1440, 390 or 320 px and CSS zoom 200% with no violations, keyboard paths and screenshots. Owner visual approval was given for MP06b2, MP06c and MP06d.                                                                                                                                                       |
| No full public cutover                                                                                               | Production learner pages read code; the store has no public read path.                                                                                                                                                                                                                                                                             |

## Owner decisions recorded

- **MP06d scope:** a read-only revision RPC for comparison; lessons need sources before review or Publish, with reviewer and review details taken from the store's decision record rather than typed into the body; split into d1 (history), d2 (d2a sources, d2b review and publication) and d3 (archive and hold).
- **One MP06 commit** of all 94 files rather than per-patch commits.
- **Two hosted packets in order**, each with a read-only preflight, the migration and a read-only acceptance, rehearsed first, and both applied before the push.
- **Curriculum editor hydration fix before release** (MP06b2a), the same fix the lesson editor received in MP06c2a.

## Defects and findings fixed before release

1. **Text typed before hydration was lost or merged (MP06c2).** React resets a server-rendered controlled field when it hydrates; a fill that straddled hydration produced "typed + original". Proven with a minimal reproduction; both editors now stay inert (`aria-busy`, disabled controls) until hydrated (MP06c2a, MP06b2a).
2. **Saving never adds empty data (MP06d2a).** A store body without a sources list reads as empty, and a save never adds an empty list to it.
3. **Approved panel wording (MP06d3).** A redundant "No decision is available" line under approved revisions was removed; comparison now names numbers inside blocks.
4. **Harness corrections, never weaker checks.** The acceptance harness gained exact allowances for each new RPC (transport and browser bridge), derived expected values from the fixture database instead of guesses, updated exact audit and revision totals for each new step, and replaced MP06a's "no writer button anywhere" check with an exact one: none in the read-only details, every writer control inside the two labelled panels.
5. **Migration-history receipt (MP06e).** Windows PowerShell 5.1 serializes an array inside a hashtable as `{value, Count}`; the publish guard now re-parses the saved, hash-checked CLI listing instead of the summary.
6. **New dependency advisory after publication.** GHSA-g3hv-75wg-m249 (moderate, `minimatch` 10.2.6, development-only through ESLint's TypeScript tooling) was published after the last green run and stopped CI's audit on `4cae4b8`. No 10.x release is patched, so `4bd1435` overrides the 10 line to 11.0.3; the full CI then passed.

## Limits and follow-ups

- **Manual accessibility checks:** native browser zoom, a screen reader, and colour contrast at 200% zoom (reported "incomplete" by axe) remain manual.
- **Authorization phrases:** both hosted migrations were run by the owner before the phrase was sent in chat; the results were reported and are recorded. The migration-history recording followed its phrase.
- **New items and assignments:** a new lesson inherits no assignment from its parent; the Owner may need to assign it before a non-Owner can open it.
- **Assets:** diagrams can reuse assets already in the lesson; uploads are not implemented.
- **Quizzes and analysis posts:** listed in the library, but their editors are separate later work (question authoring is MP07).
- **Publication to learners:** showing reviewer and review details from the decision record on learner pages, and the per-family authority switch, are MP08.
- **Learner progress:** `pipstart_set_lesson_completion` still raises `40001` through PostgREST, tracked from MP05.

## Next

MP07: question and quiz authoring, building on the MP06 editor foundation and review workflow.
