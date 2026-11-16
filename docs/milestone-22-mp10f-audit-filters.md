# MP10f: Staff audit filters and the content audit view

This patch has a migration (`20261119090000_pipstart_m22_audit_filters.sql`), an SQL suite (`apps/pipstart/scripts/test-m22-audit-filters.sql`) and application changes. It implements owner decision D7 of 16 November 2026, which MP10c did not deliver. It requires MP10a.

## Store

Two read-only views. Both require `audit.read`: the Owner, or an Administrator with the explicit delegation.

- **`pipstart_staff_audit_page_filtered`** is the staff-governance audit with filters for action, actor, resource and time range.
  - It returns exactly the same columns as `pipstart_staff_audit_page`, which is unchanged.
- **`pipstart_content_audit_page`** is the editorial audit (content, publication, partner and maintenance changes), with filters for operation, actor, item and time range.
  - It returns only time, actor, operation, item and revision.
  - For maintenance rows only, it also returns the action word: assigned, reassigned, owner removed, acknowledged, rescheduled, check recorded, review interval changed or allowlist changed.
  - **Free-text reasons and details are never returned.**
- **Paging:** both are cursor-paged (newest first, at most 101 rows per call). They refuse an unknown action, a malformed item, a half cursor or a time range whose start is not before its end.
- **No table changes,** except one ordering index on the editorial audit.

## Staff audit page

- **The filter form** uses native GET, so every page passes a fresh server gate. It has:
  - **Records:** staff access changes, or content and maintenance changes;
  - **Action:** the actions of the chosen records type;
  - **Actor** (staff ID), **Resource/Item**, **From** and **To**, as whole UTC days with the end day included;
  - **Clear filters**.
- **Paging** keeps the filters.
- **An invalid or repeated parameter** shows "This page link or filter is invalid", and no request is made.
- **With no filters,** the page calls the original `pipstart_staff_audit_page` with the original arguments, exactly as before.

## Proof

- **SQL suite:**
  - grants, with the helper closed and both views volatile;
  - the Owner and a delegated Administrator can read; an Administrator without the delegation, a Moderator and an unknown identity are refused;
  - every filter, with the time range start-inclusive and end-exclusive;
  - cursor paging;
  - staff rows keep their columns, and content rows are minimized;
  - a planted reason sentinel never appears;
  - unknown maintenance wording gives no action;
  - ten argument refusals;
  - the views are read-only.
- **The consolidated verifier** has 51 inputs, with the `auditFiltersStaged` and `auditFiltersHead` gates.
- **Unit tests:**
  - query parsing (11 refusals), empty fields, and the RPC arguments per source;
  - content-row parsing (9 refusals, cursor order);
  - the page routing to each view, the unchanged unfiltered call, no call for invalid filters, and failing closed on a malformed reply;
  - the content table, with filters kept in paging.
- **Two existing component assertions were updated to the new exact values:** three GET forms instead of two (the filter form is new), and the wording of the invalid message.

These are SQL Auth stubs, not hosted acceptance. The hosted migration follows in its own owner-run packet.
