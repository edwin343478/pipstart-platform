# MP09d4a: Check live site accepts the partners group

Owner-run patch following MP09d3 (Deriv live in generation 10, `partners` still switched off). It requires MP09b.

## Defect

MP09b added `partners` to the store groups that the build step (`scripts/fetch-live-generation.mjs`) and the site (`lib/content/live-generation.ts`) accept. The delivery check in `lib/content/publication-delivery.ts` kept its own list, `analysis` and `curriculum` only.

With `PIPSTART_STORE_FAMILIES=analysis,curriculum,partners`, **Check live site** would therefore answer "not configured" for every later publication. Each new generation would stay unconfirmed, and the next publication would supersede it.

## Change

- The delivery check takes its accepted groups from `STORE_GROUPS` in `live-generation.ts`, the same list the build and the site use. There is now one list.
- Everything else is unchanged:
  - an empty, unknown, duplicated or malformed list still answers "not configured" before any request;
  - verification still needs the deployment's groups to equal the switched groups exactly (in any order), together with the generation and seal.

## Proof

- **New unit tests:**
  - with all three groups switched, an exact deployment is verified;
  - a deployment missing `partners`, duplicating it, or carrying only `partners` is never verified;
  - `analysis,brokers`, `partners,partners` and `analysis,` are refused before any request.
- **Against the unpatched code,** the first four of these fail. That confirms the defect.
- **Full checks:** formatting, lint, both typechecks, all tests and the production build.

## Not in this patch

The switch itself, which is a Vercel environment change plus one deployment. It is the owner-run MP09d4b packet, after this patch is committed and deployed.
