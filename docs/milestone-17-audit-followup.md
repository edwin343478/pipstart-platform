# Milestone 17 audit follow-up: current index

Approved release checkpoint: `490d9de69b09b754a0b6157b5483978c7a04d64d`.
The original Milestone 17 release and mobile typography approval remain historical checkpoints.
Local validation and owner visual/accessibility review passed on 8 October 2026.
The owner commit/push and fresh CI for that exact commit remain pending; the audit
follow-up is not yet closed. See `milestone-17-phase-2-verification.md` for current evidence.

## Phase 1 scope

- Restore cold-load fragment positioning after hydration reveals a glossary term.
- Keep expanded batches in the URL and honor reload and Back/Forward.
- Preserve native links and explain their batch/direct-target count exception.
- Match query words rather than unrelated word interiors; support reordered query words, plurals and conservative word-level spelling recovery.
- Preserve the related-context qualification in lesson labels and correct the Crypto introduction's publication description.
- Send allowlisted teaching data and filter state to the client; retain native late anchors and the existing twelve-term batching policy.
- Validate imported runtime fields, share the catalogue/display digest serializer and require exact approved integration coverage.
- Cache one indexed Crypto route collection; retain immutable approval counts and historical evidence.
- Keep the dedicated search route out of indexing and correct the combined glossary page title.
- Reject the local review flag on known Vercel/Netlify production deployments, while retaining local production-server review testing.
- Target Next.js, @next/mdx and eslint-config-next 16.3.8 in both apps where present; override sharp to 0.35.5. Generate the lockfile locally and inspect the resulting diff.
- Add six production browser cases per viewport to the existing ten; preserve strict source/build-bound result verification.

## Preserved boundaries

No approved definition/example/caution rewrites, term additions/merges, lesson edits, anchor changes, reading-key changes, CSS edits or layout redesign. Approved inventory remains 378 entries and 380 meanings; 89 lesson identities remain covered.

## Phase 2 evidence still required

Local full formatting, lint, type checks, unit tests, both-app build, dependency audit, 48 public and 48 review browser cases and source-bound result verification. Then review the diff, commit/push locally and obtain fresh CI for that exact commit.

Manual checks: mobile Safari, keyboard navigation after expansion, 200% text enlargement, custom text spacing, long names, screen-reader flow and 3–5 beginner term-finding/explanation tasks. Record evidence rather than assuming automated checks prove comprehension.

Mobile heading hierarchy/spacing and wording simplification remain recommendations requiring a concrete visual/editorial review. Browser delivery still contains all matching articles to preserve native anchors: the display projection reduces serialized props, not the entire DOM.

The environment review guard covers declared Vercel/Netlify production contexts; other hosting environments must forbid the review flag in deployment configuration. Noindex is not access control. Main branch protection/rulesets remain a separate repository-settings decision; no settings are changed by this patch.

Historical evidence is retained. Link final commit, CI run and durable reports here after closure. Refresh source reviews when providers/networks change, and assign an editorial owner before treating approval as perpetual factual currency.

## Dependency sources

- https://github.com/advisories/GHSA-cjq9-62q9-8jv4 — Next.js patched in 16.3.8; the described SSRF requires configured remotePatterns.
- https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w — sharp patched in 0.35.5.

No exploit was demonstrated by these audits. The local runner records the fresh audit output and stops on any remaining advisories.

## Phase 2 local verification checkpoint — 8 October 2026

- Owner execution passed formatting, lint, type checks, both-app builds, public
  bundle checks and all 1,215 workspace unit tests.
- Production browser gates passed 48 public and 48 review cases with zero failed,
  flaky or skipped cases; strict build/catalogue/source/mode verification passed.
- Final read-only review confirmed unchanged approved catalogue/lesson/CSS files,
  clean diff whitespace and formatting across 995 tracked/intended-new paths.
- The owner approved visuals and View more, and confirmed keyboard navigation,
  200% text enlargement, custom text spacing, long names, screen-reader reading
  order and real mobile Safari. These are owner-reported passes, not independent
  observations by the reviewing assistant.
- One raw braces advisory remains under the verified local mitigation described
  in `milestone-17-dependency-repair.md`; this is not a clean raw audit.
- The final public rebuild has a different build ID from the verified browser
  reports; the reports remain evidence for their recorded builds, not that rebuild.
- Beginner comprehension testing, editorial/source-review ownership, hosting
  configuration and repository-governance recommendations remain open follow-ups.
  No claim of measured learner satisfaction or complete remediation is made.

Commit/push and fresh CI are the remaining release-closure steps. Link the exact
commit and successful CI run in the closure evidence after the owner executes them.
Retain earlier status sections and handoff reports as historical evidence; this
checkpoint supersedes their outstanding-local-validation wording.
