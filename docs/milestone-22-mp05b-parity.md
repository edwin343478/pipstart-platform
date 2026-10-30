# MP05b: shadow reads and import parity

Status: published at `62eed29`. The hosted import of all 160 items is accepted (MP05c later
brought 41 of them up to date). Learners still read code. See
`milestone-22-mp05-release-review.md`.

## Shadow reads (`apps/pipstart/src/lib/content/import/shadow.ts`, server only)

Pure functions rebuild what the site renders today from store rows: an imported body plus
its identity.

- `shadowLesson` gives the published lesson page data, including `href`, `id`,
  `introduction` and `keyPoints`, derived exactly as the lesson registry derives them.
- `shadowQuiz` gives the full assessment definition, answer key included (a private view),
  with its ID and version.
- `shadowAnalysisPost` gives the analysis post in its single section.
- `shadowCurriculum` gives the curriculum tree. Paths and levels come from code (D04);
  courses, modules, lessons and quizzes come from rows, ordered by their recorded placement.

Nothing is served from these functions in MP05b. MP05c's flagged data source reuses them.

## Parity (`parity.test.ts`)

The rows used are the manifest bodies, JSON round-tripped. They are the store's bodies byte
for byte, by three links:

- each one's canonical `jsonb` hash is checked here;
- the import refuses any body whose hash differs;
- the hosted acceptance checks every stored hash against the same manifest.

Against today's site, the tests prove:

- **Lessons:** every published lesson page is identical, including its SEO title and
  description, sources, blocks, sections and derived links.
- **Quizzes:** every quiz has the identical definition and answer key, ID and version, and
  an identical public payload.
- **Analysis:** all 6 posts are identical.
- **Curriculum:** the whole tree is identical, including order, every URL, every progress
  lesson ID and every quiz link.
- **Sitemap:** every learning and analysis URL is reproduced exactly.
- **Images:** all 110 image references are kept, and each one resolves to a file in
  `public/`.
- **Not vacuous:** changing one field (a lesson SEO title, a quiz answer key, a module
  order or an analysis section) is detected.

## Hosted import

The 160-item import runs from a separately authorized hosted packet. It has a read-only
preflight, ten ordered import chunks (each one guarded transaction) and a read-only
parity acceptance that checks every stored item against the manifest. Re-running any
chunk is safe.

## Next

MP05c: the generated bridge slice in local staging. A server-only flag (off in
Production) reads approved store content through these shadow functions. It adds dynamic
Crypto course and module routes, and proves a newly created course, module, lesson and
quiz render at their resolver URLs with no code edit.
