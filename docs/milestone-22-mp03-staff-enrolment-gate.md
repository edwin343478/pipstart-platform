# MP03: staff-only TOTP enrolment and step-up

Status: locally SQL and real Auth/browser accepted, Owner visuals approved,
owner-reported hosted schema accepted and migration history verified. Publication
and exact-commit CI pending. It grants nothing and sets no flag; staff stays paused.

## Why

The approved D03 contract allows the enrolment and step-up routes only for an
authenticated AAL1 **staff** user. Before this change, `readStaffGate()` offered
`/admin/access` enrolment to any signed-in account without a verified TOTP factor
once `PIPSTART_M22_STAFF_UI_ENABLED=true`. Since the preview cutover, `/admin`
also leads there. A learner could therefore have added an authenticator to their
own account. That was not privilege escalation, because staff access is still
checked at AAL2, but it was a support and lock-out risk.

## Contract

- `public.pipstart_staff_enrolment_allowed()` returns only a boolean: whether
  **the caller** (`auth.uid()` from the verified JWT) is an active, unbanned,
  undeleted staff member.
- It is authenticated-only (no anon or service-role grant). It is a stable
  security-definer function with an empty search path. It returns `false`, never
  an error, for a forged role claim or a missing subject, so it cannot be used to
  probe other accounts.
- It works at AAL1 and while staff control is paused. That lets a bootstrapped
  Owner enrol primary and backup factors before staff is enabled.
- `readStaffGate()` calls it, with an 8-second bound, only on the challenge path.
  Non-members get `denied` ("Staff access is not available for this account")
  and no enrolment. An error gives `unavailable`. The staff-access RPC is still
  never called before AAL2.

## Acceptance

- **Preparation:** unit tests for members and non-members, malformed results,
  errors and the timeout bound; types, lint and formatting; the SQL manifest and
  runner; and the default-off build.
- **Isolated SQL** run `7aa8944cab2c9372a98c928f99ffa29f` (owner-run) passed 23
  inputs and 35 checks with cleanup. It covers grants; active, inactive, banned,
  deleted and learner accounts; forged claims; anon and service refusal; and the
  rolled-back head.
- **Real local Auth/browser** run `802e351f957aabe0c6e2fd3e0d4e3dbb` (owner-run)
  passed 24 gates with cleanup, using four generated accounts and three TOTP
  factors. Its 14 axe states had 0 violations, and the Owner approved the
  visuals. It showed that:
  - non-members, including a learner holding an API-enrolled factor, get no
    enrolment or step-up;
  - the bootstrapped Owner enrols at AAL1 while paused, and staff access is
    queried only at AAL2;
  - after enablement the Owner adds and signs in with a backup factor;
  - pausing again shuts the open session out.
- **Hosted:** wrapper rehearsal `fc9f89e4283a6cfc2ce54e4d92b4ab2b` passed nine
  gates. The owner reported a default-closed hosted schema result for source
  SHA256 `32a8a8ded382e4341fc8d3d19c86210dd69c9c04224b2cc8efeb97341d9a5dc7`, and
  an owner-run CLI listing verified `20261029090000` in Local and Remote.

## Rollout findings (Owner decisions, not changed here)

- While paused, a verified Owner sees the learner-oriented "not available"
  message. It is fail-closed but confusing during rollout.
- A backup factor can be added only from the staff overview, so only after
  enablement. The rollout order is: bootstrap, primary factor, enable, backup
  factor, then verify with the backup.
- Factor names are random (`PipStart 1a2b3c4d`), so primary and backup devices
  cannot be told apart at sign-in.
- At 390px the staff frame leaves a large empty block above the card, and "Your
  staff roles" is unstyled.
