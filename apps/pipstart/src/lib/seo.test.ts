import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { JsonLd } from "../components/json-ld";
import { publishedLessons } from "../content/lesson-registry";
import { publishedHierarchyRoutes } from "./curriculum";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createDynamicMetadata,
  createDynamicPageMetadata,
  createPageMetadata,
  defaultSocialImage,
  seoEntries,
  siteUrl,
} from "./seo";

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
      expect(metadata.title).toEqual({ absolute: `${entry.title} | PipStart` });
      expect(metadata.alternates?.canonical).toBe(entry.path);
      expect(metadata.openGraph?.url).toBe(entry.path);
      expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
      expect(metadata.openGraph?.images).toEqual([
        expect.objectContaining({
          url: defaultSocialImage,
          width: 1200,
          height: 630,
        }),
      ]);
      expect(metadata.twitter).toMatchObject({ images: [defaultSocialImage] });
    }
  });

  it("builds complete social metadata for dynamic route classes", () => {
    const image = `${siteUrl}/analysis/example/opengraph-image`;
    const metadata = createDynamicMetadata(
      {
        path: "/analysis/example",
        title: "Example",
        description: "Example analysis.",
      },
      image,
    );
    expect(metadata.alternates?.canonical).toBe("/analysis/example");
    expect(metadata.title).toEqual({ absolute: "Example | PipStart" });
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      images: [expect.objectContaining({ url: image })],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: [image],
    });
  });

  it("uses website metadata for dynamic curriculum hierarchy pages", () => {
    const metadata = createDynamicPageMetadata({
      path: "/learn/forex/level-2/brokers-and-platforms",
      title: "Brokers and Platforms",
      description: "Learn how Forex brokers and platforms work.",
    });

    expect(metadata.alternates?.canonical).toBe(
      "/learn/forex/level-2/brokers-and-platforms",
    );
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: "/learn/forex/level-2/brokers-and-platforms",
    });
  });

  it("creates complete Article and BreadcrumbList structured data", () => {
    const article = createArticleJsonLd({
      authorName: "PipStart Editorial Team",
      authorPath: "/authors/pipstart-editorial-team",
      dateModified: "2026-09-11",
      datePublished: "2026-09-10",
      description: "A test article.",
      headline: "Test article",
      image: `${siteUrl}/analysis/test/opengraph-image`,
      path: "/analysis/test",
    });
    expect(article).toMatchObject({
      "@type": "Article",
      image: `${siteUrl}/analysis/test/opengraph-image`,
      mainEntityOfPage: `${siteUrl}/analysis/test`,
      author: { url: `${siteUrl}/authors/pipstart-editorial-team` },
    });
    const breadcrumbs = createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Test", path: "/analysis/test" },
    ]);
    expect(breadcrumbs.itemListElement).toEqual([
      expect.objectContaining({ position: 1, item: `${siteUrl}/` }),
      expect.objectContaining({
        position: 2,
        item: `${siteUrl}/analysis/test`,
      }),
    ]);
  });

  it("publishes every registered route in the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const entry of seoEntries) {
      expect(urls).toContain(new URL(entry.path, siteUrl).href);
    }
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("publishes each dynamic lesson and hierarchy route exactly once", () => {
    const entries = sitemap();

    for (const lesson of publishedLessons) {
      const url = new URL(lesson.href, siteUrl).href;
      const matches = entries.filter((entry) => entry.url === url);

      expect(matches).toHaveLength(1);
      expect(matches[0]?.lastModified).toEqual(new Date(lesson.reviewDate));
    }

    for (const path of publishedHierarchyRoutes) {
      const url = new URL(path, siteUrl).href;
      expect(entries.filter((entry) => entry.url === url)).toHaveLength(1);
    }
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
