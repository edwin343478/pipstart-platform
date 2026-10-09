import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { providers } from "../../content/providers";
import { providerLinks } from "../../content/provider-links";
import { resolveProviderLink } from "../../lib/provider-directory";
import ProviderCard from "./provider-card";
const now = new Date("2026-10-09T12:00:00Z");
describe("M19.1 reusable provider card", () => {
  it("pairs the affiliate action with disclosure, warning and review status", () => {
    const p = providers[0]!;
    const markup = renderToStaticMarkup(
      <ProviderCard provider={p} visitHref="/go/deriv" now={now} />,
    );
    expect(markup).toContain('rel="sponsored noopener noreferrer"');
    expect(markup).toContain('aria-label="Affiliate disclosure"');
    expect(markup.indexOf("Risk notice:")).toBeLessThan(
      markup.indexOf('href="/go/deriv"'),
    );
    expect(markup.indexOf("The Deriv visit link")).toBeLessThan(
      markup.indexOf('href="/go/deriv"'),
    );
    expect(markup).toContain("Recommended broker");
    expect(markup).toContain("Verified listing details:");
    expect(markup).toContain('dateTime="2026-10-09"');
    expect(markup).toContain("Availability depends on your country");
    expect(markup).toContain("opening or funding a live account is optional");
    expect(markup).not.toContain("verification pending");
    expect(markup).not.toContain("not reverified");
    expect(markup).not.toContain("Previous listing date:");
    expect(markup).not.toContain("Featured broker");
    expect(markup).not.toContain('href="https://t.deriv.link');
  });
  it("the same card works for a non-affiliate provider with no creative", () => {
    const p = {
      ...providers[0]!,
      id: "independent",
      name: "Independent provider",
      shortName: "Independent",
      relationship: "none" as const,
      linkId: null,
      brand: "neutral" as const,
      image: null,
    };
    const markup = renderToStaticMarkup(
      <ProviderCard provider={p} visitHref={null} now={now} />,
    );
    expect(markup).toContain("No affiliate relationship.");
    expect(markup).not.toContain("sponsored");
    expect(markup).toContain("grid-template-columns:minmax(0, 1fr)");
    expect(markup).toContain("Visit link unavailable.");
  });
  it("disabled register entry removes the visit action", () => {
    const p = providers[0]!;
    const resolved = resolveProviderLink(
      "deriv",
      providers,
      [{ ...providerLinks[0]!, active: false }],
      now,
    );
    const markup = renderToStaticMarkup(
      <ProviderCard
        provider={p}
        visitHref={resolved ? "/go/deriv" : null}
        now={now}
      />,
    );
    expect(markup).not.toContain('href="/go/deriv"');
    expect(markup).toContain("Visit link unavailable.");
  });
});
