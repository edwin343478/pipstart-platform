# PipStart M17 Phase 3 — native fallback repair

The Windows run passed the production build, 58 unit/render tests, typecheck, lint, formatting and all 18 JavaScript-enabled browser cases. The six no-JavaScript cases failed: two cases repeated across desktop, mobile and small mobile. The patch remains applied and has not been committed.

## Evidence and repair

The supplied production CSS includes Tailwind's `@layer base` declaration `[hidden]:where(:not([hidden=until-found])) { display: none !important; }`. The existing term `:target` override was unlayered. Important layered declarations outrank unlayered important declarations, so the later hidden glossary term stayed hidden. The repair places the more specific term override in the same base layer, where it wins by specificity.

The navigation trace shows the native View more URL retaining its last-visible-card fragment, followed by successive changes in document scroll position while Playwright waits for the Forex control to become stable. The repair uses instant scrolling only inside the glossary's noscript fallback. The native anchor and batch pagination remain intact. The Windows browser rerun will confirm that this resolves the navigation timeout.

The only production edit is the existing noscript style in `glossary-results.tsx`. The rendered font sizes, card styles, shared CSS, page markup, normal JavaScript behavior, reading keys, lessons, CI workflow and publication flags are unchanged. The existing render test now checks the critical layer/scoping; the browser test additionally checks instant native scrolling. No test is removed, skipped, forced or converted into a weaker navigation shortcut. All 24 browser cases remain required.

## Execution and safeguards

This patch follows the already-applied Phase 3 hardening patch at the reviewed H7 HEAD. Exact normalized source guards, payload hashes and before-state backups are checked before writing. Already-applied repair files are accepted for a verification rerun. Unexpected tracked changes or source mismatches stop execution; do not force them.

Stop the development server with Ctrl+C before execution. The runner applies four files (one component, two tests and this report), runs all five M17 audits, the existing 58 tests, actual repository typecheck, targeted ESLint, formatting and report self-tests, then builds the production app and runs all 24 browser checks. A report bound to the new build and source hashes is required. No cache is deleted, generated-type directory moved, process killed, database updated, commit made or push performed. Next.js still creates its normal generated build files.

Return the transcript and `apps/pipstart/test-results/m17/results.json`. If execution fails, return the transcript before making more changes; before-state backups remain in Downloads and applied files are not automatically rolled back.

## Verification and release limits

The supplemental local harness passed all 58 unit/render tests, scoped TypeScript and targeted ESLint. Playwright discovery retains all 24 cases; it does not execute browsers. Formatting, five existing source/content audit verifiers, browser-report self-tests, source-preservation checks and archive integrity were checked. The rendering harness uses a metadata-only MDX transform and dependencies from the earlier local checkout, not the actual Windows production build configuration. Full production build and browser execution of this repair must be completed in the Windows repository. The earlier successful build and 18 browser cases are evidence for the baseline, not evidence that the repair has passed.

Expanded glossary publication remains closed. Technical browser success does not complete the remaining 130 targeted source checks or the outstanding claim-level review of the core mappings, corrections, examples and notes. This patch does not publish the expanded catalogue or declare Milestone 17 complete.
