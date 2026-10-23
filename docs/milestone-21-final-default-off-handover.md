# M21 final default-off release handover

Evidence date: 23 October 2026 (Africa/Nairobi).
Runtime acceptance baseline: `b4a60e53f9521e8f54d9f062f173a46efcfa74e6`.

This record consolidates technical acceptance for the owner-approved default-off
release. Publication and the owner's final closeout approval complete the handover;
this document does not authorize customer campaigns or future sends. Earlier M21
documents describe their individual patch stages. Their historical "not complete
here" notices are not a current consolidated release status; their implementation
contracts and limitations still apply.

## Accepted release evidence

| Area                           | Recorded result                                                                                                                                                                                                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account security               | Owner confirmed reset delivery, old-password rejection/new-password success, password-changed notice delivery and signed-in Account → Security rendering.                                                                                                                                      |
| Monitoring                     | Account-email sent/delivered events were recorded; a controlled bounce alert arrived. Replaying the bounce did not create a second operator alert.                                                                                                                                             |
| Sweep and independent watchdog | Scheduled sweep and five-minute heartbeat acceptance were recorded. Independent failure/recovery notification was tested; the temporary check was paused. This is historical acceptance, not a continuous uptime guarantee.                                                                    |
| Preferences and unsubscribe    | Owner confirmed OFF + Weekly persists after refresh, signup opt-out and signed-out preference-route login redirection. Category/all-optional footer links and one-click headers were observed.                                                                                                 |
| Optional delivery controls     | Local/hosted schema and scoped acceptance were recorded for suppression, address blocking/import provenance, queue, provider evidence, cadence, worker, recovery and retention capabilities.                                                                                                   |
| Controlled live worker         | One generated job was accepted with attempts=1, one consumed permit and one cadence reservation. API acknowledgement, signed email.sent/email.delivered callbacks and Gmail arrival passed. Both footer links were visible; SPF and DKIM passed in the saved EML. No DMARC result is inferred. |
| Stop control                   | Database permit closed and worker idle were freshly verified after the test and cleanup. The current gate permits a specifically authorized single test job, not general campaign activation.                                                                                                  |
| External shutdown              | Owner reported the dedicated worker-test Resend key revoked, worker flag disabled/redeployed and old temporary enabled deployments retired. These are operator attestations, not independently verified provider/deployment API results.                                                       |
| Exact fixture cleanup          | One generated Auth account and its associated identity, profile/preferences, two preference events, two unsubscribe tokens, job, provider receipt, two delivery events and content-facts row were removed. A separate absence check passed.                                                    |
| Preservation                   | Cleanup transaction verified unrelated auth/application/storage/migration-history rows unchanged. Cadence reservation and test-control audit were retained. Sanitized acceptance/delivery evidence and all earlier attempt journals remain private.                                            |

The empty-POST correction is documented in
[worker request compatibility](milestone-21-worker-empty-body.md). Original and
pre-fix worker attempts did not establish delivery; the post-fix acceptance did.
The first cleanup attempt had no confirmed success. After read-only presence and
guard probes, a separately journaled attempt completed cleanup. No original intent
was deleted to permit retry. Do not infer the initial cleanup failure's cause from
the later successful attempt or from the separately observed disk-space incident.

The saved fixtures, headers and receipts prove this controlled test, not delivery
to every recipient or protection against every provider/inbox outage.

## Verification scope

The broader release evidence records 1,694 tests across 136 files plus lint at the
earlier reviewed-producer baseline, and a production build of 214 pages with
browser/private-boundary checks. These are not claimed as a full-suite rerun on
the final empty-body commit. The subsequent request correction passed 16 focused
adapter/stream regressions and 445 existing optional-email/unsubscribe tests,
production-option no-emit typecheck and lint. Stop-control and cleanup safety
tests used isolated generated databases; cleanup tests covered changed holds,
changed profile, unknown cascade dependency, collateral-change rollback, exact
cascade success and refusal of a repeated deletion. Temporary databases were
removed. No test database was populated with copied customer rows.

Raw EML, bearer links, credentials, database URLs, account/provider identifiers
and private execution journals are deliberately excluded from this public
handover. Protected evidence is retained in the owner's external
`m21-worker-acceptance/runs/<acceptance-run>/` archive, including the stop receipt,
sanitized cleanup preview and replacement cleanup acknowledgement/pass receipt.
The preview contains linkable operational metadata, not anonymous data; restrict
access accordingly. Cleanup removed the live test content/tokens, not the
protected historical acceptance record. It is not automatically reversible and
the sanitized archive is not a restorable account/token backup.

## Operating posture

- Keep `PIPSTART_OPTIONAL_WORKER_ENABLED=false`. Missing/false remains off.
  Publishing this document must not create or change credentials or settings.
- The approved-content catalog remains empty/frozen. No customer campaign,
  bulk producer, optional-email scheduler or campaign approval is introduced.
- Account-security SMTP, its monitoring/sweep and the independent watchdog are
  separate from optional marketing delivery. Do not revoke their credentials or
  disable them when stopping a worker test.
- Preserve uncertain sending/manual jobs and admission evidence. A timeout,
  absent callback, deployment or idle report is not resend permission. Use the
  documented owner-only review/recovery process and case-specific authorization.
- A database pause cannot recall a committed provider handoff. Stop/fence the
  relevant executors as well; revoking a test key is not a general remote lock.
- Old send/cleanup Execute commands are historical one-shot records. Never rerun
  them or recreate the removed fixture. After cleanup, use absence receipts rather
  than an old acceptance verifier that requires the live test account.

Operational contracts:
[monitoring](milestone-21-email-monitoring.md),
[sweep](milestone-21-delivery-sweep.md),
[watchdog](milestone-21-independent-watchdog.md),
[cadence](milestone-21-optional-email-cadence.md),
[controlled recovery](milestone-21-optional-worker-controlled-recovery.md),
[metadata cleanup](milestone-21-optional-metadata-cleanup.md) and
[content minimization](milestone-21-optional-content-minimization.md).

## Policy and future activation boundaries

The owner selected learning/partner ON-by-default preferences with per-email
unsubscribe. This is an opt-out model, not recorded express consent or a legal
compliance finding. Country eligibility was intentionally omitted at the owner's
request; no country allowlist or jurisdiction-based eligibility is claimed.

The approved retention rules and owner-only cleanup/minimization capabilities
are installed, not scheduled automatic deletion. Valid account unsubscribe links,
holds, unresolved work, suppression and current cadence budgets must remain
protected. The exact generated-account cleanup was separately authorized; it is
not general permission to bypass retention or delete learner accounts. New
cleanup/minimization receipt retention and private proof access require an owner
decision before real execution. Hashes and retained identifiers are linkable
metadata; minimization is not secure erasure or a complete data-subject workflow.

A future active campaign is a separate release decision: approve exact content,
category, audience, occurrence/backlog, schedule, sender credentials, bounded
execution/stop controls, operational ownership and retained-proof handling. The
[reviewed producer](milestone-21-reviewed-optional-producer.md) window controls
enqueue/scheduling, not guaranteed delivery expiry or automatic revocation of
persisted jobs. A strict delivery deadline needs separate durable send-time
controls. Privileged database owners remain outside the API boundary.

Autonomous Auth canaries, hourly failure-rate alerting, provider failover,
engagement suppression, admin campaign UI, automatic retention scheduling and
continuous campaign operation are not part of this default-off handover. Existing
monitoring cannot observe every rejection before provider acceptance or guarantee
operator-inbox delivery during a shared provider/inbox outage.

No additional send, migration, activation or cleanup is required to publish this
record. Final owner closeout applies to the defined default-off release only.
