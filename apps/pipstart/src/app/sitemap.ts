import type { MetadataRoute } from "next";

import { analysisPosts } from "./analysis/posts";
import { publishedLessons } from "../content/lesson-registry";
import { publishedHierarchyRoutes } from "../lib/curriculum";
import { seoEntries, siteUrl } from "../lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const hierarchyRouteSet = new Set<string>(publishedHierarchyRoutes);
  const lessonRouteSet = new Set(publishedLessons.map(({ href }) => href));
  const staticRoutes = seoEntries
    .filter(
      ({ path }) => !hierarchyRouteSet.has(path) && !lessonRouteSet.has(path),
    )
    .map(({ path }) => ({
      url: new URL(path, siteUrl).href,
    }));
  const articles = analysisPosts.map((post) => ({
    url: new URL(`/analysis/${post.slug}`, siteUrl).href,
    lastModified: new Date(post.reviewedAt),
  }));
  const lessons = publishedLessons.map((lesson) => ({
    url: new URL(lesson.href, siteUrl).href,
    lastModified: new Date(lesson.reviewDate),
  }));
  const hierarchy = publishedHierarchyRoutes.map((path) => ({
    url: new URL(path, siteUrl).href,
  }));

  return [...staticRoutes, ...articles, ...lessons, ...hierarchy];
}
