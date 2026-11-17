# Milestone 22: owner handover

## What is live (17 November 2026)

- **Content:** learner pages read store generation 10 (seal `7730f794…ab80`) for analysis, curriculum and partners. Vercel Production has `PIPSTART_STORE_FAMILIES=analysis,curriculum,partners`.
- **Staff platform:** `/admin/staff`, MFA-only, staff control version 3.
  - Exactly one active member: the Owner.
  - No delegations.
  - One maintenance assignment.
- **Hosted migrations:** all 26 M22 migrations (`20261026120000` to `20261120090000`) are applied and recorded. History has 75 rows, with no local-only version.
- **Off by default:**
  - scheduled publishing (scheduler version 8; Cron job 2 inactive);
  - the automatic link check;
  - the learner account provider;
  - staff account maintenance.

## Pilot and rollback receipts

- **Scheduled publishing pilot:**
  - a controlled hosted catch-up published generation 5;
  - a scheduled generation 7 was observed live 52.7–114.9 s after its due time;
  - a stop and restore were drilled (`milestone-22-mp08-release-review.md`, `milestone-22-mp08-release-handover.md`).
- **Partners switch:**
  - turned on at generation 10, checked against the `/brokers` and `/go/deriv` baselines;
  - local drill of 17 cases per snapshot;
  - rollback by environment variable (`milestone-22-mp09-release-review.md`).
- **Learner progress fix:** hosted `20261120090000`. The real PostgREST proof showed one stale save going from an endless retry to HTTP 409 in 16 ms (`milestone-22-mp11b-conflict-codes.md`).

## How to operate

- **Day to day:** `milestone-22-operations-runbook.md` covers roles, retention, revoking staff, taking a link offline, rolling back the partners switch, restoring a lesson, the scheduler and the link check.
- **Changes to the database:** owner-run packets only:
  1. Preflight, then migration, then read-only acceptance, then history.
  2. Each packet is fingerprinted and rehearsed against a replay that reproduces Supabase's default grants.
- **Changes to code:**
  1. Owner-applied installers.
  2. Commit and push only through the guarded publish script.
  3. CI (including the dependency audit and the 56-input M22 SQL proof) and Vercel must be green.

## Where the evidence is

| What                                                | Document                                                                                                        |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Each package                                        | `milestone-22-mp0N-release-review.md` / `milestone-22-mpNN-release-review.md` with its `-release-evidence.json` |
| Roadmap versus delivered, amendments and open items | `milestone-22-release-closeout.md`                                                                              |
| The pre-audit                                       | `milestone-22-mp11-release-review.md` (internal, not independent)                                               |
| Original contracts                                  | `milestone-22-mp01-contracts.md`, `milestone-22-mp01-evidence.json`                                             |

## First things to pick up after M22

1. Revoke the unused `service_role` grant on learner progress (one small hosted migration).
2. Confirm hosted backups and retention in the Supabase dashboard.
3. Optionally:
   - the scheduler capacity check (A1);
   - the link check's network test (A3);
   - the quiz editor gaps (A4);
   - a moderation feature (A5).
