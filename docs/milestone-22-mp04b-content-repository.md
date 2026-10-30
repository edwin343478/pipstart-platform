# MP04b-1: content contract, public projection and leak proofs

Status: prepared source. No route, page or database changes. Public pages still read the
existing code registries directly; switching a route to the repository is MP08 (cutover).

## What it adds (`apps/pipstart/src/lib/content/`)

| Module            | Role                                                                                                                                                                | Who may import it                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `contract.ts`     | One identity and one body shape per family (course, module, lesson, quiz, analysis), matching the MP04a store; block-type list and size limits                      | anyone (types only)                 |
| `validate.ts`     | `checkContentBody(family, body)`: rule for rule the SQL `body_ok`, including PostgreSQL's space-only `btrim` and the 256 KB limit measured on the `jsonb` text form | anyone                              |
| `public.ts`       | `toPublicQuiz`, `toPublicLesson`, `toPublicAnalysisPost`, each built from an explicit field allowlist, plus the `PublicContentRepository` interface                 | anyone (no runtime private imports) |
| `private.ts`      | Staff-only view: every quiz version with its answer key                                                                                                             | server only                         |
| `code-adapter.ts` | `codeContentRepository`: today's registries behind the public interface                                                                                             | server only; no route yet           |

An allowlist means a field added to a private source (an answer key, explanation,
review note or draft) stays private until someone deliberately lists it.

## Closed gap

Nine Forex quiz modules held answer keys without `import "server-only"`. The eleven
Crypto modules already had it. Nothing imported them from client code today, but nothing
would have stopped it. All quiz data modules are now server-only, and a test fails if a
future one is not.

## Proofs

- **Data:** sentinel strings planted in answer keys, explanations, governance, review
  notes and unknown fields never survive a public projection.
- **Types:** a public quiz question has exactly `id`, `prompt`, `type` and `choices`, and a
  choice has exactly `id` and `label`.
- **Parity:** for every quiz, `toPublicQuiz` equals today's `toPublicAssessment`. Every
  published lesson and analysis post is unchanged, and the code adapter returns exactly
  what the registries publish.
- **Import boundary:**
  - every module defining quiz data, the lesson catalogue, the private view and the
    adapter are `server-only`;
  - the existing M15-H1 graph test keeps every client component's import chain away from
    them;
  - no route imports the private view or the adapter.
- **Build:** `scripts/verify-public-bundles.mjs` (already run by CI after the production
  build) now also checks that none of 271 quiz-explanation markers appears in any browser
  chunk. It also checks that no prerendered HTML or RSC payload contains an explanation, a
  draft sentence or `correctChoiceIds`. The markers are generated from the quiz registry
  and kept current by `private-markers.test.ts`.
- **Shared validation:** `content-shape-fixtures.json` (31 cases) runs through the
  TypeScript validator now. MP04b-2 runs the same file through the SQL `body_ok`.
  Every lesson, quiz and analysis post in code is accepted as a store body.

## Next

MP04b-2 adds the database adapter (staff RPCs, private view only) and the route/resolver
contract with full URL parity and generated new items.
