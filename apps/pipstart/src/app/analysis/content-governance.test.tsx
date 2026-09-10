import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AuthorBox } from "../../components/author-box";
import sitemap from "../sitemap";
import { pipStartEditorialTeam } from "./authors";
import { analysisPosts } from "./posts";

describe("analysis authorship and content organization", () => {
  it("provides explicit publication, review, and cluster data", () => {
    for (const post of analysisPosts) {
      expect(Date.parse(post.publishedAt)).not.toBeNaN();
      expect(Date.parse(post.reviewedAt)).not.toBeNaN();
      expect(Date.parse(post.reviewedAt)).toBeGreaterThanOrEqual(
        Date.parse(post.publishedAt),
      );
      expect(["fundamental", "technical"]).toContain(post.cluster);
    }
  });

  it("keeps at least two related articles in every content cluster", () => {
    for (const post of analysisPosts) {
      const related = analysisPosts.filter(
        (candidate) =>
          candidate.cluster === post.cluster && candidate.slug !== post.slug,
      );
      expect(related.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("links a transparent institutional author without invented credentials", () => {
    const markup = renderToStaticMarkup(
      <AuthorBox author={pipStartEditorialTeam} />,
    );

    expect(markup).toContain(pipStartEditorialTeam.name);
    expect(markup).toContain(`href="${pipStartEditorialTeam.href}"`);
    expect(markup).toContain('aria-label="About the author"');
  });

  it("uses review dates as article sitemap modification dates", () => {
    const entries = sitemap();

    for (const post of analysisPosts) {
      const entry = entries.find((candidate) =>
        candidate.url.endsWith(`/analysis/${post.slug}`),
      );
      expect(entry?.lastModified).toEqual(new Date(post.reviewedAt));
    }
  });
});
