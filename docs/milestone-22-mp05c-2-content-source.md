# MP05c-2: content source switch (code or approved store snapshot)

Status: published at `6189b7a`. Production keeps reading code; nothing reads the store by default.
The hosted store was brought up to these bodies by the MP05c re-import (41 items updated).

## The switch

`lib/content/source.ts` is server-only. It decides where content comes from, once per server:

| `PIPSTART_CONTENT_SOURCE` | Result                                                           |
| ------------------------- | ---------------------------------------------------------------- |
| unset or `code`           | the code registries (default, and the only source in Production) |
| `snapshot`                | the approved store snapshot named by `PIPSTART_CONTENT_SNAPSHOT` |
| anything else             | refused                                                          |

`snapshot` is refused when `VERCEL_ENV=production`, before any file is read. The snapshot file
must be readable wherever the site builds or renders. For MP05c-3 that is a local staging build.

Five sources switch where they are defined, so every page, route, sitemap entry and quiz
follows. Each switch goes through the MP05b shadow reads:

- **lesson registry** (`publishedLessons`): the rows become lesson documents. They pass through
  the same publication pipeline as code, with the same validation, references and ordering.
- **curriculum** (`learningPaths`): `shadowCurriculum`. Paths and levels stay code (D04).
- **assessment registry**: an approved quiz replaces the code definition with the same ID and
  version, and new quizzes are added. Older code versions stay, so past attempts can still be
  graded. The registry still validates every quiz against the curriculum when it loads.
- **analysis posts**: in snapshot order.
- **presentation text** (`curriculumPresentation`): read from `metadata.presentation`.

## The snapshot file

`{ format: "pipstart-content-snapshot", version: 1, exportedAt, items, itemsSha256 }`. Each item
is one store item at its approved revision:

`{ id, family, learningPath, parentId, revisionNo, state: "approved", bodySha256, body }`.

The whole file is refused if any of these fails:

- the format or version is unknown;
- an ID is invalid or duplicated;
- a family or learning path is invalid;
- a revision is not approved;
- a parent is missing, comes later in the file, or belongs to another path;
- a body fails the store's own body rules;
- a body differs from its SHA-256 (canonical jsonb, as the store computes it);
- the item list differs from `itemsSha256`.

`buildContentSnapshot` seals rows in this format. MP05c-3 exports the store into it.

## What the store now carries

- **Presentation text:** a course, module or quiz with page text in `curriculum-presentation.ts`
  carries it as `metadata.presentation`. That text covers the lesson breadcrumb, SEO, and the
  Forex quiz link label.
- **Quiz routes:** a quiz served at its level URL records `placement.route: "level"`. Every other
  quiz lives under its module.
- **Route contract:** `hrefFor` and `routeCandidates` gain the module quiz form,
  `/learn/<path>/<level>/<course>/<module>/quiz`. The rule is one quiz per module URL, apart from
  the level quiz.

41 store items therefore differ from the hosted import of MP05b: 10 courses, 10 modules and 21
quizzes. All 89 lessons and 6 analysis posts are unchanged. A later import run updates them
through `import_item`'s `updated` path, which applies only to items nobody has edited in the
store.

## Lesson order

Lessons now follow one explicit rule for both sources: learning path in the curriculum's order,
then level, then position. Before this change, the 4 Crypto Level 0 lessons came first only
because of where they sat in the source array.

The only effect on the live site is the order of those 4 URLs in `sitemap.xml`. They now follow
the Forex lessons. The URL set is identical.

## Proof

- **Code source vs commit b576de7** (every prerendered HTML, RSC and meta file, 1,142 files):
  - 1,141 files are identical;
  - `sitemap.xml` has the same URLs, with only those 4 moved;
  - 0 files differ otherwise.
- **Snapshot source vs code source**, with the snapshot made from today's import manifest: see the
  preparation receipt.
- **`lib/content/source.test.ts`** checks:
  - code is the default;
  - unknown values are refused;
  - Production is refused before anything is read;
  - a missing path is refused;
  - every kind of tampering refuses the whole snapshot.
- **`lib/content/snapshot-source.test.ts`** checks two things.
  - A snapshot of today's manifest reproduces today's content exactly in all six switched
    exports: lessons, glossary, curriculum, quizzes, analysis posts and presentation text.
  - A new course, module, later lesson and module quiz in a Crypto level and in a Forex level
    resolve through the real routes with no code edit: course and lesson pages, lesson context,
    the progress key, the quiz link and the module quiz page. The existing level quizzes keep
    their URLs.
- **`lib/content/routes.test.ts`** checks module quiz URLs: they resolve back, there is one per
  module, and their routes exist.
