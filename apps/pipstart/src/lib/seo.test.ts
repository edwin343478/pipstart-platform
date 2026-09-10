import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { JsonLd } from "../components/json-ld";
import { createPageMetadata, seoEntries, siteUrl } from "./seo";

describe("PipStart SEO infrastructure", () => {
  it("gives every registered public route unique metadata", () => {
    const paths = seoEntries.map((entry) => entry.path);
    const titles = seoEntries.map((entry) => entry.title);
    const descriptions = seoEntries.map((entry) => entry.description);

    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);

    for (const entry of seoEntries) {
      const metadata = createPageMetadata(entry.path);
      expect(metadata.alternates?.canonical).toBe(entry.path);
      expect(metadata.openGraph?.url).toBe(entry.path);
      expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    }
  });

  it("publishes every registered route in the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const entry of seoEntries) {
      expect(urls).toContain(new URL(entry.path, siteUrl).href);
    }
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("allows public pages, protects APIs, and advertises the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
      sitemap: `${siteUrl}/sitemap.xml`,
    });
  });

  it("escapes structured data before rendering it into HTML", () => {
    const markup = renderToStaticMarkup(
      createElement(JsonLd, {
        data: { name: "PipStart", unsafe: "</script>" },
      }),
    );

    expect(markup).toContain('type="application/ld+json"');
    expect(markup).toContain("\\u003c/script>");
    expect(markup).not.toContain("</script></script>");
  });
});
