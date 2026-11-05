# MP06a — read-only content workspace

Status: source preparation on `e5e68a2`. Not yet applied, live-accepted or published.

Checkpoint 2 was explicitly accepted by the owner on 30 October 2026. The accepted
MP04 store and MP05 import/bridge remain the foundation; no source cutover is added.

## Delivered boundary

`/admin/staff/content` reuses the approved Library/table tokens and live staff shell.
The page checks the staff flag, real session and current staff gate. Every list or
item request repeats live identity/access checks and calls the existing user-context
editorial RPCs. Assigned Authors/Reviewers/Editors are not incorrectly refused just
because their global capability list omits a resource-scoped grant. SQL filters
list results and authorizes the requested item independently. No service key is used.

Reads are bounded by deadlines. The list requests 26 rows to display 25 with a
keyset lookahead cursor. Filters are labelled as applying to the current page;
counts are current-page counts, not invented global totals. Navigation is available
from the verified overview and eligible staff navigation, never paused maintenance.

Course/module/lesson detail is an allowlist: permanent identity, title, path, parent,
latest revision/hash/state, timestamps, archive/hold state and exact-revision
provenance. No full lesson body, quiz key, Auth actor identifier or arbitrary private
field is passed to the browser. Quiz/analysis rows may appear in the authorized
inventory, but their separate editors are not wired here. Imported decisions are
recognized as import provenance, not fabricated new human approval. Approval and
public visibility remain distinct; Production continues reading code.

Malformed DTOs, unexpected fields, unrelated IDs, duplicate rows, wrong shapes,
non-current revisions or unsupported detail families fail closed. Raw SDK/SQL
messages are never returned to the client. Loading clears stale selected detail;
denial/failure clears current protected results. No sample data is substituted.
The read-only page offers no save, submit, approval, archive, restore or policy
mutation and no automatic retries of operations.

## Scope and acceptance

This is the read foundation, not full MP06 completion. There is no migration,
account/role grant, hosted write, provider call, learner-content change, service
credential, new feature flag or public publication operation. Existing staff UI
configuration controls the route; publishing it would make this read-only library
available to authorized staff under the existing live flag.

Source preparation includes focused DTO/transport/action/presentation tests, the
complete unit suite, both TypeScript configurations, changed-source lint/format,
webpack build, and public-bundle verification. Exact results live in the external
preparation receipt; no unexecuted check is claimed by this document.

After owner application, run isolated real Auth/PostgREST/controller/browser
acceptance for actual Owner and assigned/refused identities, changed grants,
pagination and imported details; include keyboard/mobile/zoom/axe checks and owner
visual approval. No hosted fixture grant or real account change is implied. Any
future hosted packet must account for the existing rollout-state verifier, which
currently expects only bootstrap/control events.

## MP06 sequence

- MP06a: this read-only workspace and minimized revision contracts.
- MP06b: structured course/module creation, draft saves, ordering and presentation.
- MP06c: supported lesson block/section editing and safe progress-free preview.
- MP06d: exact review/diff, conflict recovery, archive and restore-as-draft journeys.
- MP06e: cross-journey acceptance, visual/release reconciliation and publication.

Every writer must include dirty/unsaved-change protection and optimistic conflict
handling when introduced, not defer them until the final review package. Preserve
all imported fields not being edited. Reuse deeper lesson/reference/asset validators
at server boundaries; the structural store validator alone is insufficient for
safe full editing or preview. Question editing is MP07; public activation is MP08.
The existing adapter name `publish` records approval only. No wording may claim
that this read-only workspace or that approval changes the live learner pages.

Next: owner application and isolated read-only workspace acceptance; then MP06b.
