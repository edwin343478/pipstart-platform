# M22 MP06c1 — lesson draft write boundary

Prepared after explicit MP06b2 visual approval on 2026-11-02. Additive source only; no migration or route activation.

## Scope and contracts

- A typed, dependency-free editable projection for all 22 existing lesson block formats. Unknown imported body, metadata, block and section extensions remain server-side and are preserved on save. Practice answers here are existing learner-visible worked examples, not assessment answer keys; quizzes are refused.
- Existing lesson load/save only. New lessons, connected action/page/forms and safe progress-free preview belong to MP06c2, followed by bounded real Auth/PostgREST/browser acceptance. Full MP06c is not complete.
- Editable metadata: title, description, estimated minutes, objectives and SEO title/description. Identity/path/parent, placement, prerequisites, related lesson/glossary references, author/reviewer, dates, publication flags and required-disclosure flags are preserved, not accepted from the caller.
- Flat lessons stay flat; sectioned lessons stay sectioned. Existing revision-bound source indexes follow moved blocks and sections; duplicates, absent indexes or type substitution are refused. Added blocks/sections use null indexes. Flattened blocks are regenerated atomically from sections.
- Existing risk and affiliate notices cannot be edited or removed. Required notices must remain present. These intentional editing limits do not constitute legal compliance certification.
- Source links must be HTTPS without credentials or whitespace; learning links use the existing local tools route grammar. Diagram paths reject traversal, queries, fragments, remote origins and backslashes, and must already occur in this lesson. Asset uploads/new asset selection are not implemented here. Existing long captions and untitled legacy paragraph groups remain supported.
- Default-off exact flag; verified getUser and live staff role checks on each request; only Owner/Author/Editor proceed. User-context resource RPCs independently check AAL2 and exact assignments; parent grants are not inherited.
- Both observed revision number and body SHA must match. One save call creates an immutable draft through existing SQL. Conflicts never rebase automatically. Unknown write outcome returns uncertain and is never replayed. Reads/writes retain the existing 8-second abort deadline.
- No raw JSON/HTML/MDX execution, arbitrary metadata posting, service key or new dependency. No submit/approve/publish or learner progress write.

## Verification and remaining acceptance

Focused tests exercise every block format, all imported lesson round trips, section consistency, opaque metadata preservation, URL/asset guards, required notices, spoofing/role denial, stale revision/hash, SQL refusal and uncertain acknowledgements. Both TypeScript configurations, scoped lint and format are checked before packaging. See preparation-results.json for exact evidence.

This source-only boundary is not connected to a browser or server action yet. No real Auth/DB/browser acceptance, migration, account/grant, hosted configuration, activation, commit or push is claimed. Full suite/build is reserved for the connected MP06c release candidate; it was not repeated for this unexposed additive boundary.

## Owner-run application

Run Install-M22-MP06c1-Lesson-Boundary.ps1 -Apply. The installer pins HEAD and all 35 predecessor files, refuses edited/staged/hidden state, checks payload/dependency fingerprints, runs focused tests, and undoes exact packet writes on failure. Without -Apply it only checks. Rollback requires exact installed bytes.

Next patch: MP06c2 — connected lesson editor, new-lesson creation and safe preview; then explicitly scoped local real Auth/browser/accessibility/visual acceptance. MP06d follows full MP06c acceptance.
