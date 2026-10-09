import { describe, expect, it } from "vitest";
import { providers } from "../content/providers";
import { providerLinks } from "../content/provider-links";
import {
  isProviderDate,
  safeProviderUrl,
  validateProviderDirectory,
  publishedProviders,
  providerReviewState,
  resolveProviderLink,
  type Provider,
  type ProviderLink,
} from "./provider-directory";
const now = new Date("2026-10-09T12:00:00Z");
const provider = (): Provider => structuredClone(providers[0]!);
const link = (): ProviderLink => structuredClone(providerLinks[0]!);
describe("M19.1 provider foundation", () => {
  it("validates source-backed listing facts without inventing country eligibility", () => {
    expect(() =>
      validateProviderDirectory(providers, providerLinks),
    ).not.toThrow();
    expect(providerReviewState(providers[0]!, now)).toBe("current");
    expect(providers[0]!.availability).toMatchObject({
      status: "unknown",
      allowed: [],
      blocked: [],
    });
    expect(providers[0]!.review.reviewedAt).toBe("2026-10-09");
    expect(providers[0]!.review.previousListingDate).toBeNull();
    expect(
      providers[0]!.facts.every(
        (fact) => fact.verification === "verified" && fact.source !== null,
      ),
    ).toBe(true);
  });
  it.each([
    "",
    "2026-99-99",
    "2026-02-30",
    "not-a-date",
    "2026-1-1",
    "2026-13-01",
  ])("rejects malformed calendar date %s", (date) =>
    expect(isProviderDate(date)).toBe(false),
  );
  it.each([
    "javascript:alert(1)",
    "http://t.deriv.link",
    "//t.deriv.link",
    "https://t.deriv.link.evil.test",
    "https://t.deriv.link@evil.test",
    "https://user:pass@t.deriv.link",
    "https://t.deriv.link:444",
    "https://evil.test/?next=https://t.deriv.link",
  ])("rejects unsafe or non-allowlisted destination %s", (url) =>
    expect(safeProviderUrl(url, ["t.deriv.link"])).toBe(false),
  );
  it("preserves the existing attribution parameters exactly", () => {
    expect(
      resolveProviderLink("deriv", providers, providerLinks, now)?.url,
    ).toBe(
      "https://t.deriv.link?t=QLBEVQ6ZWEHK&custom2=845cb31d-0dee-467c-bc18-9faa34f26a32",
    );
  });
  it.each([
    "unknown",
    "__proto__",
    "constructor",
    "deriv/other",
    "https://evil.test",
  ])("unknown ids cannot redirect: %s", (id) =>
    expect(resolveProviderLink(id, providers, providerLinks, now)).toBeNull(),
  );
  it("inactive links cannot redirect", () => {
    const l = link();
    l.active = false;
    expect(resolveProviderLink("deriv", providers, [l], now)).toBeNull();
  });
  it("expiry is exclusive on the expiry date, not the following day", () => {
    const l = link();
    l.expiresAt = "2026-10-09";
    expect(resolveProviderLink("deriv", providers, [l], now)).toBeNull();
    expect(
      resolveProviderLink(
        "deriv",
        providers,
        [l],
        new Date("2026-10-08T23:59:59Z"),
      ),
    ).not.toBeNull();
  });
  it.each(["draft", "suspended"] as const)(
    "a %s provider cannot redirect",
    (status) => {
      const p = provider();
      p.status = status;
      expect(resolveProviderLink("deriv", [p], providerLinks, now)).toBeNull();
    },
  );
  it("overdue reviews block the action rather than promising perpetual verification", () => {
    const p = provider();
    p.review = {
      status: "verified",
      reviewedAt: "2026-09-01",
      expiresAt: "2026-10-09",
      previousListingDate: null,
      sources: [
        { url: "https://example.com/evidence", checkedAt: "2026-09-01" },
      ],
    };
    expect(providerReviewState(p, now)).toBe("overdue");
    expect(resolveProviderLink("deriv", [p], providerLinks, now)).toBeNull();
    expect(providerReviewState(p, new Date("2026-10-08"))).toBe("current");
  });
  it("alphabetical order is independent of affiliate flags and input order", () => {
    const a = {
      ...provider(),
      id: "alpha",
      name: "Alpha",
      relationship: "none" as const,
      linkId: null,
    };
    const z = { ...provider(), id: "zeta", name: "Zeta" };
    const sorted = publishedProviders([z, a], "forex-broker").map((p) => p.id);
    expect(sorted).toEqual(["alpha", "zeta"]);
    expect(
      publishedProviders(
        [
          { ...a, relationship: "affiliate" },
          { ...z, relationship: "none" },
        ],
        "forex-broker",
      ).map((p) => p.id),
    ).toEqual(sorted);
  });
  it("draft, suspended and exchange records do not leak into the broker directory", () => {
    expect(
      publishedProviders(
        [
          { ...provider(), status: "draft" },
          { ...provider(), status: "suspended" },
          { ...provider(), kind: "crypto-exchange" },
        ],
        "forex-broker",
      ),
    ).toEqual([]);
  });
  it("non-affiliate providers need no affiliate relationship or link", () => {
    const p = { ...provider(), relationship: "none" as const, linkId: null };
    expect(() => validateProviderDirectory([p], [])).not.toThrow();
  });
  it.each([
    "duplicate-provider",
    "duplicate-link",
    "unsafe-link",
    "orphan-link",
    "mismatch",
    "bad-review",
    "bad-fact",
    "unknown-countries",
    "contradicting-countries",
    "bad-image",
  ] as const)("rejects inconsistent source records: %s", (issue) => {
    const p = provider(),
      l = link();
    if (issue === "duplicate-provider")
      return expect(() => validateProviderDirectory([p, p], [l])).toThrow();
    if (issue === "duplicate-link")
      return expect(() => validateProviderDirectory([p], [l, l])).toThrow();
    if (issue === "unsafe-link") l.url = "javascript:alert(1)";
    if (issue === "orphan-link") l.providerId = "other";
    if (issue === "mismatch") l.relationship = "none";
    if (issue === "bad-review") p.review.sources = [];
    if (issue === "bad-fact")
      p.facts = [
        {
          label: "Regulator",
          value: "Claim",
          verification: "verified",
          source: null,
        },
      ];
    if (issue === "unknown-countries") p.availability.allowed = ["KE"];
    if (issue === "contradicting-countries")
      p.availability = {
        status: "verified",
        allowed: ["KE"],
        blocked: ["KE"],
        source: {
          url: "https://example.com/evidence",
          checkedAt: "2026-09-01",
        },
      };
    if (issue === "bad-image")
      p.image = {
        src: "/brokers/../secret.svg",
        alt: "image",
        width: 1,
        height: 1,
      };
    expect(() => validateProviderDirectory([p], [l])).toThrow();
  });
});
