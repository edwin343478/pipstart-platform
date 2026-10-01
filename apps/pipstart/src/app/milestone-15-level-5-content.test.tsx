import { existsSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("../components/lesson-bookmark-button", () => ({
  LessonBookmarkButton: () => null,
}));
import { LessonPage } from "../components/lesson-page";
import { LessonBlocks } from "../components/lesson-blocks";
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
  calculatePipValue,
  calculateRiskReward,
  calculateMargin,
  calculateDrawdown,
  calculateGainRecovery,
} from "../lib/calculator-engine";
import { getForexQuizContext } from "../lib/forex-quiz-context";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { getCurrentPublishedAssessment } from "../lib/assessment-registry";
import { riskManagementFoundationsQuizV1 } from "../lib/risk-management-foundations-assessment";
vi.mock("./learn/forex/level-1/quiz/quiz-client", () => ({
  ForexFoundationsQuiz: () => null,
}));
import GenericSegment from "./learn/forex/[level]/[segment]/page";
import sitemap from "./sitemap";

const lessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-5",
});
const slugs = [
  "decide-the-loss-before-the-size",
  "margin-leverage-and-drawdown",
  "combined-exposure-and-losing-streaks",
];
describe("Milestone 15 complete Level 5", () => {
  it("publishes the three manuscript lessons through all hierarchy and lesson routes", () => {
    expect(lessons.map((l) => l.id)).toEqual(slugs);
    expect(lessons.map((l) => l.sections?.length)).toEqual([13, 13, 14]);
    expect(getGenericForexLevelRootLesson("level-5")?.lesson.id).toBe(slugs[0]);
    expect(
      getGenericForexSecondSegment("level-5", "risk-management")?.kind,
    ).toBe("course");
    expect(
      getGenericForexModule(
        "level-5",
        "risk-management",
        "risk-management-foundations",
      ),
    ).toBeDefined();
    expect(getGenericForexLevelContext("level-5")?.progressKey).toBe(
      "pipstart:learn:forex:level-5:risk-management:progress",
    );
    expect(getGenericForexLevelContext("level-5")?.quizTarget).toMatchObject({
      href: "/learn/forex/level-5/quiz",
    });
    for (const lesson of lessons) {
      expect(() =>
        validateLessonForPublication({
          metadata: lesson,
          blocks: lesson.blocks,
          sections: lesson.sections,
        }),
      ).not.toThrow();
      expect(lesson.blocks).toEqual(lesson.sections?.flatMap((s) => s.blocks));
      expect(
        lesson.prerequisites.every((id) =>
          getPublishedLessons({ learningPath: "forex" }).some(
            (l) => l.id === id,
          ),
        ),
      ).toBe(true);
      expect(
        lesson.relatedLessonIds.every((id) =>
          getPublishedLessons({ learningPath: "forex" }).some(
            (l) => l.id === id,
          ),
        ),
      ).toBe(true);
      if (lesson.position > 1)
        expect(
          getGenericForexSecondSegment("level-5", lesson.slug),
        ).toMatchObject({ kind: "lesson", lesson: { id: lesson.id } });
    }
  });
  it.each(lessons)(
    "uses the approved stepped blocks, exercises, references and checkboxes for $slug",
    (lesson) => {
      const markup = renderToStaticMarkup(
        <LessonPage
          path="forex"
          lesson={lesson}
          lessons={lessons}
          contextTitle="Risk Management Foundations"
          contextHref="/learn/forex/level-5/risk-management"
        />,
      );
      expect(markup).toContain("Show all sections at once");
      expect(markup).toContain(`Section 1 of ${lesson.sections!.length}`);
      expect(markup).toContain(`Next: ${lesson.sections![1].title}`);
      expect(markup).toContain("/learn/forex/level-5/quiz");
      const all = renderToStaticMarkup(
        <LessonBlocks blocks={lesson.blocks} checklist />,
      );
      expect(all).toContain("<table");
      expect(all).toContain("Practise with a PipStart tool");
      expect(all).toContain('type="checkbox"');
      expect(all).toContain("References");
      expect(JSON.stringify(lesson.blocks)).not.toContain("G20");
      expect(lesson.blocks.some((b) => b.type === "exercise")).toBe(true);
      for (const b of lesson.blocks)
        if (b.type === "diagram") {
          expect(existsSync(join(process.cwd(), "public", b.src))).toBe(true);
          expect(existsSync(join(process.cwd(), "public", b.desktopSrc!))).toBe(
            true,
          );
        }
    },
  );
  it("checks the sizing, pip-value, margin and recovery examples against the actual calculators", () => {
    expect(
      calculatePipValue("EUR/USD", 0.05, 1, "USD").valuePerPip,
    ).toBeCloseTo(0.5);
    expect(
      calculatePositionSize(1000, 1, 20, 1, "EUR/USD", "USD").lots,
    ).toBeCloseTo(0.05);
    expect(
      calculatePositionSize(1000, 1, 40, 1, "EUR/USD", "USD"),
    ).toMatchObject({ lots: 0.02, riskAmount: 8 });
    expect(
      calculatePositionSize(1000, 0.1, 20, 1, "EUR/USD", "USD"),
    ).toMatchObject({ lots: 0, meetsMinimumVolume: false });
    expect(calculateRiskReward("long", 1.1, 1.098, 1.104).ratio).toBeCloseTo(2);
    expect(
      calculateMargin("EUR/USD", 0.1, 1.1, 20, 1, "USD").requiredMargin,
    ).toBeCloseTo(550);
    expect(
      calculateMargin("EUR/USD", 0.1, 1.1, 50, 1, "USD").requiredMargin,
    ).toBeCloseTo(220);
    expect(calculateDrawdown(1200, 240, "amount", "USD")).toMatchObject({
      remainingBalance: 960,
      drawdownPercent: 20,
      recoveryPercent: 25,
    });
    expect(calculateGainRecovery(800, 1000, 5, "USD").periods).toBe(5);
  });
  it("checks each authored loss/recovery table value, including the changing denominator", () => {
    const table = lessons[1].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Loss and recovery"),
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Recovery table missing");
    for (const row of table.rows) {
      const pct = Number(row[0].replace("%", ""));
      expect(Number(row[2].replace("%", ""))).toBeCloseTo(
        (pct / (100 - pct)) * 100,
        2,
      );
    }
    const streak = lessons[2].blocks.find(
      (b) => b.type === "comparisonTable" && b.caption?.startsWith("Six ideal"),
    );
    if (!streak || streak.type !== "comparisonTable")
      throw new Error("Streak table missing");
    for (const [i, fraction] of [0.01, 0.05, 0.1, 0.2].entries())
      expect(
        Number(streak.rows[i + 1][1].replace("US$", "").replace(",", "")),
      ).toBeCloseTo(1000 * (1 - fraction) ** 6, 2);
  });
  it("includes a symmetric, bounded native teaching correlation matrix", () => {
    const matrix = lessons[2].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.includes("correlation matrix"),
    );
    if (!matrix || matrix.type !== "comparisonTable")
      throw new Error("Matrix missing");
    expect(matrix.rows).toHaveLength(7);
    for (const [i, row] of matrix.rows.entries())
      for (let j = 0; j < 7; j++) {
        const value = Number(row[j + 1]);
        expect(Math.abs(value)).toBeLessThanOrEqual(1);
        expect(value).toBe(Number(matrix.rows[j][i + 1]));
        if (i === j) expect(value).toBe(1);
      }
  });
  it("resolves the real quiz page with a sanitized assessment", async () => {
    const page = await GenericSegment({
      params: Promise.resolve({ level: "level-5", segment: "quiz" }),
    });
    expect(page.props.assessment.id).toBe("risk-management-foundations-quiz");
    expect(getCurrentPublishedAssessment(page.props.assessment.id)).toBe(
      riskManagementFoundationsQuizV1,
    );
    const publicJson = JSON.stringify(
      toPublicAssessment(riskManagementFoundationsQuizV1),
    );
    expect(publicJson).not.toContain("correctChoiceIds");
    expect(publicJson).not.toContain("explanation");
    const context = getForexQuizContext(
      "risk-management",
      "risk-management-foundations",
    )!;
    expect(context.lessonIds).toHaveLength(3);
    expect(context.module.assessmentRequirements).toContainEqual({
      assessmentId: riskManagementFoundationsQuizV1.id,
      completionPolicy: "any-passed-version",
    });
  });
  it("grades all 18 questions at the 70% threshold with exact multiple-answer selection", () => {
    const quiz = riskManagementFoundationsQuizV1;
    expect(quiz.questions).toHaveLength(18);
    const answers = (count: number) =>
      Object.fromEntries(
        quiz.questions.slice(0, count).map((q) => [q.id, q.correctChoiceIds]),
      );
    expect(gradeAssessment(quiz, answers(18))).toMatchObject({
      score: 18,
      passed: true,
    });
    expect(gradeAssessment(quiz, answers(13)).passed).toBe(true);
    expect(gradeAssessment(quiz, answers(12)).passed).toBe(false);
    expect(gradeAssessment(quiz, {})).toMatchObject({
      score: 0,
      passed: false,
    });
    const multiple = quiz.questions.find((q) => q.type === "multiple-answer")!;
    expect(
      gradeAssessment(quiz, {
        [multiple.id]: multiple.correctChoiceIds.slice(0, 1),
      }).score,
    ).toBe(0);
  });
  it("indexes new lessons and quiz once while retaining previous lesson counts", () => {
    const urls = sitemap().map((item) => item.url);
    for (const path of [
      ...lessons.map((l) => l.href),
      "/learn/forex/level-5/quiz",
    ])
      expect(urls.filter((url) => url.endsWith(path))).toHaveLength(1);
    [4, 6, 4, 4, 3].forEach((count, level) =>
      expect(
        getPublishedLessons({ learningPath: "forex", level: `level-${level}` }),
      ).toHaveLength(count),
    );
    expect(getGenericForexLevelContext("level-11")).toBeUndefined();
  });
});
