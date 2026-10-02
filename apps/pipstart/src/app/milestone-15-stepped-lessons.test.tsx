import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../components/lesson-bookmark-button", () => ({
  LessonBookmarkButton: () => null,
}));

import { LessonPage } from "../components/lesson-page";
import { getPublishedLessons } from "../content/lesson-registry";

const lessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-0",
  course: "forex-orientation",
  module: "orientation-and-safety",
});

describe("sectioned lessons on the published routes", () => {
  it("keeps all four approved URLs and complete, ordered sections", () => {
    expect(lessons.map((lesson) => lesson.href)).toEqual([
      "/learn/forex/level-0",
      "/learn/forex/level-0/trading-versus-investing",
      "/learn/forex/level-0/money-risk-and-demo",
      "/learn/forex/level-0/spot-forex-scams-and-safety",
    ]);
    expect(lessons.map((lesson) => lesson.sections?.length)).toEqual([
      8, 6, 6, 7,
    ]);
    for (const lesson of lessons) {
      expect(lesson.blocks).toEqual(
        lesson.sections?.flatMap((section) => section.blocks),
      );
      expect(
        lesson.sections?.every(
          (section) => section.title && section.blocks.length,
        ),
      ).toBe(true);
    }
  });

  it("renders every section, final completion control and a real next lesson", () => {
    const markup = renderToStaticMarkup(
      <LessonPage
        path="forex"
        lesson={lessons[0]}
        lessons={lessons}
        contextTitle="Orientation and Safety"
        contextHref="/learn/forex/level-0"
      />,
    );
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain("Section 1 of 8");
    expect(markup).toContain("What this course is designed to teach");
    expect(markup).toContain("Mark complete");
  });

  it("uses a Level 1 CTA for the last Level 0 lesson", () => {
    const markup = renderToStaticMarkup(
      <LessonPage
        path="forex"
        lesson={lessons[3]}
        lessons={lessons}
        contextTitle="Orientation and Safety"
        contextHref="/learn/forex/level-0"
      />,
    );
    expect(markup).toContain('href="/learn/forex/level-1"');
    expect(lessons[3].sections?.at(-1)?.title).toBe("Final Level 0 reflection");
    expect(markup).toContain("Section 1 of 7");
  });
});
