# M24 monitoring and incident runbook (X01, X02, S12)

The existing Healthchecks.io account and email integration receive uptime alerts, trusted application error alerts, and the separate M21 delivery-sweep alerts. Ping URLs are credentials. Keep their values in approved secret storage.

## Coverage and ownership

| Check or signal                          | Source and expected behavior                                                                                                                                                                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PipStart site                            | Cloudflare Worker `m24-uptime-monitor` probes `/`, `/start-here`, `/learn/forex` and `/login` for HTTP 200 and page markers.                                                                                                                                                    |
| Skillcima site                           | The same Worker probes the Skillcima homepage for HTTP 200 and its course marker.                                                                                                                                                                                               |
| Database via Skillcima                   | The same Worker requires a successful Skillcima health response with `data.database == "ok"`. This is a shared Supabase connectivity sample.                                                                                                                                    |
| PipStart errors                          | Trusted server paths send sanitized failure events. The browser-error API logs fixed diagnostic categories only.                                                                                                                                                                |
| Skillcima errors                         | Worker fetch 5xx responses and thrown fetch errors send sanitized failure events. Browser error handling uses the browser console. Queue and scheduled outbox failure events are logged separately. Verify any additional alert coverage for those events before relying on it. |
| PipStart production delivery sweep (M21) | The existing delivery-sweep monitor reports delivery health. Use its own runbook and settings for this check.                                                                                                                                                                   |

Cloudflare is the recurring uptime runner. The accepted activation on 23 November 2026 ran every ten minutes at minutes 4, 14, 24, 34, 44 and 54 UTC. All three Healthchecks checks received fresh pings. The recorded PipStart uptime drill produced Down and Up emails. GitHub's `m24-uptime.yml` is a manual workflow, with probe-only mode as its default. Keep a single recurring runner. Before relying on a detection target, confirm the current Healthchecks period/grace and record missed-run detection alongside the Cloudflare cadence.

The manual CLI imports `scripts/m24-uptime-probes.mjs`. This module uses Web APIs so it can also be reviewed as the portable probe implementation for the Cloudflare Worker. Updating the repository does not deploy the separately versioned uptime Worker. Record the active Worker version when an approved deployment is verified.

Trusted application diagnostics send fixed app and surface labels, route categories, status, short error codes, and a UTC timestamp. Keep messages, stacks, URLs with query strings, cookies, user identifiers, and request bodies out of alerts. Inspect the hosting platform logs privately when investigating. Trusted reporters throttle attempts to one per instance or isolate per minute.

## Application error lifecycle

Application checks receive failure events and alert on state transitions. A long period/grace does not make a Healthchecks check event-only. An active check that expects a success can go Down when the deadline passes. Treat missed uptime/sweep signals and application-error events as different incident types.

The owner investigates and acknowledges an application error, records the result, and restores the check to its intended ready state after verifying recovery. A disposable drill demonstrated email delivery and re-arming to New. Before beta, confirm the production settings and the behavior for a quiet interval and a second independent incident using a controlled rehearsal. Keep an unresolved error visible during investigation.

## Configuration and controlled drills

- Cloudflare uptime reporting uses `HC_UPTIME_PIPSTART`, `HC_UPTIME_SKILLCIMA` and `HC_UPTIME_DATABASE`. Vercel Production uses `PIPSTART_ERROR_PING_URL`; the Skillcima Worker uses `SKILLCIMA_ERROR_PING_URL`. Record secret presence and deployment identity without copying values into receipts.
- For uptime, review the three current check states and recent pings, then match their times to Cloudflare scheduled runs. For separately approved alert rehearsals, use a disposable check to exercise a missed run, failure, and recovery. Use the manual workflow's reporting mode only for an approved run against the intended checks.
- Exercise application alerts with a disposable check and a fixed synthetic trusted event. Confirm receipt, re-arm, then verify a later event. Browser diagnostics can be checked in the log channel using an isolated fixture.

## Incident handling

1. Match the check and timestamp to Vercel, Cloudflare or Supabase. Record whether an endpoint failed, a scheduled ping was missed, or a trusted application event was reported.
2. Classify a public site or database outage as S1. Treat recurring application errors or delivery failures as S2 when users are affected. Investigate isolated errors as S3 unless the impact warrants escalation.
3. Use the reviewed rollback path for a bad deploy. Use the provider dashboard and approved recovery procedure for a paused database or credential incident. Refer to the Vault reprovisioning runbook for Vault-paired tokens.
4. For loss or corruption, locate the latest verified encrypted backup and follow the M24-05-03 isolated restore procedure. Production restore requires a separate decision.
5. Coordinate any public incident notice with the owner. Record detection time, recovery time, cause, mitigation, follow-up and whether the relevant checks recovered. Recovery objectives are four hours to recover and at most 24 hours of lost changes, with 30-day retention.
