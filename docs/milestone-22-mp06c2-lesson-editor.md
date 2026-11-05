# M22 MP06c2 — connected lesson drafts and safe preview

## Source scope

Owner-run patch following accepted MP06c1. Adds a gated `/admin/staff/content/lesson` route and cookie/session server action. Library lesson edit links, a New lesson link, and Add lesson from a module use document navigation and the established native leave guard. Staff UI remains controlled by the existing exact default-off flag; this packet does not change it.

Structured native form controls support all 22 existing block types: text, headings, lists, paragraph groups, definitions, examples, warnings, reflection, key points/checklists, formulas, exercises, worked practice, tables, HTTPS references, local tool links, diagrams, risk/affiliate notices and quiz introductions. Worked practice answers are existing learner-visible examples, never assessment answer keys. Question authoring belongs to MP07.

Flat and sectioned lessons keep their existing layout. Blocks can be added, removed, moved within and between nonempty sections; sections can be added, removed and reordered. Source indexes remain revision-bound, server-validated references so opaque imported fields follow their original blocks/sections. Existing disclosures cannot be edited or removed. Limits are inherited from MP06c1: 500 blocks, 100 sections and the 256 KB store boundary. Existing diagram assets may be selected or reused; this packet does not implement uploads or introduce new assets. The form explains this limit.

## Creation and authority

Creation validates the supplied module and its current course through permitted item RPCs. Both must be active, readable and on the requested learning path. Level/course/module/position derive from this verified chain; SQL independently checks current write permission on the parent and exact AAL2 session. Parent assignments do not imply a grant on the new lesson: the Owner may need to assign the new item before a non-Owner can reload it.

New metadata is explicitly `status: draft`, `approved: false`, with review pending and no fabricated publication/review dates. A fixed risk notice is required. New drafts have empty prerequisites, related references and source metadata; authors can enter visible citations with References blocks. This editor cannot manufacture publication approval or alter protected identity/reference/date/governance metadata. Review/provenance, source metadata and publication validation must be addressed in the subsequent MP06d review workflow before any new lesson can be released. These fields are not claimed complete for publication.

Existing saves delegate to the accepted MP06c1 boundary: latest revision and SHA checks, current Auth/grants, server merge and one SQL save. Duplicate activation is locked. Conflict/uncertain states preserve entered work and block resend; comparison reads do not silently replace or rebase the draft. Authoritative reload is required after an acknowledged save. Explicit adoption of latest requires discard confirmation. No browser storage, autosave, write retry or public-source activation is added.

## Preview and accessibility

Preview uses the existing learner block renderer with an explicit `preview` mode: no navigable source/tool links, disabled checklists, visible worked answers and no progress callback, learner page wrapper or assessment API. Content stays in the accessibility tree. Invalid/unsafe blocks produce an explanatory message rather than being rendered. The default learner renderer behavior is preserved.

Native labels, fieldsets, legends, details, 44 px controls, visible focus and a focused live status region support keyboard and assistive use. Responsive styles reuse the approved editor foundation. Actual connected browser, accessibility and owner visual acceptance remain required; component tests are not a replacement for these checks.

## Verification and owner application

See preparation-results.json for source-tied focused/full tests, both TypeScript configurations, scoped lint/format, default-off production webpack build and public-bundle checks. The fingerprinted installer checks exact predecessor HEAD/index/source state and applies only its listed files, then runs focused regression tests. It restores exact packet writes if application or those tests fail. `-Rollback` requires unchanged installed packet bytes; no flag/account/database action is implied.

No migration, real Auth/DB fixture, hosted setting, provider action, send, activation, commit or push is included in this source packet.

Next: bounded owner-authorized local real Auth/PostgREST/controller and browser acceptance for MP06c creation/save/denial/conflict/uncertainty, hierarchy/disclosure preservation, passive preview, native leave protection, responsive accessibility and visual approval. Full MP06c remains open until those gates pass. MP06d follows.
