# MP05 acceptance and release review

This is the handover entry point for MP05 (importer and parity bridge). The per-patch guides
describe each part in detail:

- `milestone-22-mp05a-editorial-import.md`
- `milestone-22-mp05b-parity.md`
- `milestone-22-mp05c-1a-crypto-routing.md`
- `milestone-22-mp05c-1b-forex-routing.md`
- `milestone-22-mp05c-2-content-source.md`
- `milestone-22-mp05c-3-local-staging-proof.md`

The evidence index is `milestone-22-mp05-release-evidence.json`, generated from the run
receipts.

## Current status: MP05 accepted (30 October 2026)

MP05 is accepted. Every MP05 change is published. For each one, the exact-commit main CI, the
M22 staff SQL CI and a completed Vercel deployment were verified.

| Patch                                  | Commit    | Delivered                                                                                                                           |
| -------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| MP05a editorial import foundation      | `0a19b34` | additive migration `20261031090000` (provenance, `imported` decisions, operator-only `import_item`); manifest; canonical jsonb hash |
| MP05b shadow reads and import parity   | `62eed29` | store-row rebuilds of lessons, quizzes, analysis posts and the curriculum; parity with today's site                                 |
| MP05c-1a data-driven Crypto routes     | `54853d3` | Crypto levels 1-10 resolve courses, modules, lessons and quizzes from data                                                          |
| MP05c-1b data-driven Forex routes      | `b576de7` | Forex levels 0-10 resolve any number of courses and modules from data                                                               |
| MP05c-2 content source switch          | `6189b7a` | server-only switch: code by default and in Production; an approved store snapshot outside Production                                |
| MP05c-3 snapshot export, staging proof | `2467321` | read-only export of the approved store as a sealed snapshot; local staging proof                                                    |

What is live:

- **The hosted store holds all 160 items,** imported in MP05b and brought up to date by the MP05c
  re-import. The 41 items that gained page text and quiz placement are at an imported revision 2.
  The store is 160 items, 201 revisions (160 approved, 41 superseded), and 201 imported
  decisions, provenance rows and import audit rows. The review policy is unchanged.
- **Migration history lists `20261031090000`.**
- **The site serves every course, module, lesson and quiz page from data,** with no per-item
  route files.

What is not live: Production reads code. The snapshot source is refused there, and nothing public
reads the store. The per-family authority switch is MP08.

## Master-plan exit gate

| Gate                                                                                             | Evidence                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Repeat, interrupted and drift imports are safe                                                   | Full-inventory local import (run `d6fb8c82`): 160 items, a run interrupted at 80 and resumed, an exact repeat changing nothing, one drift giving exactly one revision, and a store edit kept. Hosted rehearsals refused out-of-order chunks; repeats were no-ops; a staff edit stopped the import and failed acceptance. |
| Routes, SEO, assets, progress and quiz identities are at parity                                  | MP05b parity tests (every lesson page incl. SEO, quiz definitions and public payloads, analysis posts, the curriculum tree, every sitemap URL, all 110 image references). MP05c-1a/1b/2 compared the full prerendered output: visible HTML byte-identical, payload content identical, 0 different.                       |
| A generated new course, module, lesson and quiz resolves in staging without a per-item code edit | MP05c-3 local staging (run `7f240776`): the Owner created and approved a new course, module, lesson and module quiz in Crypto and Forex through the staff RPCs. The exported snapshot built a site with exactly 8 new pages and sitemap URLs. Drafts returned 404, progress was saved, and the quizzes graded.           |
| The hosted import is separately authorized                                                       | MP05a schema, MP05b import and MP05c re-import each had a sealed packet, a production-state local rehearsal, and owner-run SQL Editor stages with read-only acceptance.                                                                                                                                                  |

## Owner decisions recorded

- **Full refactor of the routing layer** rather than a data switch alone. New courses, modules and
  quizzes needed routes, not only data.
- **New quizzes live under their module:** `/learn/<path>/<level>/<course>/<module>/quiz`. The 21
  existing quizzes keep `/learn/<path>/<level>/quiz`, and the store marks them `placement.route:
"level"`.
- **Delivery order:** Crypto, then Forex, then the data switch, then the staging proof. Each routing
  patch was guarded by identical rendered output for every existing page.
- **SEO and page text are data,** kept beside the curriculum objects. In the store they are carried
  as `metadata.presentation`. A central `seoEntries` entry still wins.

## Defects and findings fixed before release

1. **Comparison tooling (MP05c-1a).** The first rendered-output comparison rewrote prices such as
   "A$12" as if they were payload references. That could hide a real change. It now renumbers only
   whole quoted references, and every comparison was checked against itself and against
   single-letter and single-price edits.
2. **Nested routes (MP05c-1a).** The module routes prerendered nothing, because Next 16 passes
   parent parameters only from layouts. Nested routes now list their full parameters.
3. **Shared component (MP05c-1b).** A shared Forex page module put an extra stylesheet on all 11
   level pages. It was split so that only pages sharing a route load it.
4. **Lesson order (MP05c-2).** It was an accident of source-file order, which a store cannot
   reproduce. One explicit rule (path, level, position) now orders lessons from both sources. The
   only visible effect is that the 4 Crypto Level 0 URLs moved within `sitemap.xml`.
5. **Re-import acceptance.** The first version assumed that an updated item's revision 1 stays
   approved. The store supersedes it, keeping one approved revision per item. The owner's
   rehearsal caught this before any hosted run, and the acceptance now requires exactly that.

## Limits and follow-ups

- **Store-authored drafts.** A course created in the store has no hand-written page text. It gets
  text derived from its title and description until editors fill `metadata.presentation`. The
  staff editor UI for these fields is later work.
- **Snapshot file location.** The snapshot source reads a file that must exist where the site
  builds and renders. A hosted staging deployment needs that file provisioned; the public read path
  is MP08.
- **Browser quiz submit on the staging server.** It needs the Supabase service client for the
  anonymous rate limit, which the local staging server did not have. The grading that follows it
  was proven in-process.
- **The hosted re-import ran without the authorization phrase in chat.** The owner ran it, and the
  results are recorded in the workspace.
- **Learner progress.** The RPC `pipstart_set_lesson_completion` still raises `40001` through
  PostgREST. It is tracked as a separate follow-up.

## Next

MP06: the course, module and lesson editors with review and conflict UI. They include editing
the page text (`metadata.presentation`) that store-authored items need.
