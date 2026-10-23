# M21 transaction-proven cadence deferrals

This corrective patch adds `pipstart_begin_optional_email_v2`, returning an exact version-2 acknowledgement with `started`, `cadence_deferred`, or `lease_lost`. The existing boolean RPC remains unchanged for older deployments. No existing migration is rewritten.

The wrapper takes the same cadence advisory lock before the job row lock, verifies the current preparation token and lease, and calls the existing admission function within the same transaction. A safe deferral requires the resulting row to be pending with `cadence_limited`, no lease, prepared payload or provider ID, the preparation attempt refunded, a future deferral boundary, and no handoff reservation for that job. A stale token, expired lease, prior prepared body/reservation or unexpected state is never classified as a safe deferral.

Only a validated `cadence_deferred` acknowledgement lets the worker continue its already-selected batch. It never retries that job within the run. Normal worker finish still checks database state before releasing admission. A later uncertain job still retains admission. No finally-unlock, lease takeover, generic recovery, budget reset or automatic retry is added.

Database exceptions are not caught or reclassified as safe. Missing RPCs, legacy booleans, malformed responses, lost acknowledgements, stop-window rejection, manual outcomes and uncertain provider handoffs remain fail-closed. The one-job permit and SENDING trigger remain unchanged. No window is opened or consumed merely because a job was deferred.

## Deployment order

1. Keep optional sending disabled and the acceptance permit closed.
2. Obtain authorization for local isolated database migration and generated-fixture SQL acceptance. Use the complete schema head, not naive replay of older stage-dependent fixtures.
3. Obtain authorization for the additive hosted migration and read-only schema/grant verification. Do not run the generated behavioral fixture in a hosted or existing application database.
4. Publish the application adapter only after the v2 RPC is installed and verified. Existing deployments continue using the unchanged boolean RPC during this interval.

The included SQL acceptance file requires an empty disposable database, verifies privileges, safe worker completion after deferral, no premature re-claim, closed-window rollback, one permitted durable marker and reservation, and retained admission for an unresolved SENDING job. Its generated changes roll back. This file must not be run against an application or hosted database.

This patch does not authorize any database migration, hosted fixture, provider send, worker activation, campaign, commit or push. Database acceptance remains pending until explicitly authorized and executed. Broader worker time-budget handling and monitoring/lifecycle recommendations are outside this bounded correction.
