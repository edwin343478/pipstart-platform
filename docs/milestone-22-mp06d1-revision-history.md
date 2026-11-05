# M22 MP06d1 — revision history and comparison

## Source scope

Owner-run patch following accepted MP06c (including the MP06c2a hydration correction). Owner decisions recorded on 2 November 2026: add a read-only revision RPC; require sources before review or Publish (MP06d2); split MP06d into d1 (this packet), d2 (review and publication actions) and d3 (archive, restore, hold and full connected acceptance).

The content library's revision detail gains a read-only **Revision history** panel for courses, modules and lessons. It loads only on an explicit request, lists revisions newest first (20 per page, keyset paging), and shows each revision's state, save time, whether it was saved by the viewer, another staff member or the import, the save reason, and its decisions. Any earlier revision can be compared with the latest; a shortcut compares with the most recent revision that carries an imported, reviewer or Owner approval.

## Migration

`20261102090000_pipstart_m22_editorial_revision_read.sql` adds two volatile user-context RPCs and one private helper. No table, column, state transition, write path or existing grant changes.

- `pipstart_editorial_revision(id, revision)` returns one exact revision with its body, decisions and whether it was imported.
- `pipstart_editorial_history(id, before, limit)` returns bounded newest-first summaries without bodies (limit 1 to 50, cursor at least 2).

Both use the same authority as `pipstart_editorial_item`: verified staff actor, live staff control, exact AAL2 session and the resource-scoped `content.read` capability. Unassigned staff, learners, AAL1 sessions and a paused control are refused. Only `authenticated` may execute them; `anon` and `service_role` may not. The SQL suite `test-m22-editorial-revision-read.sql` runs in the consolidated MP03 SQL verifier after the import stage, with rollback and head checks, and the pinned SQL manifest lists both files.

The hosted migration is applied only in MP06e, as an owner-run SQL Editor step with its own authorization phrase. Until then the deployed library must not show the panel: publication of this source is held to MP06e, which applies the migration before deployment.

## Comparison

Bodies never reach the browser. The server reads the latest item and the requested revision, checks that no save happened between the two reads (otherwise the result is `stale` and nothing is compared), and compares both through the same editable projections the editors use. For lessons: title, description, minutes, objectives, SEO fields, layout, section titles and block content. For courses and modules: the curriculum editor's fields and the course level. Imported attributes the editors never show, private fields and actor identities are excluded.

Content changes are a longest-common-subsequence diff of blocks and section titles: an edited block appears as one removal and one addition. Texts are clipped at 1,000 characters and at most 300 changes are listed, with a notice when more exist. Stored text is rendered as React text, never HTML. Bodies outside the editable projection report "unsupported" rather than a partial comparison.

## Verification and owner application

See the packet's preparation results for focused and full unit tests, both TypeScript configurations, scoped lint and format, the consolidated SQL proof on a disposable database and the default-off production webpack build. The fingerprinted installer checks the exact applied MP06a–c2a predecessor and applies only its listed files, then runs focused regression tests, undoing its writes if they fail. No account, hosted setting, flag, commit or push is included.

Next: MP06d2 (Send to reviewer, Approve or Request changes, Publish, and the required-sources rule), then MP06d3 with full connected acceptance and owner visual approval.
