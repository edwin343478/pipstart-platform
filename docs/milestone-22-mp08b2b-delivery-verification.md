# M22 MP08b2b — publication delivery and live-site checks

Owner-run source packet on applied MP08a + MP08b1 + MP08b2a, main 616ce75. No new migration, credential, hosted flag, actual Vercel deployment or production content change is performed by installing this packet.

## Delivery contract

A confirmed baseline, publish, withdrawal or restore is followed by one delivery attempt. A replayed or uncertain publication never triggers a new attempt. Publication success remains success if delivery fails. The existing service-only refresh RPC claims pending/failed jobs atomically, increments attempts and refuses concurrent claims or attempts beyond 20. Only the deployment request is explicitly retryable; a publication is never resent. Processing jobs cannot be retried.

The staff action validates the signed-in user, real current staff access and Owner/Editor role before creating a privileged client. A service key stays server-side. The hook comes only from PIPSTART_DEPLOY_HOOK_URL, never input from the browser. Production accepts HTTPS api.vercel.com/v1/integrations/deploy/... with no credentials, query, fragment, port override or redirects. Local HTTP 127.0.0.1 is permitted only in development outside Production for isolated acceptance. Missing/invalid hook leaves the job pending. The panel states delivery is not configured.

The external hook response and anonymous check both have an absolute 8-second header/body deadline, 4096-byte and 128-chunk limits, redirect refusal and no automatic retries. A rejected, timed-out or malformed handoff can have been accepted: its short persisted note says so. No raw response, credential, URL or caught transport exception is returned or logged. A missing claim acknowledgment causes no network send; the operator must reload before deciding how to recover.

## Check live site

The server checks the configured NEXT_PUBLIC_SITE_URL origin anonymously with cache:no-store and no redirects. It reads /live-generation.json and compares the exact format, generation, snapshot seal and configured PIPSTART_STORE_FAMILIES groups. The authoritative seal is read through the existing service-only snapshot RPC: its private snapshot is held only server-side and never returned, logged or sent to the anonymous endpoint. Production requires an HTTPS site origin. No browser URL or external fetch target is accepted.

An older deployment is still delivering. Malformed evidence, wrong seal/groups, an unreachable endpoint or newer generation cannot be verified. Current store status is reread before recording success. Only a matching processing job transitions to verified; a failed/pending job is not silently advanced. A prior uncertain request with a matching deployment but a failed job requires a separate reviewed recovery decision; this packet deliberately does not bypass the SQL transition policy.

Generation evidence verifies deployment identity; it does not prove every learner route or the five-minute visibility target. Real switched builds, warmed/new route checks, caches and visibility measurement remain MP08d gates before cutover. Until a family is switched, learner pages keep reading code. An empty group configuration cannot be declared verified.

## Controls and verification

Owner and Editor receive Check live site and, only on eligible pending/failed jobs below the cap with a configured hook, Retry delivery with an explicit confirmation. Current attempts are shown. Author/Reviewer/Learner requests are refused on the server even if controls are forced. Live status and result messages use existing polite status regions.

The packet records focused/full unit, both TypeScript, lint/format, clean default-off webpack build and public bundle checks. Installer smoke must exercise check/apply/byte-exact rollback/apply. The extended connected rehearsal uses generated Auth/MFA accounts, a private run-owned database and fake loopback hook/evidence endpoints; no real hook or deployment is used. Screenshots and axe results accompany it. Owner visual approval and unperformed native zoom/screen-reader checks remain explicit.

## Next

After owner application and acceptance: prepare the hosted MP08a migration/read-only acceptance packet. Hosted SQL requires separate authorization. Then MP08c inactive scheduler/restore drill, followed by MP08d measured pilot and separately approved family cutover. MP08 remains uncommitted until publication approval.
