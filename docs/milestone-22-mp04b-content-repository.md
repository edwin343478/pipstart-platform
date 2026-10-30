# MP04b-1: content contract, public projection and leak proofs

Status: published in `dd89d53` with exact-commit CI and deployment verified (30 October
2026). No route, page or database changes. Public pages still read the existing code
registries directly; switching a route to the repository is MP08 (cutover). MP04 acceptance
is recorded in `milestone-22-mp04-release-review.md`.

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
  TypeScript validator. Every lesson, quiz and analysis post in code is accepted as a
  store body.

# MP04b-2: editorial adapter and route/resolver contract

Status: published in `ca2b21f` with exact-commit CI (including the SQL shape-parity
assertions) and deployment verified (30 October 2026). No route, page or database change;
the migration is unchanged.

## Editorial adapter (`editorial-adapter.ts`, server only)

- `createEditorialRepository(client)` wraps the 11 MP04a staff RPCs: list, item, create,
  save, submit ("Send to reviewer"), review, publish (the Owner's single-person decision),
  trash, restore, hold and the review-policy switch.
- It takes the caller's own signed-in client and never a service key, so the database still
  decides every permission, assignment and AAL2 check.
- Before any network call it refuses an invalid identity (ID format, path and parent rules,
  where analysis has no path and no parent), an invalid body (the shared validator) or a
  missing reason.
- Store errors become stable kinds: `PT409` conflict, `42501` forbidden, `22023` invalid,
  `55000` state; anything else is unavailable.
- A test reads the parameter names of every public RPC straight from the migration and
  requires the adapter to send exactly those names.
- No route imports it (enforced by the boundary test). MP06 editors will use it.

## Route/resolver contract (`routes.ts`, pure)

- `hrefFor(target)` maps a path, level, course, module, lesson, quiz or analysis post to
  its URL. The first lesson of a level is the level page itself.
- `routeCandidates(href)` gives every target a URL could mean. A third segment can be a
  course or a later lesson; the inventory decides which.
- `checkRouteSpace(targets)` enforces the rules that keep URLs unambiguous:
  - within a level, `quiz`, course IDs and later-lesson slugs share one namespace;
  - lesson slugs are unique per path;
  - each level has one quiz URL;
  - every segment is a plain lowercase slug.
- Parity: every published item in code gets exactly the URL the site uses today, and
  every learning and analysis URL in the sitemap resolves back to its item. Today's
  inventory has no conflicts.
- Generated new items (a Forex lesson, module and course, a Crypto lesson and an analysis
  post) get unambiguous URLs that resolve back. Six kinds of collision are refused.

### Which new items already have a page route

| New item      | Page route today | Note                                                             |
| ------------- | ---------------- | ---------------------------------------------------------------- |
| Forex lesson  | yes              | dynamic `[level]/[segment]`                                      |
| Forex course  | yes              | dynamic `[level]/[segment]`                                      |
| Forex module  | yes              | dynamic `[level]/[segment]/[module]`                             |
| Crypto lesson | yes              | dynamic `[lesson]` per level                                     |
| Crypto course | shape only       | matches the `[lesson]` route, which would look it up as a lesson |
| Crypto module | no               | static course folders                                            |
| Analysis post | yes              | dynamic `[slug]`                                                 |

A page route existing is not the same as rendering generated content: the pages still
read the hand-written curriculum. MP05 adds the data-driven bridge and the missing Crypto
course and module routes.

## TypeScript and SQL agree

`shape-parity.test.ts` generates one SQL assertion per known-family fixture into
`test-m22-editorial-store.sql`, which the MP03 runner and CI already run. The store's own
`body_ok` gives the same answer as `checkContentBody` for all 30 cases. The one
unknown-family case stays TypeScript-only, because the store's `create` refuses unknown
families before `body_ok` is reached (covered by the MP04a suite). The test fails if the
generated block ever drifts from the fixture file.
