import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getPublishedLessons } from "../content/lesson-registry";
import { SteppedLessonArticle } from "./SteppedLessonArticle";
import { LessonBlocks } from "./lesson-blocks";

const lessons = getPublishedLessons({ learningPath: "forex" });

describe("complete lesson HTML before client enhancement", () => {
  it("covers the approved 39-lesson catalogue", () => {
    expect(lessons).toHaveLength(39);
  });

  it.each(lessons)("renders all substantive sections of $title", (lesson) => {
    const sections = lesson.sections!;
    expect(sections.length).toBeGreaterThan(1);
    const html = renderToStaticMarkup(
      createElement(SteppedLessonArticle, {
        lessonId: lesson.id,
        title: lesson.title,
        levelLabel: lesson.level,
        lessonPosition: 1,
        lessonTotal: 1,
        sections,
        endOfLevel: {
          message: "Keep learning",
          ctaLabel: "All Forex levels",
          ctaHref: "/learn/forex",
        },
      }),
    );
    expect(html.match(/role="tabpanel"/g)).toHaveLength(sections.length);
    expect(
      html
        .match(/<div[^>]*role="tabpanel"[^>]*>/g)
        ?.every((tag) => !/\shidden(?:=|\s|>)/.test(tag)),
    ).toBe(true);
    expect(html).not.toContain('aria-hidden="true" data-section-index');
    for (const section of sections) {
      // Compare actual authored teaching markup, not only headings or an RSC payload.
      const expected = renderToStaticMarkup(
        createElement(LessonBlocks, {
          blocks: section.blocks.map((block) =>
            block.type === "section" && block.title === section.title
              ? { ...block, title: "" }
              : block,
          ),
        }),
      );
      expect(expected.length).toBeGreaterThan(100);
      expect(html).toContain(expected);
    }
  });
});
