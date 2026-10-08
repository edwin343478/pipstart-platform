# PipStart Milestone 17 — approved public glossary release

Personal review of the expanded glossary was approved on 8 October 2026 after the reviewed-integration Windows run passed 68 tests, build/typecheck/lint, 24 public browser cases and 30 review cases. This final Phase 3 patch makes exactly that approved catalogue the normal public inventory: 242 Forex + 136 Crypto entries, 378 entries / 380 meanings. No review environment setting is needed to see the complete content.

## Release and preservation

A separate public release record binds personal approval to the exact source-closure digest. The original draft flags, review attestation and historical evidence are retained as an immutable source archive; they describe earlier review states, not the new release decision. Runtime publication verifies the release record against the review attestation and the actual SHA-256 catalogue digest before promoting entries in memory. The public adapter validates all lesson contexts and refuses an incomplete inventory. Every definition, example, caution, alias and related identity is retained. Slashing and Wash trading keep their separate meanings. Normal public entries have the approved-glossary-catalogue publication basis. Local review remains available separately with its existing preview basis and noindex/nofollow.

Public routes now allow index/follow; local review routes remain noindex/nofollow. The default introductory sentence no longer says definitions await publication. Existing controls, twelve-card first batch, View more, focus movement, truthful grouping counts, categories, search, canonical anchors and native fallback remain unchanged. No CSS, typography, lesson content, quiz, course route, progress or reading-state key changes are included.

## Verification

All existing search eligibility and legacy-source adapter checks remain. Historical source fixtures are now explicitly tested as legacy fixtures, while current route assertions require the full released inventory. Four new release tests check exact field preservation, approval gating and rejection of incomplete, unreviewed or digest-mismatched snapshots. Total targeted tests: 72. The new release record verifier has six negative fixtures and binds the decision to the approved source closure.

The normal public browser suite now runs all ten cases per viewport, 30 total, including exact DOM comparison of all 380 meanings, all anchors/lesson contexts, aliases/categories and public index/follow. The local review suite also runs 30 cases, with noindex. Reports are bound separately to the production build, catalogue, relevant source files, release record and mode. CI retains previous tests and adds the release attestation; both browser steps have 20-minute limits. Previous M15/M16 CI steps are preserved.

Local validation: 72 tests passed in the existing metadata-only MDX harness, targeted ESLint passed, all source/audit verifiers and release rejection fixtures passed, browser report self-tests passed in both modes, and both suites discover 30 cases. Formatting, Node syntax, ZIP checksums and preservation checks passed. Full local typecheck is blocked by application files/dependencies missing from the read-only source export; no changed-file errors were reported. This is not a production build/browser pass. The supplied Windows runner must verify the real repository.

## Execution

Save the ZIP and Run-PipStart-M17-Public-Release.ps1 in Downloads. Stop your own local development or review server with Ctrl+C before starting. The installer checks the exact H7 HEAD, absence of staged changes, known tracked edits, before/after guards for all 276 prerequisite files, fixed payload and installer checksums, and the release attestation against actual source closure. It verifies a unique Downloads backup before writes, accepts a wholly unapplied or wholly applied package, and stops on an unexpected or partial state.

It runs preserved historical evidence checks plus the new release attestation, formatting, JS syntax, 72 tests, typecheck, targeted ESLint and report rejection fixtures. It makes one fresh production build with normal public settings, runs 30 public cases and validates the report, then runs and validates 30 review cases against that build. It finally verifies all payload/preservation hashes and unchanged HEAD. It restores the process environment flag in finally. No cache removal/move, process killing, package installation, database operation, credentials, commit or push is included. A failed later check leaves the patch state in place and prints its checkpoint for diagnosis.

Historical audit tools may print their original publication-gated messages. Those are checks of preserved pre-release evidence. The new release verifier and the final runner summary identify the current decision; old audit history is not rewritten to pretend it recorded later approval.

Return the transcript and both apps/pipstart/test-results/m17/results.json and apps/pipstart/test-results/m17-review/results.json. A successful runner makes the approved content available in normal local mode. GitHub will receive it when you perform the subsequent commit/push. Final GitHub CI success remains required before declaring Milestone 17 complete.
