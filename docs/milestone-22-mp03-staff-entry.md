# MP03: staff MFA, shell and people management

## First bounded source bundle: staff entry

This is the entry portion of MP03, not completion of the full main package.
The owner-run installer adds isolated routes and helpers; it does not change the
legacy preview gate, apply a migration, bootstrap an Owner, create a test account,
grant a role, activate staff access, commit or push. There are still twelve main
packages. The remaining work below is inside MP03, not additional main patches.

Both new routes are disabled unless the server environment contains exactly
`PIPSTART_M22_STAFF_UI_ENABLED=true`. No installer or acceptance preparation sets
that variable. Database staff control remains independently disabled. Turning on
the entry UI is not authorization to enable the database or grant membership.

### Implemented boundary

- `/admin/access`: signed-in TOTP enrollment/challenge, using the installed
  Supabase browser SDK. Initial rendering only reads factor state; enrollment
  requires a deliberate button press. Only the current identity's verified TOTP
  factors are listed. An unverified factor can be confirmed only by its creating
  page's in-memory setup; interrupted enrollment blocks adding another factor
  until separately reconciled. It never automatically deletes provider factors.
- `/admin/staff`: request-time verified Auth identity, current/next AAL2, then
  the MP02 user-context access RPC. Disabled control, revoked grants, malformed or
  foreign-user payloads and provider/DB failures do not grant access. No request
  caches permission or falls back to profile admin/JWT user metadata.
- The entry shell reuses the approved ink/teal tokens, header/sidebar/card layout,
  native focus/labels and responsive widths. It supplies no fictional identities,
  MFA age, counters or sample role navigation. Only actual implemented links are
  shown; future capability navigation is added with the respective features.
- Auth waits have eight-second deadlines; access RPC uses an abort signal. A
  timed-out Auth mutation may still complete remotely. Enrollment/verification
  uncertainty disables further attempts until reload/reconciliation, without
  blind application retries, raw errors, debug logging or false cancellation.
- Provider-generated QR is encoded into a local image data URI, never injected
  as HTML or sent to an external QR service. Setup key/code remains component
  memory; no app local storage, telemetry, URL, audit record or log stores it.
  Supabase's normal cookie-backed session storage remains part of authentication.
- MFA success navigates to a fresh server/DB check. It grants neither membership
  nor a sensitive-action receipt. No governance mutation is connected here.

### Recovery direction and provider compatibility

The installed `@supabase/auth-js` is 2.100.0 and exposes TOTP enroll/challenge/
verify/list/unenroll, not recovery-code APIs. Current online SDK documentation can
describe newer capabilities; do not infer they exist in this lockfile/project.
The approved MP01 direction therefore remains a second verified TOTP factor on a
separate device and an explicitly authorized offline Owner recovery procedure.
The overview links an AAL2-authorized staff member to backup-factor enrollment.
No custom recovery code or email-only staff bypass is introduced.

This bundle does **not** prove recovery is ready. Before hosted UI activation,
MP03 must rehearse loss of one factor and complete loss/only-Owner recovery with
disposable local identities, pause staff access, verify session effects and audit
the exact operation. The operational recovery/grant/deletion primitives and
approval runbook must be completed before live staff operations are exposed.

Primary reference: [Supabase TOTP MFA](https://supabase.com/docs/guides/auth/auth-mfa/totp).
The actual installed SDK source/type definitions determine calls in this bundle.

## Remaining MP03 acceptance and implementation

1. Fresh verified challenge evidence connected to MP02's single-use, five-minute
   operation/target/session-bound receipt. Never accept a client verification time
   or an old AAL2 claim as recent-action proof.
2. Minimal, paginated people/search/detail and live capability navigation; role,
   assignment and delegation forms, minimized audit/operation views. Every RPC
   rechecks grants, scope and last-owner conditions, including already-open tabs.
3. Durable Auth-operation intent/result/unknown reconciliation, no blind retries;
   learner-only delegated administration, Owner-only staff operations, staff
   retirement/anonymization and account-deletion handling without deleting audit.
4. Real local Supabase Auth/PostgREST/browser AAL1/AAL2 and direct-call denials;
   learner/Administrator/Owner and revoked-member tests; actual enrollment,
   challenge, backup-factor/lost-factor recovery and session/browser effects.
5. Owner desktop/phone visual acceptance, keyboard/zoom/axe, known-failure and
   uncertain-provider handling; compatible retirement of the legacy preview
   authority; exact source/CI and separately authorized hosted bootstrap/enable.

SDK mocks and server-rendered component tests are preparation evidence only.
They do not satisfy real Auth/MFA/PostgREST/browser acceptance or authorize live
factor enrollment. Existing M21/M22 migrations and CI gates remain unchanged.

Next within MP03: fresh-verification receipt integration and the bounded people
read model. Next main package after full MP03 acceptance: **MP04 — revision
storage and adapters**. Nine main packages follow MP03.
