import { existsSync, readFileSync } from "node:fs";
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
import {
  getGenericForexLevelContext,
  getGenericForexLevelRootLesson,
  getGenericForexSecondSegment,
} from "../lib/forex-level-routing";
import {
  getPublishedLessonContext,
  getCourseLessonIds,
} from "../lib/permanent-progress";
import {
  calculateMargin,
  calculatePipValue,
  calculateProfitLoss,
  calculateRiskReward,
} from "../lib/calculator-engine";
import {
  parseLessonProgress,
  serializeLessonProgress,
} from "./learn/forex/level-1/progress";
import sitemap from "./sitemap";
const lessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-2",
});
const slugs = [
  "choosing-a-forex-provider",
  "platforms-and-demo-practice",
  "order-types-and-exits",
  "costs-withdrawals-and-safety",
];
describe("Milestone 15 complete Level 2", () => {
  it("publishes the four authored lessons in the curriculum with matching routes and metadata", () => {
    expect(lessons.map((l) => l.slug)).toEqual(slugs);
    expect(lessons.map((l) => l.sections?.length)).toEqual([10, 11, 11, 11]);
    expect(getGenericForexLevelRootLesson("level-2")?.lesson.id).toBe(slugs[0]);
    expect(lessons[0].href).toBe("/learn/forex/level-2");
    expect(
      getGenericForexSecondSegment("level-2", "brokers-and-platforms")?.kind,
    ).toBe("course");
    for (const lesson of lessons) {
      expect(lesson.blocks).toEqual(lesson.sections?.flatMap((s) => s.blocks));
      expect(() =>
        validateLessonForPublication({
          metadata: lesson,
          blocks: lesson.blocks,
          sections: lesson.sections,
        }),
      ).not.toThrow();
      if (lesson.position > 1) {
        expect(
          getGenericForexSecondSegment("level-2", lesson.slug),
        ).toMatchObject({ kind: "lesson", lesson: { id: lesson.id } });
      }
    }
    expect(getGenericForexLevelContext("level-2")?.quizTarget?.href).toBe(
      "/learn/forex/level-2/quiz",
    );
    expect(getGenericForexLevelContext("level-11")).toBeUndefined();
  });
  it.each(lessons)(
    "opens $slug through the shared stepper and renders final checkboxes",
    (lesson) => {
      const markup = renderToStaticMarkup(
        <LessonPage
          path="forex"
          lesson={lesson}
          lessons={lessons}
          contextTitle="Broker Foundations"
          contextHref="/learn/forex/level-2/brokers-and-platforms"
          quizTarget={null}
        />,
      );
      expect(markup).toContain(`Section 1 of ${lesson.sections!.length}`);
      expect(markup).toContain(`Next: ${lesson.sections![1].title}`);
      expect(markup).toContain("Show all sections at once");
      expect(markup).not.toContain("(for review)");
      expect(markup).not.toContain("Mark complete");
      const last = renderToStaticMarkup(
        <LessonBlocks blocks={lesson.sections!.at(-1)!.blocks} checklist />,
      );
      expect(last).toContain('type="checkbox"');
      expect(last).toContain("References");
    },
  );
  it("registers isolated progress contexts and preserves approved earlier lesson counts", () => {
    expect(getGenericForexLevelContext("level-2")?.progressKey).toBe(
      "pipstart:learn:forex:level-2:brokers-and-platforms:progress",
    );
    expect(
      getCourseLessonIds(getGenericForexLevelContext("level-2")!.course),
    ).toEqual(slugs);
    for (const slug of slugs)
      expect(getPublishedLessonContext(slug)).toMatchObject({
        courseId: "brokers-and-platforms",
        moduleId: "broker-foundations",
        lessonId: slug,
      });
    expect(parseLessonProgress(serializeLessonProgress(slugs), slugs)).toEqual(
      slugs,
    );
    expect(
      getPublishedLessons({ learningPath: "forex", level: "level-0" }),
    ).toHaveLength(4);
    expect(
      getPublishedLessons({ learningPath: "forex", level: "level-1" }),
    ).toHaveLength(6);
  });
  it("adds all lesson and hierarchy URLs to the sitemap without duplicates", () => {
    const urls = sitemap().map((e) => e.url);
    for (const lesson of lessons)
      expect(urls).toContain(`https://pipstart.net${lesson.href}`);
    expect(urls).toContain(
      "https://pipstart.net/learn/forex/level-2/brokers-and-platforms/broker-foundations",
    );
    expect(new Set(urls).size).toBe(urls.length);
  });
  it("renders native tables, styled working tool links and responsive illustration sources", () => {
    for (const lesson of lessons) {
      const tables = lesson.blocks.filter((b) => b.type === "comparisonTable");
      expect(tables.length).toBeGreaterThanOrEqual(2);
      expect(renderToStaticMarkup(<LessonBlocks blocks={tables} />)).toContain(
        'scope="col"',
      );
      for (const block of lesson.blocks) {
        if (block.type === "learningLink") {
          expect(
            existsSync(join(process.cwd(), "src/app", block.href, "page.tsx")),
          ).toBe(true);
          const markup = renderToStaticMarkup(
            <LessonBlocks blocks={[block]} />,
          );
          expect(markup).toContain(`href="${block.href}"`);
          expect(markup).toMatch(/class="[^" ]*toolLink[^" ]*"/);
        }
        if (block.type === "diagram") {
          expect(block.desktopSrc).toBeDefined();
          const markup = renderToStaticMarkup(
            <LessonBlocks blocks={[block]} />,
          );
          expect(markup).toContain('media="(min-width: 768px)"');
          expect(markup).toContain(`srcSet="${block.desktopSrc}"`);
          expect(markup).toContain(`src="${block.src}"`);
          for (const src of [block.src, block.desktopSrc!]) {
            const svg = readFileSync(
              join(process.cwd(), "public", src),
              "utf8",
            );
            expect(svg).toContain('aria-labelledby="title description"');
            expect(svg).toContain('<desc id="description">');
          }
        }
      }
    }
  });
  it("agrees with the calculators for sizes, filled-price results and planned distances", () => {
    expect(
      calculateMargin("EUR/USD", 0.01, 1.1, 10, 1, "USD").requiredMargin,
    ).toBeCloseTo(110);
    expect(
      calculatePipValue("EUR/USD", 0.01, 1, "USD").valuePerPip,
    ).toBeCloseTo(0.1);
    expect(calculatePipValue("EUR/CAD", 0.1, 1, "CAD").valuePerPip).toBeCloseTo(
      1,
    );
    expect(
      calculateProfitLoss("long", "EUR/USD", 0.01, 1.1003, 1.1013, 1, "USD")
        .profitLoss,
    ).toBeCloseTo(1);
    expect(
      calculateProfitLoss("long", "EUR/USD", 0.01, 1.095, 1.09, 1, "USD")
        .profitLoss,
    ).toBeCloseTo(-5);
    expect(
      calculateProfitLoss("long", "EUR/USD", 0.01, 1.095, 1.0895, 1, "USD")
        .profitLoss,
    ).toBeCloseTo(-5.5);
    expect(
      calculateProfitLoss("long", "EUR/USD", 0.01, 1.095, 1.105, 1, "USD")
        .profitLoss,
    ).toBeCloseTo(10);
    expect(calculateRiskReward("long", 1.095, 1.09, 1.105).ratio).toBeCloseTo(
      2,
    );
    const executable = calculateProfitLoss(
      "long",
      "EUR/CAD",
      0.1,
      1.4702,
      1.471,
      1,
      "CAD",
    ).profitLoss;
    expect(executable).toBeCloseTo(8);
    expect(executable - 1 - 3).toBeCloseTo(4);
  });
});
