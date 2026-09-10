import type { MetadataRoute } from "next";

import { analysisPosts } from "./analysis/posts";
import { forexLessons } from "./learn/forex/level-1/lessons";
import { seoEntries, siteUrl } from "../lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = seoEntries.map(({ path }) => ({
    url: new URL(path, siteUrl).href,
  }));
  const articles = analysisPosts.map((post) => ({
    url: new URL(`/analysis/${post.slug}`, siteUrl).href,
    lastModified: new Date(post.publishedAt),
  }));
  const lessons = forexLessons
    .slice(1)
    .map((lesson) => ({ url: new URL(lesson.href, siteUrl).href }));

  return [...staticRoutes, ...articles, ...lessons];
}
