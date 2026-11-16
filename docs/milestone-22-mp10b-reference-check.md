# MP10b: internal reference check

This is a code-only patch. It implements owner decision D4 of 16 November 2026 and requires MP10a.

## What is checked

Content can point at three kinds of internal target. Each must exist in this deployment:

| Reference                                                                             | Must exist as                  |
| ------------------------------------------------------------------------------------- | ------------------------------ |
| `learningLink.href`                                                                   | a `/tools` page                |
| diagram `src` and `desktopSrc` (also inside lesson sections); a partner's `image.src` | a file under `public/`         |
| a parent; a quiz's `courseId`, `moduleId` and `lessonId` (report only)                | an item in the same generation |

- **No filesystem reads at runtime.** `lib/content/reference-targets.ts` is generated from the repository by `scripts/reference-targets.mjs`, so the server never reads the filesystem. Run `node scripts/reference-targets.mjs --write` after adding a public file or a `/tools` page.
- **Drift fails CI.** `reference-targets.test.mjs` fails if the list differs from the repository.
- **Text is never treated as a link.** Lesson and post text is plain, with no inline links. External URLs (sources and references) are not checked here; that is MP10d's safe check.

## Make live

Before **Make live** sends anything:

1. The server reads the exact revision on the staff member's own session (`pipstart_editorial_revision`) and confirms its SHA-256. A changed revision is a conflict.
2. It checks the body.
3. If a page or image is missing, it refuses with the new `references` result. The panel shows the reason and up to ten problems, each with its location, for example: `blocks[3].src uses an image that does not exist: /images/x.svg`.

Nothing is sent and nothing changes. Withdraw, restore and the baseline are unchanged. Parents remain enforced by the store at publish time.

## Report

`referenceReport` covers a whole generation: body references, plus every parent and quiz target. `snapshotReferenceItems` reads a sealed snapshot, including its partners and links. The staff report page is MP10c.

## First report (16 November 2026)

Today's content, built exactly as the store import that generation 10 came from, has **no findings** across 162 items:

- 22 courses, 22 modules and 89 lessons;
- 21 quizzes and 6 analysis posts;
- 1 partner and 1 link.

The walk examined 152 diagrams (68 with a desktop image), 154 learning links and every quiz target. A planted missing image in each of the 70 items with a diagram was caught 70 times out of 70.

## Proof

- **Unit tests:**
  - existing targets accepted;
  - missing pages and images reported in order, with their location;
  - section blocks and partner images covered;
  - a query string ignored, but not a different path;
  - text and external URLs never treated as references;
  - generation reports (parents and quiz targets);
  - snapshot reading;
  - target generation;
  - the panel message.
- **Make live tests:**
  - the revision is read before publishing;
  - a missing reference is refused with nothing sent;
  - a changed hash is a conflict;
  - failed reads map to denied, invalid, unavailable or conflict, without sending;
  - withdraw does not read a revision.
- **Against the unpatched `publication.ts`,** seven of the new Make live tests fail.
- **Full checks:** formatting, lint, both typechecks, all tests and the production build.
