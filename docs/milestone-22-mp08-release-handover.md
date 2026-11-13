# MP08 publication and paused-scheduler handover

13 November 2026. Source baseline fe67caca15036cf6bd2f2a0874d76eb151787593.

## Release disposition

MP08 is not yet complete. Manual publication, withdrawal, recovery, approved analysis/curriculum cutover, controlled scheduled catch-up, stop and exact test cleanup have accepted evidence. The normal future-due scheduling visibility and capacity gate remains open. The owner explicitly chose a measured future-due pilot rather than waiving this gate or accepting a paused-scope closeout. This handover authorizes neither that pilot nor steady-state activation.

## Verified current state

- Generation 4 baseline restored through the normal Owner UI as new generation 6; exact equality for 160 entry tuples and 21 frozen quiz versions. Generation 6 seal: ae9dadbadd8a91220fd0b94908d0fcc3ffe0d3b170703993d4c3a84a6980615a. Configured groups: analysis,curriculum.
- Private generation 6 refresh verified with attempts 1. Bounded anonymous observation matched generation, seal and groups; the exact test route returned 404. Owner Check live site and final read-only SQL also passed.
- Exact analysis fixture m22-analysis-scheduler-verification-20261112 revision 1 archived with confirmed receipt and closed Auth session. Historical revisions, approvals, schedule and generations remain preserved. No physical deletion.
- DB scheduler disabled/version 4; job 2 pipstart-publication-minute inactive with its original fixed command restored. Staff access remains enabled. These are point-in-time owner read-only facts, not continuous monitoring.
- Post-test Production runtime delivery disabled: unauthenticated bounded check at 2026-11-13T09:34:47.344Z returned HTTP503/status disabled. Owner confirmed pipstart-platform-fn1rsxz9h-pipstart.vercel.app Ready/Production at fe67caca. No secrets were requested or logged.

## Evidence and limits

Checkpoint 3 was explicitly accepted. The analysis pilot demonstrated publish/withdraw/restore and a disposable real-provider failed build without disrupting application production; that was a lightweight build probe, not a forced full Next production failure. Default/no-store warmed-route checks are repeatability evidence, not forced cold-CDN observations.

Curriculum cutover observed 160 routes in two cache modes with matching headings and initial private-content sentinel checks. Owner confirmed existing progress survived refresh and an existing quiz attempt resumed. This does not claim exhaustive private-content analysis or mutation of real learner data by the agent.

The scheduled fixture was overdue and explicitly authorized as catch-up. It committed generation 5 and made one automatic delivery attempt; public generation 5 was observed. The original provider acknowledgement remains unknown. The separately hosted, accepted and published check-only reconciliation function verified a matching public generation without sending another deployment request or increasing attempts. Do not rewrite that historical receipt as sent or use the post-deployment observer duration as due-to-visible latency.

Exact CI and SQL CI passed at fe67caca. The inactive installer change was accepted with 16 isolated catalog/rollback cases and 23 hosted-wrapper cases; its exact source was installed and read-only accepted separately. Those local Cron catalog stubs were not native execution proof. Real pg_cron API permissions/transactions were separately rehearsed; the controlled hosted catch-up established the actual pipeline. Nine isolated restore/archive checks passed and the disposable database was removed. No tests were silently skipped because credentials were unavailable.

## Operator recovery rules

Publish commits before deployment. A timeout or unknown hook response does not undo the committed generation. First capture private head/seal/state read-only, inspect Vercel, observe the exact public marker/content and use Check live site; never blindly restore, republish or resend to repair an acknowledgement. Stop commits the DB pause before separately stopping the exact Cron job; a failed Cron alteration must not roll back the pause. A pause cannot recall a provider request already in flight.

Restore a known accepted baseline as a NEW generation, requiring expected-head checks, exact entry/quiz parity and a matching public seal/groups observation. Archive only the exact unpublished, unheld test revision after the restored generation is verified. Preserve one-attempt journals. Do not revive either retired pilot fixture or reset its journal.

## Remaining acceptance sequence

1. Prepare the new future-due fixture/receipt, bounded actual capacity review, timed observation and stop packets at the current verified generation 6. Use a new fixture identity, not the archived one. Obtain explicit hosted fixture/schedule/activation authorization only after the exact packets are reviewable.
2. Verify a future UTC due time, original local input/IANA zone, current approvals/policy and sole eligible request. Native one-minute tick must publish once; at most one scheduled hook claim. Record DB due time and the first matching anonymous generation/seal/content observation. Five-minute normal-operation objective is not an outage SLA. An overdue catch-up is not replacement proof.
3. Record actual plan, existing relevant job load and remaining deployment allowance before activation. One-minute cadence means 1,440 SQL ticks/day, not 1,440 builds/day; idle ticks must not deploy. Do not assert quota or paid capacity from old documentation. This publication changes no plan or spend.
4. Stop after the bounded pilot; verify DB/Cron/runtime stop, restore and verify the baseline as a new generation, then archive that new exact fixture under scoped approval. Reconcile outcomes and obtain an explicit steady-operation/activation decision before declaring full operational MP08 closure.
5. Commit/push this reviewed publication set only under separate owner approval, then verify exact-SHA CI/SQL CI and deployment. A Ready URL or public marker alone does not identify the source commit. Future pilot receipts and final disposition require a later bounded documentation update.

The review packet retains a fingerprinted external evidence index and original receipts. It does not copy credentials or full operational logs into the repository. MP09 partner/affiliate administration follows accepted MP08; MP10 maintenance/link reports, MP11 pre-audit and MP12 final reconciliation remain separate milestone packages.
