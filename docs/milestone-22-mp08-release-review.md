# MP08 acceptance and release review

This is the handover entry point for MP08 (publishing, scheduling and controlled cutover). The evidence index is `milestone-22-mp08-release-evidence.json`. The per-patch guides:

- `milestone-22-mp08a-publication-store.md`
- `milestone-22-mp08b1-publication-panel.md`
- `milestone-22-mp08b2a-live-generation-build.md`
- `milestone-22-mp08b2b-delivery-verification.md`
- `milestone-22-mp08c1-scheduling-foundation.md`
- `milestone-22-mp08c2-restricted-scheduler.md`
- `milestone-22-mp08c3-connected-scheduling.md`
- `milestone-22-mp08-observed-verification.md`

`milestone-22-mp08-release-handover.md` records the paused state on 13 November. This review supersedes its release disposition.

## Current status: MP08 accepted (15 November 2026)

MP08 is accepted. Scheduled publishing is installed but **off**, by owner decision. Turning it on is a separate, authorized step.

| Commit    | Delivered                                                                                     | CI                                                                 |
| --------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `6ed6a8d` | Publication generations, delivery, panel, live-generation build, paused scheduling (54 files) | CI, M21 SQL and M22 SQL passed; live learner release gates skipped |
| `fe67cac` | Check-only reconciliation of an observed deployment, without retry (8 files)                  | CI, M21 SQL and M22 SQL passed; live learner release gates skipped |
| `77a601f` | Paused handover and inactive installer safety (3 files)                                       | CI, M21 SQL and M22 SQL passed; live learner release gates skipped |

What is live:

- **Publishing model.** Publishing creates a new immutable, sealed generation. Each generation is delivered by a new Vercel deployment that bakes it in. Analysis posts and curriculum both read the store, through `PIPSTART_STORE_FAMILIES=analysis,curriculum`.
- **Content library.** Make live, Take offline, Restore generation (Owner only), Check live site and Retry delivery. The Owner single-person publication policy is audited.
- **Current generation: 8,** restored from generation 6 (160 entries, 21 frozen quiz versions), seal `47cc0291…6897`, verified on the live site.
- **Scheduling.** Schedules can be created and cancelled in the dashboard. The database scheduler is paused (version 8), Cron job 2 is inactive with its original command, and production runtime delivery is disabled (`PIPSTART_PUBLICATION_SCHEDULER_DELIVERY_ENABLED` is not `true`; the endpoint answers 503 "disabled").

## Gate disposition

- **Manual publish, withdraw, restore and durable delivery:** accepted, covering the analysis pilot, checkpoint 3, and the curriculum cutover across 160 routes with learner progress preserved.
- **Five-minute future-due visibility: accepted by owner amendment on 15 November 2026.** Schedule `ddc67708…` was due at 2026-11-14T20:32:00Z.
  - The scheduler published generation 7 at **+0.685 s** (database timestamp).
  - The deploy hook was sent at **+9.45 s** (database timestamp).
  - The public site showed generation 7, with the exact seal and content, between **52.7 s and 114.9 s** after due. This is a single-anchor bound: the observer's process ended before its final same-process database clock reading, and that limitation is accepted openly rather than backfilled. No further pilot will be run.
- **Stop:** the database pause was committed first; the Cron command was then restored to its original form, still inactive; nothing is pending. Generation 7 was verified by Check live site without a retry, and its attempts stayed at 1.
- **Cleanup:** generation 6 was restored as generation 8, with exact parity. The deploy acknowledgement was uncertain, but the public site matched, so a check-only verification was used and attempts stayed at 1.
  - The test post `m22-analysis-scheduler-timing-verification-20261113` was soft-archived with one confirmed attempt.
  - The histories of generations 6, 7 and 8, the schedule and the delivery receipts are preserved.
- **Steady state: scheduled publishing off (owner decision, 15 November 2026).** Runtime delivery was turned off again after the pilot and a redeploy; the endpoint was observed at 503 "disabled" at 2026-11-15T08:59:30Z.

## Operator rules

- A deployment timeout does not undo a committed generation. Capture the state read-only, observe the public site, then use Check live site. Never republish, restore or retry just to repair an acknowledgement.
- Stop the database scheduler before the Cron job; a pause cannot recall a request already in flight.
- Restore a verified baseline as a new generation, and archive only the exact unpublished test revision.
- Turning scheduling on needs a separate packet and owner authorization covering all three switches: the database control, the Cron job and the runtime delivery flag.

## Next

MP09 (partner and affiliate administration) follows. MP10 to MP12 remain separate packages.
