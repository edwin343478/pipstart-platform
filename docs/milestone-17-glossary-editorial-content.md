# Milestone 17 approved glossary editorial content

This patch applies the owner-approved **PipStart Milestone 17 Glossary Editorial Review** from 7 October 2026 to the private glossary catalogue. The catalogue now contains 378 entries: 242 Forex entries and 136 Crypto entries. All 362 original identities and glossary anchors remain intact.

## Applied content

- 33 revised definitions: 5 Forex and 28 Crypto.
- 120 everyday Crypto examples and one revised Forex currency-swap example.
- 27 additional Crypto Remember notes and two revised Forex notes.
- 16 additional Crypto entries, with definitions, examples, cautions and lesson context.
- 13 category refinements, 11 additional search labels on existing entries and 38 additional directed related-term links.
- Ten additional links on existing entries connect the catalogue to all 89 registered lessons.
- 32 primary reference records support selected editorial corrections and additions. They do not certify all inherited course sources.

The two original meaning occurrences for Slashing and Wash trading remain separate. Existing per-meaning lesson context, all prior lesson links, the 89 preservation records and the reading keys are retained.

## Approval and publication

Wording approval is recorded separately in `editorialReview`. Catalogue `status` remains `draft`; catalogue `approved` remains `false`. Every entry remains `draft`, `approved: false` and `sourceReview: pending`. Selective reference support is not blanket source verification or release approval.

The existing metadata publication gate stays in place. Public glossary pages continue using their approved published-course sources. This content patch does not change lesson files, glossary adapters, page components, CSS, quizzes, progress tracking or responsive layout. The new glossary wording and discovery metadata will become public only through a separately reviewed release step.

## Review evidence and verification

`milestone-17-glossary-editorial-baseline.json` preserves the entire original editorial catalogue. `milestone-17-glossary-editorial-changes.json` records the approved field changes, previous wording, new entries and selected references. Both records are in `docs`, outside the application content directory.

From the repository root, run:

```powershell
node scripts/verify-m17-glossary-editorial.mjs
pnpm --filter pipstart exec vitest run src/lib/glossary-search.test.ts src/app/milestone-17-phase-2.test.tsx
pnpm --filter pipstart typecheck
pnpm --filter pipstart lint
```

The verification script reconstructs only the approved changes and compares the full result with the current catalogue. It rejects unintended wording changes, lost source contexts, changed IDs, routes, reading keys or release flags. Nine negative fixtures exercise those checks without writing files. The existing glossary tests continue verifying query behavior and the publication gates with test-only published fixtures.

The patch installer verifies all reviewed inputs before writing, backs up affected files, rejects unexpected staged or tracked changes, and verifies protected inputs again after installation and checks. An interrupted validation does not silently roll back files. Return the transcript for diagnosis; the verified before-files remain in the printed checkpoint folder.

No commit, push, database operation or generated-cache deletion is performed by this patch.
