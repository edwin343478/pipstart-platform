# M22 MP11d: integrated journey and failure drills (traced evidence)

**Owner decision, 17 November 2026 (lean path):** MP11d is a traced evidence map, not a new single connected run. Each step of the master plan's journey, and each failure drill from MP11 decision D6, is mapped to the run, suite or hosted record that already proves it. Gaps are listed, not hidden. This amends MP11 decisions D2, D6 and D7. MP12 records the amendment for the owner to accept.

## The journey (master plan §7)

| Step                                            | Proven by                                                                                                                              |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Staff MFA                                       | Real TOTP sessions for seven roles (MP11c2 run 3); staff entry and MFA gates (MP03)                                                    |
| Assigned new or existing draft; save and reload | Editor connected runs (MP06); saves through the RPC (MP11c1 coverage suite)                                                            |
| Conflict and review                             | Optimistic conflicts answer `PT409` (MP04a, MP06); learner conflicts (MP11b real-PostgREST proof); separate reviewer approval (MP11c1) |
| Exact approval                                  | Revision and hash-bound approvals (MP06, MP07; MP11c1)                                                                                 |
| Publish or schedule                             | Sealed generations and delivery (MP08); hosted scheduled catch-up pilot (MP08 handover); scheduler paused since                        |
| Anonymous read                                  | Observed live generations (MP08, MP09d3/d4b partner switch checks)                                                                     |
| Learner progress and quiz                       | Attempt N survives version N+1 (MP07); progress conflict proof (MP11b)                                                                 |
| Changed revision                                | Quiz version 2 beside version 1 (MP11c1 retention suite)                                                                               |
| Withdraw                                        | Hosted withdraw (MP08); MP11c1 retention suite                                                                                         |
| Restore                                         | Generation restore drills (MP08); archive and restore as draft (MP11c1)                                                                |
| Revoke staff                                    | Staff suspension and retirement suites (MP03); AT01 refusals (MP11c2)                                                                  |

**Gap:** these steps were proven by separate runs, not traced with one set of IDs through a single run. Each link between steps is covered by the shared store contracts (generations, revisions, audit), which every suite above exercises.

## Failure drills (D6)

| Drill                                         | Proven by                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Database unreachable during Save or Make live | App maps store errors to "unavailable" or "uncertain" without claiming success (MP06, MP08 unit tests) |
| Audit write fails                             | The whole change rolls back, for all 22 audited actions (MP11c1)                                       |
| Deploy hook fails or refresh never verifies   | Visible delivery states and manual retry (MP08b2b)                                                     |
| Auth unavailable at staff sign-in             | Staff gate "temporarily unavailable" state (MP03)                                                      |
| MFA session at aal1 for a staff action        | Refused (MP03 proofs suite)                                                                            |
| Stale cache after withdraw                    | Observed refresh after withdraw (MP08)                                                                 |
| Scheduler paused with a due item              | Paused scheduler does not run (MP08c2); hosted scheduler paused at version 8                           |

## Import, restore and export (D7)

- Importer and parity (MP05).
- Partner import parity (MP09d2).
- Generation restore drills (MP08).
- Snapshot format 2 (MP07).

**Not verified by me:** hosted database backups and their retention, which depend on the Supabase plan. The owner can confirm this in the Supabase dashboard; MP12 records it as an owner fact or an open item.
