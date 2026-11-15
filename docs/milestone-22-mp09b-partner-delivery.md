# MP09b: partner delivery from the live generation

This patch has a migration (`20261116120000_pipstart_m22_partner_snapshot.sql`), an SQL suite (`apps/pipstart/scripts/test-m22-partner-snapshot.sql`) and application changes. It requires MP09a.

## Snapshot

A generation that publishes partner content gains a `partners` section in its sealed public snapshot. Each partner carries:

- its exact revision body and SHA-256;
- the Owner risk notice frozen with that generation;
- its live link, if any, with the approved hosts frozen with that generation.

The key is added **only** when partner content is published. Every earlier generation's snapshot text, and therefore its seal, is unchanged. The verifier proves this: it seals a generation with the previous function, redefines it in the same rolled-back transaction, and the service read still verifies.

## Site

- `PIPSTART_STORE_FAMILIES` accepts a third group, `partners`. The build fetch step accepts it too.
- `lib/provider-registry.ts` decides what `/brokers` and `/go/[id]` read:
  - when `partners` is switched, they read the deployment's live generation;
  - otherwise (the default), they read the deployment register in `content/`, as before.
- `lib/content/partner-snapshot.ts` maps `partner:<id>` and `link:<id>` back to the directory types. `link:deriv` is served at `/go/deriv`.
  - It refuses any body whose SHA-256 doesn't match, any identity in another form, a missing risk notice, extra fields, or a destination outside its approved hosts.
  - It then runs the same directory validation as the register.
- **A revoked link** leaves its partner listed, still with its disclosure but with no visit button; `/go` returns the existing 404 page.
- **Expiry, `active: false` and an overdue review** are still checked on every request.
- `/go` still redirects only to the stored destination, with `no-store` and `noindex`, and never from request input. There is no tracking.

## Proof

- **Unit tests:**
  - the store mapping reproduces today's Deriv register exactly, including the byte-exact attribution URL;
  - revoked, expired and inactive links fail closed;
  - seven tampering cases are refused;
  - `/go` redirects in store mode, returns 404 for revoked or unknown links, and reads the code register when `partners` is not switched.
- **Full checks:** all tests, both typechecks, lint and the production build pass, and the public-bundle scan is clean.
- **SQL proof:** the consolidated verifier passed with 45 inputs, including the seal-continuity check, in a disposable container.

These are not hosted proofs. The switch happens in MP09d.
