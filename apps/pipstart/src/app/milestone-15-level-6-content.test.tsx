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
  calculateProfitLoss,
} from "../lib/calculator-engine";
import { getForexQuizContext } from "../lib/forex-quiz-context";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { getCurrentPublishedAssessment } from "../lib/assessment-registry";
import { priceActionFoundationsQuizV1 } from "../lib/price-action-foundations-assessment";
vi.mock("./learn/forex/level-1/quiz/quiz-client", () => ({
  ForexFoundationsQuiz: () => null,
}));
import GenericSegment from "./learn/forex/[level]/[segment]/page";
import sitemap from "./sitemap";

const lessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-6",
});
const slugs = [
  "describe-structure-without-guessing",
  "build-a-testable-observation",
  "stops-targets-and-a-checklist",
];
describe("Milestone 15 complete Level 6", () => {
  it("publishes the three manuscript lessons through all hierarchy and lesson routes", () => {
    expect(lessons.map((l) => l.id)).toEqual(slugs);
    expect(lessons.map((l) => l.sections?.length)).toEqual([13, 14, 14]);
    expect(getGenericForexLevelRootLesson("level-6")?.lesson.id).toBe(slugs[0]);
    expect(getGenericForexSecondSegment("level-6", "price-action")?.kind).toBe(
      "course",
    );
    expect(
      getGenericForexModule(
        "level-6",
        "price-action",
        "price-action-foundations",
      ),
    ).toBeDefined();
    expect(getGenericForexLevelContext("level-6")?.progressKey).toBe(
      "pipstart:learn:forex:level-6:price-action:progress",
    );
    expect(getGenericForexLevelContext("level-6")?.quizTarget).toMatchObject({
      href: "/learn/forex/level-6/quiz",
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
          getGenericForexSecondSegment("level-6", lesson.slug),
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
          contextTitle="Price Action Foundations"
          contextHref="/learn/forex/level-6/price-action"
        />,
      );
      expect(markup).toContain("Show all sections at once");
      expect(markup).toContain(`Section 1 of ${lesson.sections!.length}`);
      expect(markup).toContain(`${lesson.sections![1].title}`);
      expect(markup).toContain("/learn/forex/level-6/quiz");
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
  it("checks the long, short and actual-fill arithmetic against real tools", () => {
    expect(calculateRiskReward("long", 1.1, 1.098, 1.104).ratio).toBeCloseTo(2);
    expect(calculateRiskReward("short", 1.1, 1.102, 1.096).ratio).toBeCloseTo(
      2,
    );
    expect(
      calculateRiskReward("long", 150.02, 149.82, 150.42).ratio,
    ).toBeCloseTo(2);
    expect(
      calculatePipValue("EUR/USD", 0.03, 1, "USD").valuePerPip,
    ).toBeCloseTo(0.3);
    expect(
      calculatePositionSize(1000, 1, 20, 1, "EUR/USD", "USD").lots,
    ).toBeCloseTo(0.05);
    expect(
      calculatePositionSize(1000, 1, 40, 1, "EUR/USD", "USD").lots,
    ).toBeCloseTo(0.02);
    expect(
      calculateProfitLoss("long", "EUR/USD", 0.05, 1.1, 1.098, 1, "USD")
        .profitLoss,
    ).toBeCloseTo(-10);
    expect(
      calculateProfitLoss("long", "EUR/USD", 0.05, 1.1, 1.0975, 1, "USD")
        .profitLoss,
    ).toBeCloseTo(-12.5);
  });
  it("checks every authored sizing scenario against cash loss plus the stated commission", () => {
    const table = lessons[2].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented EUR/USD worksheet"),
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Scenario table missing");
    for (const row of table.rows) {
      const lots = Number(row[0]);
      const cash = (column: number) => Number(row[column].replace("US$", ""));
      const planned = -calculateProfitLoss(
        "long",
        "EUR/USD",
        lots,
        1.1,
        1.098,
        1,
        "USD",
      ).profitLoss;
      const scenario = -calculateProfitLoss(
        "long",
        "EUR/USD",
        lots,
        1.1,
        1.0975,
        1,
        "USD",
      ).profitLoss;
      expect(cash(1)).toBeCloseTo(planned, 2);
      expect(cash(2)).toBeCloseTo(7 * lots, 2);
      expect(cash(3)).toBeCloseTo(planned + 7 * lots, 2);
      expect(cash(4)).toBeCloseTo(scenario + 7 * lots, 2);
    }
  });
  it("checks the authored zone bars against the exact touch and close conditions", () => {
    const table = lessons[1].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented EUR/USD bars"),
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Zone table missing");
    const touches = table.rows.map(
      (row) => Number(row[1]) <= 1.1 && Number(row[2]) >= 1.098,
    );
    const closesAbove = table.rows.map((row) => Number(row[3]) > 1.1);
    const closesBelow = table.rows.map((row) => Number(row[3]) < 1.098);
    expect(touches).toEqual([true, true, false, true]);
    expect(closesAbove).toEqual([false, true, true, false]);
    expect(closesBelow).toEqual([false, false, false, true]);
  });
  it("resolves the real quiz page with a sanitized assessment", async () => {
    const page = await GenericSegment({
      params: Promise.resolve({ level: "level-6", segment: "quiz" }),
    });
    expect(page.props.assessment.id).toBe("price-action-foundations-quiz");
    expect(getCurrentPublishedAssessment(page.props.assessment.id)).toBe(
      priceActionFoundationsQuizV1,
    );
    const publicJson = JSON.stringify(
      toPublicAssessment(priceActionFoundationsQuizV1),
    );
    expect(publicJson).not.toContain("correctChoiceIds");
    expect(publicJson).not.toContain("explanation");
    const context = getForexQuizContext(
      "price-action",
      "price-action-foundations",
    )!;
    expect(context.lessonIds).toHaveLength(3);
    expect(context.module.assessmentRequirements).toContainEqual({
      assessmentId: priceActionFoundationsQuizV1.id,
      completionPolicy: "any-passed-version",
    });
  });
  it("grades all 18 questions at the 70% threshold with exact multiple-answer selection", () => {
    const quiz = priceActionFoundationsQuizV1;
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
      "/learn/forex/level-6/quiz",
    ])
      expect(urls.filter((url) => url.endsWith(path))).toHaveLength(1);
    [4, 6, 4, 4, 3, 3].forEach((count, level) =>
      expect(
        getPublishedLessons({ learningPath: "forex", level: `level-${level}` }),
      ).toHaveLength(count),
    );
    expect(getGenericForexLevelContext("level-11")).toBeUndefined();
  });
});
