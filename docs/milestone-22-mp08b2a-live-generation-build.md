# M22 MP08b2a — live generation in the build

## Source scope

Owner-run patch following applied MP08b1 (Publication panel). A production build can now read the live publication generation for chosen content groups, which is the delivery half of "publish = new generation + new deployment". **Nothing is switched by default:** with `PIPSTART_STORE_FAMILIES` unset, the build makes no network call and every page reads code exactly as before. Switching a group is MP08d's controlled cutover.

### Per-group authority

`PIPSTART_STORE_FAMILIES` lists the groups that read the store:

- `analysis`: analysis posts (the pilot);
- `curriculum`: courses, modules, lessons and quizzes, which switch together because they depend on each other.

Unknown values stop the build. A switched group reads only the deployment's live generation, and is allowed in Production. The local snapshot source (`PIPSTART_CONTENT_SOURCE=snapshot`) still serves every group outside Production only, and is still refused in Production.

### Build step

`scripts/fetch-live-generation.mjs` now runs before `next build`.

- **With no group switched:** it does nothing and removes any stale file.
- **Otherwise:** it reads the live generation through `pipstart_publication_snapshot` with `SUPABASE_SECRET_KEY` (the RPC refuses a generation that does not match its seal). It then writes `.generated/live-generation.json` atomically (git-ignored), and the content loader verifies every item and quiz version again as it reads the file.

Any failure stops the build — a missing key, a non-HTTPS URL, a refused or malformed reply — so the current deployment stays live. Git is never a silent fallback for a switched group, and the key is never printed.

### Delivery support

- The generation file is traced into server functions, so server-rendered routes read the same generation as the static pages.
- The Turborepo build task now keys on `PIPSTART_STORE_FAMILIES` and `VERCEL_DEPLOYMENT_ID`, so a deploy-hook rebuild of an unchanged commit is never served from a cached build with an older generation. `SUPABASE_SECRET_KEY` is passed through to the build step without entering the cache key.
- `/live-generation.json` (static, public) states which generation the deployment was built from: the number, its seal and the switched groups, never content. The anonymous delivery check (MP08b2b) compares it with the store's live generation.

## Verification and owner application

- **Unit tests:**
  - group parsing, and the exact file format with its refusals;
  - fail-closed reads;
  - the fetch step: no-op, exact RPC call with the key, atomic write, and five ways to stop the build;
  - in a Production-mode build with `analysis` switched, analysis posts come from the generation (a withdrawn post is absent) while the curriculum stays code;
  - the snapshot source is still refused in Production;
  - the endpoint reports the generation, or nothing.
- **Preparation checks:** see the packet's preparation results for the full unit suite, both TypeScript configurations, lint, formatting, the production webpack build (with the new build step as a no-op) and the public-bundle check.
- **Not yet proven:** a connected build against a real published generation on Vercel. It belongs to MP08d (measured visibility on a staging deployment before any cutover).
- No migration, account, hosted setting, flag, commit or push.

Next: MP08b2b — the deploy-hook trigger after each publication and the "Check live site" verification.
