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
  calculateProfitLoss,
  calculateRiskReward,
  calculateDrawdown,
  calculateGainRecovery,
} from "../lib/calculator-engine";
import { getForexQuizContext } from "../lib/forex-quiz-context";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { getCurrentPublishedAssessment } from "../lib/assessment-registry";
import { strategyDevelopmentFoundationsQuizV1 } from "../lib/strategy-development-foundations-assessment";
vi.mock("./learn/forex/level-1/quiz/quiz-client", () => ({
  ForexFoundationsQuiz: () => null,
}));
import GenericSegment from "./learn/forex/[level]/[segment]/page";
import sitemap from "./sitemap";

const lessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-9",
});
const slugs = [
  "write-a-strategy-that-can-be-checked",
  "test-without-looking-ahead",
  "read-the-results-honestly",
];
describe("Milestone 15 complete Level 9", () => {
  it("publishes the three manuscript lessons through all hierarchy and lesson routes", () => {
    expect(lessons.map((l) => l.id)).toEqual(slugs);
    expect(lessons.map((l) => l.sections?.length)).toEqual([14, 15, 15]);
    expect(getGenericForexLevelRootLesson("level-9")?.lesson.id).toBe(slugs[0]);
    expect(
      getGenericForexSecondSegment("level-9", "strategy-development")?.kind,
    ).toBe("course");
    expect(
      getGenericForexModule(
        "level-9",
        "strategy-development",
        "strategy-development-foundations",
      ),
    ).toBeDefined();
    expect(getGenericForexLevelContext("level-9")?.progressKey).toBe(
      "pipstart:learn:forex:level-9:strategy-development:progress",
    );
    expect(getGenericForexLevelContext("level-9")?.quizTarget).toMatchObject({
      href: "/learn/forex/level-9/quiz",
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
          getGenericForexSecondSegment("level-9", lesson.slug),
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
          contextTitle="Strategy Development Foundations"
          contextHref="/learn/forex/level-9/strategy-development"
        />,
      );
      expect(markup).toContain("Show all sections at once");
      expect(markup).toContain(`Section 1 of ${lesson.sections!.length}`);
      expect(markup).toContain(`Next: ${lesson.sections![1].title}`);
      expect(markup).toContain("/learn/forex/level-9/quiz");
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
  it("checks the authored prior-bar reference, quote gates and risk scenarios against actual tools", () => {
    const table = lessons[0].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented EUR/CAD prior-five"),
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Reference table missing");
    const reference = Math.max(...table.rows.map((row) => Number(row[1])));
    expect(reference).toBe(1.462);
    expect(1.463 > reference).toBe(true);
    expect(reference > reference).toBe(false);
    expect((1.4632 - 1.463) / 0.0001).toBeCloseTo(2);
    expect(1.4632 <= 1.4633).toBe(true);
    expect(
      calculateRiskReward("long", 1.4632, 1.4612, 1.4672).ratio,
    ).toBeCloseTo(2);
    expect(
      calculatePositionSize(1000, 1, 20, 1, "EUR/CAD", "CAD"),
    ).toMatchObject({ lots: 0.05, riskAmount: 10 });
    expect(
      calculatePipValue("EUR/CAD", 0.05, 1, "CAD").valuePerPip,
    ).toBeCloseTo(0.5);
    expect(
      calculateProfitLoss("long", "EUR/CAD", 0.05, 1.4632, 1.4607, 1, "CAD")
        .profitLoss - 0.5,
    ).toBeCloseTo(-13);
  });
  it("checks every authored execution/cost row against the price-only calculator", () => {
    const table = lessons[1].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented EUR/USD long cash scenarios"),
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Cost table missing");
    const cash = (s: string) =>
      Number(s.replace("US$", "").replace("+", "").replace("−", "-"));
    for (const row of table.rows) {
      const price = calculateProfitLoss(
        "long",
        "EUR/USD",
        0.01,
        Number(row[0]),
        Number(row[1]),
        1,
        "USD",
      ).profitLoss;
      expect(price).toBeCloseTo(cash(row[2]));
      expect(price - cash(row[3])).toBeCloseTo(cash(row[4]));
    }
    const audit = lessons[1].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented candidate audit"),
    );
    if (!audit || audit.type !== "comparisonTable")
      throw new Error("Audit table missing");
    const counts = audit.rows.map((row) => Number(row[1]));
    expect(counts[0] - counts[1] - counts[2]).toBe(counts[3]);
    expect(counts[4] + counts[5]).toBe(counts[3]);
    expect(counts).toEqual([20, 5, 2, 13, 11, 2]);
  });
  it("recomputes the full pound ledger, sample measures and running-peak drawdown", () => {
    const table = lessons[2].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented GBP/USD outcomes"),
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Pound ledger missing");
    const pounds = (s: string) =>
      Number(s.replace("£", "").replace("+", "").replace("−", "-"));
    const results = table.rows.map((row) => pounds(row[1]));
    const gains = results.filter((x) => x > 0),
      losses = results.filter((x) => x < 0);
    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    expect(results).toHaveLength(10);
    expect(gains.length / results.length).toBe(0.9);
    expect(sum(gains) / gains.length).toBe(1);
    expect(-sum(losses) / losses.length).toBe(12);
    expect(sum(results)).toBe(-3);
    expect(sum(results) / results.length).toBeCloseTo(-0.3);
    expect(sum(gains) / -sum(losses)).toBe(0.75);
    let balance = 100,
      peak = 100,
      maxDrawdown = 0;
    for (const [i, result] of results.entries()) {
      balance += result;
      peak = Math.max(peak, balance);
      expect(balance).toBe(pounds(table.rows[i][2]));
      maxDrawdown = Math.max(maxDrawdown, ((peak - balance) / peak) * 100);
    }
    expect(balance).toBe(97);
    expect(peak).toBe(109);
    expect(maxDrawdown).toBeCloseTo((12 / 109) * 100);
    const drawdown = calculateDrawdown(109, 12, "amount", "GBP");
    expect(drawdown.remainingBalance).toBe(97);
    expect(drawdown.drawdownPercent).toBeCloseTo(maxDrawdown);
    expect(drawdown.recoveryPercent).toBeCloseTo((12 / 97) * 100);
    const recovery = calculateGainRecovery(97, 109, 1, "GBP");
    expect(recovery.periods).toBe(12);
    expect(recovery.projectedBalance).toBeGreaterThanOrEqual(109);
    expect(97 * Math.pow(1.01, 11)).toBeLessThan(109);
  });
  it("retains zero cases in the authored expectancy denominator and distinguishes an added-charge scenario", () => {
    const table = lessons[2].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Six invented completed net results"),
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Zero-case ledger missing");
    const results = table.rows.map((row) => Number(row[1].replace("−", "-")));
    const gains = results.filter((x) => x > 0),
      losses = results.filter((x) => x < 0),
      zeros = results.filter((x) => x === 0);
    const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
    const winRate = gains.length / results.length,
      lossRate = losses.length / results.length;
    const expectancy =
      winRate * (sum(gains) / gains.length) -
      lossRate * (-sum(losses) / losses.length);
    expect(zeros).toHaveLength(2);
    expect(results).toHaveLength(6);
    expect(expectancy).toBeCloseTo(sum(results) / results.length);
    expect(expectancy).toBeCloseTo(1 / 3);
    expect(sum(gains) / -sum(losses)).toBe(1.5);
    expect(lossRate).not.toBeCloseTo(1 - winRate);
    expect(sum(results) - results.length * 0.5).toBe(-1);
    expect(
      calculateProfitLoss("long", "EUR/USD", 0.01, 1.1, 1.1012, 1, "USD")
        .profitLoss - 0.2,
    ).toBeCloseTo(1);
  });
  it("resolves the real quiz page with a sanitized assessment", async () => {
    const page = await GenericSegment({
      params: Promise.resolve({ level: "level-9", segment: "quiz" }),
    });
    expect(page.props.assessment.id).toBe(
      "strategy-development-foundations-quiz",
    );
    expect(getCurrentPublishedAssessment(page.props.assessment.id)).toBe(
      strategyDevelopmentFoundationsQuizV1,
    );
    const publicJson = JSON.stringify(
      toPublicAssessment(strategyDevelopmentFoundationsQuizV1),
    );
    expect(publicJson).not.toContain("correctChoiceIds");
    expect(publicJson).not.toContain("explanation");
    const context = getForexQuizContext(
      "strategy-development",
      "strategy-development-foundations",
    )!;
    expect(context.lessonIds).toHaveLength(3);
    expect(context.module.assessmentRequirements).toContainEqual({
      assessmentId: strategyDevelopmentFoundationsQuizV1.id,
      completionPolicy: "any-passed-version",
    });
  });
  it("grades all 18 questions at the 70% threshold with exact multiple-answer selection", () => {
    const quiz = strategyDevelopmentFoundationsQuizV1;
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
      "/learn/forex/level-9/quiz",
    ])
      expect(urls.filter((url) => url.endsWith(path))).toHaveLength(1);
    [4, 6, 4, 4, 3, 3, 3, 3, 3].forEach((count, level) =>
      expect(
        getPublishedLessons({ learningPath: "forex", level: `level-${level}` }),
      ).toHaveLength(count),
    );
    expect(getGenericForexLevelContext("level-11")).toBeUndefined();
  });
});
