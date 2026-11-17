# M22 audit follow-up (Packages 1 and 2)

An implementation review of the accepted M22 (17 November 2026, reviewed commit `0961665`) found:

- three defects in the automatic single-link check, which is switched off;
- an unused `service_role` grant;
- two documentation errors.

This change fixes all of them. **The automatic link check stays off** (`PIPSTART_MAINTENANCE_PROBE_ENABLED` unset); nothing is enabled by this change.

## Fixes

| Finding                                                                       | Fix                                                                                                                                                                                                                                  | Proof                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **F1:** the check contacted the host before the item and link were authorized | New `pipstart_maintenance_probe_intent` (migration `20261121090000`) authorizes the exact person, item, live revision, link and host **before** any DNS or HTTP. `record_result` keeps its own checks                                | SQL suite: unassigned, unknown item, stale revision, link not in the content, unlisted host and affiliate host are all refused with **nothing written**. Unit tests: **no DNS or HTTP** for every refusal |
| **F2:** the 8 s deadline was only a socket inactivity timer                   | One 8 s deadline across DNS (itself 3 s), connection, headers and the HEAD-to-GET fallback. On expiry the real request is aborted through an `AbortSignal`; all timers are cleared                                                   | Fake-timer tests: a send that never answers ends at exactly 8 s with the request aborted; the fallback stays inside the same 8 s; a hanging DNS ends at 3 s with no contact                               |
| **F3:** encoded paths like `/%72eset/` bypassed the deny list                 | The path is decoded once before the deny test. Malformed encodings, double encoding, encoded `/` or `\` and backslashes are refused                                                                                                  | Tests for `%72eset`, `%75nsubscribe`, `%2572eset`, `%2F`, `%5C`, a malformed `%E0%A4%A` and `LOG%49N`                                                                                                     |
| **F5:** unused grant; no limit on the expensive action                        | `service_role` EXECUTE on `pipstart_set_lesson_completion` is revoked. The intent allows at most **20 checks per person per rolling hour**, counted in the store so every server instance shares the limit; the 21st answers `PT429` | Negative grant test (authenticated keeps EXECUTE); quota test (21st refused, nothing written, another person unaffected)                                                                                  |
| **F10:** stale evidence status; runbook role rule                             | The evidence status now records acceptance. `milestone-22-release-receipt.json` cites the green `0961665` checks and deployment. The runbook states the real delegated-role rule. A5 is reworded as a clarification                  | Docs                                                                                                                                                                                                      |

**Proof that the tests bite:**

- The new unit tests fail (20 of them) against the previous probe code, and pass against the fixed code.
- The SQL suite fails on a planted intent that skips the permission check, and on a re-added `service_role` grant.

## Hosted step

Migration `20261121090000` adds one table, one function and one revoke. It is applied by the owner through the usual fingerprinted packet: preflight, migration, read-only acceptance, history.

## Not changed

- The automatic check is still off; turning it on still needs one controlled real-network check (A3).
- Broader staff rate limits (beyond this check) and the other audit packages (backups, quiz gaps, connected journey) are separate.
