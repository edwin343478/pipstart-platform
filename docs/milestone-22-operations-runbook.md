# M22 operations runbook

One page for running the M22 staff platform. It gathers the operator rules from the MP03–MP11 release reviews; each review has the detail.

## Who can do what

| Role              | Can do (only on assigned items, except the Owner)                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Owner             | Everything, including any role, partner disclosure policy, holds and review intervals                                            |
| Administrator     | Read people. With a delegation: manage learners, read the audit, and grant or revoke the five non-admin roles (`roles.delegate`) |
| Author            | Write, submit and archive courses, modules, lessons and quizzes                                                                  |
| Reviewer          | Review content, partners and links                                                                                               |
| Editor            | As Author, plus publish, withdraw and restore; publish and withdraw partners and links                                           |
| Affiliate Manager | Write, archive and restore partners and links; revoke links                                                                      |
| Moderator         | Assigned maintenance work only                                                                                                   |
| Any staff role    | Their own assigned maintenance items                                                                                             |

**Every staff action needs:**

- an active member;
- a TOTP (aal2) session;
- staff access switched on.

**Role changes:**

- The Owner can grant or revoke any role.
- An Administrator holding the `roles.delegate` delegation can grant or revoke **only** Author, Reviewer, Editor, Moderator and Affiliate Manager, **only** for other people, and **never** for an Owner or Administrator (the store's delegation ceiling).
- Only the Owner manages Owner and Administrator roles and delegations.
- Metadata in a user's account grants nothing (proven in MP11c).

## Staff action limits

Each person may make only so many consequential changes per rolling hour (Package 4, migration `20261122090000`). The store counts them, so the limit holds across every server instance and for direct API calls.

| Class            | Actions                                                        | Per person per hour |
| ---------------- | -------------------------------------------------------------- | ------------------- |
| Edit             | create, save, archive, review policy, partner policy           | 120                 |
| Review           | submit, approve, request changes, single-person approval       | 60                  |
| Publish          | make live, delivery refresh, schedule, cancel a schedule       | 10                  |
| People           | grant or revoke a role or delegation, assign, unassign, resume | 30                  |
| Upkeep           | maintenance actions and check results                          | 60                  |
| Learner accounts | learner suspend or resume requests                             | 10                  |

- **Never limited:** pausing or enabling staff access, suspending a staff member, placing or releasing a hold, withdrawing (taking offline), restoring content or a generation, imports, the baseline, the scheduler, and owner-run SQL.
- **The Owner is limited too.** Every emergency and recovery action above stays open.
- **What staff see:** "Too many changes in the last hour. Nothing was changed…" with an estimate of when to retry. The editors keep the unsaved text. Role, governance and learner-account screens show their usual "refused, nothing changed" message instead (a stated limit).
- **Changing a limit:** owner-run SQL, for example `update pipstart_staff_private.action_limits set per_hour=… where class='publish';` (classes as above, 1–10000). No screen changes a limit, and no API role can read the table.

## Retention

- **Content:** every revision, decision and generation is kept. Archive is the store's trash, and nothing is ever purged.
- **Restore:** "restore as draft" brings an archived item back as a new draft. Approvals are not carried over, and nothing is republished.
- **Audit:**
  - The editorial and staff audits are append-only and never purged.
  - The content audit view shows action words, never free-text reasons.
  - Scheduling has its own unchangeable ledger, which the Staff audit page does not show (accepted while scheduling is paused).
- **Learner data:**
  - Progress is never deleted by staff actions.
  - Staff views show no learner email or progress.
  - Logs carry no learner ID.

## Procedures

- **Revoke a staff member:** People, then remove the role (the Owner, or an Administrator with `roles.delegate`) or suspend. Suspension through `/admin/maintenance` is off by default.
- **Take a partner link offline now:** Take offline (withdraw), then deliver the new generation. Don't edit the code register.
- **Roll back the partners switch:**
  1. Set `PIPSTART_STORE_FAMILIES=analysis,curriculum`.
  2. Redeploy without the build cache.
  3. Confirm `/brokers` and `/go/deriv` match the baseline.
- **Restore a lesson:**
  1. Content library, then archived item, then Restore as draft.
  2. Review and approve it.
  3. Make it live.
- **Scheduler:** paused (version 8, Cron job 2 inactive). Resuming needs a reviewed capacity check (MP01 gate `MP08-hosted-scheduler-capacity`).
- **Automatic link check:** off. Before any outside contact, the store authorizes the exact person, item, live revision, link and host, and allows at most 20 checks per person per hour. To enable:
  1. Add allowlisted hosts.
  2. Set `PIPSTART_MAINTENANCE_PROBE_ENABLED=true` and redeploy.
  3. Check one link and confirm the result.
- **New public image or `/tools` page:** run `node scripts/reference-targets.mjs --write`; CI fails if the list is stale.
- **Database changes:** owner-run, fingerprinted packets only:
  1. Preflight, then migration, then read-only acceptance, then record history.
  2. The replay used to build a packet must reproduce Supabase's default grants (lesson from MP11b).

## Regular checks

- **Access review:** run the read-only access review (counts only; see the MP11 release review). Confirm exactly one active Owner and no unexpected role, delegation or unexpired receipt.
- **CI:** the dependency audit fails on any new advisory. Treat that as a prompt to patch, not to allow-list (Next.js 16.4.5, MP11).
  - **Two scoped exceptions remain, both development-only:**
    - braces GHSA-vfj7-8cjw-p6xm, mitigated by a local patch (M17);
    - picomatch GHSA-fc5q-39xc-vjpf, a ReDoS with no published fix, accepted on 17 November 2026 only for picomatch 4.0.5 and 2.3.2 reached through vitest, the Next ESLint config or the MDX rollup plugin.
  - Any other version, path or advisory still fails.
  - When a fixed picomatch (4.0.8 or later) is published, upgrade it and remove the picomatch exception in the same change.
