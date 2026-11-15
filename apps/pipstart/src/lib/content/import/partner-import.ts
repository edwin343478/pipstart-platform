import "server-only";

// M22 MP09d2 partner import: the deployment register's published partners and their one link as
// store content, plus each partner's risk notice and each link's approved hosts as their first
// Owner policy. Steps are in import order: a policy before the content it governs, a partner before
// its link. Bodies are the register records minus identity, status, link and the Owner-held risk
// notice, so the MP09b snapshot mapping reproduces the register exactly; the attribution URL is
// kept byte for byte. The SQL calls the operator-only MP09d2 import functions.
import { providerLinks } from "../../../content/provider-links";
import { providers } from "../../../content/providers";
import type { Provider, ProviderLink } from "../../provider-directory";
import { jsonbSha256 } from "../jsonb";

export type PartnerImportStep =
  | {
      seq: number;
      step: "policy";
      id: string;
      kind: "partner" | "link";
      value: { riskNotice: string } | { allowedHosts: string[] };
      sourceRef: string;
    }
  | {
      seq: number;
      step: "item";
      id: string;
      family: "partner" | "link";
      parentId: string | null;
      sourceRef: string;
      body: Record<string, unknown>;
      bodySha256: string;
    };

type StepInput = PartnerImportStep extends infer S
  ? S extends PartnerImportStep
    ? Omit<S, "seq">
    : never
  : never;

/** The partner store body MP09a validates, from a register record. */
export const partnerStoreBody = (p: Provider): Record<string, unknown> => ({
  metadata: {
    title: p.name,
    shortName: p.shortName,
    kind: p.kind,
    brand: p.brand,
  },
  relationship: p.relationship,
  summary: p.summary,
  facts: p.facts,
  fees: p.fees,
  support: p.support,
  review: p.review,
  availability: p.availability,
  entities: p.entities,
  payments: p.payments,
  image: p.image,
});

/** The link store body; its title is the staff label of the public "Visit" button. */
export const linkStoreBody = (
  l: ProviderLink,
  p: Provider,
): Record<string, unknown> => ({
  metadata: { title: "Visit " + p.shortName },
  url: l.url,
  active: l.active,
  expiresAt: l.expiresAt,
});

export async function partnerImportManifest(
  list: readonly Provider[] = providers,
  links: readonly ProviderLink[] = providerLinks,
): Promise<PartnerImportStep[]> {
  const steps: PartnerImportStep[] = [];
  const add = (s: StepInput) =>
    steps.push({ ...s, seq: steps.length + 1 } as PartnerImportStep);
  for (const p of list) {
    if (p.status !== "published")
      throw new Error(`Only published partners are imported: ${p.id}`);
    const own = links.filter((l) => l.providerId === p.id);
    if (own.length > 1)
      throw new Error(`A partner has at most one link: ${p.id}`);
    if ((p.linkId ?? null) !== (own[0]?.id ?? null))
      throw new Error(`Partner and link do not pair: ${p.id}`);
    const partnerId = "partner:" + p.id;
    add({
      step: "policy",
      id: partnerId,
      kind: "partner",
      value: { riskNotice: p.riskNotice },
      sourceRef: `provider-registry:${p.id}/risk-notice`,
    });
    const body = partnerStoreBody(p);
    add({
      step: "item",
      id: partnerId,
      family: "partner",
      parentId: null,
      sourceRef: `provider-registry:${p.id}`,
      body,
      bodySha256: await jsonbSha256(body),
    });
    for (const l of own) {
      if (l.relationship !== p.relationship)
        throw new Error(`Link relationship differs from its partner: ${l.id}`);
      const linkId = "link:" + l.id;
      add({
        step: "policy",
        id: linkId,
        kind: "link",
        value: { allowedHosts: [...l.allowedHosts] },
        sourceRef: `provider-link-registry:${l.id}/allowed-hosts`,
      });
      const linkBody = linkStoreBody(l, p);
      add({
        step: "item",
        id: linkId,
        family: "link",
        parentId: partnerId,
        sourceRef: `provider-link-registry:${l.id}`,
        body: linkBody,
        bodySha256: await jsonbSha256(linkBody),
      });
    }
  }
  if (links.some((l) => !list.some((p) => p.id === l.providerId)))
    throw new Error("A link names a partner that is not imported");
  return steps;
}

const TAG = "$m22partner$";
const lit = (value: string | null) =>
  value === null ? "null" : `'${value.replace(/'/g, "''")}'`;
const json = (value: unknown) => {
  const text = JSON.stringify(value);
  if (text.includes(TAG)) throw new Error("Value contains the SQL quote tag");
  return `${TAG}${text}${TAG}::jsonb`;
};

export function partnerImportStatement(s: PartnerImportStep): string {
  const call =
    s.step === "policy"
      ? `pipstart_editorial_private.import_partner_policy(${lit(s.id)},${lit(s.kind)},${json(s.value)},${lit(s.sourceRef)})`
      : `pipstart_editorial_private.import_partner_item(${lit(s.id)},${lit(s.family)},${lit(s.parentId)},${json(s.body)},${lit(s.sourceRef)},${lit(s.bodySha256)})`;
  return `insert into m22_partner_import_result select ${s.seq},${lit(s.step)},${lit(s.id)},${call};`;
}

/** Ordered import SQL. Safe to re-run: unchanged steps are no-ops; a conflict stops the run. */
export function partnerImportSql(
  steps: readonly PartnerImportStep[],
  manifestSha256: string,
): string {
  return (
    [
      `-- PipStart M22 MP09d2 partner import: ${steps.length} steps, manifest ${manifestSha256}.`,
      "-- Operator-only. Safe to re-run: unchanged steps are no-ops and staff edits are never overwritten.",
      "create temp table if not exists m22_partner_import_result(seq integer primary key, step text not null, item_id text not null, status text not null);",
      "truncate m22_partner_import_result;",
      ...steps.map(partnerImportStatement),
      "do $m22check$ begin if (select count(*) from m22_partner_import_result)<>" +
        steps.length +
        " then raise exception 'Partner import incomplete'; end if;" +
        " if exists(select 1 from m22_partner_import_result where status not in ('created','unchanged','updated')) then raise exception 'Partner import conflict: staff changes were not overwritten'; end if; end $m22check$;",
      "select seq, step, item_id, status from m22_partner_import_result order by seq;",
    ].join("\n") + "\n"
  );
}
