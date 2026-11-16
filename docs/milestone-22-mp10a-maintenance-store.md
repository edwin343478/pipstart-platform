# MP10a: maintenance store

This patch has a migration (`20261118090000_pipstart_m22_maintenance_store.sql`) and an SQL suite (`apps/pipstart/scripts/test-m22-maintenance-store.sql`). It requires MP09. It implements owner decisions D1–D3, D5 (the store part) and D6 of 16 November 2026. There is no application change; the staff pages are MP10c.

## Due dates, computed on read

Every maintained item is read from the **live** generation: lessons, quizzes, analysis posts, partners and links. Courses and modules are structure and are not listed.

| Family        | Due date                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------- |
| Partner       | `review.expiresAt` of a verified review                                                      |
| Link          | `expiresAt` (a link without one is current)                                                  |
| Quiz          | `metadata.governance.nextReviewAt`                                                           |
| Analysis post | `metadata.reviewedAt` plus the Owner interval (180 days)                                     |
| Lesson        | `metadata.reviewedAt` plus the Owner interval (365 days); lessons carry no review date today |

- **Statuses:**
  - `overdue`: the due date is today or earlier.
  - `due`: due within 30 days.
  - `current`: otherwise.
  - `no_review`: the content carries no genuine review date. The import date is never used as one.
- **Intervals** are Owner policy: append-only versions with compare-and-set, between 30 and 730 days.

## Actions

- **Assign, reassign and unassign.** The maintenance owner is the MP02 staff assignment of kind `maintenance`, so the existing `maintenance.assigned` capability applies unchanged.
  - The Owner, or an Editor who may publish the item, sets it with a reason. An item has one owner.
  - This is the only path that writes `maintenance` assignments outside staff governance.
- **Acknowledge** ("seen, will handle", with a reason). The item stays due.
- **Reschedule** to a new due date after today: at most 90 days ahead, or 365 for the Owner.
  - Neither action changes any review date in the content.
  - Both apply to the current live revision only. A new live revision (a genuine review) starts a new cycle; the maintenance owner stays.
- **Record result** for a reference that appears in the live revision:
  - **manual** results: `manual_ok`, `manual_broken` or `not_checked`;
  - **probe** results: `ok`, `not_found`, `gone`, `redirect`, `forbidden`, `throttled`, `timeout` or `unreachable`.
  - A probe result requires an HTTPS host on the Owner allowlist that is **not** an affiliate host (any approved link host). Evidence is at most 2 KB.
- **Allowlist.** Owner only, append-only add and remove. Affiliate hosts are refused. The safe check itself is MP10d.

The assignee or the Owner acknowledges, reschedules and records results. Staff who may assign can read results. Repeating an assignment or allowlist state is reported as unchanged and writes nothing.

## Boundaries

- The private schema `pipstart_maintenance_private` is closed to `anon`, `authenticated` and `service_role`.
- Twelve volatile RPCs are granted to `authenticated` only:
  - `pipstart_maintenance_worklist`: scope `mine` or `all`, filters, cursor paging of at most 50;
  - `…_assign` and `…_unassign`;
  - `…_acknowledge` and `…_reschedule`;
  - `…_record_result` and `…_results`;
  - `…_interval_set` and `…_intervals`;
  - `…_allowlist_change` and `…_allowlist` (Owner only);
  - `…_check_allowed`.
- Every change writes one `maintenance` row in the editorial audit, in the same transaction. Refusals and unchanged calls write none.
- The four tables are append-only.
- There is no email, no Cron and no background work.

## Proof

- **The suite covers:**
  - grants;
  - the six family states;
  - filters and complete cursor paging;
  - Administrator, unknown and inactive identities;
  - Editor scope and Moderator scope;
  - assignment rules and assignee validation;
  - acknowledgement and reschedule limits;
  - a stale revision (PT409);
  - a new live revision resetting the cycle;
  - results bound to the revision;
  - probe allowlisting, with affiliate links refused;
  - the allowlist and interval rules;
  - append-only tables;
  - the audit invariant (one row per change, none for refusals).
- **The consolidated verifier** has 49 inputs, with the `maintenanceStoreStaged` and `maintenanceStoreHead` gates.

These are SQL Auth stubs, not hosted acceptance. The hosted migration follows in MP10e.
