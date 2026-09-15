# PipStart lesson publishing

Lessons are authored as MDX documents under `src/content/lessons`. Each file exports `metadata` and a serializable `blocks` array, then renders the blocks with `LessonBlocks`.

## Add a lesson

1. Copy an existing MDX lesson into the correct learning-path folder.
2. Complete every metadata field and choose a unique module position and slug.
3. Add the document import to `lesson-registry.ts`. No route or layout change is required.
4. Keep `status` as `draft` and `approved` as `false` during editorial work.
5. Add sources, independent reviewer approval, review dates, alternative text, and any required disclosure blocks.
6. Change the document to `status: "published"` and `approved: true` only after review.
7. Run the unit, type, lint, build, and browser acceptance gates.

Published documents with missing or invalid safeguards fail validation. Draft documents are omitted from curriculum navigation, generated lesson routes, and the sitemap.

## Reusable blocks

Supported block types are `definition`, `example`, `warning`, `keyPoint`, `formula`, `exercise`, `diagram`, `comparisonTable`, `riskNotice`, `affiliateDisclosure`, and `quizPreview`. Their typed fields are defined in `lesson-content.ts` and their shared renderer is `components/lesson-blocks.tsx`.
