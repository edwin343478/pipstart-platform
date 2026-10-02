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
} from "../lib/calculator-engine";
import { getForexQuizContext } from "../lib/forex-quiz-context";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { getCurrentPublishedAssessment } from "../lib/assessment-registry";
import { fundamentalAnalysisFoundationsQuizV1 } from "../lib/fundamental-analysis-foundations-assessment";
vi.mock("./learn/forex/level-1/quiz/quiz-client", () => ({
  ForexFoundationsQuiz: () => null,
}));
import GenericSegment from "./learn/forex/[level]/[segment]/page";
import sitemap from "./sitemap";

const lessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-7",
});
const slugs = [
  "economic-news-and-currency-demand",
  "policy-and-market-relationships",
  "use-an-economic-calendar-safely",
];
describe("Milestone 15 complete Level 7", () => {
  it("publishes the three manuscript lessons through all hierarchy and lesson routes", () => {
    expect(lessons.map((l) => l.id)).toEqual(slugs);
    expect(lessons.map((l) => l.sections?.length)).toEqual([13, 14, 13]);
    expect(getGenericForexLevelRootLesson("level-7")?.lesson.id).toBe(slugs[0]);
    expect(
      getGenericForexSecondSegment("level-7", "fundamental-analysis")?.kind,
    ).toBe("course");
    expect(
      getGenericForexModule(
        "level-7",
        "fundamental-analysis",
        "fundamental-analysis-foundations",
      ),
    ).toBeDefined();
    expect(getGenericForexLevelContext("level-7")?.progressKey).toBe(
      "pipstart:learn:forex:level-7:fundamental-analysis:progress",
    );
    expect(getGenericForexLevelContext("level-7")?.quizTarget).toMatchObject({
      href: "/learn/forex/level-7/quiz",
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
          getGenericForexSecondSegment("level-7", lesson.slug),
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
          contextTitle="Fundamental Analysis Foundations"
          contextHref="/learn/forex/level-7/fundamental-analysis"
        />,
      );
      expect(markup).toContain("Show all sections at once");
      expect(markup).toContain(`Section 1 of ${lesson.sections!.length}`);
      expect(markup).toContain(`${lesson.sections![1].title}`);
      expect(markup).toContain("/learn/forex/level-7/quiz");
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
  it("checks the authored importer, inflation, growth and return arithmetic", () => {
    expect(100 * 5).toBe(500);
    expect(100 * 5.2).toBe(520);
    expect((520 / 500 - 1) * 100).toBeCloseTo(4);
    expect((104 / 100 - 1) * 100).toBeCloseTo(4);
    expect((106 / 104 - 1) * 100).toBeCloseTo(1.9231, 4);
    expect((Math.pow(1.01, 4) - 1) * 100).toBeCloseTo(4.0604, 4);
    expect((4.25 - 4) * 100).toBe(25);
    expect(100 * 1.04 * 0.92).toBeCloseTo(95.68);
    expect((1.04 / 1.03 - 1) * 100).toBeCloseTo(0.9709, 4);
    const content = JSON.stringify(lessons.flatMap((l) => l.blocks));
    for (const result of [
      "R$500",
      "R$520",
      "4.06%",
      "25 basis points",
      "£95.68",
      "0.97%",
    ])
      expect(content).toContain(result);
  });
  it("checks actual quote-table spreads and executable outcomes against the tools", () => {
    const table = lessons[2].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented EUR/USD quotes"),
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Quote table missing");
    const quotes = table.rows.map((row) => ({
      bid: Number(row[1]),
      ask: Number(row[2]),
      mid: Number(row[3]),
      spread: Number(row[4].replace(" pips", "")),
    }));
    for (const q of quotes) {
      expect((q.ask - q.bid) / 0.0001).toBeCloseTo(q.spread);
      expect((q.ask + q.bid) / 2).toBeCloseTo(q.mid);
    }
    expect((quotes[1].mid - quotes[0].mid) / 0.0001).toBeCloseTo(5);
    expect(
      calculateProfitLoss(
        "long",
        "EUR/USD",
        0.01,
        quotes[0].ask,
        quotes[1].bid,
        1,
        "USD",
      ).profitLoss,
    ).toBeCloseTo(0);
    expect(
      calculateProfitLoss(
        "long",
        "EUR/USD",
        0.01,
        quotes[1].ask,
        quotes[1].bid,
        1,
        "USD",
      ).profitLoss,
    ).toBeCloseTo(-0.8);
    expect(
      calculatePipValue("EUR/USD", 0.01, 1, "USD").valuePerPip,
    ).toBeCloseTo(0.1);
    expect(
      calculateProfitLoss("long", "EUR/USD", 0.01, 1.1, 1.095, 1, "USD")
        .profitLoss,
    ).toBeCloseTo(-5);
    expect(
      calculatePositionSize(1000, 1, 20, 1, "EUR/USD", "USD").lots,
    ).toBeCloseTo(0.05);
  });
  it("checks the authored clock table with both supplied source offsets", () => {
    const table = lessons[2].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented clock exercise"),
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Clock table missing");
    const minutes = (s: string) =>
      s
        .split(":")
        .map(Number)
        .reduce((h, m) => h * 60 + m);
    for (const [i, row] of table.rows.entries()) {
      const utc = minutes("08:30") + (i === 0 ? 4 : 5) * 60;
      expect(minutes(row[1])).toBe(utc);
      expect(minutes(row[2])).toBe(utc + 3 * 60);
      expect(minutes(row[3])).toBe(utc + 2 * 60);
    }
    const payroll = lessons[0].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented payroll release"),
    );
    if (!payroll || payroll.type !== "comparisonTable")
      throw new Error("Payroll table missing");
    expect(Number(payroll.rows[1][1]) - Number(payroll.rows[0][1])).toBe(40);
    expect(Number(payroll.rows[4][1]) - Number(payroll.rows[3][1])).toBe(-60);
  });
  it("resolves the real quiz page with a sanitized assessment", async () => {
    const page = await GenericSegment({
      params: Promise.resolve({ level: "level-7", segment: "quiz" }),
    });
    expect(page.props.assessment.id).toBe(
      "fundamental-analysis-foundations-quiz",
    );
    expect(getCurrentPublishedAssessment(page.props.assessment.id)).toBe(
      fundamentalAnalysisFoundationsQuizV1,
    );
    const publicJson = JSON.stringify(
      toPublicAssessment(fundamentalAnalysisFoundationsQuizV1),
    );
    expect(publicJson).not.toContain("correctChoiceIds");
    expect(publicJson).not.toContain("explanation");
    const context = getForexQuizContext(
      "fundamental-analysis",
      "fundamental-analysis-foundations",
    )!;
    expect(context.lessonIds).toHaveLength(3);
    expect(context.module.assessmentRequirements).toContainEqual({
      assessmentId: fundamentalAnalysisFoundationsQuizV1.id,
      completionPolicy: "any-passed-version",
    });
  });
  it("grades all 18 questions at the 70% threshold with exact multiple-answer selection", () => {
    const quiz = fundamentalAnalysisFoundationsQuizV1;
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
      "/learn/forex/level-7/quiz",
    ])
      expect(urls.filter((url) => url.endsWith(path))).toHaveLength(1);
    [4, 6, 4, 4, 3, 3, 3].forEach((count, level) =>
      expect(
        getPublishedLessons({ learningPath: "forex", level: `level-${level}` }),
      ).toHaveLength(count),
    );
    expect(getGenericForexLevelContext("level-11")).toBeUndefined();
  });
});
