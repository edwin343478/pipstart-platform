# MP09a: partner store and protected policy

Migration `20261116090000_pipstart_m22_partner_store.sql`; suite `apps/pipstart/scripts/test-m22-partner-store.sql`.

This patch changes the database only. Public pages still read partners from `content/providers.ts` and `content/provider-links.ts`; the build adapter is MP09b.

## What it adds

- **Families.** `partner` (no parent, no learning path) and `link` (child of exactly one partner). Use the identities `partner:<id>` and `link:<id>`; MP09b maps `link:deriv` to `/go/deriv`.
- **Partner body.** `metadata` (title, shortName, kind, brand), plus `relationship`, `summary`, `facts`, `fees`, `support`, `review`, `availability`, `entities`, `payments` and `image`, with strict keys. The database validates HTTPS sources, real dates and country/currency codes. A partner body cannot carry a risk notice.
- **Link body.** `metadata.title`, `url`, `active` and `expiresAt`, with strict keys. The URL must be HTTPS with a lowercase public host and no credentials, port or whitespace. A link body cannot carry hosts.
- **Owner-only policy** (`pipstart_partner_policy_set`). It records a partner's risk notice and a link's one to five approved hosts.
  - Policy rows are append-only versions, use compare-and-set (`PT409` when stale) and are audited as `policy`.
  - Staff who may read the partner can read the current policy (`pipstart_partner_policy`). It contains no secrets.
- **Enforcement.**
  - Every link revision must use one of its current approved hosts, or it is refused with `22023`.
  - Every publication, withdrawal and restore rechecks the whole generation. A link needs its partner to be live; a partner needs a risk notice; a link destination must still be on the approved hosts. Otherwise it is refused with `55000`.
  - Each generation freezes the policy versions it used, in `generation_partner_policies`.
  - If the Owner narrows a link's hosts while the old destination is live, publication stops until that link is revoked or corrected.
- **Capabilities.** Editorial actions on partner content map to the partner capabilities.

  | Editorial action | Capability needed                   |
  | ---------------- | ----------------------------------- |
  | read             | `partner.read`                      |
  | write, submit    | `partner.write`                     |
  | trash            | `partner.trash`                     |
  | restore          | `partner.restore`                   |
  | withdraw a link  | `content.withdraw` or `link.revoke` |

  An assigned Affiliate Manager can create and edit partners and links and revoke links. Only the Owner approves (single-person policy) and sets policy. An Editor or the Owner publishes.

## Proof

The consolidated verifier (`verify-m22-mp03.mjs`, 43 inputs) ran in a disposable container and passed, including the new `partnerStoreStaged` and `partnerStoreHead` gates. The suite covers:

- grants;
- Owner-only policy and its shapes;
- immutability of policy rows;
- the Affiliate Manager's assignment scope;
- refusals for unsafe or out-of-policy links, risk notices and hosts in bodies, and author or unassigned access;
- live-partner, risk-notice and narrowed-host refusals on publish and restore;
- link revocation by an Affiliate Manager;
- byte-exact Deriv attribution URL parity;
- sealed snapshots still verifying after later policy versions;
- complete audit coverage.

These are SQL Auth stubs, not hosted acceptance. The hosted migration follows in MP09d.
