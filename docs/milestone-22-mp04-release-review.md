# MP04 acceptance and release review

This is the handover entry point for MP04 (revision store and content adapters). The
per-patch guides describe each part in detail:

- `milestone-22-mp04-editorial-store.md`
- `milestone-22-mp04b-content-repository.md`

The evidence index is `milestone-22-mp04-release-evidence.json`, generated from the run
receipts.

## Current status: MP04 accepted (30 October 2026)

MP04 is accepted. Every MP04 change is published, each with exact-commit main CI, M22
staff SQL CI and a completed Vercel deployment verified:

| Patch                                | Commit    | Delivered                                                                                                                                          |
| ------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| MP04a editorial store                | `286475e` | private store for courses, modules, lessons, quizzes and analysis posts; immutable revisions; both publication paths; trash, restore, holds; audit |
| MP04b-1 contract and leak proofs     | `dd89d53` | content contract, store-equal validator, allowlist public projection, server-only private view and code adapter, build-level leak scan             |
| MP04b-2 editorial adapter and routes | `ca2b21f` | staff adapter over the 11 store RPCs, route/resolver contract, TypeScript and SQL shape parity                                                     |

- **Live:** the hosted project has the editorial store schema, with an empty store and the
  default policy (review optional). Staff state is unchanged: enabled at version 3, one
  Owner. Migration history lists `20261030090000`.
- **Not live:** nothing public reads the store. Learner pages, quizzes and analysis still
  come from code; the per-family authority switch is MP08.

## Master-plan exit gate

| Gate                                                    | Evidence                                                                                                                                                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Permission, transition, concurrency, schema, hold tests | MP04a SQL suite (37 gates); real Auth/PostgREST run with 4 accounts and 3 TOTP factors (24 gates), including two saves observed blocked on one row, giving one revision and one `PT409` |
| No draft or key leakage                                 | allowlist projection; sentinel and type tests; every quiz data module `server-only`; client graph test; post-build scan of browser chunks and prerendered HTML/RSC on every push        |
| New content types fit the route/resolver contract       | every published URL and the sitemap reproduced exactly; route-space rules refuse ambiguous new items; generated new items resolve back                                                  |
| No live source cutover                                  | no route imports either adapter or the private view (boundary test); public output unchanged                                                                                            |

## Owner decisions recorded

- **Two publication buttons:** "Publish" is the Owner's single-person decision, while
  review is optional. "Send to reviewer" asks a different reviewer, and no one, the Owner
  included, reviews their own revision. A version-checked, audited policy switch can later
  require review for everyone without rework.
- **Analysis posts** are a content family with no learning path and no parent, in exactly
  one section (Fundamental or Technical), enforced in SQL and TypeScript.
- **Editing and removing published content:** an edit is a new revision; the live site
  keeps the published revision until the new one is published. Withdraw takes content off
  the live site immediately and is audited. Both are delivered with publishing in MP08.

## Defects the live run found, fixed before release

1. Conflicts raised `40001`, which PostgREST retries. One stale save produced 4,422
   rolled-back transactions in 8.2 seconds without an answer. They now raise `PT409`
   (HTTP 409), answered once.
2. The read RPCs were `stable`, so PostgREST ran them read-only and the staff actor's
   `FOR SHARE` check failed (`25006`). Every editorial RPC is now volatile, and asserted so.
3. Missing body fields made SQL checks `NULL` instead of false. Every guard now treats
   missing as invalid.

The first two pass every SQL-only test, so new staff RPCs need a real PostgREST run before
their hosted step.

## Limits and follow-ups

- The real Auth/PostgREST evidence ran in a disposable local stack. Hosted acceptance is
  schema-only and owner-reported.
- Only the Owner can author analysis posts until staff assignments gain an analysis kind,
  which is a separately reviewed staff-core change.
- Pages still read the hand-written curriculum, and new Crypto courses and modules have no
  page route yet. Both are MP05.
- The live learner progress RPC `pipstart_set_lesson_completion` still raises `40001`
  through PostgREST. It is tracked as a separate follow-up.

## Next

MP05: the importer and parity bridge.
