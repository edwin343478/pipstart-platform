# MP08c2 — restricted scheduler and delivery handoff

Second of three bounded MP08c patches. Builds on exact applied c1; source installation does not execute migrations or activate anything. c3 supplies connected scheduling/cancellation UI, real Auth/browser/accessibility acceptance and combined hosted review. MP08d owns real Vercel/cache/recovery measurement and approved family cutover.

## Restricted execution

A NOLOGIN, NOINHERIT role has only private-schema usage and execution of two fixed scheduler functions. It cannot read/write Auth, content or schedule tables, call the private publication mutation kernel, change flags or invoke the service delivery API. No API-role membership, saved staff JWT, fake human session or worker Owner account is introduced. The trusted Cron operator drops into this role for each fixed command.

Each tick takes a nonblocking transaction advisory lock; overlapping ticks return busy. Staff and scheduler controls must both be enabled. Governance control, pointer, schedule and authorizer rows serialize changes; live account/membership, verified MFA factor, current Owner or exact scoped Editor assignment and policy version are rechecked. Human session expiry alone does not invalidate an already authorized plan. Removed/banned account, removed factor, membership or scope cannot authorize due work.

At most five due commands are considered per tick, ordered by due time/identity, with a 1.5-second loop budget after lock acquisition. Due time uses the database clock. Original c1 UTC/time-zone/local-input records stay immutable. Future commands are untouched. Exact approval and dependencies are rechecked. A later same-item publication or a restore supersedes older work; an unrelated item's publication does not discard an otherwise valid schedule. Policy changes invalidate prior approval assumptions. Success creates one sealed generation, refresh job and terminal event under the schedule's stable operation identity. Known refusal produces a minimized terminal failure; unexpected DB errors roll back, leaving work durable for diagnosis.

Manual publish/withdraw and the worker share one private mutation kernel, including parent coherence, approved revision/hash, quiz-version monotonicity and immutable snapshot completion. The manual RPCs retain current-user authorization, replay and compare-and-set behavior. No private kernel is granted to users or the worker role.

## Delivery and uncertainty

The database publishes before making a separate network wake. The delivery-only endpoint cannot select content or a generation. It requires its separate default-off environment flag and a dedicated opaque bearer token, then atomically claims only the latest pending scheduled generation with zero attempts. At most one durable claim exists. Duplicate wakes are idle; manual deployment claims and scheduler claims serialize on the same pointer/refresh rows.

The server uses the existing exact Vercel-hook URL rules and 8-second / 4096-byte / 128-chunk response bounds, with redirects refused. Request bodies are limited to empty or an empty object, 32 bytes, eight chunks and the existing 2-second body deadline. Token comparison uses fixed-size hashes and constant-time equality. Invalid/disabled requests do not construct an admin client or touch the hook.

A confirmed HTTP acknowledgement records sent and leaves the refresh job processing; it does not certify a successful build. A non-2xx, timeout, lost response or lost finish acknowledgement is uncertain. Uncertain claims are never automatically resent, including on the next Cron wake. A crash after claiming also requires review. Existing staff delivery status and Check live site remain the verification/recovery path. A superseded generation is not made current again. A pause prevents new claims; a request already in flight cannot be recalled.

## Inactive Cron wiring

The separately authorized operator script `apps/pipstart/scripts/install-m22-publication-cron-inactive.sql` requires pg_cron to be installed, paused controls and an unused exact job name. It creates a one-minute job and marks it inactive within the same transaction. It never installs extensions, creates credentials or enables controls. Publication and wake run in separate transactions so a missing wake prerequisite cannot undo a committed generation.

The wake has a fixed destination, https://pipstart.net/api/internal/publication/scheduled-delivery. It reads only `pipstart_publication_scheduler_token` from Vault and uses pg_net with an 8-second timeout. It does nothing while disabled or without an eligible pending scheduled generation. Missing extensions/Vault credentials fail visibly; the pending job remains durable. Vault/pg_net setup, token generation/storage, deployment configuration and activation require a later separately approved operator packet. Supabase documents this Cron/pg_net/Vault pattern and also notes that pg_net briefly holds the plaintext header in its request queue; trusted database operators therefore remain inside the secret boundary: [Cron](https://supabase.com/docs/guides/cron), [scheduled requests and Vault](https://supabase.com/docs/guides/functions/schedule-functions).

Server runtime settings, all absent/default off in this packet:

- PIPSTART_PUBLICATION_SCHEDULER_DELIVERY_ENABLED: exact true only after later approval.
- PIPSTART_PUBLICATION_SCHEDULER_TOKEN: dedicated random base64url token (32–128 characters), matching Vault. Never a Supabase service key or human JWT.
- PIPSTART_DEPLOY_HOOK_URL: existing server-only Vercel hook. Never NEXT_PUBLIC.

## Acceptance boundary

The consolidated 39-input SQL gate retains all earlier assertions and time limits, and adds rollback/default-closed head, due-time execution/refusal, immutable outcome, bounded work and single-claim uncertainty tests. Independent sessions cover overlapping ticks, both cancel/tick orderings, governance revocation and duplicate delivery claims. Endpoint tests cover configuration/auth/body/DTO refusal, bounded hook responses, timeout, uncertainty and no duplicate send. Default-off build/public bundles and the fingerprinted installer rehearsal are required before handoff.

SQL Auth stubs do not replace c3's real Auth/PostgREST/browser acceptance. Inactive Cron installation is an operator artifact, not proof that hosted Cron/extensions/secrets are configured. No real external hook, live site cutover, account grant, credential, activation, hosted SQL, commit or push belongs to this source patch.

Next: MP08c3 connected staff scheduling controls and real local Auth/browser/accessibility acceptance, then combined hosted MP08c review. MP08b2b owner visual approval and MP08d pilot remain open.
