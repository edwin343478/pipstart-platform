# M21 provenance-tracked provider-suppression import foundation

Adds two private audit tables and a database-operator-only invoker function. This migration imports **no real address**. No provider transport, campaign, route, secret, scheduler, Auth/preference change or webhook reconfiguration is included. Existing live webhook events and address checks remain unchanged.

## Evidence and semantics

`pipstart_optional_address_import_batches` records the operator batch UUID, exact CSV SHA-256, Resend team, full-export attestation, canonical manifest hash, source count, original new-block count and import time. `pipstart_optional_address_import_items` records only canonical address hash, source-record fingerprint, normalized provider source label, optional provider-list creation timestamp, and whether the import created the block. No raw address, raw export/payload, reason detail, fake event ID or provider-message ID is stored. A source fingerprint/attestation is not independent cryptographic proof of provider origin. Address hashes remain guessable pseudonymous personal data, not anonymization; retain exports/reports privately and review access/retention.

All new address blocks use `provider_suppressed`. In particular, a CSV `bounce` label is retained as source metadata but does not establish a historical Permanent bounce. First/last block times for new rows record observation at import; provider-list creation time is separate metadata, not a claimed event timestamp. Existing block rows are left unchanged, including stronger reasons and times. Authentic later webhook evidence can strengthen the generic block through the existing writer.

The function accepts only a bounded, fully validated hash-based manifest for the pinned team `agentkibubu25` and explicit `full_unfiltered_team_export` attestation. It validates every item before writes, fences both source and batch identity, sorts address locks, and commits batch/items/new blocks atomically. Exact replays (including reordered identical items) return `duplicate` without updates. A changed body/source under the same batch, or the same source under another batch, is rejected. A later new export is separate provenance, not a reason to remove a block absent from it. Existing items remain immutable through the import function. Database owners retain normal administrative power.

## Permissions and scope

Tables have RLS with no public/anon/authenticated/service-role grants or policies. `pipstart_import_optional_address_snapshot(uuid,text,text,text,jsonb)` uses invoker rights and an empty search path; no application/API role is allowed to execute it. No application-facing import or unblock endpoint is added. Use separately reviewed privileged CLI execution, never raw SQL assembled from CSV fields. Preparation must canonicalize addresses exactly like the existing normalizer, pin the reviewed export, hash records, and verify live state before any import. This foundation does not include a live import runner.

Blocks affect optional delivery through the existing dispatch/queue gate, survive account deletion, and do not change Supabase security email. A block cannot recall an email already handed to a provider. No automated unblock/resend or provider-list mutation is implemented. Optional campaigns remain disabled.

## Separate gates

1. External patch review/application; isolated generated-fixture SQL and concurrency tests.
2. Explicit local application migration and local acceptance authorization.
3. Explicit hosted schema migration/acceptance authorization; verify grants and unchanged original functions/state.
4. Prepare and review the one-address import plan pinned to the full export and read-only comparison. Explicit hosted **data import** authorization is separate from schema migration. No real provider export is included in Git.
5. Validate exact batch/item/new-block counts, existing-block preservation, no fake webhook events and no learner/preferences/queue mutations. Resolve uncertain CLI acknowledgements through read-only verification, not a new batch ID or deletion.
6. Publishing requires separate commit/push authorization. This import foundation is not optional-sending clearance or independent verification of historical provider-list completeness.

The current reviewed one-row export is missing one local block, while the existing controlled-test block is retained. No implementation should assume these addresses match or replace one with the other.
