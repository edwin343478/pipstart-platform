# MP03 offline factor recovery and retirement

Status: prepared source; local SQL and real-provider rehearsal are required before acceptance. No hosted authorization or activation is included.

## Recovery contract

Prefer a second independently stored verified TOTP factor. If a factor is lost, pause staff access before exact-factor operator maintenance; never remove an unknown factor or retry an uncertain provider mutation. Preserve the single-use operation journal and its exact request/dispatch binding.

Complete loss of the only Owner's factors is an offline trusted-operator procedure, not a password/email-only recovery feature. Before a real operation, independently establish ownership through the approved organizational channel, record the exact account/factor scope and authorization outside the application, and obtain access to the trusted database/provider administration channels. The local rehearsal uses generated identities and cannot prove a real human's identity or backup-device custody.

Keep staff paused while removing lost factors. After an uncertain response, inspect the exact provider state and reconcile the original journal; observation is not causal success. Re-enroll and verify replacement primary and backup factors, test a new signed-in session, and check role/audit continuity before reopening access. No Owner role is regranted. Do not store TOTP seeds, passwords, access tokens, recovery credentials or raw provider bodies in reports.

## Retirement contract

Revoke staff roles, delegations and assignments through audited governance first. Pause staff and prepare/claim an exact staff_retirement journal request. Require another active, verified Owner. Use the provider's supported soft-deletion operation once for the reviewed account; never delete provider Auth rows directly.

The private finalizer requires the provider deletion marker, inactive membership, no remaining grants, exact dispatch and retained profile/preferences. It changes the retained profile to Former staff member / learner and disables both optional-email preferences atomically with the journal append. An append failure rolls all these local changes back. API users and service-role clients cannot invoke it. A repeated matching result only reads back; conflicting or uncertain results require explicit reconciliation.

Live staff gates reject provider-deleted accounts. Profile and preference triggers prevent a still-valid old JWT from restoring an identifying display name, legacy administrator flag or optional-email consent. Normal learner updates remain unchanged. These are retained audit-linked pseudonyms, not complete data erasure or anonymous audit history. Separate privacy requests require a reviewed retention/erasure decision.

Provider soft deletion and JWT expiry are distinct. Validate the pinned local provider behavior; do not assume soft deletion instantly revokes every already-issued JWT. The application gates remain necessary. References: https://github.com/supabase/auth/blob/master/internal/api/admin_test.go and https://github.com/supabase/supabase/blob/master/apps/docs/content/guides/auth/managing-user-data.mdx

## Acceptance boundaries

1. Source apply adds this document, one private SQL migration, a SQL behavior suite and its manifest. It does not execute SQL.
2. Owner-run isolated SQL tests use Auth stubs in a fresh marked disposable database. Check exact dispatch, prerequisites, failure rollback, idempotence, retained references, API denial and stale-JWT update guards.
3. Owner-run real Auth rehearsal uses a separate internal tmpfs Docker stack, generated accounts, actual SDK MFA and supported provider deletion. Check backup-factor recovery, complete-loss default closure, verified replacement factors, one soft retirement, retained references and final paused state. No real identity checks or browser/physical backup-device acceptance are inferred.
4. Hosted migration, live recovery, real staff retirement, activation and publication remain separate scope. Nine main packages follow full MP03.
