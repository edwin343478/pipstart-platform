import { existsSync } from "node:fs";
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
  getGenericForexModule,
} from "../lib/forex-level-routing";
import {
  calculatePositionSize,
  calculateProfitLoss,
} from "../lib/calculator-engine";
const lessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-4",
});
const slugs = [
  "averages-and-momentum",
  "volatility-tools",
  "levels-patterns-and-limits",
];
describe("Milestone 15 complete Level 4", () => {
  it("publishes all three approved lessons through real course, module and lesson routes", () => {
    expect(lessons.map((l) => l.id)).toEqual(slugs);
    expect(lessons.map((l) => l.sections?.length)).toEqual([12, 11, 14]);
    expect(getGenericForexLevelRootLesson("level-4")?.lesson.id).toBe(slugs[0]);
    expect(
      getGenericForexSecondSegment("level-4", "technical-tools")?.kind,
    ).toBe("course");
    expect(
      getGenericForexModule(
        "level-4",
        "technical-tools",
        "technical-tool-foundations",
      ),
    ).toBeDefined();
    expect(getGenericForexLevelContext("level-4")?.progressKey).toBe(
      "pipstart:learn:forex:level-4:technical-tools:progress",
    );
    for (const l of lessons) {
      expect(() =>
        validateLessonForPublication({
          metadata: l,
          blocks: l.blocks,
          sections: l.sections,
        }),
      ).not.toThrow();
      expect(l.blocks).toEqual(l.sections?.flatMap((s) => s.blocks));
      if (l.position > 1)
        expect(getGenericForexSecondSegment("level-4", l.slug)).toMatchObject({
          kind: "lesson",
          lesson: { id: l.id },
        });
    }
  });
  it.each(lessons)(
    "renders $slug in the existing stepper with exercises, answers and final checkboxes",
    (lesson) => {
      const markup = renderToStaticMarkup(
        <LessonPage
          path="forex"
          lesson={lesson}
          lessons={lessons}
          contextTitle="Technical Tool Foundations"
          contextHref="/learn/forex/level-4/technical-tools"
          quizTarget={null}
        />,
      );
      expect(markup).toContain("Show all sections at once");
      expect(markup).not.toContain("(for review)");
      expect(markup).toContain(`Section 1 of ${lesson.sections!.length}`);
      expect(markup).toContain(`Next: ${lesson.sections![1].title}`);
      const last = renderToStaticMarkup(
        <LessonBlocks blocks={lesson.sections!.at(-1)!.blocks} checklist />,
      );
      expect(last).toContain('type="checkbox"');
      expect(last).toContain("References");
      expect(lesson.blocks.some((b) => b.type === "exercise")).toBe(true);
      expect(lesson.blocks.some((b) => b.type === "learningLink")).toBe(true);
      expect(JSON.stringify(lesson.blocks)).not.toContain("G20");
      for (const b of lesson.blocks)
        if (b.type === "diagram") {
          expect(existsSync(join(process.cwd(), "public", b.src))).toBe(true);
          expect(existsSync(join(process.cwd(), "public", b.desktopSrc!))).toBe(
            true,
          );
        }
    },
  );
  it("checks the authored sizing arithmetic against the actual tools", () => {
    expect(
      calculatePositionSize(1000, 1, 20, 1, "EUR/USD", "USD").lots,
    ).toBeCloseTo(0.05);
    expect(
      calculatePositionSize(1000, 1, 40, 1, "EUR/USD", "USD").lots,
    ).toBeCloseTo(0.02);
    expect(
      calculateProfitLoss("long", "EUR/USD", 0.01, 1.1, 1.098, 1, "USD")
        .profitLoss,
    ).toBeCloseTo(-2);
  });
  it("checks the published retracement table against its documented formula", () => {
    const t = lessons[2].blocks.find(
      (b) => b.type === "comparisonTable" && b.caption?.includes("1.0800"),
    );
    if (!t || t.type !== "comparisonTable")
      throw new Error("Retracement table missing");
    const ratios = [0.236, 0.382, 0.5, 0.618, 0.786];
    t.rows.forEach((row, i) =>
      expect(Number(row[2])).toBeCloseTo(1.12 - ratios[i] * (1.12 - 1.08), 5),
    );
  });
  it("retains approved earlier-level counts and keeps Level 11 unavailable", () => {
    [4, 6, 4, 4].forEach((count, i) =>
      expect(
        getPublishedLessons({ learningPath: "forex", level: `level-${i}` }),
      ).toHaveLength(count),
    );
    expect(getGenericForexLevelContext("level-11")).toBeUndefined();
  });
});
