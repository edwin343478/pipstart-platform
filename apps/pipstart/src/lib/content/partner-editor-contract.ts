import type { ActionLimited } from "./staff-action-limit";
// M22 MP09c: the partner and link editor's shapes, shared by the browser and the server. The rules
// mirror the store (MP09a); the store stays the authority and rechecks everything. One link per
// partner: partner:<slug> owns link:<slug>, served at /go/<slug>.

export type PartnerFact = {
  label: string;
  value: string;
  verification: "pending" | "verified";
  sourceUrl: string;
  checkedAt: string;
};
export type PartnerFields = {
  name: string;
  shortName: string;
  kind: "forex-broker" | "crypto-exchange";
  brand: "deriv" | "neutral";
  relationship: "affiliate" | "none";
  summary: string;
  reviewStatus: "pending" | "verified";
  reviewedAt: string;
  expiresAt: string;
  /** One source per line: "https://… YYYY-MM-DD". */
  reviewSources: string;
  facts: PartnerFact[];
};
export type LinkFields = {
  title: string;
  url: string;
  active: boolean;
  expiresAt: string;
};
type Base = { baseRevision: number; baseSha256: string; reason: string };
export type PartnerEditorInput =
  | { kind: "load"; id: string }
  | { kind: "read-policy"; id: string }
  | {
      kind: "create-partner";
      slug: string;
      fields: PartnerFields;
      reason: string;
    }
  | ({ kind: "save-partner"; slug: string; fields: PartnerFields } & Base)
  | { kind: "create-link"; slug: string; fields: LinkFields; reason: string }
  | ({ kind: "save-link"; slug: string; fields: LinkFields } & Base)
  | {
      kind: "policy";
      id: string;
      expectedVersion: number;
      riskNotice: string | null;
      allowedHosts: string[] | null;
      reason: string;
    };
export type PartnerPolicyView = {
  version: number;
  riskNotice: string | null;
  allowedHosts: string[];
};
type ViewBase = {
  slug: string;
  revision: number;
  bodySha256: string;
  state: string;
  trashed: boolean;
  policy: PartnerPolicyView;
};
export type PartnerEditorView =
  | ({ kind: "partner"; fields: PartnerFields; hasLink: boolean } & ViewBase)
  | ({ kind: "link"; fields: LinkFields } & ViewBase);
export type PartnerEditorResult =
  | ActionLimited
  | { kind: "ready"; view: PartnerEditorView }
  | { kind: "policy"; policy: PartnerPolicyView }
  | { kind: "saved"; id: string; revision: number }
  | { kind: "policy-saved"; id: string; version: number }
  | { kind: "invalid" | "denied" | "unavailable" | "conflict" | "uncertain" };

export const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const exact = (v: Record<string, unknown>, keys: string) =>
  Object.keys(v).sort().join(",") === keys;
const text = (v: unknown, max: number, required = false): v is string =>
  typeof v === "string" &&
  v === v.trim() &&
  [...v].length <= max &&
  (!required || v.length > 0) &&
  !/[\u0000-\u001f\u007f]/.test(v);
export const partnerSlug = (v: unknown): v is string =>
  typeof v === "string" &&
  v.length <= 60 &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
export const partnerItemId = (v: unknown): v is string =>
  typeof v === "string" &&
  /^(partner|link):/.test(v) &&
  partnerSlug(v.slice(v.indexOf(":") + 1));
export const isoDate = (v: unknown): v is string => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + "T00:00:00Z");
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v;
};
const host =
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
export const hostName = (v: unknown): v is string =>
  typeof v === "string" && host.test(v);
/** Lowercase public host of an https URL with no credentials, port or whitespace; else null. */
export function httpsHost(v: unknown): string | null {
  if (
    typeof v !== "string" ||
    v.length < 12 ||
    v.length > 2048 ||
    /[\s\u0000-\u001f\u007f]/.test(v)
  )
    return null;
  const m = /^https:\/\/([^/?#]+)(?:[/?#].*)?$/.exec(v);
  return m && host.test(m[1]) ? m[1] : null;
}
/** Parses the review-sources text: one "URL DATE" per line. Null when any line is malformed. */
export function parseSources(
  v: string,
): { url: string; checkedAt: string }[] | null {
  const lines = v
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length > 50) return null;
  const out: { url: string; checkedAt: string }[] = [];
  for (const line of lines) {
    const [url, checkedAt, ...rest] = line.split(/\s+/);
    if (rest.length || !httpsHost(url) || !isoDate(checkedAt)) return null;
    out.push({ url, checkedAt });
  }
  return out;
}
function validFact(v: unknown): v is PartnerFact {
  return (
    object(v) &&
    exact(v, "checkedAt,label,sourceUrl,value,verification") &&
    text(v.label, 100, true) &&
    text(v.value, 500) &&
    ["pending", "verified"].includes(String(v.verification)) &&
    (v.sourceUrl === ""
      ? v.checkedAt === ""
      : !!httpsHost(v.sourceUrl) && isoDate(v.checkedAt)) &&
    (v.verification !== "verified" || (v.value !== "" && v.sourceUrl !== ""))
  );
}
/** Plain-language problems with partner fields; empty when they can be saved. */
export function partnerProblems(v: PartnerFields): string[] {
  const p: string[] = [];
  if (!text(v.name, 200, true)) p.push("Give the partner a name.");
  if (!text(v.shortName, 60, true)) p.push("Give a short name.");
  if (!text(v.summary, 2000, true)) p.push("Write a summary.");
  const sources = parseSources(v.reviewSources);
  if (!sources)
    p.push(
      "Each review source must be one line: an https link, a space, then a date like 2026-10-09.",
    );
  if (v.reviewedAt !== "" && !isoDate(v.reviewedAt))
    p.push("Reviewed date must be a real date.");
  if (v.expiresAt !== "" && !isoDate(v.expiresAt))
    p.push("Review expiry must be a real date.");
  if (
    v.reviewStatus === "verified" &&
    (!isoDate(v.reviewedAt) ||
      !isoDate(v.expiresAt) ||
      v.expiresAt <= v.reviewedAt ||
      !sources?.length)
  )
    p.push(
      "A verified review needs a reviewed date, a later expiry date and at least one source.",
    );
  if (v.facts.length > 50) p.push("Keep to 50 facts.");
  v.facts.forEach((f, i) => {
    if (!validFact(f))
      p.push(
        `Fact ${i + 1}: needs a label; a source needs an https link and a date; a verified fact needs a value and a source.`,
      );
  });
  return p;
}
export function validPartnerFields(v: unknown): v is PartnerFields {
  return (
    object(v) &&
    exact(
      v,
      "brand,expiresAt,facts,kind,name,relationship,reviewSources,reviewStatus,reviewedAt,shortName,summary",
    ) &&
    ["forex-broker", "crypto-exchange"].includes(String(v.kind)) &&
    ["deriv", "neutral"].includes(String(v.brand)) &&
    ["affiliate", "none"].includes(String(v.relationship)) &&
    ["pending", "verified"].includes(String(v.reviewStatus)) &&
    typeof v.name === "string" &&
    typeof v.shortName === "string" &&
    typeof v.summary === "string" &&
    typeof v.reviewedAt === "string" &&
    typeof v.expiresAt === "string" &&
    typeof v.reviewSources === "string" &&
    v.reviewSources.length <= 10000 &&
    Array.isArray(v.facts) &&
    v.facts.every(validFact) &&
    partnerProblems(v as PartnerFields).length === 0
  );
}
/** Plain-language problems with link fields against the Owner-approved hosts. */
export function linkProblems(v: LinkFields, allowedHosts: string[]): string[] {
  const p: string[] = [];
  if (!text(v.title, 200, true)) p.push("Give the link a button label.");
  const h = httpsHost(v.url);
  if (!h)
    p.push(
      "The destination must be an https link with a lowercase host, no login details and no port.",
    );
  else if (!allowedHosts.includes(h))
    p.push(
      allowedHosts.length
        ? `The destination host must be one of the Owner-approved hosts: ${allowedHosts.join(", ")}.`
        : "The Owner has not approved any host for this link yet.",
    );
  if (v.expiresAt !== "" && !isoDate(v.expiresAt))
    p.push("Expiry must be a real date.");
  return p;
}
export function validLinkFields(v: unknown): v is LinkFields {
  return (
    object(v) &&
    exact(v, "active,expiresAt,title,url") &&
    typeof v.title === "string" &&
    text(v.title, 200, true) &&
    !!httpsHost(v.url) &&
    typeof v.active === "boolean" &&
    (v.expiresAt === "" || isoDate(v.expiresAt))
  );
}
export function validPartnerEditorInput(v: unknown): v is PartnerEditorInput {
  if (!object(v)) return false;
  const base = (x: Record<string, unknown>) =>
    Number.isSafeInteger(x.baseRevision) &&
    Number(x.baseRevision) >= 1 &&
    Number(x.baseRevision) < 2147483647 &&
    typeof x.baseSha256 === "string" &&
    /^[a-f0-9]{64}$/.test(x.baseSha256);
  switch (v.kind) {
    case "load":
    case "read-policy":
      return exact(v, "id,kind") && partnerItemId(v.id);
    case "create-partner":
      return (
        exact(v, "fields,kind,reason,slug") &&
        partnerSlug(v.slug) &&
        validPartnerFields(v.fields) &&
        text(v.reason, 200, true)
      );
    case "save-partner":
      return (
        exact(v, "baseRevision,baseSha256,fields,kind,reason,slug") &&
        partnerSlug(v.slug) &&
        base(v) &&
        validPartnerFields(v.fields) &&
        text(v.reason, 200, true)
      );
    case "create-link":
      return (
        exact(v, "fields,kind,reason,slug") &&
        partnerSlug(v.slug) &&
        validLinkFields(v.fields) &&
        text(v.reason, 200, true)
      );
    case "save-link":
      return (
        exact(v, "baseRevision,baseSha256,fields,kind,reason,slug") &&
        partnerSlug(v.slug) &&
        base(v) &&
        validLinkFields(v.fields) &&
        text(v.reason, 200, true)
      );
    case "policy":
      return (
        exact(v, "allowedHosts,expectedVersion,id,kind,reason,riskNotice") &&
        partnerItemId(v.id) &&
        Number.isSafeInteger(v.expectedVersion) &&
        Number(v.expectedVersion) >= 0 &&
        text(v.reason, 200, true) &&
        (String(v.id).startsWith("partner:")
          ? v.allowedHosts === null && text(v.riskNotice, 1000, true)
          : v.riskNotice === null &&
            Array.isArray(v.allowedHosts) &&
            v.allowedHosts.length >= 1 &&
            v.allowedHosts.length <= 5 &&
            v.allowedHosts.every(hostName) &&
            new Set(v.allowedHosts).size === v.allowedHosts.length)
      );
    default:
      return false;
  }
}

type Source = { url: string; checkedAt: string };
const src = (v: unknown): Source | null =>
  object(v) && typeof v.url === "string" && typeof v.checkedAt === "string"
    ? { url: v.url, checkedAt: v.checkedAt }
    : null;
/** The editable fields of a stored partner body; null when its shape is not the store's. */
export function projectPartner(
  body: Record<string, unknown>,
): PartnerFields | null {
  const m = body.metadata,
    r = body.review;
  if (
    !object(m) ||
    !object(r) ||
    !Array.isArray(r.sources) ||
    !Array.isArray(body.facts)
  )
    return null;
  const facts: PartnerFact[] = [];
  for (const f of body.facts) {
    if (!object(f)) return null;
    const s = f.source === null ? null : src(f.source);
    if (f.source !== null && !s) return null;
    facts.push({
      label: String(f.label ?? ""),
      value: f.value === null ? "" : String(f.value ?? ""),
      verification: f.verification === "verified" ? "verified" : "pending",
      sourceUrl: s?.url ?? "",
      checkedAt: s?.checkedAt ?? "",
    });
  }
  const sources = r.sources.map(src);
  if (sources.some((s) => !s)) return null;
  const fields: PartnerFields = {
    name: String(m.title ?? ""),
    shortName: String(m.shortName ?? ""),
    kind: m.kind === "crypto-exchange" ? "crypto-exchange" : "forex-broker",
    brand: m.brand === "deriv" ? "deriv" : "neutral",
    relationship: body.relationship === "affiliate" ? "affiliate" : "none",
    summary: String(body.summary ?? ""),
    reviewStatus: r.status === "verified" ? "verified" : "pending",
    reviewedAt: typeof r.reviewedAt === "string" ? r.reviewedAt : "",
    expiresAt: typeof r.expiresAt === "string" ? r.expiresAt : "",
    reviewSources: (sources as Source[])
      .map((s) => `${s.url} ${s.checkedAt}`)
      .join("\n"),
    facts,
  };
  return fields;
}
/** A stored partner body with the editor's fields applied; everything else is preserved exactly. */
export function partnerBody(
  fields: PartnerFields,
  previous: Record<string, unknown> | null,
): Record<string, unknown> {
  const prevReview = previous && object(previous.review) ? previous.review : {};
  return {
    metadata: {
      title: fields.name,
      shortName: fields.shortName,
      kind: fields.kind,
      brand: fields.brand,
    },
    relationship: fields.relationship,
    summary: fields.summary,
    facts: fields.facts.map((f) => ({
      label: f.label,
      value: f.value === "" ? null : f.value,
      verification: f.verification,
      source:
        f.sourceUrl === ""
          ? null
          : { url: f.sourceUrl, checkedAt: f.checkedAt },
    })),
    fees: previous?.fees ?? [],
    support: previous?.support ?? [],
    review: {
      status: fields.reviewStatus,
      reviewedAt: fields.reviewedAt || null,
      expiresAt: fields.expiresAt || null,
      previousListingDate: prevReview.previousListingDate ?? null,
      sources: parseSources(fields.reviewSources) ?? [],
    },
    availability: previous?.availability ?? {
      status: "unknown",
      allowed: [],
      blocked: [],
      source: null,
    },
    entities: previous?.entities ?? [],
    payments: previous?.payments ?? [],
    image: previous && "image" in previous ? previous.image : null,
  };
}
export function projectLink(body: Record<string, unknown>): LinkFields | null {
  if (
    !object(body.metadata) ||
    typeof body.url !== "string" ||
    typeof body.active !== "boolean"
  )
    return null;
  return {
    title: String(body.metadata.title ?? ""),
    url: body.url,
    active: body.active,
    expiresAt: typeof body.expiresAt === "string" ? body.expiresAt : "",
  };
}
export const linkBody = (f: LinkFields) => ({
  metadata: { title: f.title },
  url: f.url,
  active: f.active,
  expiresAt: f.expiresAt || null,
});
export const emptyPartnerFields = (): PartnerFields => ({
  name: "",
  shortName: "",
  kind: "forex-broker",
  brand: "neutral",
  relationship: "affiliate",
  summary: "",
  reviewStatus: "pending",
  reviewedAt: "",
  expiresAt: "",
  reviewSources: "",
  facts: [],
});
