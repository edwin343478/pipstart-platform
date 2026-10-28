# MP03 remaining work: learner account intents

## Acceptance and publication status — 28 October 2026

The owner applied this ten-file source patch. Local consolidated SQL run `2aeb578209ee8ae7982c1f0e95d74c26` passed all 17 input fingerprints, 21 gates (including learner observed two-session single intent) and exact cleanup. CRLF hosted-wrapper rehearsal `24914a9f7341457ade9c2435bd3ec16a` passed all six wrapper gates and cleanup. The owner reported `MP03_LEARNER_HOSTED_ACCEPTANCE_PASSED_DEFAULT_CLOSED` with migration SHA256 `410b6fe0f5c5f37f0e185c9403f36232a037123fe5ebb76518872e6e8eb782ca`, matching the prepared migration, and version `20261028120000` is verified in both Local and Remote history columns. This is owner-reported hosted schema/provenance evidence, not independent agent inspection or real hosted learner/provider execution.

Preparation passed 25 focused DTO tests, 14 CI safety checks, production types, changed-source lint and format. Actual local SQL acceptance is now recorded separately from preparation. These results do not establish a later published commit; exact-commit full CI remains required after separately authorized publication. This three-document handover adds no executable/SQL change. Earlier apply/acceptance helpers and receipts retain their historical fingerprints; this publication handover manifest is the current source inventory. Do not rerun accepted migrations merely because documentation changed.

Next: apply this handover, obtain commit/push approval for the ten-file learner-intent patch, then verify exact-commit CI and deployment. Following implementation patch connects production provider transport/UI. Full MP03/live readiness remains open.

## Implemented boundary

This complete source patch adds the authorization and durable-intent boundary for learner suspension/reactivation. It is one bounded part of the remaining MP03 work; it does not complete provider execution, UI integration or live rollout. Staff control, staff UI and the existing provider adapter stay off. Applying this source runs no SQL or account operation.

## Decisions retained from the approved contract

Only an active, live AAL2 Owner or an Administrator explicitly delegated `people.manage_learners` may issue a receipt or record an intent. A profile admin flag and editable Auth metadata grant no capability. All current/former staff memberships, legacy administrator profiles, missing/deleted identities and self targets are excluded from this learner-only path, including when the caller is Owner. Staff operations retain their separate Owner maintenance/recovery path. No account deletion, factor change, bulk operation or new role is added.

Suspend uses an exact reviewed absolute expiry, with the existing 365-day transport ceiling. Resume requires no expiry. Fixed reason codes are `security_response` and `access_change`; arbitrary audit text is not accepted. The browser is not an authority for timestamps or staff eligibility.

## Atomic request boundary

New authenticated RPCs issue an exact fresh receipt, record one intent, and read a single minimized request. They take the common governance control lock and recheck live role/delegation, target eligibility and provider session/factor state. Issuance binds the signed TOTP AMR second, exact actor/session/request/target/operation/expiry/reason and a random token hash. The existing global proof-use ledger prevents another receipt from the same verification second, including across other staff actions.

Recording consumes that exact unexpired receipt, appends the immutable intent and a separate immutable event in one transaction. A failed append rolls all three effects back. Target/profile/Auth rows are locked during validation; staff grants and revocation serialize through the common control lock. Promotion/revocation between proof and submit is refused. Future dispatch must repeat those checks: a recorded intent is not permanent authorization.

There is no provider claim or executable permit in these public responses. Status `intent_recorded` means only that an intent was recorded. It does not mean a learner was suspended/reactivated, a provider request was sent, or an unknown remote operation was resolved. A second exact same-actor request UUID returns the existing record without another write; changed commands conflict. A duplicate unexpired intent for the target is refused. After expiry, the old record remains historical, not executable. Future transport must provide its own durable single-attempt/outcome model and must not interpret this time-window check as permission to retry unknown remote work.

Only the original actor (while currently authorized) or Owner can read the minimized request. It exposes request/target/action/expiry and intent status, with no actor session, receipt/token, email, factor seed, provider payload or credentials. Current/former staff identifiers never become learner targets simply because grants were removed. Audit-linked UUIDs are retained; this patch is not a full-erasure policy.

Private tables enable RLS and grant no raw access to anon/authenticated/service_role. Private helpers have fixed empty search paths and no API execution grants. Three narrow authenticated RPCs have no anon or service-key grant. No production transport or service-secret exposure is introduced.

## Preparation and owner acceptance

The 17-input consolidated CI manifest extends the accepted 15 inputs with this migration and rollback SQL suite. Existing acceptance stages remain unchanged. New stages cover learner role/delegation denial, legacy/metadata trust boundaries, staff/former/self target exclusion, signed AMR mismatch, command/reason binding, replay, revocation/promotion after proof, immutable events and append-failure rollback. An additional two-session test observes the shared lock and proves two concurrent exact submissions create one request/event, followed by paused control and cleanup of only the marked disposable database.

SQL fixtures simulate provider state; they do not prove real Auth/PostgREST/SDK/browser behavior. Do not call preparation checks SQL acceptance. Owner-run isolated acceptance is required after source application and before hosted review. No hosted migration or publication is authorized by this source patch. The CI migration requires the published MP03 baseline. No existing user database is reset.

Focused DTO tests validate exact commands and minimized responses, preserving the distinction between historical intent and a provider effect. Types, changed-source lint/format and no-Docker CI guard checks are recorded by the tied external preparation receipt. A new frontend build is not claimed because no route/UI/imported application module changes in this patch; exact-commit complete CI remains required at publication.

## Remaining MP03 sequence

1. This patch: learner intent authorization, immutable recording, strict DTOs and prepared isolated SQL/concurrency acceptance.
2. Connect reviewed learner and Owner staff requests to a least-privilege production transport and provider UI, preserving one-attempt/unknown outcomes, live target/grant rechecks and read-only reconciliation. Complete actual isolated Auth/controller/browser acceptance before activation.
3. Compatible legacy-preview retirement/navigation cutover, native browser 200% zoom and physical screen-reader/device acceptance. Preserve approved design references and record unverified manual checks explicitly.
4. Exact real Owner/bootstrap identity, independent recovery custody, reviewed provider credentials, hosted role/learner/revocation checks and separately authorized staged activation. No real identity is invented or granted by code preparation.
5. Final MP03 reconciliation and exact-release evidence. MP04 follows full MP03 acceptance; nine main packages follow MP03.

The published baseline `cb8f691955609213e34ee5c6f3ac247817e42646` has successful main CI, separate M22 SQL CI and owner-reported Vercel Ready/Production, retained in the external release receipt. It remains the baseline for this patch. Those checks do not imply these new files have been accepted or published.
