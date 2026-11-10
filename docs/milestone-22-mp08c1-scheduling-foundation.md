# MP08c1 — durable scheduling and due-time foundation

First of three bounded MP08c patches. Owner-run source installer on applied MP08b2b and hosted-accepted MP08a. MP08c2 supplies restricted execution/inactive Cron and delivery integration; MP08c3 supplies connected staff controls, Auth/browser/accessibility acceptance and the combined hosted review. MP08c is not complete after c1.

## Current behavior

The migration adds three private RLS-protected tables: an inactive scheduler control, immutable schedule commands with terminal outcomes, and append-only schedule events. No role, executor, Cron extension/job, HTTP endpoint, secret, provider call or activation is installed. The control starts disabled, and no public or service API can change it. Schedules are planning records until the later executor is accepted and separately activated.

Authenticated AAL2 Owner or scoped Editor may schedule an exact approved publication or withdrawal, or cancel pending work. Author/Reviewer cannot mutate schedules; scoped readers can inspect at most ten recent minimized schedule records, without authorizer IDs or content bodies. Every write checks current account/session/membership and item scope. Governance changes serialize with the staff control lock. Stable operation identities replay only identical requests. One pending schedule per item is enforced by a partial unique index. Cancellation is idempotent, creates one event, and cannot undo a completed publication. Historical requests and events cannot be deleted or reopened.

Scheduling captures the UTC due instant, original wall-clock input, IANA zone, exact revision/hash where applicable, authorizer, baseline generation and policy version. The future executor must recheck current authorizer/account/grants, approval, policy, dependencies and later publication decisions; it must not impersonate an old human JWT or treat scheduling as permission to publish forever. c1 intentionally supplies no execution path.

## Due-time contract

Minute-resolution local input uses YYYY-MM-DDTHH:mm and an IANA geographic zone (UTC is also supported). Years 2000–2099 are supported by the converter; a new schedule must be between one minute and 366 days ahead according to the database clock. These bounds are explicit and adjustable in a reviewed later patch.

The pure TypeScript converter and PostgreSQL independently enumerate every UTC minute within the supported 26-hour offset bound. They preserve quarter/half-hour offsets, reject invalid calendar normalization, and reject both nonexistent and ambiguous wall-clock times. No presumed one-hour DST jump and no guessed offset. The database recomputes the unique mapping and refuses a forged browser UTC instant. Original local input and zone remain intact. If browser ICU and database timezone data disagree, scheduling fails rather than moving the requested time silently. A different unambiguous time must be selected or the timezone data reviewed.

## Tests and limits

The new rolled-back SQL suite checks conversion and DST refusals, grants, default-off head, exact approval/hash, stale generation, due-time bounds, live role/assignment/account revocation, replay/collision, cancellation, immutable events/commands and bounded DTOs. It proves planning/cancellation never creates a generation or extra refresh job.

The generated restore drill uses only disposable fixtures: publish a known exact revision, withdraw it, restore the earlier sealed set as a new generation, verify lineage/entry equality and the build snapshot seal, then prove restoring trashed content is refused without moving the pointer. This is a database restore proof, not a Vercel delivery/cache drill; the latter remains MP08d.

The consolidated CI verifier runs the new migration and suite, checks their rollback/head, and observes two independent sessions blocking on schedule creation/replay and cancel/replay. Exactly one request and one terminal event must result, while the publication generation stays unchanged. The manifest now contains 37 exact ordered SQL inputs. Cancellation versus actual executor, permission revocation at due execution and overlapping ticks remain mandatory MP08c2 gates; c1 does not simulate those as completed acceptance.

No hosted SQL, existing database reset, real account/role change, activation, send, commit or push is performed by source installation. SQL acceptance is run only through the external owned-container wrapper. Do not run the generic local verifier against the owner's Supabase stack.

## Next

After owner application of c1: MP08c2 restricted executor, inactive Cron wiring and delivery handoff. Then MP08c3 connected scheduling/cancellation UI and real local Auth/browser acceptance. Hosted MP08c migrations require their own separately authorized packet. MP08b2b owner visual approval and MP08d visibility/cutover remain open.
