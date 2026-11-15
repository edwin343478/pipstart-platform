# MP09d2: partner import

- Migration: `20261117090000_pipstart_m22_partner_import.sql`
- SQL suite: `apps/pipstart/scripts/test-m22-partner-import.sql`
- Generator: `apps/pipstart/src/lib/content/import/partner-import.ts`

This patch requires MP09a and MP09b. It brings the deployment register (`content/providers.ts` and `content/provider-links.ts`) into the editorial store byte-exact. Public pages keep reading the register until the Owner switches the `partners` store group.

## Functions

Both functions are operator-only: no API role can call them. They are run from the SQL Editor by the Owner.

- **`import_partner_policy(id, kind, value, source)`** records a partner's risk notice or a link's approved hosts as policy version 1, with the same shape rules as the Owner policy RPC. It returns one of:
  - `created`;
  - `unchanged`, when the current policy already holds that value;
  - `conflict`, when the Owner has set a different policy. Nothing is written.
- **`import_partner_item(id, family, parent, body, source, expected sha)`** imports a partner (`partner:<slug>`) or its one link (`link:<slug>`). It returns `created`, `unchanged`, `updated` or `conflict`, as the MP05 import does.
  - The revision is recorded as approved with an `imported` decision, provenance and an audit row.
  - Any staff edit or trash since the last import makes it a conflict.
  - A link must already be on its approved hosts.
  - A partner has at most one link.

Every import requires exactly one active Owner and is attributed to that Owner. Making the imported content live is still the Owner's action in the publication panel: first the partner, then its link.

## Generator

`partnerImportManifest()` produces four steps for Deriv, in order:

1. the risk notice;
2. `partner:deriv`;
3. the approved host `t.deriv.link`;
4. `link:deriv`.

Each body is the register record without its identity, status, link and risk notice. The link URL keeps its attribution parameters byte for byte. `partnerImportSql()` writes one guarded statement per step and stops on any conflict.

## Proof

- **Unit tests:**
  - the step order and values;
  - jsonb hashes;
  - the sealed partners section built from the manifest reads back as exactly today's register through `parsePartnerSnapshot`;
  - refusals of unpublished, unpaired or extra links;
  - SQL shape.
- **SQL suite:**
  - grants;
  - the single-Owner rule;
  - identity, source and shape refusals;
  - the approved-hosts trigger;
  - one link per partner;
  - repeats and drift;
  - Owner publication of imported content, sealed with its frozen policy;
  - conflicts that leave staff work in place;
  - exact audit.
- **Consolidated verifier:** 47 inputs, with the `partnerImportStaged` and `partnerImportHead` gates.
