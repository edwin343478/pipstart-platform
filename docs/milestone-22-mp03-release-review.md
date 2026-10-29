# MP03 consolidated acceptance and release review

This is the current handover entry point for the MP03 source on the MP01/MP02 baseline. Earlier per-bundle documents describe their staged state; their old "next" lists are historical, not the current completion register.

## Current status — MP03 accepted (29 October 2026)

MP03 is accepted for its staff-core scope. Every MP03 change is published with exact-commit main CI, M22 staff SQL CI and Ready/Production deployment verified. The latest is `9ef200812b5a8423f3c2048980188c5207df2247`.

- **Live:** the real Owner holds two named authenticators. Staff core (entry, overview, people, audit and governance) is enabled at control version 3, and only `PIPSTART_M22_STAFF_UI_ENABLED` is set in Production. See `milestone-22-mp03-owner-rollout.md`.
- **Manual accessibility:** native zoom, keyboard-only operation and a physical screen reader were owner-reported passing on the live staff pages.
- **Deferred:** activating the learner provider and staff maintenance, which are published and default-off, and any further staff grants. These are separate operational rollouts, not MP03 acceptance gates.

The sections below are the historical record of how MP03 got here. Their "next" lines and pending notes describe the state at the time.

## Decision and scope

Keep staff UI, staff database control and the account-provider adapter default closed. This packet prepares publication of staff source that remains disabled by default and continuous SQL verification. The separately authorized six hosted MP03 migrations and read-only schema acceptance have completed, with the exact source-set hash reported by the owner and matched to the prepared packet. This is not authorization for Owner bootstrap, role grants, provider operations, legacy-preview cutover or activation. Full MP03/live operational readiness is not declared. (Historical: the current status above supersedes this.)

The reconciled implementation covers staff entry and TOTP; live AAL2 and capability checks; bounded people, roles, delegations, assignments and audit views; single-use fresh-action receipts; own-account deletion eligibility and staff-history protection; the durable private account-operation journal; dormant Owner-proof/provider suspension, resumption and inspection adapter; offline recovery and audit-linked retirement finalization.

## Publication order: learner account deletion

The MP03 update to account/actions.ts calls pipstart_account_deletion_eligibility() for ordinary account deletion, independently of the staff UI flag. The hosted MP03 deletion-safety migration must be accepted before publishing that source. Missing/error/malformed eligibility deliberately refuses deletion; default-off staff UI does not remove this customer-path dependency. Do not add a legacy-role or missing-schema bypass. The owner-reported hosted schema acceptance passed for source set `fce2652ed0efb0c4900138388303c4c5beb8edc717c7a811ced4fcb9c0e8e226`, including the deletion eligibility RPC fingerprint and grants. Local real Auth/controller acceptance covers learner eligibility and staff-history protection. Hosted acceptance is schema-only: it did not delete a live learner or exercise real hosted staff identities. The required hosted schema prerequisite is now met; publication still requires separate approval and exact-commit CI.

## Accepted staged evidence

| Boundary                             | Accepted local evidence          | Practical limit                                                                                                                                                                                                  |
| ------------------------------------ | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Governance controllers and browser   | 019a7443301eb193c8fd45cd6e0b9084 | Real local Auth/PostgREST/browser and nine axe states; recorded Owner visual approval. CSS 200% zoom is not native browser zoom or a physical screen-reader test.                                                |
| Audit controller and browser         | c78992b27cd6880b6783a9e0bc57c44f | 23 required gates, minimized audit, signed-in authorization and browser states; Owner approved visuals in the conversation.                                                                                      |
| Own-account deletion safety          | 910408083b18df43c72a0d7dcf137c7e | Disposable SQL/Auth/controller accounts; staff and former-staff deletion blocked. No live account erased.                                                                                                        |
| Provider bridge                      | 795f28b4fb39489255948e07368e528e | 18 gates, exactly one generated-account suspension and resumption; response-loss and read-only reconciliation. Production transport remains disconnected.                                                        |
| Recovery and retirement SQL          | 9ff600ab085833a43b875e8f8504582b | Marked disposable DB, SQL Auth stubs, transaction rollback and immutable-append failure. Includes proof/journal/provider/retirement stages; new consolidated CI additionally stages governance/deletion.         |
| Offline recovery and retirement Auth | 15e5ea54841ecec6db4148f92313dba5 | 17 gates, three generated accounts, five factors, exactly two factor deletions and one soft retirement. Cleanup confirmed; final staff state paused. No real-person ownership or physical backup custody proven. |

The accompanying minimized evidence index records report hashes and source matches. All recorded source inputs match the current reconciled files. These reports remain staged local evidence and do not prove a later published commit or production configuration. Subsequent consolidated SQL and owner-reported hosted schema evidence are recorded separately below.

Two rehearsal defects were corrected and failed runs preserved externally: a PostgreSQL-incompatible temporary foreign-key fixture and the installed SDK's nested deletion acknowledgment. Neither correction changed application migration behavior. Actual SDK contract tests cover the acknowledgment checks. No failed run is counted as accepted.

## Consolidated CI gate

The MP02-only workflow is extended to a portable MP03 runner with an explicit ordered manifest of 15 SQL inputs. It retains MP02 staged/rollback/head and observed last-Owner contention, then tests proof freshness/replay, governance reads, deletion safety, journal atomic append and observed two-session single dispatch, provider proof/ban gate and retirement safeguards. New negative guard tests reject scope changes, changed fingerprints, traversal and symlink escape, and exercise the actual no-Docker preflight.

Only a fresh, labelled CI PostgreSQL service is selectable in CI mode. Existing application DBs are not reset. Local execution creates and drops only its exact marked disposable database. Auth schemas here are stubs; this gate does not replace the real Auth/browser evidence. Publication requires this gate and the complete existing quality workflow to pass on the exact published revision.

## Open completion and activation register

1. Learner-provider implementation and the approved visual follow-up were published as `854d7d30c4654a8af05eb08ab6c647ce22886ac1`; its exact-commit main CI `40706793818`, M22 staff SQL CI `40706794241` and Vercel deployment status succeeded. Original preparation note: they were applied locally. Isolated SQL run `4e19fdad873775de5c29d7c9ba662693` passed 19 inputs/26 gates; actual local Auth/provider/controller/browser run `f660c500bb3aedfb6c2258d799b6dba9` passed 29 gates, exact provider counts and cleanup. Publication of the 22-file scope still needs approval and exact-commit main/SQL CI plus deployment verification. The accepted published baseline is `c5b7a4677dae6b03ba61cfd549b64dda96b4b56a`.
2. The owner reported successful hosted learner-provider schema acceptance for SHA256 `8a6bbeebd3a3a2273e104a2009806740b54e6ea714cad051744a4db5cc00872d`, with default-closed control. Local wrapper rehearsal `068e5acf70c03d2782260fbf092a6ebd` passed eight gates and cleanup. The exact saved owner CLI listing now verifies all eight MP03 history versions through `20261028150000` in Local and Remote. This is owner-reported hosted schema/history evidence, not independent remote inspection or real hosted identity/provider acceptance.
3. The real Owner rollout is complete for staff core only (see `milestone-22-mp03-owner-rollout.md`). The Owner's own account is the single active Owner, with two verified, named TOTP authenticators on separate devices. Staff control is enabled at version 3 after a successful stop drill, and only `PIPSTART_M22_STAFF_UI_ENABLED` is set in Production. It rests on the published staff-only enrolment gate and authenticator naming. The learner-provider and staff-maintenance flags and keys remain unset, and any further staff grant is a separate reviewed operation. Evidence is owner-reported, not independent remote inspection.
4. Manual accessibility is owner-reported passing. A 26-check checklist was run on the live staff pages: sign-in, staff verification, overview, People, Audit and the learner refusal. It covered native browser zoom at 200% and 400%, keyboard-only operation and a physical screen reader. Itemized results and the screen reader used were not supplied. The authenticator setup screen was not exercised live, because that would add a factor; it keeps its automated axe, keyboard and width evidence. Owner visual approval and automated axe evidence remain as recorded.
5. Learner-only account intent, fresh-verification transport and inline suspension/reactivation/state/inspection UI are implemented, accepted and published, with owner-reported hosted schema and exact migration history. The provider/UI part was published as `854d7d30c4654a8af05eb08ab6c647ce22886ac1` with verified exact-commit CI. Current/former staff and legacy administrator targets remain excluded. The path remains default-off: `PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED` and its dedicated key are unset. Its live rollout is a separate later operation.
6. Owner-only current/former-staff suspension/resumption/inspection is connected through the default-off `/admin/maintenance` transport/UI (see `milestone-22-mp03-staff-maintenance.md`). It is locally SQL and real-service accepted, owner-approved visually, owner-reported hosted schema accepted and history verified. It is published as `ba8bfc8391ef9116b0177918a9d3f8841623e190` with exact-commit main CI, M22 staff SQL CI and Ready/Production deployment verified; it remains default-off. Offline factor recovery and retirement procedures already have staged acceptance, while real Owner identity/recovery custody and live operational acceptance remain separate. Staff maintenance is not routed through the learner path.
7. The legacy sample preview and its profile-role gate (`requireAdministrator`, `pipstart_profiles.role = 'admin'`) are retired by the preview-cutover change: the preview routes and preview-only components are removed, `/admin` redirects to staff entry, and no source grants authority from the legacy role. An owner-run hosted count showed five profiles, all `learner`, so no account lost access. The legacy enum value and data are unchanged; the role remains only a learner-path exclusion. The approved CSS/icons/primitives remain the staff design system. It is published as `abc215da541bf3fb858f5495ef134325c0e37d81` with M22 staff SQL CI `40832072217` and Ready/Production deployment verified. Main CI `40832072281` passed on attempt 2 after the M16 key-terms test (`milestone-16-h6-accessibility.spec.ts:182`) timed out twice in attempt 1 on the same commit and image. That test was hardened in `9ef200812b5a8423f3c2048980188c5207df2247` and passed on the first attempt there. It now re-opens the native panel with the keyboard until the link is visible; a simulated closed panel showed the old steps failing and the new steps recovering.
8. Retirement preserves pseudonymized audit-linked identity/profile/preferences and protected references. It is not complete erasure or legal compliance certification. Separate privacy cases require their own retention/erasure decision. The final MP03 evidence/register reconciliation is recorded below.

## Quality and release sequence

Initial MP03 preparation used an external baseline snapshot plus 75 reconciled implementation files and that release packet. The exact frozen dependency candidate uses Next 16.4.1 and Vitest 4.1.12. It passed all 2,373 unit tests, TypeScript, changed-source lint, formatting, 14 CI guard tests and a default-off webpack build. Public-bundle verification found no draft/catalogue-body sentinels in 193 browser chunks. Earlier broad checks against stale shared dependencies were inconclusive and are preserved; full lint and all release gates still require exact-commit CI. No result is inferred from an absent test. The main checkout still has its previous dependency installation; refresh it with pnpm install --frozen-lockfile before future local UI/build checks. Future preparation should reuse this exact candidate runtime only while package/lockfile fingerprints still match.

The owner applied the release source packet, completed consolidated isolated SQL acceptance, and reported successful authorized hosted schema acceptance and history reconciliation. A subsequent two-document handover update records those results without changing executable source or SQL. After its owner-run application, obtain publication approval for the exact 81-file MP03 inventory. Then require complete quality and MP03 SQL CI on the exact published commit; the preparation results are not a substitute for those checks. Staff UI/provider settings and hosted staff control remain default-closed. Live bootstrap/activation and the unfinished capabilities in the register above remain separate gates.

MP03 is accepted; next is MP04. The learner-provider and staff-maintenance live rollouts remain separate later operations. Exact-commit CI and deployment are verified for `854d7d30c4654a8af05eb08ab6c647ce22886ac1`, `ba8bfc8391ef9116b0177918a9d3f8841623e190`, `abc215da541bf3fb858f5495ef134325c0e37d81`, `c26b15d3a261f4503e47723f18a3e0897c8ee7de`, `d5bb601586cace7636b20fbaeec22ea559289f6b`, `87a0e9ff0d72e19cb07875e8739a325ea18057ca` and `9ef200812b5a8423f3c2048980188c5207df2247`. Nine main packages follow MP03.

## Publication review — 28 October 2026

The reviewed inventory contains 75 reconciled MP03 implementation files and six release/CI files. All match their accepted source fingerprints before the two documentation-only status updates. The index was empty during review; unrelated M15 bundles are excluded. Source inspection confirms exact-true environment gates for staff UI/provider access, and hosted schema acceptance reports disabled control version zero. Current production environment values have not been independently inspected.

No commit, push, account/role grant, provider operation or activation was performed by this review. Passing publication/CI does not close the remaining MP03 feature and live-rollout gaps listed above.

## Learner-intent publication review — 28 October 2026

The ten-file patch is reconciled against its applied fingerprints and 13 accepted dependencies. Local SQL acceptance `2aeb578209ee8ae7982c1f0e95d74c26` verifies 21 gates and cleanup; wrapper rehearsal `24914a9f7341457ade9c2435bd3ec16a` verifies six wrapper gates and cleanup. Hosted schema acceptance and migration-history reconciliation are owner-reported and matched to source SHA256 `410b6fe0f5c5f37f0e185c9403f36232a037123fe5ebb76518872e6e8eb782ca`. Final schema checks include 32 function fingerprints, 10 trigger links and 12 private tables with RLS/API restrictions and initial empty/default-closed state. No real Auth/provider/user mutation was performed by hosted acceptance.

This handover updates only three documents, preserving all seven implementation/SQL/CI payload files. Publication scope remains ten files, with unrelated M15 bundles excluded. Preparation types/lint/format, 25 DTO tests and 14 CI safety checks are accepted; exact published-commit complete CI and deployment checks remain pending. Provider transport/UI, real Owner/recovery custody, legacy-preview transition and manual accessibility remain open. No activation or commit/push is authorized by applying the handover.

## Learner provider/UI preparation — 28 October 2026

The learner-intent baseline `c5b7a4677dae6b03ba61cfd549b64dda96b4b56a` subsequently passed main CI `40665553756`, isolated SQL CI `40665553780` and the owner-reported Ready/Production deployment. This closes its earlier exact-commit publication gate; it does not activate staff or provider access.

The next source packet connects learner-only suspension/reactivation and read-only inspection through an exact fresh-MFA command and a one-use database-bound server permit. See `milestone-22-mp03-learner-provider-ui.md` for the authority, uncertainty, credential and rollout contracts. The additive migration and 19-input / 26-gate consolidated SQL suite are prepared, not executed or accepted. Applying source does not authorize migration, provider operations or activation. Real local Auth/PostgREST, provider transport/controller/browser and accessibility/visual acceptance remain required before hosted review or publication.

Open register items 5 and 6 above describe the prior release: this packet implements the learner transport/UI source only, pending acceptance. Owner-only staff-maintenance transport/UI remains separate and unfinished. Legacy-preview cutover, live identity/bootstrap/recovery custody and manual native zoom/screen-reader acceptance also remain open. Full MP03 is not complete.

## Learner-provider publication handover — accepted evidence

The exact 22-file scope combines 13 additions and nine tracked updates; unrelated M15 bundles are excluded. Source and dependency fingerprints match the accepted implementation plus the two-file className/scoped-CSS presentation change. This handover changes only the learner-provider guide, this completion register and the evidence index. No implementation or SQL is altered.

Accepted evidence: local SQL `4e19fdad873775de5c29d7c9ba662693` (26 gates/19 inputs); actual local Auth/provider/controller/browser `f660c500bb3aedfb6c2258d799b6dba9` (29 gates, four updates/two inspections, 11 clean axe states); visual follow-up (22 checks, 16 isolated presentation states, explicit owner approval); hosted-wrapper rehearsal `068e5acf70c03d2782260fbf092a6ebd` (eight gates); owner-reported hosted default-closed schema result for source SHA `8a6bbeebd3a3a2273e104a2009806740b54e6ea714cad051744a4db5cc00872d`; and exact owner-run CLI history listing through version `20261028150000` with SHA256 `b7a88085560622763bb68f48a7aa4eac40249f3c8da975b72ce6ec93661db4d1`. Each disposable run confirmed cleanup. Earlier failed helper runs remain preserved and excluded from accepted results.

History reconciliation and current documentation are complete after owner application of this handover. Publication approval, exact-commit CI and Ready/Production verification remain pending. Hosted production environment flags/credentials were not independently inspected, and no activation is claimed. Full MP03 remains open as listed above.

## Owner staff-maintenance publication handover — accepted evidence

The exact 21-file scope combines 15 additions and six tracked updates on `854d7d30c4654a8af05eb08ab6c647ce22886ac1`; unrelated M15 bundles are excluded. It adds the default-off paused-Owner `/admin/maintenance` transport/UI, the additive maintenance permit migration and its SQL suite, and an opt-in paused navigation for the shared staff frame. This handover changes only the maintenance guide, this completion register and the evidence index. No implementation or SQL is altered.

Accepted evidence: isolated SQL `5c046bebc229e9856c739a946ff3cda6` (21 inputs, 33 gate checks, observed permit contention); real local Auth/provider/controller/browser `1dcb904dff2be4abc7a28373c4b37652` (33 gates, four updates/three inspections, 16 clean axe states) with explicit owner visual approval; hosted-wrapper rehearsal `4e126e976c6e3bc000b2fa36c8a159f8` (eight gates); owner-reported hosted default-closed schema result for source SHA `df97d6dcf696ffa142f209a3765765e60a0e725f3a04de2ba4cae6e4497f1719`; and exact owner-run CLI history verification of `20261028180000` in Local and Remote. Each disposable run confirmed cleanup. Earlier failed and superseded runs remain preserved and excluded from accepted results.

Publication approval, exact-commit main/SQL CI and Ready/Production verification remain pending. No real staff identity, provider action, credential/flag setup or activation is claimed. Full MP03 remains open as listed above.

## Staff-only enrolment gate publication handover — accepted evidence

The exact 10-file scope combines three additions and seven tracked updates on `abc215da541bf3fb858f5495ef134325c0e37d81`; unrelated M15 bundles are excluded. It closes a D03 gap: `readStaffGate()` had offered `/admin/access` TOTP enrolment to any signed-in account without a verified factor. Enrolment and step-up now require `pipstart_staff_enrolment_allowed()`, an authenticated-only boolean that reveals only the caller's own active, unbanned, undeleted membership. It works at AAL1 and while staff is paused, so the Owner can enrol before enablement. The SQL runner grows to 23 inputs. This handover changes only the enrolment guide, this completion register and the evidence index; no implementation or SQL is altered.

Accepted evidence:

- isolated SQL `7aa8944cab2c9372a98c928f99ffa29f` (23 inputs, 35 checks);
- real local Auth/browser `802e351f957aabe0c6e2fd3e0d4e3dbb` (24 gates, four generated accounts, three TOTP factors, 14 clean axe states), with explicit owner visual approval;
- hosted-wrapper rehearsal `fc9f89e4283a6cfc2ce54e4d92b4ab2b` (nine gates, including collision-based replay refusal and function-body tamper refusal);
- owner-reported hosted default-closed schema result for source SHA `32a8a8ded382e4341fc8d3d19c86210dd69c9c04224b2cc8efeb97341d9a5dc7`;
- exact owner-run CLI history verification of `20261029090000` in Local and Remote.

Each disposable run confirmed cleanup. Two rehearsal-only harness corrections were made before the owner run; no product defect was found.

The run recorded rollout findings for Owner decision, listed in the enrolment guide. It is published as `c26b15d3a261f4503e47723f18a3e0897c8ee7de`: main CI `40849881255` passed on its first attempt (quality 27/27, M21 SQL 12/12), M22 staff SQL CI `40849881492` passed 13/13, and the Ready/Production deployment succeeded. No real staff identity, credential/flag setup or activation is claimed.

## Authenticator naming publication handover — accepted evidence

The Owner chose staff-core-only live scope, leaving staff enabled after the live drills, and fixing only the factor-naming finding before going live. The exact 9-file scope has nine tracked updates on `c26b15d3a261f4503e47723f18a3e0897c8ee7de` and no SQL; unrelated M15 bundles are excluded.

Staff now name each authenticator before setup. The sign-in choice shows that name, so the primary and backup devices can be told apart during sign-in and offline recovery. Unusable and duplicate names are refused before anything is created. The provider's name-conflict refusal is reported as definite; every other enrolment failure remains uncertain and is never retried. This handover adds the accepted run to the enrolment guide, this register and the evidence index; no source or SQL is altered.

Accepted evidence:

- preparation: types, lint and formatting; 184 test files with 2,467 tests (23 new); the default-off build; and a clean scan of all 191 public chunks;
- real local Auth/browser `7c8803c6a47da526d998a73563059b22` (27 gates, four generated accounts, three named TOTP factors, 15 clean axe states), with explicit owner visual approval.

No hosted or migration-history step applies. It is published as `d5bb601586cace7636b20fbaeec22ea559289f6b`: main CI `40859549106` passed on its first attempt (quality 27/27 including 2,467 unit tests and 214 M16 browser tests, M21 SQL 12/12), M22 staff SQL CI `40859549142` passed 13/13, and the Ready/Production deployment succeeded. The paused-Owner wording and narrow-screen layout findings remain deferred.

## Real Owner rollout — accepted evidence

Phase 2 rehearsed the exact hosted runbook locally:

- nine fingerprinted SQL stages, whose only variable is the Owner's Auth UUID, filled by the same helper used live;
- real local Auth and browser, with four generated accounts;
- the application started first without and then with the staff UI flag.

The assistant's run and the owner's run `df731e0a82110fcdc6fc2d8d6884faf3` each passed 39 gates: 9 stage passes and 10 refusals, every refusal with its expected reason and unchanged state, and cleanup confirmed.

Phase 3 ran on the hosted project with the owner's explicit authorization. The owner ran each stage in order through the copy helper and reported each result:

1. A read-only lookup confirmed an ordinary, confirmed, active learner account with no authenticators.
2. Preflight passed, then the bootstrap left staff paused at version 0.
3. `PIPSTART_M22_STAFF_UI_ENABLED=true` was set for Production and redeployed.
4. The primary authenticator was named and verified while paused, and the primary check passed.
5. Staff was enabled at version 1.
6. The backup authenticator was named and verified, and the two-factor check passed.
7. Signing in with the backup reached the staff overview, and a learner account was refused.
8. The stop drill paused at version 2, shutting out the open session on its next request.
9. Staff was re-enabled at version 3, and the final check passed: one Owner, two distinct named authenticators, and audit history of exactly the bootstrap then enable, pause and enable.

Staff stays enabled, as the Owner decided. The Owner keeps the offline custody record of the devices; the complete-loss procedure is offline and was not run live. The kill switches are documented in the rollout guide.

## Final MP03 reconciliation — 29 October 2026

Closing items since the Owner rollout:

- **Rollout documentation:** published as `87a0e9ff0d72e19cb07875e8739a325ea18057ca`. Main CI `40886447631` passed 27/27 on the first attempt, M22 staff SQL CI `40886447679` passed 13/13, and the deployment is Ready.
- **M16 key-terms test hardening:** published as `9ef200812b5a8423f3c2048980188c5207df2247`. Main CI `40894517574` passed 27/27 on the first attempt, including the M16 browser suite; M22 staff SQL CI `40894517755` passed 13/13, and the deployment is Ready. It changes the test only.
- **Manual accessibility:** owner-reported passing for all 26 checks (register item 4). This closes the remaining MP03 gate.

MP03 acceptance therefore covers:

- the staff core, with the default-closed control and fresh-verification model;
- staff-only enrolment and named authenticators;
- the retired legacy preview and profile-role gate;
- the published, default-off learner-provider and staff-maintenance transports with their accepted SQL, real-service and hosted schema evidence;
- the offline recovery and retirement procedures;
- the live Owner rollout.

Every accepted run is indexed in `milestone-22-mp03-release-evidence.json`.

Deliberately outside MP03 acceptance, each a separate reviewed rollout:

- enabling the learner provider or staff maintenance in Production, with their dedicated keys;
- any second Owner or further staff grant;
- the deferred presentation findings: the paused-Owner wording, and the 390px staff-frame block and roles heading.

Hosted evidence throughout is owner-reported, not independent remote inspection.
