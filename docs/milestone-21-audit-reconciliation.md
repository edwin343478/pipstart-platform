# M21 audit reconciliation and default-off closeout

Evidence date: **24 October 2026 (Africa/Nairobi)**. Reviewed code baseline:
`55e1a38393e1821bfed749313b4b43d063e08bf8`. C05 changes documentation and four
stale comments only. It introduces no executable logic, schema, settings, send,
cleanup, recurrence or campaign. Preparation is not application/publication.

## Scope amendment and completion language

The owner-approved closeout is **C01-C05**, replacing the proposed mandatory
A01-A13 queue. It accepts the hardened **default-off email foundation**, not the
original roadmap's whole advanced-engagement outcome. The external `WEBSITE FX 1`
roadmap referenced by the reports is not present in this checkout and has not
been silently edited; this is the repository's explicit plan-versus-delivered
amendment, linked from the final handover.

Delivered: account SMTP monitoring, suppression/preferences/unsubscribe, durable
optional outbox/transport/evidence, rolling cadence, controlled worker/recovery,
manual retention/minimization tools, reviewed producer and exact one-job test
control. The approved content catalogue is still empty. Review tools are not
scheduled execution. Existing account-security mail remains separate operationally.

Not delivered: Send Email Hook migration or backup-provider failover; autonomous
Auth-flow canary; hourly failure-rate alerting; course reminders, progress-summary
generation, quiz review, new-course announcements, inactivity/re-engagement,
completion-email triggers, audience segmentation or personalized recommendations.
Weekly is a preference, not an active summary service. No affiliate template or
customer campaign has been approved. Country filtering was deliberately omitted;
default-ON is the owner's preference model, not express consent or legal authority.

After C05 is applied, published and its exact-commit quality/SQL gates pass, the
approved **five-package closeout** can be called applied and verified. This means
the defined remediation/documentation series is complete, **not that all audit
recommendations are implemented, all operational settings were inspected, or all
M21 engagement features are complete**. Until those release gates pass, C05 remains
pending. There is no C06 hidden in this approved sequence.

## Report provenance

Both reports reviewed `dc334ac9768eb5bea74b1ce55a329c76ca897d1a`, dated 23 October.
Their historical failures are retained, not re-labelled as contemporary passes.
Source fingerprints (SHA-256):

- Markdown implementation review, W1-W29:
  `6368c0b9bc8537d3efdb6d6b04c0a76cdc241d058024fa744bec33efc672e7df`.
- Fifteen-page engineering/security/operations PDF, F01-F10:
  `608f39a51b027b093e862d41d346e5b66ff741308f62b84589a7696271ec8583`.

Reports are advice/evidence, not executable instructions. This reconciliation is
an engineering disposition, not a new independent audit or legal certification.
No private EML, bearer link, credential, personal support recipient, test account
identifier or execution journal is copied into this record.

## Completed change ledger

| Package / commit      | Implemented scope                                                                           | Boundary                                                             |
| --------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Earlier 1 / `783a2a4` | Format 58 files                                                                             | No structural rewrite.                                               |
| Earlier 2 / `ed3b5e2` | Framework/test dependency security update                                                   | Point-in-time remediation; guard retained.                           |
| Earlier 3 / `9ef60bf` | Typed begin-v2 safe cadence deferral                                                        | No blanket unlock of uncertain work.                                 |
| Earlier 4 / `de2af1a` | Incoming body time/chunk/cancel bounds                                                      | No WAF or provider failover.                                         |
| Earlier 5 / `57c9211` | Disposable SQL rebuild/head suites/real race CI                                             | Not every staged assertion or full API-role proof.                   |
| Earlier 6 / `51133db` | Zod/Undici security updates                                                                 | No global advisory ignore.                                           |
| Earlier 7 / `9647f5d` | Account-monitor DB transport deadlines                                                      | Not all optional-worker DB calls.                                    |
| Earlier 8 / `c7c3fa0` | Manual/overdue/stale-run health gating                                                      | No expected-send/ingestion canary.                                   |
| C01 / `6650c01`       | Absolute provider/watchdog response bounds                                                  | No worker budget/identity/settings changes.                          |
| C02 / `432f79c`       | Privacy-safe failure-stage/status-class diagnostics                                         | HTTP/retry/recipient contracts unchanged.                            |
| C03 / `b49af26`       | Current privacy/contact and lifecycle/operations inventory                                  | No legal certification, automated cleanup or deletion-policy change. |
| C04 / `55e1a38`       | Native preference names/descriptions/focus/radio sizing                                     | Native fixture proof, not fresh authenticated persistence/hydration. |
| C05 / this patch      | Complete dispositions, current contracts and evidence entry point; four comment corrections | Application, commit and exact release CI remain separate gates.      |

## Markdown findings: complete disposition

**Fixed** closes the identified bounded defect, not every adjacent suggestion.
**Partial** states both the implemented part and the missing proof/work.
**Accepted limit** retains an existing deliberate behavior within this default-off
scope; it is not a claim the recommendation was implemented or risk disappeared.
**Deferred** is explicitly outside this series, with a closure/activation condition.
No row below authorizes external execution or accepts a legal/business policy on
the owner's behalf.

| ID  | Disposition    | Evidence, retained limit and required future action                                                                                                                                                                                                                                                        |
| --- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W1  | Fixed          | `783a2a4`, exact current formatting CI. Template extraction remains W13, not part of formatting.                                                                                                                                                                                                           |
| W2  | Fixed          | `9ef60bf`: `version: 2` distinguishes `started`, `cadence_deferred`, `lease_lost`; verified pre-handoff deferral can finish. SQL rollback/race gates preserve uncertainty.                                                                                                                                 |
| W3  | Deferred       | Optional still shares `no-reply@account.pipstart.net`. Separate optional sender/domain/key, parsers/imports and received authentication before campaigns; subdomains do not guarantee independent reputation.                                                                                              |
| W4  | Deferred       | Known backlog/stale work is monitored; an expected Auth/SMTP send absent from the ledger can remain invisible. Design an independent expected-send/Auth-flow canary and authorized failure/recovery proof; do not flag idle organic traffic.                                                               |
| W5  | Fixed          | `c7c3fa0`: unresolved manual/overdue work degrades health and withholds success heartbeat after automatic retry eligibility ends. No reset of historical attempt time.                                                                                                                                     |
| W6  | Deferred       | C03 fixes factual public contact/privacy gaps. Legacy sending basis, actual audience/legal review and complete identity/eligibility/sponsorship footer still block campaigns. Live signup notice completeness needs review now, not only when campaigns start.                                             |
| W7  | Partial        | `57c9211` reconstructs all 19 M21 migrations plus account dependency, three head suites, rollback and two-connection cadence race. Remaining staged assertions, other named races, real API roles and protected-branch requirements are not certified.                                                     |
| W8  | Accepted limit | Keep purpose-specific wrappers and deployed migration history; C01 shares demonstrated response bounds. No generalized framework, wrapper consolidation or generated full current-definition catalogue was added. Revisit measured maintenance pain, not line count alone.                                 |
| W9  | Deferred       | C03 discloses account-linked cascades and re-signup default reset. Holds survive but do not fence deletion of held account content. Approve/implement minimal opt-out continuity and hold-aware erasure; account deletion is not permission to resend.                                                     |
| W10 | Accepted limit | Adopt the PDF's conservative uncertainty rule, rejecting blanket manual/finally unlock. Known typed deferral is fixed; manual/unknown handoffs retain singleton admission for stopped-executor owner review.                                                                                               |
| W11 | Fixed          | C02 documents the exact recipient fence as intentional anti-misconfiguration protection. It remains one mailbox; multi-recipient failover was not implemented and requires reviewed changes.                                                                                                               |
| W12 | Fixed          | `9647f5d` and `c7c3fa0` bound account DB transport and surface stale runs; C01 bounds outgoing response waits. No global end-to-end budget or automatic stale unlock is claimed.                                                                                                                           |
| W13 | Accepted limit | Existing payload-equivalence checks and purpose-specific signature/store code remain. C01 shares response handling; C05 corrects stale runtime comments. Broader byte-equivalent extraction is deferred until justified, not secretly completed.                                                           |
| W14 | Deferred       | No digest/backoff/fairness or independent rate alarm added. Measure volume/age and design bounded fairness before recurring growth, preserving cutoff/idempotency and distinguishing rejection from uncertainty.                                                                                           |
| W15 | Deferred       | Terminal minimization exists; pending/manual raw bearer-bearing content is not automatically pruned. Define safe abandoned-state/link/callback/hold rules and exact execution before extending minimization.                                                                                               |
| W16 | Deferred       | Repeated application checks are not atomic SQL preference/address/token-ownership enforcement. Add transactional boundary checks and concurrent unsubscribe/block tests before campaigns; committed external handoff cannot be recalled.                                                                   |
| W17 | Deferred       | SHA-256 suppression/cadence identity is linkable, dictionary-guessable metadata. A versioned HMAC/dual-read/key-rotation migration must preserve normalization and all existing blocks; no casual hash replacement.                                                                                        |
| W18 | Accepted limit | Closed/expired exact-job window still fails closed and can yield review_required/503. No new window_closed API or broader admission was added. Changing safe rejection/recovery semantics needs its own tested contract.                                                                                   |
| W19 | Deferred       | Worker admits at most five; database permit remains one specifically approved job. C01 settles per-call waits, not the five-job/DB worst-case route budget. Bound DB/remaining-time admission before multi-job operation.                                                                                  |
| W20 | Partial        | Direct SDK/adapters, generated stalled/aborted/body/cancel cases, four outgoing callers and C02 phase diagnostics were added. Aggregate counts do not prove every historical method/media/signature boundary, live failure mode or API role.                                                               |
| W21 | Accepted limit | Existing pre-auth not_configured responses remain visible; diagnostics do not remove this configuration-state leak. It exposes no secret value. Uniform auth/config responses were excluded from the logging-only scope, not claimed fixed.                                                                |
| W22 | Fixed          | C02 logs fixed source/stage/provider-status-class vocabulary, including configuration/payload and recovery finish. It does not log errors, IDs, bodies, addresses or credentials; 2xx is not inbox-delivery proof.                                                                                         |
| W23 | Accepted limit | Signed malformed account payload still returns 400. Reject blanket 200-and-discard advice. A durable bounded unsupported-event/quarantine policy and retry/disable monitoring need separate design; persistent failures must be investigated.                                                              |
| W24 | Partial        | Stale-running index/health exists; C03 inventories monitor events/sweeps. No general event-scan index, measured query tuning or automatic retention job is claimed. Review growth/purpose/holds before changing them.                                                                                      |
| W25 | Deferred       | Application byte/time/work limits exist; edge/WAF rate protection is not installed here. Design from actual traffic without login/CAPTCHA/cookie barriers or broken RFC 8058 POST/GET confirmation semantics.                                                                                              |
| W26 | Accepted limit | Historical constraint-deparse migration is preserved and rebuilds on pinned PostgreSQL 17.6 CI. Cross-version portability/named-constraint repair was not implemented or certified. Use a forward-only fix if required; never rewrite applied history.                                                     |
| W27 | Fixed          | C04 uses native radios with named radiogroup, unique name/hint relationships and visible focus, at three viewport widths. ARIA grouping intentionally retains approved layout rather than forcing fieldset markup. Full signed-in/error/200%-text/screen-reader proof remains outside the fixture's scope. |
| W28 | Accepted limit | Provider-team provenance and rolling caps remain documented constants, not a new config table. Team `agentkibubu25` is the accepted import contract; cap changes require review. See cadence document for exact windows.                                                                                   |
| W29 | Accepted limit | Valid persistent bearer unsubscribe links deliberately remain reusable; forwarding can opt the represented account out. Do not prune supposedly unused/deferred tokens without proving link, dedupe, callback and hold safety.                                                                             |

## PDF findings: complete disposition

| ID  | Disposition    | Evidence and residual condition                                                                                                                                                                                                                                                                        |
| --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F01 | Fixed          | Dependency commits `ed3b5e2`/`51133db`; exact `55e1a38` fresh CI audit reports no advisories, installed braces checks retained. Point-in-time result, not permanent vulnerability freedom.                                                                                                             |
| F02 | Fixed          | Formatting commit and full exact release CI at `55e1a38`; no exclusions or weakened gates.                                                                                                                                                                                                             |
| F03 | Partial        | Committed disposable PostgreSQL gate, rebuild, three final-schema suites and real cadence race pass. Not all 17 historical staged assertions, every proposed race, GoTrue/PostgREST roles or fresh authenticated preference lifecycle.                                                                 |
| F04 | Accepted limit | Explicit scope amendment above: default-off foundation accepted separately; full reminders/summaries/personalization and original roadmap completion not claimed.                                                                                                                                      |
| F05 | Partial        | Typed safe deferral implemented and uncertainty preserved. Closed-window outcome and multi-job/optional-DB budget remain W18/W19 limits.                                                                                                                                                               |
| F06 | Partial        | Manual/overdue/stale health and safe diagnostics implemented. Shared sender/classification, expected-send blind spot and independent liveness-vs-backlog signals remain; current heartbeat is health-gated, not pure liveness.                                                                         |
| F07 | Fixed          | `de2af1a` bounds actual ingress bytes/time/chunks/cancellation, preserves one-click and raw signature bytes. C01 separately bounds outgoing acknowledgements. WAF configuration remains W25, not claimed installed.                                                                                    |
| F08 | Deferred       | Future campaigns need independent audience/basis, durable approval/revision/expiry/revocation, final atomic eligibility and reviewed HTML/text/MIME disclosures. Producer enqueue window is not delivery expiry.                                                                                       |
| F09 | Partial        | C03 inventories 22 tables plus providers/private archives and interim owner/runbook. Receipt/archive/support/provider durations, actual access/recovery checks, erasure/holds and any exact cleanup execution remain explicit decisions; no auto-deletion inferred.                                    |
| F10 | Partial        | C04 improves native semantics/focus and has keyboard/axe fixture proof; C05 fixes four stale comments and centralizes current contracts. Full generated RPC definitions, staged/API/race proof, hydrated save/error/refresh/200%-text and screen-reader/email-client grading are not silently claimed. |

## Current runtime contracts and reading order

- Account monitoring: signature-authenticated raw callbacks -> record -> claim ->
  provider handoff -> persist acceptance. Sweep starts/queues/due/claims, grades
  manual/overdue/stale health and persists completion. Only a successful healthy
  sweep permits the Healthchecks ping. Watchdog failure does not rewrite an already
  persisted sweep or send again. Neither path sees every pre-provider SMTP failure.
- [Incoming bodies](milestone-21-request-body-deadlines.md): 2,048-byte unsubscribe
  / 65,536-byte webhook, 2-second total read, 128/1,024 chunks; worker empty-body
  verifier separately uses 1 second/four chunks. GET/HEAD unsubscribe do not mutate.
- [Account DB transport](milestone-21-monitor-database-deadlines.md): opt-in
  3-second operation, 256-KiB/1,024-chunk response. This is not a global SDK change.
- [Outgoing response bounds](milestone-21-outgoing-response-boundaries.md): provider
  8 seconds/16 KiB/1,024 chunks; watchdog 3 seconds/64 bytes/32 chunks. Absolute
  budgets and non-awaited best-effort cancellation; no uncertain-send retry.
- [Diagnostics](milestone-21-monitor-diagnostics.md) retain generic constants and
  fixed stage/status-class fields. HTTP responses, exact recipient fence and retry
  contracts did not change. Access logs have a separate privacy boundary.
- Optional composition is wired: authenticated internal route -> batch-runtime ->
  worker -> queue -> fresh eligibility/preparation -> durable SENDING/cadence ->
  final application check -> Resend -> provider receipt. Default-off is not unwired.
- `pipstart_acquire_optional_worker` / `pipstart_finish_optional_worker` bracket
  admission. Queue claim -> `pipstart_begin_optional_email_v2` -> finish/release
  use lease fencing. Only proven safe statuses permit worker finish; uncertain
  handoff, malformed/lost acknowledgement or manual work retains admission.
- Begin-v2, not the historical boolean comment, defines current cadence outcomes:
  `started`, `cadence_deferred`, `lease_lost`. Reservations and SENDING commit
  atomically. This does not add W16 transactional preference/token ownership checks.
- [Cadence](milestone-21-optional-email-cadence.md) remains rolling: learning All
  one/24h and three/168h; Weekly one/168h; partner one/720h; combined recipient
  one/24h; platform 50/24h. Frequency does not turn a category ON. Security/operator
  mail is outside that budget. Hash normalization does not merge Gmail aliases.
- [Privacy/operations](milestone-21-privacy-operations.md) is the lifecycle and
  public contact entry: `support@pipstart.net`, Zoho mailbox. Owner confirms Forever
  Free plan; one supplied reply shows SPF/DKIM/DMARC pass with p=none. This does not
  prove future pricing, MFA, continuous monitoring or account-subdomain alignment.
- [SQL gate](milestone-21-sql-ci.md) rebuilds pinned migrations in a disposable DB.
  It is not a generated full RPC/grant catalogue or full Supabase API certification.
  Recovery/cleanup/minimization contracts remain in their individual linked
  [historical handover](milestone-21-final-default-off-handover.md) and C03 inventory.

## Exact evidence, not substituted baselines

Latest inspected archive: `logs_108707589903.zip`, SHA-256
`cad4be9be40d2dc4c74be332ed65182c92710e41731aa062dfc2d6f199a1d43b`,
checks out **55e1a38393e1821bfed749313b4b43d063e08bf8** in both jobs:

- Formatting, two lint tasks, seven type tasks, four workspace test tasks pass.
  PipStart: **1,907 tests / 147 files**; other workspace suites: 16, 11 and 340.
- Dependency guard/installed mitigation checks pass, fresh audit no advisories.
  Both application builds and 42-chunk public boundary gate pass.
- M21 isolated SQL/concurrency/rollback/disposable cleanup pass.
- M20: 54 pass and exactly six justified skips; M17 public/review: 48 each;
  M16: 214 pass, no flaky result reported in this archive.
- Owner supplied Vercel Ready/Production for `55e1a38`, deployment
  `J1RoUbToyZMP2JUyup794284xVwS`. This is an owner-supplied deployment result, not
  independent inspection of deployed environment values or branch protection.

C04's separate native-control gate: three cases at 1440/390/320px, keyboard,
descriptions, form values, focus, wrapping and axe pass, exact four-file hashes
matched before commit. It did not grade hydrated saving or real assistive output.
Initial browser absence failed before tests; installing its pinned Chromium enabled
the pass. C03's initial parallel publication-test timeout was retained; original
assertions/timeouts passed sequentially, then full exact CI passed. C01's older
M16 run had one retry-pass flaky glossary link; do not erase that historical result.

C02's initially supplied ZIP was for `57c9211`, not C02: never counted as C02 CI.
Subsequent exact C03 (`b49af26`) and C04 full green CI test included C02 code.
None of the above is the future C05 exact-commit CI. Do not copy these results
forward as if a new release had already passed. Retain original private reports.

## Operations, unresolved facts and activation gates

Last owner shutdown attestation: dedicated test provider key revoked, worker flag
disabled/redeployed and old temporary enabled deployments retired. Historical exact
cleanup/absence and closed-permit/idle receipts remain in the private handover.
C05 reads source/evidence only; it does **not freshly query hosted state**.

Keep worker OFF, permit closed, catalogue frozen, account-security monitoring and
watchdog intact. No new optional scheduler exists. Do not rerun historical send,
fixture-creation or cleanup Execute commands. Timeouts/absent callbacks are not
resend permission. An old attestation is not continuous runtime assurance.

External facts not established by CI/source inspection: current hosted email
confirmation setting; Auth security-notice SiteURL; scheduler pg_net timeout
relative to the 60-second route; current endpoint/provider enablement and old
deployment retirement; fresh permit/admission state; branch protection; mailbox
MFA/recovery/ongoing review; provider/access-log/archive retention and recovery.
Confirm those through scoped read-only operator checks when signing off current
operations. Do not print keys, cron command secrets or full bearer ping URLs.
No missing check is silently promoted into a pass or masked by a green heartbeat.

The owner is the interim operations contact, not an invented legal entity/DPO.
C03 recommends weekly unresolved-incident and monthly lifecycle/access review;
this is not an automation or evidence reviews already occurred. Public privacy
identity/basis/rights/transfer completeness needs qualified factual review while
signup is live. Retention review triggers 90/31/365 are not universal deletion
deadlines and do not silently apply to every receipt/support/provider archive.

Before campaigns or broader worker operation, separately approve/implement the
deferred items above: sender/stream separation, audience/legacy basis and footer,
atomic final eligibility, durable content approval/expiry/revocation, bounded
worker DB/run budget and measured operations/abuse controls. Lifecycle/HMAC,
deletion/holds and retained-proof policy must be resolved before affected real
execution. Preserve valid unsubscribe and dedupe/suppression/cadence evidence.
No legal compliance, exactly-once delivery, global inbox placement, complete
erasure or safe automatic retry is certified by this closeout.

## C05 exit checklist

1. Owner applies the exact fingerprinted external bundle; no migration/settings/send.
2. Explicit commit/push authorization; only six reviewed files are published.
3. Obtain **that commit's** complete quality and M21 SQL CI plus Ready/Production.
   Record the actual SHA/results rather than inserting a guessed future SHA here.
4. Report approved C01-C05 series completion and the explicit limits above together.
   Do not claim every audit finding fixed or recurring campaign readiness.

**Next patch: none in the approved closeout series.** C05 publication/CI is the
final remaining package gate. Any active engagement feature, infrastructure change
or broader remediation is a separately scoped proposal, not an unannounced C06.
