# M21 optional-email preferences: owner-selected opt-out model

Prepared 20 October 2026 against main 79f8628a5924c4cb9a329808521649cbc5af31c6.

## Approved direction and exact scope

The owner explicitly chose learning and partner emails ON by default, an
unsubscribe option in each optional email, infrequent partner offers sent by
PipStart itself, and a selected-country audience. This supersedes the earlier
execution plan's proposed default-OFF opt-in model. Preferences here are NOT
described as express consent or a legal eligibility determination. Learner
addresses are not shared with partners by any code in this patch.

This first foundation patch adds default-ON signup controls, saved settings,
learning-frequency choice, truthful preference history and isolated tests.
It sends no email and creates no outbox, campaign, scheduler, provider call,
unsubscribe link/token, suppression engine or geographic eligibility rule.
Optional sending must remain disabled until selected countries, applicable
eligibility rules, per-email unsubscribe and send-time suppression checks are
implemented and accepted. Low message volume does not replace those checks.
No country list was supplied, so none is invented here. This is a technical
preference foundation, not certification of worldwide marketing compliance.

## New accounts and signup

Both optional categories are visibly checked by default on registration, with
plain disclosure and a chance to turn either off before creating the account.
Choices are independent of mandatory Terms acceptance and remain in client
state after validation errors. Password reset/security notices stay separate.
There is no welcome email or new verification step; confirmation stays off.

Validated booleans are passed in new-account metadata under namespaced keys.
The existing auth insert trigger uses only boolean values with the expected
model version for optional preferences. Missing/old/malformed metadata uses the
owner-approved new-account defaults. No metadata can change the learner role.
Later editable metadata updates do not resubscribe an existing account.
Frequency starts at all learning reminders/summaries and can be changed later.

## Existing accounts

The migration changes defaults for FUTURE rows only. No existing educational or
marketing boolean is updated, including any false values that may represent
unsubscribe/opt-out. It does not assume that a legacy false means anything less
than off. A new all-frequency column supplies an initial scheduling preference;
it does not turn any category on or send anything.

Existing settings receive two history snapshots labelled legacy_snapshot /
legacy_unknown with no policy-text version and no claimed prior enabled value.
There is no backdated opt-in, consent event or fabricated disclosure receipt.

The account page reads exact stored booleans and frequency. Missing records,
errors, invalid data or an unapplied new column show an unavailable message,
not editable invented ON/OFF values. The dashboard likewise refuses to invent
email settings if the preference record is missing. Existing profile, course,
progress and role policies remain unchanged.

## History and ownership

`pipstart_email_preference_events` is an owner-readable RLS table of settings
history, not a consent ledger. Fields include category, previous/new enabled
state, relevant previous/new learning frequency, source, model, text-version
identifier and recorded time. No email address, IP, reset token or body is stored.
The version identifies this implementation's policy text; it does not assert a
user saw it, read it, or affirmatively agreed to a checked-by-default setting.

A security-definer trigger records inserts and actual value changes in the same
transaction as the setting. No-op saves create no change event. Audit-insertion
failure rolls back the setting update. Signup, user-context changes, system
changes and legacy snapshots are distinguished. Authenticated clients cannot
insert, update or delete history through the API, and can read only their own
rows. This is not tamper-proof against the database owner. Existing account
deletion cascades also remove that user's history; no new retention policy is
introduced. Service-role clients have read access but no granted history writes.

The original account preference update policy is retained: an authenticated
learner updates only their own row. A bounded form parser checks the policy
version, checkbox values and duplicates, and the supported frequency. Stale
settings forms fail with a refresh message instead of changing unknown fields.
Saving off plus weekly leaves the category off; frequency never overrides it.

## What is deliberately not completed

- Per-email unsubscribe links and RFC 8058 one-click handling: next foundation
  step, BEFORE optional sending. No present account-security email is changed.
- Send-time suppression and selected-country eligibility: not implemented yet.
- Campaign content, partner frequency caps, quiet hours and outbox sending:
  later steps. The frequency setting is stored, not a scheduler by itself.
- Formal consent collection required for an audience/category: a separate
  sending prerequisite where applicable, not fabricated from these defaults.
- All of Milestone 21: not complete by this patch.

## Acceptance and release gates

Run helper/form-rendering tests, all monitoring tests, the full serial unit
suite, full lint, production type-check and normal production build. Run the
SQL fixture tests in a dedicated temporary local database using only generated
auth users. Verify legacy OFF preservation, new defaults, signup opt-outs,
malformed metadata boundaries, no metadata role escalation, owner RLS, history
write restrictions, no-op saves, atomic audit failure and deletion cascades.
The supplied external harness never applies to a real local/hosted schema.

The updated authenticated lifecycle Playwright test checks default-ON controls,
saves both off plus weekly, reloads and verifies persistence before continuing
the existing password/session/deletion checks. It requires the normal isolated
local release environment and is not automatically run against production.
No browser or hosted lifecycle pass should be claimed before it is run.

Review the migration dry run first, then apply only
20261020090000_pipstart_optional_email_preferences.sql through the Supabase CLI
with separately confirmed hosted execution. Do not run untracked schema DDL in
the SQL Editor or repair migration history. Apply the hosted migration before
deploying the new UI; an older UI submission during this short window preserves
existing booleans, and the new history trigger observes it. Obtain separate
commit/push authorization and deploy only the reviewed files. No new environment
secret, extension, provider or scheduler is required.

After deployment, verify signup with defaults and with both boxes unticked;
save/reload settings and inspect owner-scoped history. Recheck password reset,
password-changed mail and healthy scheduler/watchdog. No optional emails should
be sent during this acceptance.

For rollback, preserve new history and do not rewrite existing booleans, reset a
database, drop auth triggers, or delete audit rows. Reverting to the old server
action can change settings without frequency but the database trigger still
records actual boolean changes. Review the signup-default compatibility before
rolling back the UI. The working monitoring pipeline is outside this patch.
