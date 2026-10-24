# M21 closeout C03: current privacy and operations

Prepared 24 October 2026 against `432f79c`. This is a factual transparency and
operating-inventory patch for the default-off foundation, not a legal opinion,
campaign activation or erasure implementation. Public pages retain their existing
shell/styles and calendar disclosures. No consent-default, schema, deletion,
retention-execution, sender, scheduler, provider or worker behavior changes.

## Confirmed public contact and evidence boundary

The owner approved business name **PipStart** and public mailbox
**support@pipstart.net** for support/privacy. Do not invent incorporation details,
registration, a postal address, a DPO, a legal basis or data-transfer safeguards.
Further operator/legal identity details must be confirmed where applicable; using
the brand name does not independently establish registered legal status.

Owner setup screenshots list the Zoho user and completed DNS mapping. Read-only
public DNS checks found the three Zoho MX records, one root SPF, Zoho DKIM and
`v=DMARC1; p=none;`. The supplied reply EML identifies the support sender and Gmail
recipient, contains a reply reference, and records Gmail SPF/DKIM/DMARC pass. This
grades the supplied message, not future delivery, inbox placement for everyone,
account MFA, recovery settings or continuing human monitoring. The personal Gmail
recipient and raw EML/private proof stay out of public pages/repository.

DMARC is presently non-enforcing; this is not spoofing enforcement or completion
of a provider-security audit. Review all legitimate mail sources, including account
security mail, before any future quarantine/reject change. Do not replace working
`account.pipstart.net` mail records with root-mailbox settings. No DNS operation is
executed by this source patch. The owner confirmed that Zoho's subscription/billing
page shows the Forever Free plan. This is owner-confirmed entitlement, not an
independent authenticated billing inspection or a guarantee of future pricing.

The old Contact page promised a channel before account creation became enabled.
C03 replaces that stale promise with the approved working mailbox. The privacy
page explains optional choices/history, unsubscribe/correlation metadata, linkable
address hashes, actual processor roles, support-message content and deletion limits.
It does not claim a reviewed sending basis, universal consent, permanent category
opt-out continuity after deletion, or a full jurisdiction-compliant legal notice.

## Lifecycle inventory

| Store                                                                                                         | Purpose and current behavior                                                                                                                           | Review / boundary                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth/profile, enrollment/progress/learning events                                                             | Account security and synchronized learning; linked application records cascade through the existing deletion path. Browser-local progress is separate. | Account-request handling requires ownership verification; provider backups/logs need separate review.                                                                                              |
| `pipstart_email_preferences`, `pipstart_email_preference_events`                                              | Current category/frequency choices and model/source/version/time history; account-linked cascade.                                                      | Not an express-consent ledger or durable post-deletion category opt-out tombstone.                                                                                                                 |
| `pipstart_email_unsubscribe_tokens`, `pipstart_email_unsubscribe_events`                                      | Hashed token lookup and account/category/time opt-out history; account-linked cascade.                                                                 | Valid account links remain usable; no indiscriminate pruning or new token expiry. Private envelopes may retain usable links.                                                                       |
| `pipstart_account_email_events`, `pipstart_account_email_alerts`                                              | Provider message/type/time correlation, lease/manual/acceptance evidence; independent of an Auth FK.                                                   | No automatic purge. Preserve unresolved cases; decide purpose-based retention rather than assuming account deletion removes them.                                                                  |
| `pipstart_email_monitor_sweeps`                                                                               | Run timestamps/status, aggregate counts and health evidence.                                                                                           | No automatic purge. Historical partial status is not proof of zero sends. Review growth and incident needs before a retention change.                                                              |
| `pipstart_optional_email_jobs`                                                                                | Account occurrence/dedupe, private content/prepared message and handoff state; cascades with account.                                                  | Existing owner minimization considers eligible terminal content strictly older than 90 days. Pending/preparing/sending/manual uncertainty is excluded.                                             |
| `pipstart_optional_provider_receipts`, `pipstart_optional_delivery_events`, `pipstart_optional_content_facts` | Provider IDs/correlation, signed callbacks, digests and late-evidence compatibility; dependent on job rows.                                            | Owner minimization preserves dedupe/correlation; account/job cascade can remove dependent records. Not erasure of external copies.                                                                 |
| `pipstart_optional_address_blocks`, `pipstart_optional_address_events`                                        | Hard-bounce/complaint/provider-suppression protection using normalized-address SHA-256; no account cascade.                                            | Hashes are linkable and susceptible to guessing, not anonymous. Preserve blocks; keyed migration/rotation is separate activation-gate work.                                                        |
| `pipstart_optional_address_import_batches`, `pipstart_optional_address_import_items`                          | Independent provider-team/source/provenance audit.                                                                                                     | Owner-only. Access/duration require review; no cleanup or import executed here.                                                                                                                    |
| `pipstart_optional_email_reservations`                                                                        | Address/platform rolling cadence accounting; deliberately no account/job FK.                                                                           | Existing owner cleanup considers strictly older than 31 elapsed days, excluding held/active/unresolved references. Deletion/re-signup is not budget-reset permission.                              |
| `pipstart_optional_worker_slot`                                                                               | Persistent singleton/current batch and uncertain admission.                                                                                            | Live control, not age-expiring telemetry. Never automatically prune, unlock or take over.                                                                                                          |
| `pipstart_optional_worker_recoveries`                                                                         | Controlled recovery plans, transitions and related evidence.                                                                                           | Existing 365-day review excludes holds, active membership and extant unresolved jobs; not scheduled deletion.                                                                                      |
| `pipstart_optional_retention_holds`                                                                           | Job/recovery IDs and opaque private-proof references; no account/job FK or automatic expiry.                                                           | Holds survive cascades but do not themselves stop account deletion removing held content. A hold-aware erasure workflow remains future work.                                                       |
| `pipstart_optional_cleanup_receipts`, `pipstart_optional_minimization_receipts`                               | Privileged bounded-action acknowledgment/audit evidence; independent of account cascade.                                                               | Retention/access approval remains required before real execution. Do not silently apply the recovery-audit 365-day rule to these receipts.                                                         |
| `pipstart_optional_test_window`, `pipstart_optional_test_window_audit`                                        | Exact-job authorization, expiry/consumption/pause and control audit.                                                                                   | Window stays closed; audit is independent. No permit or cleanup is created by documentation.                                                                                                       |
| Private EML, acceptance/source exports, execution journals and backups                                        | Scoped incident/acceptance/recovery proof; may contain linkable IDs and usable bearer links.                                                           | Restricted access outside public repository/chat. Record approved location, access, recovery and duration; do not treat a digest/receipt as a restorable backup.                                   |
| Zoho support inbox/sent mail                                                                                  | Sender/address, request text, attachments, correspondence and replies.                                                                                 | PipStart owner monitors the published mailbox. Do not request passwords/recovery links or forward sensitive requests by default. Confirm actual mailbox retention/recovery/MFA settings privately. |
| Supabase/Resend/Vercel/Healthchecks/DNS-provider logs and backups                                             | Auth/database/hosting/delivery/heartbeat/domain infrastructure.                                                                                        | Outside application cascade/minimization. Inspect actual settings, contracts/locations and access; do not invent provider retention periods or transfer safeguards.                                |

This inventory represents all 22 M21-added tables plus baseline preferences,
account classes and external stores. It is derived from code/migrations, not a
hosted customer export. Role restrictions differ: ordinary account/preference
access, service-only execution and owner-only tools must not be conflated.

## Operating ownership and review procedure

Accountable operator is the PipStart owner until a replacement is explicitly
designated. `support@pipstart.net` is the published support/privacy channel;
operational alerts remain on the separately approved mailbox. Service credentials,
backups and private proof are limited to named authorized operators. Confirm MFA,
recovery ownership and access revocation before delegating this mailbox or evidence.
This document records responsibilities, not a newly provisioned support team or SLA.

Recommended manual review cadence: unresolved incidents weekly; inventory/access
monthly and before any new data use, deletion workflow or campaign. These are
operating recommendations, not automations or a claim past reviews occurred.
Record reviewer, date, purpose/record class, existing hold/unresolved work, approved
action, private proof reference and next review. Do not put IDs/credentials/EML
contents or customer exports in public review notes.

1. Read current monitoring status without editing message facts. A successful
   heartbeat is not an ingestion canary or proof of operator-inbox delivery.
2. Review an incident's original evidence before any correction. C02 stage/class
   logs contain no identifiers; correlate through authorized provider/database
   tools, not by adding PII to application logs. Never reset acceptance/attempts
   merely to produce a green dashboard or resend uncertain work.
3. For data-rights requests, establish account ownership without passwords/reset
   tokens. Identify actual account-linked and independent/provider records. Assess
   applicable obligations and holds with the responsible reviewer; do not promise
   all data disappears or that holds already fence the deletion API.
4. Before real cleanup/minimization, approve the class/retention basis, exact bounded
   batch, stopped/fenced executors, current holds, protected recoverable export,
   generated-data restore test, private receipt access/duration and rollback limits.
   An installed capability or preview count is not execution permission. An uncertain
   CLI result requires read-only verification, not a blind repeat.
5. Preserve valid links, dedupe, suppression, current cadence and late callbacks.
   Do not automatically prune pending/manual work, owner receipts or held content.
   Existing 90/31/365-day limits remain review thresholds, not automatic erasure.
6. Keep worker OFF, permit closed and content catalogue frozen. Campaign sender
   separation, audience/basis and legacy eligibility, factual footer/disclosures,
   approval expiry/revocation, post-deletion opt-out policy and hold-aware erasure
   remain explicit future activation conditions. No live campaign is approved here.

Receipt/archive/support/provider retention periods and applicable legal basis,
operator registration/identity detail, international processing safeguards and
jurisdiction-specific rights procedures must be confirmed rather than fabricated.
The existing ON-by-default UI is an owner decision, not a legal compliance finding.
The factual notice does not resolve those legal/business decisions. Qualified review
is especially important while signup is live; unresolved notice completeness is
not made harmless merely because campaigns are off.

## Acceptance and remaining gates

Tests render the actual public page components and reference shell, check approved
contact links/copy, preserve calendar disclosures, and verify inventory coverage
against the migration table declarations. They are not a fresh interactive browser,
MFA, mailbox subscription, provider-storage or legal compliance audit. Production
build/browser CI and public link/readability review remain release gates.

C02 exact-commit CI had not been supplied when C03 was prepared; the last ZIP was
for `57c9211`, not `432f79c`. Do not reuse it as C02/C03 proof. Obtain current
candidate CI before final closeout; a subsequent full green C03 run can grade the
included C02 code, without retroactively claiming its earlier run was verified.

Technical transparency reference, checked 24 October 2026: [ICO privacy-information
checklist](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/).
It is UK-specific and currently marked under review; it does not determine which
law applies to PipStart or certify this notice. No legal entity/address/basis was
inferred from the brand name.

Next package: **C04 - preferences accessibility**. Two packages remain after C03:
C04 and C05 final reconciliation. C03 is not applied/published by preparing this
document, and not all approved closeout packages are complete.
