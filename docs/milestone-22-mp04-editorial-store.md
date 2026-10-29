# MP04a: editorial revision store

Status: accepted and live on the hosted project as schema only (29 October 2026). It is
additive and default-closed: no public route reads it, and no content moves from code.
Publishing, scheduling and cutover are MP08.

## What it stores

The private schema `pipstart_editorial_private` has no table grants. Staff reach it only
through user-context RPCs.

- **Identities** (`items`) for course, module, lesson, quiz and **analysis post**.
  - The ID is permanent and uses the same format as existing code IDs, so learner progress,
    bookmarks and attempts keep their references.
  - Family, path and parent are fixed. The parent rules are: module under course, lesson
    under module, quiz under course, module or lesson.
  - Courses, modules, lessons and quizzes belong to one learning path (forex or crypto).
    Analysis posts have no path and no parent.
- **Revisions:**
  - Every save is a new immutable revision: schema version 1, a JSON body and its SHA-256.
  - A save must name the latest revision as its base; otherwise it is refused as a conflict
    (`PT409`, HTTP 409) and nothing is lost.
  - Conflicts deliberately do not use `40001`. PostgREST retries that serialization-failure
    code, and a live test showed one stale save causing over 4,000 retried transactions
    in 8 seconds without ever answering.
  - A trigger allows only these state changes: draft → submitted / approved / superseded;
    submitted → approved / changes requested / superseded; changes requested / approved →
    superseded.
- **Decisions,** each bound to the exact revision hash:
  - `reviewed`: a different reviewer approved;
  - `changes_requested`: a note is required;
  - `single_person`: the Owner's Publish decision.
- **Trash, holds and restore:**
  - Trash needs a reason, and is refused while the item is on hold or still has live
    children.
  - Restore creates a **new draft** and never reinstates an approval.
  - Holds are Owner-only.
- **Audit:** every change appends a minimized row (actor, action, item, revision, short
  reason) in the same transaction. If the audit row fails, the change is rolled back.
  Content bodies are never written to audit.

## Analysis posts (owner question, 29 October 2026)

The Analysis tab has two sections, Fundamental and Technical. Each post belongs to **exactly
one** of them.

- The body is `metadata.title`, `metadata.category`, `metadata.excerpt` and `paragraphs`
  (1–200 non-blank strings).
- `metadata.category` must be the single string `fundamental` or `technical`. A missing
  section, a list, both sections or any other value is refused in SQL, even on a direct RPC
  call.
- An edit may move a post to the other section. The move is a new revision and needs a new
  Publish or review decision.
- `pipstart_editorial_list` returns each post's current section.
- Analysis uses the same two publication buttons as lessons.
- Today only the Owner can create or edit analysis posts. Staff assignments cover
  course, module, lesson and quiz, so giving a reviewer or author analysis rights needs a
  small, separately reviewed staff-core change when the first such person joins.

## Editing and removing published content

- **Edit:** saving creates a new draft revision. In MP08 the live site keeps showing the last
  published revision until the new one is published.
- **Remove:** MP08 adds **Withdraw**. It takes content off the live site at once, is
  audited, and can't be undone by a code deploy. Withdrawn content can then go to trash;
  restore always creates a new draft.
- MP04a stores the decisions only. The `published` and `withdrawn` states, and the public
  read, are MP08.

## The two publication buttons (owner decision, 29 October 2026)

There is no team yet, so publication is single-person for now. Review will come later.

| Button               | RPC                                                           | Who                                                                                                    | Records                           |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------- |
| **Publish**          | `pipstart_editorial_approve_single_person`                    | active Owner only, while review is optional                                                            | `single_person`                   |
| **Send to reviewer** | `pipstart_editorial_submit`, then `pipstart_editorial_review` | author submits; a **different** assigned reviewer decides (the Owner cannot review their own revision) | `reviewed` or `changes_requested` |

`pipstart_editorial_set_review_policy(true, version)` is Owner-only, version-checked and
audited. It closes Publish for everyone without schema or UI change, and earlier approvals
keep their recorded kind. Publish does not ask for a new authenticator code: the staff
session is already MFA-verified (AAL2), and the note is optional.

In MP04 an approval means the revision may be published. Making it public, with every
publication safety check, is MP08.

## Permissions

All RPCs require a verified staff session: AAL2, an active membership, and staff control
enabled. On top of that, each RPC applies the MP02 capability for the object:

- **Author:** `content.write`, `content.submit` and `content.trash` on assigned items.
- **Reviewer:** `content.review` on assigned items.
- **Editor:** write, submit, trash and restore.
- **Owner:** every capability. The Owner still cannot review their own revision.

Creating a course requires the Owner. Creating anything else requires write access on its
parent. Reads (`pipstart_editorial_item`, `pipstart_editorial_list`) are scoped to the
caller's assignments, while the Owner sees everything. Lists are keyset-paged, at most 100
items per page. Both reads are volatile functions: the staff session check takes
short row locks, which a read-only PostgREST transaction would refuse.

## Acceptance

- **Isolated SQL suite** (`test-m22-editorial-store.sql`, run by the MP03 runner and CI):
  - grants, paused control, AAL1 and learner refusal;
  - hierarchy and identity rules, and body structure (unsupported block, blank or missing
    title, empty or missing lesson blocks, quiz without an answer key, over 256 KB);
  - analysis: no path or parent, exactly one section (missing, both, unknown refused), excerpt
    and paragraphs required, author refused, section change by edit, Owner Publish;
  - optimistic conflict, exact-hash submit and review, the reviewer-is-not-author rule
    including the Owner;
  - single-person Publish, and the policy switch closing it;
  - hold, trash and restore, scoped reads and paging;
  - immutability even for the database owner role, hash integrity, a complete audit, and
    audit-failure rollback.
  - every editorial RPC is volatile.
- **Live real-Auth/PostgREST run** in a disposable Docker stack (real GoTrue, TOTP and
  PostgREST; four generated accounts, three factors), 24 gates:
  - paused, AAL1, learner, anonymous and service callers refused, and a token with an
    altered payload rejected (HTTP 401);
  - a stale save answered once, promptly, as `PT409`;
  - two saves from the same base observed blocked on the row, giving one new revision and
    one `PT409`;
  - both publication paths, the policy switch, Analysis sections and scoped reads;
  - exactly one audit row per successful change.
- **Two defects found by the live run and fixed before release:**
  - conflicts used `40001`, which PostgREST retries: one stale save caused over 4,000
    retried transactions without an answer;
  - the read RPCs were `stable`, so PostgREST ran them read-only and the staff session
    check failed (`25006`).
- **Hosted:** a read-only preflight confirmed the rolled-out staff state, the migration ran
  in one atomic transaction, and a read-only acceptance confirmed the exact schema with
  staff state unchanged. The migration history entry `20261030090000` was recorded without
  replaying SQL.

| Evidence                                | Reference                                                          |
| --------------------------------------- | ------------------------------------------------------------------ |
| Isolated SQL run (37 checks, 25 inputs) | `d0f478de1339b05724a9d3fe450cc2e7`                                 |
| Real Auth/PostgREST run (24 gates)      | `a81b39842ab30a44a858dbfca8d25571`                                 |
| Hosted wrapper rehearsal (11 gates)     | `2d0d615bb10eefbdbee77c9e51c2c618`                                 |
| Hosted migration source SHA-256         | `71f950a70cb133cf87cfbd25ebe6dbb039c8da8d8981f0cc7514aa3980ed89b7` |
