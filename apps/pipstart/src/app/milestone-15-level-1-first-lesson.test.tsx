import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../components/lesson-bookmark-button", () => ({
  LessonBookmarkButton: () => null,
}));

import { LessonBlocks } from "../components/lesson-blocks";
import { LessonPage } from "../components/lesson-page";
import { getPublishedLessons } from "../content/lesson-registry";
import { validateLessonForPublication } from "../content/lesson-content";

const lessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-1",
});
const lesson = lessons[0];

describe("Milestone 15 first Level 1 lesson", () => {
  it("registers the authored sections on the existing lesson URL", () => {
    expect(lesson.href).toBe("/learn/forex/level-1");
    expect(lesson.sections).toHaveLength(10);
    expect(lesson.blocks).toEqual(
      lesson.sections?.flatMap((item) => item.blocks),
    );
    expect(() =>
      validateLessonForPublication({
        metadata: lesson,
        sections: lesson.sections,
        blocks: lesson.blocks,
      }),
    ).not.toThrow();
  });

  it("preserves the other lessons and Level 0 structure", () => {
    expect(lessons.map((item) => item.slug)).toEqual([
      "what-is-forex",
      "currency-pairs",
      "pips-and-lots",
      "bid-ask-spread",
      "trading-sessions",
      "market-participants",
    ]);
    expect(lessons.slice(1).every((item) => item.sections?.length)).toBe(true);
    expect(
      getPublishedLessons({ learningPath: "forex", level: "level-0" }).map(
        (item) => item.sections?.length,
      ),
    ).toEqual([8, 6, 6, 7]);
  });

  it("renders complete lesson HTML for progressive enhancement", () => {
    const markup = renderToStaticMarkup(
      <LessonPage
        path="forex"
        lesson={lesson}
        lessons={lessons}
        contextTitle="Forex Foundations"
        contextHref="/learn/forex/level-1/forex-kindergarten"
      />,
    );
    expect(markup).toContain("Section 1 of 10");
    expect(markup).toContain("Reading an exchange rate");
    expect(markup).toContain("Show all sections at once");
    expect(markup).toContain("The complete school-book calculation");
    expect(markup).toContain("Mark complete");
  });

  it("renders accessible native tables, final checkboxes, and a real diagram asset", () => {
    const table = lesson.blocks.find((item) => item.type === "comparisonTable");
    const markup = renderToStaticMarkup(
      <LessonBlocks blocks={table ? [table] : []} />,
    );
    expect(markup).toContain("<table>");
    expect(markup).toContain('scope="col"');
    const final = renderToStaticMarkup(
      <LessonBlocks blocks={lesson.sections!.at(-1)!.blocks} checklist />,
    );
    expect(final).toContain('type="checkbox"');
    const diagram = lesson.blocks.find((item) => item.type === "diagram");
    expect(diagram?.type).toBe("diagram");
    if (diagram?.type !== "diagram") throw new Error("Missing diagram");
    const svg = readFileSync(
      join(process.cwd(), "public", diagram.src),
      "utf8",
    );
    expect(svg).toContain('<title id="title">');
    expect(svg).toContain('viewBox="0 0 600 520"');
    expect(svg).toContain("US$20");
  });
});
