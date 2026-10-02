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
import { getCourseLessonIds } from "../lib/permanent-progress";
import { getPublishedLessonContext } from "../lib/permanent-progress-catalogue";
import {
  calculatePipValue,
  calculateProfitLoss,
} from "../lib/calculator-engine";
import {
  parseLessonProgress,
  serializeLessonProgress,
} from "./learn/forex/level-1/progress";
import sitemap from "./sitemap";
const lessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-3",
});
const slugs = [
  "read-a-chart-before-interpreting-it",
  "trends-and-price-landmarks",
  "swings-breakouts-and-false-signals",
  "volume-and-chart-limits",
];
describe("Milestone 15 complete Level 3", () => {
  it("publishes the four authored lessons in the curriculum with matching routes and metadata", () => {
    expect(lessons.map((l) => l.slug)).toEqual(slugs);
    expect(lessons.map((l) => l.sections?.length)).toEqual([10, 10, 11, 11]);
    expect(getGenericForexLevelRootLesson("level-3")?.lesson.id).toBe(slugs[0]);
    expect(lessons[0].href).toBe("/learn/forex/level-3");
    expect(getGenericForexSecondSegment("level-3", "charts")?.kind).toBe(
      "course",
    );
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
          getGenericForexSecondSegment("level-3", lesson.slug),
        ).toMatchObject({ kind: "lesson", lesson: { id: lesson.id } });
      }
    }
    expect(getGenericForexLevelContext("level-3")?.quizTarget).toMatchObject({
      href: "/learn/forex/level-3/quiz",
      label: "Chart Foundations quiz",
    });
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
          contextTitle="Chart Foundations"
          contextHref="/learn/forex/level-3/charts"
          quizTarget={null}
        />,
      );
      expect(markup).toContain(`Section 1 of ${lesson.sections!.length}`);
      expect(markup).toContain(`${lesson.sections![1].title}`);
      expect(markup).toContain("Show all sections at once");
      expect(markup).not.toContain("(for review)");
      expect(markup).toContain("Mark complete");
      const last = renderToStaticMarkup(
        <LessonBlocks blocks={lesson.sections!.at(-1)!.blocks} checklist />,
      );
      expect(last).toContain('type="checkbox"');
      expect(last).toContain("References");
    },
  );
  it("registers isolated progress contexts and preserves approved earlier lesson counts", () => {
    expect(getGenericForexLevelContext("level-3")?.progressKey).toBe(
      "pipstart:learn:forex:level-3:charts:progress",
    );
    expect(
      getCourseLessonIds(getGenericForexLevelContext("level-3")!.course),
    ).toEqual(slugs);
    for (const slug of slugs)
      expect(getPublishedLessonContext(slug)).toMatchObject({
        courseId: "charts",
        moduleId: "chart-foundations",
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
    expect(
      getPublishedLessons({ learningPath: "forex", level: "level-2" }),
    ).toHaveLength(4);
  });
  it("adds all lesson and hierarchy URLs to the sitemap without duplicates", () => {
    const urls = sitemap().map((e) => e.url);
    for (const lesson of lessons)
      expect(urls).toContain(`https://pipstart.net${lesson.href}`);
    expect(urls).toContain(
      "https://pipstart.net/learn/forex/level-3/charts/chart-foundations",
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
  it("keeps calculator exercises consistent with the taught price units", () => {
    expect(
      calculatePipValue("GBP/USD", 0.01, 1, "USD").valuePerPip,
    ).toBeCloseTo(0.1);
    expect(
      calculatePipValue("USD/JPY", 0.01, 1, "JPY").valuePerPip,
    ).toBeCloseTo(10);
    expect(
      calculateProfitLoss("long", "AUD/USD", 0.01, 0.6502, 0.6512, 1, "USD")
        .profitLoss,
    ).toBeCloseTo(1);
  });
  it("keeps the authored OHLC table valid and aggregates the four-hour record accurately", () => {
    const table = lessons[0].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption === "Four invented one-hour bars forming one four-hour bar",
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("OHLC teaching table missing");
    const hours = table.rows.slice(0, 4).map((row) => row.slice(1).map(Number));
    for (const [open, high, low, close] of hours) {
      expect(high).toBeGreaterThanOrEqual(Math.max(open, close));
      expect(low).toBeLessThanOrEqual(Math.min(open, close));
    }
    const aggregate = [
      hours[0][0],
      Math.max(...hours.map((r) => r[1])),
      Math.min(...hours.map((r) => r[2])),
      hours.at(-1)![3],
    ];
    expect(aggregate).toEqual(table.rows[4].slice(1).map(Number));
    expect(aggregate).toEqual([1.25, 1.255, 1.247, 1.252]);
    expect((aggregate[1] - aggregate[2]) / 0.0001).toBeCloseTo(80);
    expect((aggregate[3] - aggregate[0]) / 0.0001).toBeCloseTo(20);
  });
});
