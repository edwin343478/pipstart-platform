# MP09 acceptance and release review

This is the handover entry point for MP09 (partner and affiliate administration). The evidence index is `milestone-22-mp09-release-evidence.json`. The per-patch guides:

- `milestone-22-mp09a-partner-store.md`
- `milestone-22-mp09b-partner-delivery.md`
- `milestone-22-mp09c-partner-editor.md`
- `milestone-22-mp09d2-partner-import.md`
- `milestone-22-mp09d4a-partners-check.md`

## Current status: MP09 accepted (16 November 2026)

| Commit    | Delivered                                                                                | CI                                                                 |
| --------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `d45b5d4` | Partner store and Owner policy, sealed partner delivery, staff partner editor (34 files) | CI, M21 SQL and M22 SQL passed; live learner release gates skipped |
| `332c213` | Operator-only partner import and the Deriv import generator (8 files)                    | CI, M21 SQL and M22 SQL passed; live learner release gates skipped |
| `e2ffec5` | Check live site accepts the `partners` group (3 files)                                   | CI, M21 SQL and M22 SQL passed; live learner release gates skipped |

**What is live:**

- **Partners in the editorial store.** Partner and link are store families with revisions, Owner single-person approval, sealed generations, the publication panel and restore. There is no second workflow.
- **Owner-only protected policy.** A partner's risk notice and a link's approved hosts are versioned, audited policy records.
  - Only the Owner sets them.
  - An Affiliate Manager edits links only within the approved hosts and can take an assigned link offline.
  - The store enforces this, not the form.
- **Deriv in the store.** Deriv was imported byte for byte from the code register.
  - Partner body: `4864ec1a…`. Link body: `492c43fb…`. Policy v1 holds the risk notice and `t.deriv.link`.
  - The Owner published the partner as generation 9 and the link as generation 10.
  - Each delivery was verified at attempt 1.
- **Current generation: 10,** seal `7730f794…ab80`, verified on the live site.
- **The directory reads the store.** Production has `PIPSTART_STORE_FAMILIES=analysis,curriculum,partners`, so `/brokers` and `/go/deriv` read Deriv from generation 10.
  - The visible `/brokers` text and links are byte-identical to the code-register baseline (SHA-256 `dfde60b9…`).
  - `/go/deriv` redirects 302 to the exact attribution URL, with `no-store` and `noindex`.
  - Check live site confirms generation 10 with all three groups.
- **Scheduled publishing stays off** (scheduler paused at version 8; Cron job 2 inactive), unchanged from MP08.

**Hosted migrations,** each applied by the owner, accepted read-only and recorded in history:

- `20261116090000` partner store
- `20261116120000` partner snapshot
- `20261117090000` partner import (functions for the operator only; no API role can call them)

## Gate disposition

| Gate                                                         | Disposition                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Attribution preserved                                        | Accepted. The byte-exact import is proved through the site's own reader. `/go/deriv`'s `Location` hash equals the register URL's before and after the switch.                                                                                                                                                                                   |
| Tampering with roles, hosts or disclosures denied            | Accepted. SQL suites (refusals for out-of-policy hosts, risk notices or hosts in bodies, unassigned access, narrowed hosts at publish and restore), snapshot tampering refused by the site reader (seven cases), and the connected browser rehearsal (an Affiliate Manager's policy write denied; an out-of-policy URL blocked before sending). |
| Active, expired, suspended, outage and cache cases           | Accepted. The local link drill (owner decision: local, not hosted) used real production builds, against generated partners on `go.drill.invalid`. See below.                                                                                                                                                                                    |
| No tracking and no unsafe network probes                     | Accepted. `/go` redirects only to the stored destination, never from input; the route itself writes no cookie and keeps no click log. Observation used public GET requests only.                                                                                                                                                                |
| AT03: Affiliate Managers cannot reach infrastructure secrets | Accepted for MP09. The partner editor's server code calls the store on the user's own session; it reads only the staff UI flag and never creates the service-key client. The policy read returns no secrets. The public-bundle scan passed on every build. MP11 keeps its own gate.                                                             |
| Important actions logged                                     | Accepted. Every policy, create, save, approve, publish and withdraw writes one audit row (exact counts in the SQL suites and the connected rehearsal).                                                                                                                                                                                          |

## Link drill (16 November 2026)

The drill ran in a run-owned, networkless database driven through the Owner's panel calls. A production `next build --webpack` served it locally. The server had no database connection at all, so the outage case is covered: `/go` and `/brokers` never read the database at runtime.

| Case                                                                    | Result                                      |
| ----------------------------------------------------------------------- | ------------------------------------------- |
| Link valid until tomorrow                                               | 302 to its destination; visit button        |
| Link that expires today                                                 | 404; "Visit link unavailable"               |
| Link suspended (`active: false`), at publication or by a later revision | 404; card listed without a button           |
| Link renewed by a new revision                                          | 302 again                                   |
| Link revoked (withdrawn)                                                | Partner still listed; 404                   |
| Partner review overdue                                                  | 404; "Review overdue … Visit link disabled" |
| Partner withdrawn                                                       | Not listed; 404                             |
| Deriv (never edited)                                                    | 302 to the exact attribution URL throughout |

- Every `/go` reply carries `no-store` and `noindex`, and an unknown link is a 404.
- Snapshot A (generation 11) and snapshot B (generation 16) each passed 17 checks.
- **Limits:**
  - expiry was tested at the UTC date boundary, not across midnight;
  - only `partners` was switched in the drill builds;
  - there was no browser or Vercel.

## Found and fixed during MP09

- **Check live site** kept its own group list (`analysis`, `curriculum`). Switching `partners` would have left every later publication unverifiable. Fixed in `e2ffec5` before the switch; the four new tests fail on the old code.
- **Delivery order:** publish the link only after the partner's generation is verified. A new publication supersedes an unconfirmed delivery.

## Operator rules

- **Partner content goes live** only by publication (a new generation and deployment). Expiry dates are checked on every `/go` request.
- **To take a link offline at once,** use **Take offline** (withdraw) and deliver the new generation. Don't edit the code register: it is no longer read for partners.
- **Rollback of the switch:** set `PIPSTART_STORE_FAMILIES=analysis,curriculum`, redeploy without the build cache, then confirm `/brokers` and `/go/deriv` still match the baseline. The code register is unchanged.
- **Never test on Deriv.** Use generated partners on a reserved host, locally.

## Next

MP10, MP11 and MP12 remain separate packages.
