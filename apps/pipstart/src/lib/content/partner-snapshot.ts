// M22 MP09b: the partners section of a sealed publication snapshot (MP09b SQL), read into the
// provider directory's own types. Every entry's body must match its SHA-256, identities must be the
// store's partner:/link: forms, and the Owner policy the generation froze supplies the risk notice
// and approved hosts. Any defect refuses the whole section, so a switched build fails closed.
import "server-only";
import { createHash } from "node:crypto";

import { jsonbText } from "./jsonb";
import {
  validateProviderDirectory,
  type Provider,
  type ProviderLink,
} from "../provider-directory";

export type PartnerDirectory = {
  providers: readonly Provider[];
  links: readonly ProviderLink[];
};

const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const sha256 = (text: string) =>
  createHash("sha256").update(text, "utf8").digest("hex");
const keys = (v: Record<string, unknown>) => Object.keys(v).sort().join(",");
const strip = (id: unknown, prefix: string): string | null =>
  typeof id === "string" &&
  id.startsWith(prefix) &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id.slice(prefix.length))
    ? id.slice(prefix.length)
    : null;

/** Directory from a snapshot's partners section; empty when the generation publishes none. */
export function parsePartnerSnapshot(snapshotText: string): PartnerDirectory {
  const fail = (reason: string): never => {
    throw new Error(`Partner snapshot refused: ${reason}`);
  };
  let data: unknown;
  try {
    data = JSON.parse(snapshotText);
  } catch {
    return fail("not valid JSON");
  }
  if (!object(data)) return fail("not an object");
  if (!("partners" in data)) return { providers: [], links: [] };
  if (!Array.isArray(data.partners) || data.partners.length === 0)
    return fail("partners is not a non-empty list");
  const providers: Provider[] = [];
  const links: ProviderLink[] = [];
  for (const entry of data.partners as unknown[]) {
    if (
      !object(entry) ||
      keys(entry) !==
        "body,bodySha256,id,links,policyVersion,revisionNo,riskNotice"
    )
      fail("a partner entry is malformed");
    const p = entry as Record<string, unknown>;
    const id = strip(p.id, "partner:");
    if (!id) return fail(`invalid partner identity ${String(p.id)}`);
    if (!object(p.body) || p.bodySha256 !== sha256(jsonbText(p.body)))
      fail(`partner ${id}: body does not match its SHA-256`);
    if (typeof p.riskNotice !== "string" || !p.riskNotice.trim())
      fail(`partner ${id}: missing Owner risk notice`);
    if (!Array.isArray(p.links)) fail(`partner ${id}: links is not a list`);
    const body = p.body as Record<string, unknown>;
    const meta = body.metadata as Record<string, unknown>;
    const relationship = body.relationship as Provider["relationship"];
    let linkId: string | null = null;
    for (const raw of p.links as unknown[]) {
      if (
        !object(raw) ||
        keys(raw) !== "allowedHosts,body,bodySha256,id,policyVersion,revisionNo"
      )
        fail(`partner ${id}: a link entry is malformed`);
      const l = raw as Record<string, unknown>;
      const lid = strip(l.id, "link:");
      if (!lid) return fail(`invalid link identity ${String(l.id)}`);
      if (!object(l.body) || l.bodySha256 !== sha256(jsonbText(l.body)))
        fail(`link ${lid}: body does not match its SHA-256`);
      if (
        !Array.isArray(l.allowedHosts) ||
        l.allowedHosts.some((h) => typeof h !== "string")
      )
        fail(`link ${lid}: approved hosts are malformed`);
      if (linkId !== null) fail(`partner ${id}: more than one live link`);
      const lb = l.body as Record<string, unknown>;
      linkId = lid;
      links.push({
        id: lid,
        providerId: id,
        relationship,
        url: lb.url as string,
        allowedHosts: l.allowedHosts as string[],
        active: lb.active as boolean,
        expiresAt: (lb.expiresAt as string | null) ?? null,
      });
    }
    providers.push({
      id,
      name: meta.title as string,
      shortName: meta.shortName as string,
      kind: meta.kind as Provider["kind"],
      brand: meta.brand as Provider["brand"],
      status: "published",
      relationship,
      linkId,
      summary: body.summary as string,
      riskNotice: p.riskNotice as string,
      facts: body.facts as Provider["facts"],
      fees: body.fees as Provider["fees"],
      support: body.support as Provider["support"],
      review: body.review as Provider["review"],
      availability: body.availability as Provider["availability"],
      entities: body.entities as Provider["entities"],
      payments: body.payments as Provider["payments"],
      image: body.image as Provider["image"],
    });
  }
  // The same rules as the deployment register; a revoked link leaves its partner listed without one.
  validateProviderDirectory(providers, links, {
    allowUnlinkedAffiliates: true,
  });
  return { providers, links };
}
