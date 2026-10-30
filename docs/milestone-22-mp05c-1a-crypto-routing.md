# MP05c-1a: data-driven Crypto routes (levels 1-10)

Status: published at `54853d3`. Same pages, same text, same URLs. No database or data-source change.

## What changed

Crypto levels 1-10 no longer name a course, module or quiz in any route file. Each level keeps
thin route files that pass their level ID to shared code; everything else is read from the
curriculum and lesson registry (D04: levels stay code).

- `lib/crypto-level-lessons.ts`: lesson lists from the registry only. The level page's course
  is the course of the level's position-1 lesson.
- `lib/crypto-level-routing.ts`: resolves courses, modules, lessons and quizzes; lesson context
  (breadcrumb title, course link, progress key); and SEO metadata.
- `lib/curriculum-presentation.ts`: presentation text kept beside the curriculum objects, so page
  payloads stay unchanged. Every existing Crypto string was moved here verbatim.
- `app/learn/crypto/crypto-level-pages.tsx`: the shared course, module and quiz pages.

### Routes per level

| URL                                            | Route                             | Notes                                         |
| ---------------------------------------------- | --------------------------------- | --------------------------------------------- |
| `/learn/crypto/<level>`                        | `page.tsx`                        | the level page (position-1 lesson), unchanged |
| `/learn/crypto/<level>/<segment>`              | `[lesson]/page.tsx`               | a course page or a later lesson of any course |
| `/learn/crypto/<level>/<course>/<module>`      | `[lesson]/[module]/page.tsx`      | replaces the static module folders            |
| `/learn/crypto/<level>/<course>/<module>/quiz` | `[lesson]/[module]/quiz/page.tsx` | new quizzes live under their module; none yet |
| `/learn/crypto/<level>/quiz`                   | `quiz/page.tsx`                   | existing level quiz, found by its `href`      |

All of these routes are static (`dynamicParams = false`). An unknown segment returns not found.
A course ID and a later lesson slug may not be equal in one level; resolution refuses that.

### SEO rule

A central `seoEntries` entry for the URL wins. Otherwise the item's presentation SEO is used.
Otherwise the text is derived from the item's own title and description.

### Removed

- The 10 static course folders, with their 20 course and module pages. The generic routes now
  serve the same URLs.
- The `progress.ts` files for levels 2-10, which had no remaining importer. Progress keys come
  from `getLearningProgressStorageKey`; Level 1 keeps its file and its legacy key.

## Proof: rendered output

Two production builds (`next build --webpack`) were compared: commit 62eed29 and this change.
The comparison covers every prerendered HTML, RSC and meta file.

| Result                    | Files | Meaning                                                                                      |
| ------------------------- | ----: | -------------------------------------------------------------------------------------------- |
| Identical                 |   842 | equal after removing build noise only: build ID, chunk names and counts, and RSC row numbers |
| Route encoding only       |   300 | the 56 pages now under `[lesson]`/`[module]`, plus their RSC files (see below)               |
| Segment files renamed     |    20 | `…/<course>/__PAGE__` became `…/$d$lesson/__PAGE__` (included above)                         |
| Different, missing or new |     0 |                                                                                              |

For each of the 56 moved pages:

- the visible HTML is byte-identical;
- the payload content is identical: every prop, text, href and class name;
- no stylesheet is missing.

The comparison was checked against itself, and it caught a one-letter title change, a one-letter
body change and a single changed price.

The 36 later-lesson pages now load one extra stylesheet, because they share the `[lesson]` route
with course pages. A check proved that all 178 of its rules are scoped to hashed CSS-module
classes, and that none of those classes occurs in any lesson page. It cannot change how a
lesson looks.

## Tests

- `lib/crypto-level-routing.test.ts` (23 tests) covers every level:
  - every course, module, later lesson and level quiz resolves from data;
  - the static parameters cover exactly those;
  - level page lessons, context titles and progress keys (Level 1's legacy key included) are
    unchanged;
  - unknown and cross-level IDs are refused;
  - no route folder names a course or module.
- The level tests (`milestone-16-level-1` to `-10`) now expect the course entry in
  `generateStaticParams`.
- The Milestone 8 tests render the Bitcoin course and module pages through the generic routes.
