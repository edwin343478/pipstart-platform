# M22 MP01: scope, security and workflow contracts

26 October 2026. Master plan and supplied 27-screen dashboard adopted by the owner.
This specifies subsequent implementation; it does not claim the mechanisms below
already exist. MP01 adds a sample-data preview and test-planning safeguards only.

## Decision register

| ID  | Adopted direction                                                             | Concrete boundary / evidence owner                                                                                                                                                                                                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D01 | DB revisions and approved public snapshots                                    | MP04/MP05 establish parity before a per-family MP08 authority switch; no stale Git fallback after switch.                                                                                                                                                                                                                                                                       |
| D02 | Distinct author and reviewer for ordinary publication                         | Approval binds exact revision, hash and dependencies. Authors including Owner cannot approve their own work. Bootstrap only the approved existing Owner; do not invent another reviewer. Emergency withdrawal is audited, not self-publication.                                                                                                                                 |
| D03 | Staff TOTP/AAL2; sensitive actions need fresh verification                    | Five-minute maximum age, bound to verified actor/session, action and target; single-use at the mutation boundary. An old AAL2 JWT or client timestamp is insufficient. MP02/MP03 prove trusted verification evidence, expiry, replay, revocation and recovery before enforcement.                                                                                               |
| D04 | Create within existing Forex/Crypto hierarchy                                 | Preserve historical IDs/URLs, attempts and progress. New course/module/lesson/quiz must resolve in existing supported paths without per-item route source edits. New top-level paths/levels remain code changes. MP05 proves the bridge.                                                                                                                                        |
| D05 | At least 90-day recoverability                                                | No automatic hard purge, no cascade removal of progress/attempts, protect assets/references/holds. Restore creates a draft. A safely retained record is not forbidden to restore merely because 90 days elapsed.                                                                                                                                                                |
| D06 | Minimized audit; 365-day review trigger                                       | Not automatic erasure or legal certification. App append-only, owner-controlled access/holds; never claim immunity from a trusted DB operator.                                                                                                                                                                                                                                  |
| D07 | Explicit scheduler; one-minute tick / five-minute normal visibility objective | Supabase Cron supports the frequency; prefer a separate M22 job and least-privilege identity. Vercel Hobby native cron is unsuitable. Target remains conditional on actual project capacity, endpoint-duration/usage budget and MP08 rehearsal, with no spend/activation approval implied. If unsupported, seek a target amendment before cutover; never silently claim it met. |
| D08 | In-app reminders and deterministic internal checks                            | Selective manual external allowlisted HTTPS probes only; no broad crawler, visitor tracking or new email types.                                                                                                                                                                                                                                                                 |
| D09 | Exact supplied desktop/phone design reference                                 | Reuse shell/tokens/components. Sample MFA/status/names are fictional; device frames/captions are presentation. Behavioural accessibility and honest policy wording take precedence over screenshot-only simulation.                                                                                                                                                             |

Master adoption approves these design directions, not production migrations,
identity grants, paid services, hosted imports, sensitive account operations or
activation. Five-minute step-up is the MP01 technical default; materially changing
the user policy or unsupported recovery design must be brought back explicitly.

### Scheduling feasibility and MFA recovery

Official sources checked 26 October 2026: [Supabase Cron](https://supabase.com/docs/guides/cron)
supports recurring SQL/HTTP jobs; [Vercel limits](https://vercel.com/docs/cron-jobs/usage-and-pricing)
restrict Hobby native cron to daily execution. Existing M21 sweep documentation is
historical evidence of a scheduler pattern, not a current hosted inspection or
permission to reuse its bearer, heartbeat, queue, job or service identity.
At MP08 record actual plan/capacity, one job's expected 1,440 ticks/day plus retry
budget, normal/failure bounds and cost estimate before activation. No new paid
subscription is selected here.

The [Supabase MFA model](https://supabase.com/docs/guides/auth/auth-mfa) supplies
assurance levels; AAL2 is not a recent-action receipt. MP03 must demonstrate factor
loss recovery before requiring MFA. A3's backup-code mock-up is not proof of a
supported provider API. Do not ship custom codes as an AAL2 bypass. Prefer a second
verified TOTP factor where supported and an explicitly authorized owner recovery
runbook; reconcile the A3 functionality with the provider in MP03 before enabling
it. If safe code recovery needs a different identity architecture, surface that
decision rather than expanding authentication scope silently.

## Fixed roles and capability matrix

Codes below are capabilities, not user-editable role metadata. Default deny applies
to every unlisted action. All staff reads/actions require verified active staff
grants, AAL2 and object assignment/scope. AAL1 access is limited to enrol/challenge
or recovery entry, with no staff payload. Multiple roles form explicit grants;
separation of duties and policy ceilings still apply to the same actor.

| Capability                                       | Author                       | Reviewer                | Editor                   | Moderator                    | Affiliate Manager                               | Administrator                                     | Owner                                                   |
| ------------------------------------------------ | ---------------------------- | ----------------------- | ------------------------ | ---------------------------- | ----------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| Read/create/edit assigned content drafts         | Yes                          | Read assigned           | Yes in scope             | No                           | No                                              | No by default                                     | Yes                                                     |
| Submit own draft / respond to changes            | Yes                          | No                      | Yes for own drafts       | No                           | No                                              | No                                                | Yes                                                     |
| Review another author's assigned exact revision  | No                           | Yes                     | Only with Reviewer grant | No                           | Partner review only with Reviewer grant         | No                                                | Yes, never own                                          |
| Publish/schedule approved content / cancel       | No                           | No                      | Yes in scope             | No                           | No                                              | No                                                | Yes                                                     |
| Withdraw published content                       | No                           | No                      | Yes in scope, audited    | No                           | Revoke own scoped link, not content publication | No                                                | Yes                                                     |
| Trash/restore unpublished content in scope       | Own assigned drafts          | No                      | Yes                      | No                           | Own partner/link drafts                         | No                                                | Yes                                                     |
| Edit partner/link facts and allowed destinations | No                           | Read assigned review    | No by default            | No                           | Yes in scope                                    | No                                                | Yes                                                     |
| Edit fixed disclosure or allowed-host policy     | No                           | No                      | No                       | No                           | No                                              | No                                                | Reviewed code/policy process, not arbitrary UI override |
| Triage assigned maintenance/reminders            | Own assigned                 | Own assigned            | In scope                 | Yes                          | Own assigned                                    | No by default                                     | Yes                                                     |
| Read minimal people list/detail                  | No                           | No                      | No                       | No                           | No                                              | Yes                                               | Yes                                                     |
| Suspend/reactivate account                       | No                           | No                      | No                       | No                           | No                                              | Explicit delegated learner-only capability        | Yes except last-owner loss                              |
| Grant/revoke fixed non-owner staff roles         | No                           | No                      | No                       | No                           | No                                              | Explicit delegation below own ceiling; never self | Yes, fresh verification                                 |
| Owner grant/revoke / recovery authorization      | No                           | No                      | No                       | No                           | No                                              | No                                                | Fresh verification, serialize last-owner protection     |
| Read audit                                       | Own scoped editorial history | Assigned review history | Scoped content history   | Assigned maintenance history | Own scoped partner history                      | Explicit audit-view grant, minimized              | Minimized owner view                                    |
| Infrastructure secrets / bulk learner export     | No                           | No                      | No                       | No                           | No                                              | No                                                | No admin UI capability                                  |

Student/learner and anonymous identities have no staff capabilities. Moderator
triage does not include editing content, learner account state, disclosures or
community moderation tooling. There is no forum in M22. Administrator is not a DB
superuser. Owner cannot bypass exact approval, mandatory disclosures, destination
policy, last-owner protection or protected history merely by holding the role.

### Mutation and data-boundary contract

Every action/route verifies session, active grant, capability, scope, assurance and
freshness when required; critical conditions are rechecked under DB transaction
locks. Use verified `auth.uid()` context rather than a posted actor or editable
`user_metadata`. Prefer restricted RLS/RPC in user context; necessary definer
functions have fixed search paths and narrow grants. A service credential alone
does not supply staff authorization. Revoke the legacy profile `admin` flag as an
alternative authority only through a compatible MP02/MP03 transition with a receipt.

Prevent self-promotion and concurrent last-owner demotion. Revocation must affect
an already-open tab's next operation; hide UI for clarity, never as authorization.
Serialize writes with optimistic version checks; conflicts keep the unsaved local
draft and show differences. No silent overwrite or automatic manual-merge claim.

Successful DB mutations and minimized audit append commit together or both roll
back. Record actor/action/object/revision/reason/time/correlation and justified
diffs. Never store passwords, tokens, reset URLs, factor seeds, service keys, full
learner payloads or arbitrary content bodies in audit. Failed/denied security
events use a separately bounded/redacted path and cannot masquerade as success.
Remote Auth suspend/reactivate uses durable intent, one bounded attempt and a
known-success/known-failure/unknown ledger; uncertain results require read-only
reconciliation before retry. A DB row is not proof Auth changed. Targeting staff
requires Owner; delegated Administrator cannot disable an Owner or another staff
member. MP03 defines exact SDK effect and browser/session behaviour before exposure.

## State machines and invariants

| Family                     | Allowed progression                                                                  | Required checks / failure meaning                                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff access               | authenticated AAL1 → enrolled/challenged → verified active staff → revoked/suspended | Verified provider session; no actor/role supplied by browser; lost-factor recovery does not silently grant staff access.                                                                             |
| Editorial revision         | draft → submitted → changes-requested → new draft; submitted → approved → superseded | Immutable saved revision; assigned distinct reviewer; exact hash/dependencies; new edits invalidate approval for that new candidate. Older public revision stays unchanged.                          |
| Publication                | approved → scheduled or processing → published-refresh-pending → public-verified     | Recheck approval, delegation, dependencies and policy at execution; snapshot pointer and cache work atomic. Public-verified requires observing intended anonymous content, not only a DB success.    |
| Cancellation/failure       | scheduled → cancelled; processing → failed or refresh-pending                        | Lock establishes cancel/publish winner. A committed snapshot with failed cache refresh is not called cancelled or rolled back; retry bounded cache work. Repeats cannot produce another publication. |
| Withdrawal                 | published → withdrawn + refresh-pending → publicly-withdrawn                         | Audited immediate authority change; durable invalidation; show cache lag. No Git resurrection on DB error.                                                                                           |
| Trash/recovery             | unpublished or withdrawn → trashed → restored new draft                              | Enforce dependencies/holds; never delete learner history. Published records must be withdrawn first. Restoration does not reinstate approval or republish.                                           |
| Quiz                       | editorial drafts → approved → immutable public N+1                                   | Historical N attempts/grades retain N's identity and server resolver. Preview never writes real learner progress; initial public payload contains no private answer key.                             |
| Partner/link               | draft → exact review → approved public; active → expired/revoked                     | Safe destination/attribution/disclosure/availability policy; fail closed on expiry/revocation/unavailable authority. No ranking by commission.                                                       |
| External account operation | intent → known-success / known-failure / unknown → reconciled                        | No fake success, blind retries or automatic duplicate side effect.                                                                                                                                   |
| Maintenance                | due → overdue; acknowledged/rescheduled with reason                                  | Acknowledgement is not a fresh factual review. Reports distinguish internal missing, external 404/410, blocked, throttled, timeout, redirect and not checked.                                        |

Public snapshots contain only public fields, sanitized supported blocks and a
coherent dependency manifest. Staff comments, drafts, removed revisions, private
quiz keys, review notes and secrets must not escape via HTML/RSC/JSON, search,
sitemap, bundle or cache. Post-submit feedback must respect existing assessment
rules. No editor-authored JS, MDX evaluation or unrestricted HTML. Import provenance
records source hash/time separately from genuine reviewer approval/date.

Scheduling preserves UTC due time, IANA zone and original local input; ambiguous
or nonexistent daylight-saving times need explicit resolution. Scheduler identity
is restricted, does not impersonate an old human AAL2 session, and checks current
delegation/approval at execution. Overlap/replay/cancel/revoke races are tested with
two independent DB sessions in MP08. Five-minute visibility is a normal-operation
objective, not a guarantee under an outage; show durable pending/failure state.

## Source-shape and bridge feasibility

Current authority is repository content: MDX plus typed lesson/section records,
hierarchy/progress registries, private quiz definitions, provider/link registries.
The accompanying baseline inventory fingerprints relevant tracked files at
`a83669a`; it is not a complete semantic parity proof. Existing Forex route shapes
include `[level]/[segment]/[module]` alongside legacy level-1 paths, while Crypto
has per-level dynamic lesson routes. Resolvers and static route enumeration need
one-time bridge changes. Existing schema includes supported blocks, sections,
local diagrams, references, related IDs, sources, risk/disclosure and SEO fields.

MP05 must preserve every baseline ID/URL, full normalized content/hierarchy/asset
inventory, historical progress/quiz bindings and exceptions. Prove a generated
new course/module/lesson/quiz on an actual staging route without editing per-item
source. Imports are idempotent and cannot overwrite newer staff edits. Keep
shadow reads until parity and approved rollback are proven. Do not use module-file
counts as a substitute for lesson counts or claim this inventory proves parity.

## Evidence, acceptance and release

`milestone-22-mp01-evidence.json` maps all fourteen features and five roadmap tests
to MP owners. MP01's fixture checks do not mark future DB/security tests passed.
Per patch: focused changed-boundary tests, types/lint, meaningful negative/race
cases, then exact published-commit CI. Keep real Auth/PostgREST/SQL/Storage tests
where relevant, including staged migrations and head-state checks. Mocks alone
cannot satisfy staff authorization or full-stack acceptance.

The local SQL plan guard has no DB execution capability. It rejects hosted/default
DB targets and unreviewed/empty/tampered migration plans. MP02 supplies the actual
reviewed executor and disposable resources; existing application DBs are never
reset. Do not silently add SQL files by discovery or rewrite the accepted M21 gate.

Dashboard visual checks cover actual screen markup/CSS at 1440/390/320, 200% zoom,
keyboard focus, labels, overflow and axe; mock-up sheets are the reference, not
proof of runtime accessibility. Static modals remain visual samples until their
owning patch implements focus trapping/return, Escape and background isolation.
Real signed-in Administrator access and learner denial remain necessary beyond
anonymous browser or mocked page tests. On 26 October the owner confirmed a test
administrator will be created when the system supports setup. Therefore record
that gate under MP02/MP03 before live staff features, without creating/elevating
accounts in MP01 or claiming the check passed. Final owner visual acceptance and
exact release CI remain explicit; no absent credential test becomes a pass.

Next main package after MP01 acceptance: MP02 authorization and audit core.
There are eleven subsequent main packages. No publication approval is implied here.
