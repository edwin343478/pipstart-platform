import { describe, expect, it } from "vitest";

import { publishedLessons } from "../content/lesson-registry";
import { GET } from "../app/llms.txt/route";
import { createLessonJsonLd } from "./lesson-json-ld";
import { buildLlmsText, llmsSections } from "./llms-text";
import { seoEntries } from "./seo";

describe("lesson structured data", () => {
  it("is built for every published lesson from its reviewed metadata", () => {
    expect(publishedLessons.length).toBeGreaterThan(0);
    for (const lesson of publishedLessons) {
      const ld = createLessonJsonLd(lesson);
      expect(ld["@type"]).toEqual(["Article", "LearningResource"]);
      expect(ld.url).toBe(`https://pipstart.net${lesson.href}`);
      expect(ld.name).toBe(lesson.title);
      expect(ld.headline.length).toBeLessThanOrEqual(110);
      expect(ld.datePublished).toBe(lesson.publishedDate);
      expect(ld.dateModified).toBe(lesson.reviewDate);
      expect(ld.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(ld.author).toMatchObject({
        "@type": "Organization",
        name: lesson.author,
      });
      expect(ld.timeRequired).toBe(`PT${lesson.estimatedMinutes}M`);
      expect(ld.teaches).toEqual(lesson.objectives);
      expect(JSON.stringify(ld)).not.toMatch(/"@type":"Person"/);
    }
  });

  it("only links the author page for the team that page describes", () => {
    const team = publishedLessons.find(
      (l) => l.author === "PipStart Editorial Team",
    );
    const other = publishedLessons.find(
      (l) => l.author !== "PipStart Editorial Team",
    );
    if (team)
      expect(createLessonJsonLd(team).author).toHaveProperty(
        "url",
        "https://pipstart.net/authors/pipstart-editorial-team",
      );
    if (other)
      expect(createLessonJsonLd(other).author).not.toHaveProperty("url");
  });
});

describe("visible lesson credit", () => {
  it("every lesson footer credits the PipStart team (owner-approved wording, 20 Nov 2026)", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync(
      new URL("../components/lesson-page-client.tsx", import.meta.url),
      "utf8",
    );
    expect(source).toContain(
      "<p>Written, checked and approved by the PipStart team</p>",
    );
  });
});

describe("llms.txt", () => {
  it("lists only real public pages, with their published titles and descriptions", () => {
    const known = new Set(seoEntries.map((e) => e.path as string));
    for (const section of llmsSections)
      for (const path of section.paths)
        expect(known.has(path), path).toBe(true);
    const text = buildLlmsText();
    expect(text.startsWith("# PipStart\n")).toBe(true);
    expect(text).toContain(`${publishedLessons.length} published lessons`);
    expect(text).toContain("- [Start Here](https://pipstart.net/start-here): ");
    expect(text).not.toMatch(/\/(admin|account|dashboard|login|api)\b/);
  });

  it("is served as plain text", async () => {
    const res = GET();
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await res.text()).toBe(buildLlmsText());
  });
});
