# MP10c: staff Maintenance pages

This is a code-only patch. It implements owner decisions D2, D3, D8 and D9 of 16 November 2026 and requires MP10a and MP10b. The pages call the MP10a store, so until the hosted migration `20261118090000` is applied (MP10e), each section on the live site shows that it could not be read. Nothing else changes.

## Where

A **Maintenance** link appears in the staff navigation for every role that can hold maintenance: Owner, Author, Reviewer, Editor, Moderator and Affiliate Manager. It is not shown to Administrators or while staff access is paused. The link opens `/admin/staff/maintenance`, which is separate from the MP02 Owner maintenance page at `/admin/maintenance`.

| View            | Who                    | What                                                                                                                              |
| --------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Assigned to me  | everyone above         | Live items whose maintenance owner is you: status, due date (and the content date when rescheduled), last review, acknowledgement |
| Due and overdue | Owner, Editors         | Every live item in scope, filterable by status and type, 50 per page with a cursor                                                |
| Link report     | everyone above         | The MP10b internal reference report for the generation this deployment serves                                                     |
| Review policy   | everyone above to read | The review intervals. The Owner can change them, and sees and edits the allowlist of hosts for automatic checks                   |

## Actions

Each action is sent once, on the staff member's own session. An unclear outcome blocks further changes until reload.

- **Assignee or Owner:**
  - **Acknowledge**, with a reason. The page says plainly that the item stays due and that acknowledging is not a review.
  - **Reschedule**, with a reason: at most 90 days ahead, or 365 for the Owner.
  - **Record a manual check** of a link or reference exactly as it appears in the live revision: working, broken or not checked, with an optional note.
  - **Show recorded checks.**
- **Owner:** assigns or reassigns the maintenance owner from a list of active staff, read through People (up to 200 people), with a reason.
- **Editor:** can only **Assign to me**, because Editors cannot read the staff list. The store decides whether the item is in their scope.
- **Owner or Editor:** removes the maintenance owner, with a reason.

There is no probe button. The safe automatic check is MP10d.

## Proof

- **Contract tests:** every command shape and refusal; strict parsing of worklist pages (order, cursor, statuses, families), results, intervals and the allowlist.
- **Service tests:**
  - default-off;
  - malformed input refused before Auth;
  - Learners and Administrators refused without a store call;
  - each command sends one exact RPC, with manual results only;
  - refusals map to conflict, denied, invalid or uncertain, never resent;
  - a lost reply is uncertain;
  - reads fail closed per section;
  - the Owner's staff picker lists only active, maintenance-capable staff.
- **Markup tests:**
  - assignee actions;
  - the Owner's picker, names and paging;
  - the Editor's Assign to me only;
  - fail-closed list;
  - the report states;
  - policy visibility;
  - the navigation link rules.
- **Full checks:** formatting, lint, both typechecks, all tests, the production build and the public-bundle scan.
