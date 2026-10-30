# MP05a: editorial import foundation

Status: published at `0a19b34` (30 October 2026). The hosted migration `20261031090000` is
accepted and recorded in the migration history. The hosted content import ran in MP05b. See
`milestone-22-mp05-release-review.md`.

## Decisions (owner, 30 October 2026)

- The import runs as generated, rehearsed operator SQL in the SQL Editor, audited as the
  Owner. The SQL contains no Auth UUID.
- Content that is live today is recorded as already approved, under its own decision kind,
  `imported`, bound to the exact body hash.
- The 6 analysis posts are imported with the learning content.
- Staging for MP05c is the disposable local stack.

## What comes across

160 items:

| Family   | Count | Identity                                    |
| -------- | ----- | ------------------------------------------- |
| course   | 22    | course ID (URL segment)                     |
| module   | 22    | module ID (URL segment)                     |
| lesson   | 89    | slug, the learner-progress `lesson_id`      |
| quiz     | 21    | assessment ID; the body carries its version |
| analysis | 6     | slug                                        |

No ID collides across families, so every code ID is kept unchanged.

- Paths and levels stay in code (D04). A course records its level in its metadata.
- Lessons and quizzes record their curriculum placement (order and assessment
  requirements), so the tree can be rebuilt from the store.
- The 110 lesson images stay in the repository; bodies keep their references.
- Out of scope: the glossary, providers and links.

## Migration (`20261031090000_pipstart_m22_editorial_import.sql`)

- Adds `imported` to the decision kinds and `import` to the audit operations.
- `pipstart_editorial_private.imports` records each imported revision's source reference and
  body hash. It is append-only, has RLS, and grants nothing to API roles.
- `pipstart_editorial_private.import_item(...)` is operator-only: no API role may execute it.
  It requires exactly one active Owner, validates like `create`, and refuses any body whose
  hash differs from the one computed from code. It returns:
  - `created`: a new identity, with revision 1 recorded as imported (approved);
  - `unchanged`: the latest revision is the import with this exact body, so nothing is
    written;
  - `updated`: the code changed and nobody edited the item in the store, so a new imported
    revision is written and the earlier one is superseded;
  - `conflict`: the item was edited or trashed in the store since the last import. Nothing
    is written: an import never overwrites staff work or resurrects trashed content.

## Importer (`apps/pipstart/src/lib/content/`)

- `jsonb.ts` reproduces PostgreSQL's canonical `jsonb` text: keys ordered by byte length,
  then bytewise, with `", "` and `": "` separators. It computes the SHA-256 the store
  records, so each item carries its expected hash.
- `import/manifest.ts` (server-only) builds the ordered manifest, parents first, through
  the MP04b validator.
- `import/import-sql.ts` emits one independent, hash-carrying statement per item, plus a
  completeness check and a status summary. Re-running is safe, so an interrupted run is
  resumed by running the same SQL again.

## Acceptance

- **SQL suite** (`test-m22-editorial-import.sql`, run by the MP03 runner and CI, 27 inputs):
  - grants;
  - the Owner rules (none, or two, are refused);
  - created, unchanged, drift-updated;
  - a real staff-session edit and a trash, each reported as a conflict and never
    overwritten;
  - wrong-hash, child-before-parent, identity, body and analysis-path refusals;
  - immutable provenance;
  - exact audit and decision counts.
- **Full-inventory import** of all 160 items in a marked throwaway local database:
  - interrupted at 80, then resumed (80 unchanged, 80 created);
  - an exact repeat changes nothing;
  - one changed lesson gives exactly one new revision;
  - a store edit survives the next import (reported as 1 conflict);
  - every item's identity and hash match the manifest;
  - audit, decisions and provenance are exact.

  Every body's TypeScript hash equalled PostgreSQL's, or the import would have refused it.

## Next

MP05b:

- parity of the store against today's output (routes, SEO, assets, progress and quiz IDs,
  curriculum tree) through shadow reads;
- the separately authorized hosted import. The full import SQL is about 4.2 MB, so the
  hosted packet will run in chunks.
