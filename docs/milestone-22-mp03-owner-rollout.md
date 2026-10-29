# MP03: real Owner rollout and staff operations

Status: complete for staff core only. The Owner's own account is the single active Owner,
with two verified, named TOTP authenticators on separate devices. Staff control is enabled at
version 3. Evidence is owner-reported; see the completion register for the accepted runs.

## Live configuration

- **Production:** `PIPSTART_M22_STAFF_UI_ENABLED=true`.
- **Still unset:**
  - `PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED` and `PIPSTART_M22_ACCOUNT_PROVIDER_SECRET_KEY`;
  - `PIPSTART_M22_STAFF_MAINTENANCE_ENABLED` and `PIPSTART_M22_STAFF_MAINTENANCE_SECRET_KEY`.

  Each pair is a separate later rollout, with its own rehearsal and authorization.

- **Membership:** exactly one active Owner; no delegations or assignments. Any further
  grant goes through the audited governance UI, not through SQL.

## How it was done

The rollout followed fixed, fingerprinted SQL stages. The only variable was the Owner's Auth
UUID, filled by a reviewed copy helper that enforced order, a single UUID and typed
confirmation of each previous result. The same templates and fill function were first
rehearsed locally with real Auth and a browser, including the refusals.

The order was:

1. preflight;
2. bootstrap (paused);
3. staff UI flag and redeploy;
4. name and verify the primary authenticator, then check it;
5. enable;
6. name and verify the backup from the staff overview, then check it;
7. sign in with the backup;
8. confirm a learner is refused;
9. stop drill: pause, then re-enable;
10. final check.

A backup authenticator can only be added from the staff overview, so only after
enablement.

## Kill switches

Each takes effect on the next request; none deletes anything.

1. **Pause staff control**, at the current version, through the reviewed kill-switch
   stage. It needs an operator in the SQL Editor and is audited.
2. **Unset `PIPSTART_M22_STAFF_UI_ENABLED`** in Production and redeploy. The staff pages then
   show the not-found page.
3. **Revoke a member's role or membership** through audited governance.

To resume after a pause, use a reviewed, version-checked transition. Do not edit the control
row by hand.

## Authenticator custody

- Keep the two authenticators on separate devices, stored apart. Keep an offline record,
  outside the app and repository, of which named authenticator is on which device.
- There are no recovery codes and no email or password-only bypass.
- If one device is lost, sign in with the other, add a replacement from the staff overview
  and record it.
- Losing both is the offline trusted-operator procedure in
  `milestone-22-mp03-offline-recovery.md`: pause, reconcile the exact factors, re-enrol the
  primary and backup, verify, then reopen. It has not been run live.
- Never share codes, QR images or setup keys.

## Deferred findings

- While paused, a verified Owner sees the learner-oriented "not available" message.
- At 390px the staff frame leaves an empty block above the card, and "Your staff roles" is
  unstyled.
