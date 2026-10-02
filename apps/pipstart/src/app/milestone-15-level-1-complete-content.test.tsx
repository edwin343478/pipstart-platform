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
import {
  validateLessonForPublication,
  type LessonBlock,
} from "../content/lesson-content";
import {
  calculatePipValue,
  calculateProfitLoss,
} from "../lib/calculator-engine";
const lessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-1",
});
describe("Milestone 15 complete Level 1", () => {
  it("registers sections on the six existing routes with valid publication metadata", () => {
    expect(lessons.map((l) => l.href)).toEqual([
      "/learn/forex/level-1",
      "/learn/forex/level-1/currency-pairs",
      "/learn/forex/level-1/pips-and-lots",
      "/learn/forex/level-1/bid-ask-spread",
      "/learn/forex/level-1/trading-sessions",
      "/learn/forex/level-1/market-participants",
    ]);
    expect(lessons.map((l) => l.sections?.length)).toEqual([
      10, 11, 11, 11, 10, 11,
    ]);
    for (const lesson of lessons) {
      expect(lesson.blocks).toEqual(lesson.sections?.flatMap((s) => s.blocks));
      expect(() =>
        validateLessonForPublication({
          metadata: lesson,
          blocks: lesson.blocks,
          sections: lesson.sections,
        }),
      ).not.toThrow();
    }
  });
  it.each(lessons.slice(1))(
    "opens $slug in the shared stepper and retains a final checklist",
    (lesson) => {
      const markup = renderToStaticMarkup(
        <LessonPage
          path="forex"
          lesson={lesson}
          lessons={lessons}
          contextTitle="Forex Foundations"
          contextHref="/learn/forex/level-1/forex-kindergarten"
        />,
      );
      expect(markup).toContain(`Section 1 of ${lesson.sections!.length}`);
      expect(markup).toContain(`${lesson.sections![1].title}`);
      expect(markup).toContain("Show all sections at once");
      expect(markup).toContain("Mark complete");
      expect(
        renderToStaticMarkup(
          <LessonBlocks blocks={lesson.sections!.at(-1)!.blocks} checklist />,
        ),
      ).toContain('type="checkbox"');
    },
  );
  it("renders native tables, actual local tool links, and accessible illustration files", () => {
    for (const lesson of lessons.slice(1)) {
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
          expect(
            renderToStaticMarkup(<LessonBlocks blocks={[block]} />),
          ).toContain(`href="${block.href}"`);
        }
        if (block.type === "diagram") {
          const svg = readFileSync(
            join(process.cwd(), "public", block.src),
            "utf8",
          );
          expect(svg).toContain('aria-labelledby="title description"');
          expect(svg).toContain('<desc id="description">');
        }
      }
    }
  });
  it("agrees with the calculators for the taught units and executable-price results", () => {
    expect(calculatePipValue("EUR/USD", 0.1, 1, "USD").valuePerPip).toBeCloseTo(
      1,
    );
    expect(
      calculatePipValue("EUR/USD", 0.01, 1, "USD").valuePerPip,
    ).toBeCloseTo(0.1);
    expect(calculatePipValue("USD/JPY", 0.1, 1, "JPY").valuePerPip).toBeCloseTo(
      100,
    );
    expect(
      calculatePipValue("USD/JPY", 0.1, 1 / 150, "USD").valuePerPip,
    ).toBeCloseTo(2 / 3);
    expect(
      calculateProfitLoss("long", "EUR/USD", 0.1, 1.1002, 1.1012, 1, "USD")
        .profitLoss,
    ).toBeCloseTo(10);
    expect(
      calculateProfitLoss("short", "EUR/USD", 0.1, 1.1, 1.0982, 1, "USD")
        .profitLoss,
    ).toBeCloseTo(18);
    expect(
      calculateProfitLoss("long", "EUR/USD", 0.1, 1.1002, 1.1, 1, "USD")
        .profitLoss,
    ).toBeCloseTo(-2);
  });
  it("rejects unsafe tool URLs while preserving normal publication validation", () => {
    for (const href of [
      "//example.com",
      "https://example.com",
      "/tools/../account",
      "/account",
    ]) {
      const invalid = {
        type: "learningLink",
        title: "Tool",
        description: "Practice",
        href,
      } as LessonBlock;
      expect(() =>
        validateLessonForPublication({
          metadata: lessons[1],
          blocks: [invalid],
        }),
      ).toThrow("local tools route");
    }
  });
  it("preserves Level 0 counts and teaches the Tokyo-London overlap", () => {
    expect(
      getPublishedLessons({ learningPath: "forex", level: "level-0" }).map(
        (l) => l.sections?.length,
      ),
    ).toEqual([8, 6, 6, 7]);
    expect(JSON.stringify(lessons[4].blocks)).toContain(
      "Tokyo and London also overlap",
    );
  });
});
