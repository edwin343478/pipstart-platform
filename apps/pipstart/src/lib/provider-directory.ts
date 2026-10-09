export type ProviderSource = { url: string; checkedAt: string };
export type ProviderFact = {
  label: string;
  value: string | null;
  verification: "pending" | "verified";
  source: ProviderSource | null;
};
export type Provider = {
  id: string;
  name: string;
  shortName: string;
  kind: "forex-broker" | "crypto-exchange";
  status: "draft" | "published" | "suspended";
  relationship: "affiliate" | "none";
  linkId: string | null;
  summary: string;
  riskNotice: string;
  facts: readonly ProviderFact[];
  review: {
    status: "pending" | "verified";
    reviewedAt: string | null;
    expiresAt: string | null;
    previousListingDate: string | null;
    sources: readonly ProviderSource[];
  };
  availability: {
    status: "unknown" | "verified";
    allowed: readonly string[];
    blocked: readonly string[];
    source: ProviderSource | null;
  };
  entities: readonly {
    name: string;
    regulator: string | null;
    licence: string | null;
    source: ProviderSource;
  }[];
  fees: readonly ProviderFact[];
  payments: readonly {
    method: string;
    countries: readonly string[];
    currencies: readonly string[];
    source: ProviderSource;
  }[];
  support: readonly ProviderFact[];
  image: { src: string; alt: string; width: number; height: number } | null;
  brand: "deriv" | "neutral";
};
export type ProviderLink = {
  id: string;
  providerId: string;
  relationship: Provider["relationship"];
  url: string;
  allowedHosts: readonly string[];
  active: boolean;
  expiresAt: string | null;
};
const safeId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function isProviderDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function safeProviderUrl(
  value: string,
  allowedHosts?: readonly string[],
): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      (!allowedHosts || allowedHosts.includes(url.hostname))
    );
  } catch {
    return false;
  }
}
function validSource(source: ProviderSource | null): boolean {
  return (
    !!source &&
    safeProviderUrl(source.url) &&
    isProviderDate(source.checkedAt) &&
    source.checkedAt <= new Date().toISOString().slice(0, 10)
  );
}
export function providerReviewState(
  provider: Provider,
  now = new Date(),
): "pending" | "current" | "overdue" {
  if (provider.review.status !== "verified") return "pending";
  if (
    !provider.review.reviewedAt ||
    !provider.review.expiresAt ||
    !isProviderDate(provider.review.reviewedAt) ||
    !isProviderDate(provider.review.expiresAt) ||
    provider.review.reviewedAt > now.toISOString().slice(0, 10)
  )
    return "pending";
  return now.toISOString().slice(0, 10) >= provider.review.expiresAt
    ? "overdue"
    : "current";
}
export function validateProviderDirectory(
  providers: readonly Provider[],
  links: readonly ProviderLink[],
): void {
  const ids = new Set<string>();
  const linkIds = new Set<string>();
  for (const link of links) {
    if (
      !safeId.test(link.id) ||
      linkIds.has(link.id) ||
      !safeId.test(link.providerId) ||
      !["affiliate", "none"].includes(link.relationship) ||
      typeof link.active !== "boolean" ||
      !link.allowedHosts.length ||
      !safeProviderUrl(link.url, link.allowedHosts) ||
      (link.expiresAt !== null && !isProviderDate(link.expiresAt))
    )
      throw new Error("Invalid provider link: " + link.id);
    linkIds.add(link.id);
  }
  for (const provider of providers) {
    if (
      !safeId.test(provider.id) ||
      ids.has(provider.id) ||
      !provider.name.trim() ||
      !provider.shortName.trim() ||
      !["forex-broker", "crypto-exchange"].includes(provider.kind) ||
      !["draft", "published", "suspended"].includes(provider.status) ||
      !["affiliate", "none"].includes(provider.relationship) ||
      !["pending", "verified"].includes(provider.review.status) ||
      !["unknown", "verified"].includes(provider.availability.status) ||
      !provider.summary.trim() ||
      !provider.riskNotice.trim()
    )
      throw new Error("Invalid provider: " + provider.id);
    ids.add(provider.id);
    const dates = [
      provider.review.reviewedAt,
      provider.review.expiresAt,
      provider.review.previousListingDate,
    ];
    if (dates.some((date) => date !== null && !isProviderDate(date)))
      throw new Error("Invalid review date: " + provider.id);
    if (
      provider.review.status === "verified" &&
      (!provider.review.reviewedAt ||
        !provider.review.expiresAt ||
        provider.review.expiresAt <= provider.review.reviewedAt ||
        !provider.review.sources.length ||
        !provider.review.sources.every(validSource))
    )
      throw new Error("Verified review needs dated evidence: " + provider.id);
    for (const fact of [
      ...provider.facts,
      ...provider.fees,
      ...provider.support,
    ]) {
      if (
        !fact.label.trim() ||
        !["pending", "verified"].includes(fact.verification) ||
        (fact.verification === "verified" &&
          (!fact.value?.trim() || !validSource(fact.source))) ||
        (fact.source !== null && !validSource(fact.source))
      )
        throw new Error("Invalid provider fact: " + provider.id);
    }
    if (
      provider.availability.status === "verified" &&
      !validSource(provider.availability.source)
    )
      throw new Error("Availability needs evidence: " + provider.id);
    const countries = [
      ...provider.availability.allowed,
      ...provider.availability.blocked,
    ];
    if (
      countries.some((code) => !/^[A-Z]{2}$/.test(code)) ||
      provider.availability.allowed.some((code) =>
        provider.availability.blocked.includes(code),
      ) ||
      (provider.availability.status === "unknown" && countries.length > 0)
    )
      throw new Error("Invalid country availability: " + provider.id);
    for (const entity of provider.entities) {
      if (!entity.name.trim() || !validSource(entity.source))
        throw new Error("Entity needs evidence: " + provider.id);
    }
    for (const payment of provider.payments) {
      if (
        !payment.method.trim() ||
        !validSource(payment.source) ||
        payment.countries.some((code) => !/^[A-Z]{2}$/.test(code)) ||
        payment.currencies.some((code) => !/^[A-Z]{3}$/.test(code))
      )
        throw new Error("Payment needs evidence: " + provider.id);
    }
    if (
      provider.image &&
      (!/^\/brokers\/[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp|svg)$/.test(
        provider.image.src,
      ) ||
        !provider.image.alt.trim() ||
        !Number.isFinite(provider.image.width) ||
        !Number.isFinite(provider.image.height) ||
        provider.image.width <= 0 ||
        provider.image.height <= 0)
    )
      throw new Error("Invalid provider image: " + provider.id);
    if (provider.linkId !== null) {
      const link = links.find((item) => item.id === provider.linkId);
      if (
        !link ||
        link.providerId !== provider.id ||
        link.relationship !== provider.relationship
      )
        throw new Error("Provider/link mismatch: " + provider.id);
    } else if (provider.relationship === "affiliate")
      throw new Error("Affiliate provider needs a link record: " + provider.id);
  }
  for (const link of links) {
    if (
      !providers.some(
        (provider) =>
          provider.id === link.providerId && provider.linkId === link.id,
      )
    )
      throw new Error("Orphan provider link: " + link.id);
  }
}
export function publishedProviders(
  providers: readonly Provider[],
  kind: Provider["kind"],
): Provider[] {
  return providers
    .filter(
      (provider) => provider.status === "published" && provider.kind === kind,
    )
    .toSorted(
      (a, b) =>
        a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id, "en"),
    );
}
export function resolveProviderLink(
  id: string,
  providers: readonly Provider[],
  links: readonly ProviderLink[],
  now = new Date(),
): ProviderLink | null {
  if (!safeId.test(id)) return null;
  const link = links.find((item) => item.id === id);
  const provider =
    link && providers.find((item) => item.id === link.providerId);
  if (
    !link ||
    !provider ||
    provider.linkId !== id ||
    provider.status !== "published" ||
    link.relationship !== provider.relationship ||
    !link.active ||
    !safeProviderUrl(link.url, link.allowedHosts) ||
    (link.expiresAt !== null &&
      (!isProviderDate(link.expiresAt) ||
        now.toISOString().slice(0, 10) >= link.expiresAt)) ||
    providerReviewState(provider, now) === "overdue"
  )
    return null;
  return link;
}
