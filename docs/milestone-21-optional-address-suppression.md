# M21 optional address suppression foundation

Adds a separate signed webhook at `/api/webhooks/resend/optional-suppression` and a private, durable address block ledger. Optional mail stays disabled by default; no provider transport, producer or campaign is added. Existing security-email webhook, Auth SMTP and monitoring/sweep/watchdog are unchanged.

## Intake and boundaries

The new endpoint requires **its own** `PIPSTART_OPTIONAL_SUPPRESSION_WEBHOOK_SECRET` (the new Resend endpoint's signing secret, not an API key or the existing monitor secret). Configuration/subscription is a later separate gate; until configured it returns 503. Never repoint the working monitoring webhook or reuse a different endpoint's signing secret.

Authenticates the original bounded UTF-8 body using the existing Svix verifier before parsing or persisting evidence. Accepts only exact PipStart sender `no-reply@account.pipstart.net` (display-name wrapper allowed), one unambiguous plain recipient, valid event/message IDs and timestamp. Ignores other-brand and operational-alert senders. Accepts `email.bounced` only when `data.bounce.type` is `Permanent`, plus `email.complained` and `email.suppressed`. Transient/undetermined bounces, delivery delays and generic send failures do not create permanent address blocks. Ambiguous multiple recipients fail with 400 rather than suppressing every listed address. Future multi-recipient sending requires reliable per-recipient correlation first.

References: https://resend.com/changelog/email-bounce-details and https://resend.com/changelog/email-suppression-visibility . The latter describes provider suppression as a skipped send, distinct from successful delivery. Neither event intake nor local absence of a block is proof of current provider-list clearance.

Only event ID, message ID, normalized address SHA-256, reason and timestamps are retained. Raw payload, subject, bodies, recipient address and unsubscribe tokens are not stored in these tables or logged by this endpoint. Hashes are pseudonymous, not anonymized: unsalted address hashes remain guessable by dictionary attacks. Service access/retention review is still needed; standard request/platform/database logs are outside this redaction claim. Address normalization lowercases unquoted ASCII mailbox syntax and trims ASCII spaces; it does not strip dots/plus tags. Unsupported/invalid current Auth mailbox formats fail closed for optional mail and need operator review, not guessed normalization.

The record RPC atomically deduplicates exact event replays; conflicting replay IDs fail without modifying either table. Same-address events serialize through upsert; earliest/latest event times survive out-of-order delivery and complaint reason is never weakened. All API roles including service_role have no direct table access. Only service-role record/lookup and existing dispatch RPC can access the data through private-search-path definers; the hash helper is not API-callable.

## Enforcement

The existing dispatch-state RPC reads current Auth email, preference/frequency and account status, then excludes blocked addresses. It deliberately preserves its existing strict contract by returning `{status:"inactive"}` for a blocked/unsupported address. This means **unavailable for optional delivery**, not a disabled Auth account. Queue suppression reason is consequently the coarse `account_inactive`, not proof of account deletion. Operator reason lookup is separate from learner state.

No preference booleans/frequency are changed. The block applies to the address across optional categories/accounts and survives account deletion/re-registration; a different confirmed email is checked independently. Existing dispatch checks before preparation and immediately before handoff, including the queue's post-persistence check, use this same current-state RPC. A newly enqueued blocked-address job is suppressed; an older pending job is evaluated when consumed, not deleted or automatically resent. A block received after provider handoff cannot recall that in-flight email.

This does not suppress/change Supabase security reset mail, nor remove any provider suppression. There is no unblock RPC, learner bypass or automatic removal on delivered/sent events. Verified-address recovery, retention, operator audit/review and provider-list reconciliation require a separately reviewed workflow. Historical monitoring events omit recipient addresses and cannot be blindly backfilled. Before real sending, reconcile pre-existing provider suppressions and prove signed event capture end to end; do not treat this new empty ledger as complete provider history.

## Gates

Patch preparation changes only external package files. Isolated generated-database assertions cover normalization, record/replay/conflict, out-of-order precedence, current-email/preference/queue behavior, account re-registration and grants. Separate two-connection tests prove duplicate-event serialization. No real provider email is sent.

Local application migration/acceptance, hosted migration/acceptance, publishing, webhook subscription/secret configuration, provider reconciliation and real outbound transport/header/DKIM tests are separate gates. This is a suppression foundation, not certification that optional campaigns are ready.
