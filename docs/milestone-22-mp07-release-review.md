# MP07 acceptance and release review

This is the handover entry point for MP07 (quiz authoring and version history). The per-patch guides describe each part in detail:

- `milestone-22-mp07a-quiz-versions.md`
- `milestone-22-mp07b-quiz-editor.md`

The evidence index is `milestone-22-mp07-release-evidence.json`, generated from the run receipts.

## Current status: MP07 accepted (6 November 2026)

MP07 is accepted. Its source was applied as three owner-run patches (MP07a, MP07b and the MP07c layout fix), each rehearsed before hand-over, and published as one commit.

| Commit    | Delivered                                                                            | CI and deployment                                                                    |
| --------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `197abf7` | MP07: quiz versions rule, snapshot format 2, quiz editor, sandbox preview (32 files) | CI and M22 staff SQL CI passed; Vercel deployed. Live learner release gates skipped. |

What is live:

- **Quiz versions rule** (migration `20261106090000`, applied to the hosted project and recorded in its migration history).
  - An approved quiz version never changes.
  - A quiz draft must carry the next version.
  - Submit, approve and Owner publish refuse a second body under a published version.
- **Content snapshot format 2.** The local snapshot source keeps every approved quiz version, sealed. The registry keeps older versions as retired, so an attempt started on version N finishes and is graded on N while new attempts use N+1. Format 1 snapshots still load.
- **Quiz editor** at `/admin/staff/content/quiz?id=…`, for Owner, Author and Editor, on existing quizzes. It covers:
  - title, pass mark and cooldown;
  - questions, choices, answer keys and explanations, with the registry's rules shown as plain-language problems.

  The version is set by the server. Conflict, uncertainty and hydration handling match the lesson editor.

- **Sandbox preview:** grades the unsaved draft in the browser with the learner grader. No request is sent and nothing is recorded.
- **Library:** View revision, Edit draft, review and publication, and revision comparison for quizzes. Archive, restore and hold remain unavailable for quizzes.

The staff UI stays off by default in production, and learner pages keep reading code until MP08.

## Acceptance evidence

- **Connected rehearsals** `d819aac3` (MP07b) and `4ef3127d` (layout fix), 69 gates each, with exact cleanup. Both ran the full MP06 journey plus the quiz journey, with real local Auth and MFA, PostgREST and Chromium. The quiz journey covered:
  - the version stated by the server, and the sandbox with zero requests;
  - a save as version 2 that preserves database-only attributes;
  - Send to reviewer and Owner Publish, after which version 3 is offered;
  - a direct tampered save refused (`22023`);
  - inspected payloads with no private body or actor IDs;
  - no accessibility violations at 1440, 390 and 320 px.
- **Continuity proof** (server level). In a disposable CI container, the full SQL verifier passed. Then, on today's 160-item catalogue, a learner started an attempt on version 1, version 2 was published, and the attempt was recorded on version 1 at 6/6.
  - The real loader, registry, binding and grader resolved that attempt to retired version 1. It scores 5/6 on version 2's key.
  - A new attempt binds to version 2.
  - Eleven tamper cases were refused.
  - No answer key or explanation appears in a learner payload.

  A full browser learner journey was not run.

- **Hosted packet**, derived from MP06e packet 2:
  - a read-only preflight;
  - one guarded migration transaction that re-verifies the inventory before commit, at 17 private functions with five new RPC fingerprints;
  - a read-only acceptance.

  Its local wrapper rehearsal `95101e28` passed 11 gates. The owner ran all three stages and reported all three markers with migration SHA-256 `03560b2c…`.

- **Migration history:** `20261106090000` was recorded with `supabase migration repair` after hosted acceptance. It appears in Local and Remote.
- **Owner visual approval:** given on 6 November 2026, after the layout fix.

## Owner decisions

- The server assigns the version on save, and attempts started on version N finish on N.
- The work was split into MP07a, MP07b and MP07c.
- The commit was published before the hosted migration. The migration was then applied and recorded the same day.

## Follow-ups

- **MP08 (publication):** the store snapshot still selects items by approved state, so an edit in progress leaves an item out of a store snapshot. MP08 must select the latest decided revision.
- **Not yet supported:** new-quiz creation, a read-only quiz view for reviewers, and archiving quizzes.
- **Manual checks still pending:** native zoom, screen reader and contrast checks for the quiz editor.
