# MP05c-1b: data-driven Forex routes (levels 0-10)

Status: prepared source. Same pages, same text, same URLs. No database or data-source change.

## What changed

Before this change, the generic Forex routes refused any level that did not have exactly one course
and one module, and they used `courses[0]` and `modules[0]`. Level 1 named its course, module and
quiz in static folders and default props.

Now every Forex course, module, lesson and quiz is resolved from the curriculum and the lesson
registry, for any number of courses and modules per level. Levels stay code (D04).

- `lib/forex-level-routing.ts`:
  - The resolvers (`resolveForexSegment`, `resolveForexModule`, `resolveForexModuleQuiz`,
    `forexLevelQuiz`, `forexLevelPageContext`) cover every level.
  - A lesson's context comes from its own course and module: the course's lesson list, the
    breadcrumb, the progress key and the module's quiz link.
  - The `getGenericForex*` functions keep their names and shapes for the generic `[level]` tree,
    which still leaves Level 1 to its own route tree.
- `lib/forex-level-lessons.ts` reads lesson lists from the registry only, because
  `lib/curriculum.ts` imports Level 1's list.
- `app/learn/forex/forex-level-pages.tsx` holds the shared lesson, course, module and quiz pages
  for both trees.
- `lib/curriculum-presentation.ts` gains two of today's exact strings:
  - Level 1's quiz link label, "Take the Forex Foundations quiz";
  - Level 0's breadcrumb, "Orientation and Safety". This was a `level-0` special case in
    `forex-lesson.tsx`.

### Routes

| URL                                           | Level 1 route                     | Levels 0, 2-10 route                 |
| --------------------------------------------- | --------------------------------- | ------------------------------------ |
| `/learn/forex/<level>`                        | `level-1/page.tsx`                | `[level]/page.tsx`                   |
| `/learn/forex/<level>/<segment>`              | `level-1/[lesson]`                | `[level]/[segment]`                  |
| `/learn/forex/<level>/<course>/<module>`      | `level-1/[lesson]/[module]` (new) | `[level]/[segment]/[module]`         |
| `/learn/forex/<level>/<course>/<module>/quiz` | new                               | new                                  |
| `/learn/forex/<level>/quiz`                   | `level-1/quiz` (static)           | `[level]/[segment]` (segment `quiz`) |

- A segment is a course, the level quiz, or a later lesson of any course. They come in that order.
- A new quiz lives under its module. None exists yet.
- The level quiz is found by its `href`, and its ID is the published assessment.
- As before, the Forex routes keep `dynamicParams = true`, with the resolvers as the authority.

### SEO rule

A central `seoEntries` entry for the URL wins. Today only Level 1's course and module have one.
Otherwise the item's own title and description are used, as before.

### Removed

- The static `level-1/forex-kindergarten` course and module pages. `level-1/[lesson]` and
  `level-1/[lesson]/[module]` now serve the same URLs.

`forex-lesson.tsx` is unchanged. Every route now passes it complete, data-derived props, so its
Level 1 defaults are no longer used.

## Proof: rendered output

Two production builds were compared, commit 54853d3 and this change. The comparison covers every
prerendered HTML, RSC and meta file. It uses the MP05c-1a comparer and checks: self-check,
single-edit sensitivity, visible HTML, content multiset and stylesheets. The results are in the
preparation receipt.

## Tests

- `lib/forex-level-routing.test.ts` adds 15 tests across every Forex level (0-10):
  - every course, module, later lesson and level quiz resolves from data;
  - position-1 lessons never take a second segment;
  - Level 1's page, breadcrumb, legacy progress key and quiz link are unchanged;
  - Level 0's breadcrumb and the derived labels of other levels are unchanged;
  - unknown and cross-level items are refused;
  - no route folder names a course or module.
    The existing generic-routing tests are unchanged and pass.
- The Milestone 8 tests now render the Forex Kindergarten course and module pages through the
  generic Level 1 routes.
