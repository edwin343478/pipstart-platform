# PipStart Milestone 17 — reviewed catalogue integration

This is the next guarded step within Phase 3, following the successful source-closure Windows run. It connects the 378-entry / 380-meaning approved catalogue to the existing glossary presentation in explicit local review mode. It does not publish the expanded catalogue or declare Milestone 17 complete.

## Behaviour

Normal public mode retains the existing 16 Forex and 120 Crypto entries, the existing root/entry publication gates and current public wording. An explicit process-only `PIPSTART_M17_GLOSSARY_REVIEW=1` enables the reviewed presentation on the same three glossary routes for local inspection: 242 Forex and 136 Crypto entries, 378 entries total, with 380 separate meanings. Review-only presentation projections do not mutate the private JSON or the independent public inventory. Their `reviewed-glossary-preview` basis distinguishes them from released entries. Exact source-closure digest and approval/status checks must pass before review content is returned. URL parameters cannot enable this mode.

The existing teaching blocks render definitions, everyday examples, cautions, meaning-specific lesson links and related-term links. No CSS, font, card, grouping control, lesson, progress/state key, quiz or route slug is replaced. Normal and review modes retain twelve-item batches, View more, focus movement, truthful counts, course grouping, letter filters, search, aliases, typo fallback, category selection, canonical anchors and the no-JavaScript fallback. Review routes receive noindex/nofollow metadata. Their introductory sentence refers to reviewed content rather than describing it as published.

## Verification

Ten new unit/render tests check exact coverage and field preservation, strict mode selection, digest/approval/incomplete-review rejection, separate Slashing/Wash trading contexts, lesson validation, noindex, preview rendering and unchanged public defaults. The previous 58 tests remain intact. A new seven-fixture record verifier binds the display attestation to the already-applied source closure. Current source/ledger/audit documents remain unchanged.

The production browser suite preserves all 24 normal-mode cases. Review mode runs those same eight cases per viewport against the expanded inventory, plus two additional cases per viewport (30 total): compare every rendered definition/example/caution against all 380 approved meanings, and verify aliases/categories/noindex. Every expanded anchor and unique lesson context is checked. Desktop, mobile, small-mobile, accessibility and native fallback checks remain required; no retries, skipped cases or weaker click shortcuts are introduced. The larger all-anchor test receives a scoped five-minute timeout. Metadata binds catalogue, source files, build and mode, and separate report paths prevent one mode overwriting the other's evidence. The report validator now rejects a mode mismatch as well as eleven existing invalid-report cases.

CI retains its existing public browser step and adds the review suite with a step-scoped environment flag. It runs the new record verifier and retains both report directories. Normal test discovery includes the new unit tests. No deploy, commit or push is performed by this patch.

## Guarded execution

Stop your local development server with Ctrl+C before execution. The installer checks the exact reviewed H7 HEAD, no staged changes, known tracked edits, 270 before/after guards, exact payload checksums and a fixed manifest checksum. It accepts either the whole before-state or the complete after-state; an unexpected or partly applied state stops for review. Verified backups and a transcript are written into a unique Downloads folder before repository writes. It checks the after-state review attestation against the actual approved source closure before applying files.

After application it runs current/historical source audits, review-record checks, all 68 unit/render tests with your normal Vitest configuration, repository typecheck, targeted lint, formatting, Node syntax and report self-tests. It performs one fresh production build in normal mode. It then runs and validates 24 normal browser cases and 30 review browser cases against that build on 127.0.0.1:3102, using separate reports. The review environment flag is restored in finally; it is not written to .env.local. Playwright owns its temporary verification servers. No cache deletion/move, process termination, package installation, database operation or key request is included. The script leaves an after-state in place if a later check fails and prints the verified checkpoint; return the transcript before further changes.

## Local validation and limits

The restored baseline matched all 270 checks from the successful source-closure patch. All 68 tests passed in the available local MDX-metadata harness; targeted ESLint, source-closure/readiness checks, the new seven-fixture attestation check, normal/review report self-tests, browser discovery (24 + 30), formatting, Node syntax, JSON/ZIP and scope/preservation checks passed. Full local repository typecheck was blocked by missing exported application files and linked dependencies; no errors were reported in the changed files. The harness uses a metadata-only MDX transform and available local dependencies, not the complete Windows production environment. Windows typecheck/build and actual browser execution remain authoritative and must complete through the runner. Discovery and self-tests are not browser passes.

## Review after a successful run

Return the transcript plus `apps/pipstart/test-results/m17/results.json` and `apps/pipstart/test-results/m17-review/results.json`. For personal review, start the supplied loopback preview script after the verification server has closed, then open http://127.0.0.1:3102/glossary. Inspect Forex/Crypto/Both totals, the first twelve cards, View more, new definitions and examples, Slashing's two meanings, search aliases, lesson links and narrow mobile widths. The preview script sets the flag only inside its child process. Stop it with Ctrl+C when finished.

Publication remains a separate decision. Approval of this patch or a passing preview suite does not authorize opening the catalogue release flags. After personal review and successful technical evidence, the remaining release step will activate the approved content and require the matching final production/CI checks.
