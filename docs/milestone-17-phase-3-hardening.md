# PipStart M17 — Phase 3 hardening and release checks

## Scope

This patch adds production browser verification and integrates it into the current CI quality job. It changes no glossary page, component, lesson, font, layout, catalogue wording or release flag. It is a verification patch within Phase 3, not a declaration that Milestone 17 is complete.

The current approved public glossary has 16 Forex and 120 Crypto entries. The expanded draft has 378 entries / 380 meanings and remains gated. Source verification still has 130 targeted checks pending; the 149 core mappings and five corrections also need final claim-level review, including remaining examples and notes. Existing arithmetic and lesson-context checks are separate evidence.

## Browser coverage

24 cases: eight cases on each of desktop 1440px, mobile 390px and small mobile 320px. Coverage includes:

- Both as the default, honest course counts, visible grouping controls and the removed cross-search promotion.
- Groups of 12, no automatic expansion while scrolling, keyboard activation of View more, focus placement and final-group behavior.
- All/P alphabet filters and course-switch reset behavior.
- Separate Forex/Crypto meanings of spread, typo fallback, empty results, escaped query text and private Forex draft exclusion.
- Every current course-specific canonical anchor and every unique lesson-context link collected from the public cards. Runtime visibility checks require later groups to expand when JavaScript is enabled.
- Axe WCAG checks and horizontal-overflow checks on the three glossary entry points and the retained combined-search URL.
- Native grouping/search/View more and late-anchor visibility with JavaScript disabled.

The separate `playwright.m17.config.ts` uses a production server on port 3102 and the installed full Chromium binary. It does not reuse a development server or require live assessment credentials. Existing M15/M16 configurations remain unchanged. No database writes or backend rate-limit probes are added.

## Evidence integrity

The browser JSON report records the production BUILD_ID, catalogue digest and a digest of the glossary implementation, configuration and test source. The verifier checks the report against the current build and sources, rejects a report predating the build, and requires exactly 24 passing cases with all three projects. Failed, skipped, retried/flaky or partial runs are rejected. Eleven negative self-test fixtures exercise these checks; they are not browser executions.

## CI preservation

The existing workflow's Node 24.18.1, pnpm 11.18.0, dependency installation, format/lint/typecheck/test/build steps, isolated CI Supabase setup, public-bundle verification, approved Crypto browser checks, artifacts and live learner job are preserved. Added steps run the five M17 audit verifiers, the report verifier self-test, the production M17 browser gate and a separate M17 artifact upload. No new secret is requested.

## Local validation and pending execution

The supplemental local harness passed the existing 58 unit/render tests, scoped TypeScript and targeted ESLint. Playwright discovery found all 24 cases. Report self-tests, Node syntax checks, Prettier, the five existing audit verifiers, the existing-CI-step preservation check, baseline/payload hashes, unchanged application-content/style checks and archive integrity passed.

The local rendering harness uses a metadata-only MDX transform, the supplied source files and dependencies from the existing local checkout; it is separate from the actual repository production configuration. Discovery does not run browsers. A full current production application build and browser execution have not been completed locally. Your Windows runner performs those checks using the actual repository and installed Chromium. GitHub CI remains pending until the verified changes are committed and pushed through the agreed workflow.

## Execution

Save the ZIP and runner in Downloads. Stop the development server with Ctrl+C before running so the production build can own its generated files. The installer checks the exact reviewed source hashes and the H7 HEAD, verifies/backups pending files, and applies only the seven payload files. It runs the five audit verifiers, the existing 58-test suite, production typecheck, targeted ESLint, Prettier and the report-verifier self-test. It then makes a fresh PipStart production build, checks the browser environment, runs the 24 production browser cases and validates their JSON evidence.

No cache is deleted; no generated-type directory is moved; no existing process is terminated. Next.js may regenerate its normal build outputs and next-env.d.ts; that generated declaration was inspected but is not frozen as approved source. If port 3102 is occupied or a check fails, execution stops and the transcript identifies the failure. Already-written files are not automatically rolled back; their before state is preserved in the Downloads checkpoint. Do not force a baseline mismatch.

Return the transcript and `apps/pipstart/test-results/m17/results.json` after a successful run. Browser failure screenshots/traces and the HTML report remain in `apps/pipstart/test-results/m17` and `apps/pipstart/playwright-report/m17` for review.

## Release status

A successful technical run proves the tested current public glossary behavior. It does not certify all expanded definitions or open publication gates. Finish remaining source verification and obtain publication approval before the expanded glossary is released. This installer does not commit or push.
