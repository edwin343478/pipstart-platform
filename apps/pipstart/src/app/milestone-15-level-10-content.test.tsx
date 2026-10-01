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
  calculatePipValue,
  calculateProfitLoss,
} from "../lib/calculator-engine";
import { getForexQuizContext } from "../lib/forex-quiz-context";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { getCurrentPublishedAssessment } from "../lib/assessment-registry";
import { advancedForexFoundationsQuizV1 } from "../lib/advanced-forex-foundations-assessment";
vi.mock("./learn/forex/level-1/quiz/quiz-client", () => ({
  ForexFoundationsQuiz: () => null,
}));
import GenericSegment from "./learn/forex/[level]/[segment]/page";
import sitemap from "./sitemap";

const lessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-10",
});
const slugs = [
  "relationships-that-can-change",
  "liquidity-and-market-positioning",
  "review-the-whole-portfolio",
];
describe("Milestone 15 complete Level 10", () => {
  it("publishes the three manuscript lessons through all hierarchy and lesson routes", () => {
    expect(lessons.map((l) => l.id)).toEqual(slugs);
    expect(lessons.map((l) => l.sections?.length)).toEqual([13, 14, 16]);
    expect(getGenericForexLevelRootLesson("level-10")?.lesson.id).toBe(
      slugs[0],
    );
    expect(
      getGenericForexSecondSegment("level-10", "advanced-forex")?.kind,
    ).toBe("course");
    expect(
      getGenericForexModule(
        "level-10",
        "advanced-forex",
        "advanced-forex-foundations",
      ),
    ).toBeDefined();
    expect(getGenericForexLevelContext("level-10")?.progressKey).toBe(
      "pipstart:learn:forex:level-10:advanced-forex:progress",
    );
    expect(getGenericForexLevelContext("level-10")?.quizTarget).toMatchObject({
      href: "/learn/forex/level-10/quiz",
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
          getGenericForexSecondSegment("level-10", lesson.slug),
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
          contextTitle="Advanced Forex Foundations"
          contextHref="/learn/forex/level-10/advanced-forex"
        />,
      );
      expect(markup).toContain("Show all sections at once");
      expect(markup).toContain(`Section 1 of ${lesson.sections!.length}`);
      expect(markup).toContain(`Next: ${lesson.sections![1].title}`);
      expect(markup).toContain("/learn/forex/level-10/quiz");
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
  it("preserves the manuscript matrix and checks return/inversion/yield arithmetic", () => {
    const table = lessons[0].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption === "Invented correlation matrix of monthly returns",
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Matrix missing");
    const matrix = table.rows.map((row) =>
      row.slice(1).map((value) => Number(value.replace("−", "-"))),
    );
    expect(matrix).toEqual([
      [1, 0.65, -0.3],
      [0.65, 1, -0.2],
      [-0.3, -0.2, 1],
    ]);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) expect(matrix[i][j]).toBe(matrix[j][i]);
    const determinant =
      1 + 2 * 0.65 * -0.3 * -0.2 - 0.65 ** 2 - (-0.3) ** 2 - (-0.2) ** 2;
    expect(determinant).toBeGreaterThan(0);
    expect((1.111 / 1.1 - 1) * 100).toBeCloseTo(1);
    expect((-0.1 / 1.1) * 100).toBeCloseTo(-9.090909);
    expect(100000 * 1.05 * 0.9).toBe(94500);
    const returns = lessons[0].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented aligned interval returns"),
    );
    if (!returns || returns.type !== "comparisonTable")
      throw new Error("Return table missing");
    const number = (v: string) => Number(v.replace("−", "-"));
    const corr = (xs: number[], ys: number[]) => {
      const avg = (x: number[]) => x.reduce((a, b) => a + b, 0) / x.length;
      const dx = xs.map((x) => x - avg(xs)),
        dy = ys.map((y) => y - avg(ys));
      return (
        dx.reduce((a, x, i) => a + x * dy[i], 0) /
        Math.sqrt(
          dx.reduce((a, x) => a + x * x, 0) * dy.reduce((a, y) => a + y * y, 0),
        )
      );
    };
    const xs = returns.rows.map((row) => number(row[1]));
    expect(
      corr(
        xs,
        returns.rows.map((row) => number(row[2])),
      ),
    ).toBe(1);
    expect(
      corr(
        xs,
        returns.rows.map((row) => number(row[3])),
      ),
    ).toBe(-1);
  });
  it("recomputes weighted depth fills, carry liability and position net changes", () => {
    const book = lessons[1].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption === "Invented single-venue EUR/USD ask depth",
    );
    if (!book || book.type !== "comparisonTable")
      throw new Error("Depth table missing");
    let quantity = 0,
      cost = 0;
    for (const row of book.rows) {
      const value = Number(row[0]) * Number(row[1]);
      expect(value).toBeCloseTo(Number(row[2]));
      quantity += Number(row[1]);
      cost += value;
    }
    expect(quantity).toBe(5000);
    expect(cost).toBeCloseTo(5501.9);
    expect(cost / quantity).toBeCloseTo(1.10038);
    expect((cost / quantity - 1.1001) / 0.0001).toBeCloseTo(2.8);
    expect(100000 * 1.05 * 0.9 - 100000 * 1.01).toBe(-6500);
    const positioning = lessons[1].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented category positions"),
    );
    if (!positioning || positioning.type !== "comparisonTable")
      throw new Error("Positions missing");
    const nets = positioning.rows.map((row) => Number(row[1]) - Number(row[2]));
    expect(nets).toEqual([10, 20]);
    expect(nets[1] - nets[0]).toBe(10);
  });
  it("reconciles combined portfolio charges and all seven graduation deliverables", () => {
    const table = lessons[2].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented Canadian demo portfolio scenarios"),
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Portfolio table missing");
    const totals = [1, 2, 3].map((col) =>
      table.rows.slice(0, 3).reduce((sum, row) => sum + Number(row[col]), 0),
    );
    expect(totals).toEqual([30, 40, 3]);
    expect(table.rows[3].slice(1).map(Number)).toEqual(totals);
    expect(totals[0] + totals[2]).toBe(33);
    expect(totals[1] + totals[2]).toBe(43);
    expect(33 <= 35).toBe(true);
    expect(43 <= 35).toBe(false);
    const project = lessons[2].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption === "The seven-part learning portfolio",
    );
    if (!project || project.type !== "comparisonTable")
      throw new Error("Graduation portfolio missing");
    expect(project.rows).toHaveLength(7);
    expect(project.rows.map((row) => Number(row[0][0]))).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(getPublishedLessons({ learningPath: "forex" })).toHaveLength(39);
  });
  it("checks execution price results and separately charged costs against the actual calculator", () => {
    const table = lessons[2].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption === "Invented EUR/USD long in a USD account",
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Execution table missing");
    const cash = (s: string) => Number(s.replace("US$", ""));
    expect(
      calculatePipValue("EUR/USD", 0.05, 1, "USD").valuePerPip,
    ).toBeCloseTo(0.5);
    for (const col of [1, 2]) {
      const price = calculateProfitLoss(
        "long",
        "EUR/USD",
        0.05,
        Number(table.rows[1][col]),
        Number(table.rows[2][col]),
        1,
        "USD",
      ).profitLoss;
      expect(price).toBeCloseTo(cash(table.rows[4][col]));
      expect(
        price - cash(table.rows[5][col]) - cash(table.rows[6][col]),
      ).toBeCloseTo(cash(table.rows[7][col]));
    }
    expect(cash(table.rows[7][1]) - cash(table.rows[7][2])).toBeCloseTo(2.7);
  });
  it("resolves the real quiz page with a sanitized assessment", async () => {
    const page = await GenericSegment({
      params: Promise.resolve({ level: "level-10", segment: "quiz" }),
    });
    expect(page.props.assessment.id).toBe("advanced-forex-foundations-quiz");
    expect(getCurrentPublishedAssessment(page.props.assessment.id)).toBe(
      advancedForexFoundationsQuizV1,
    );
    const publicJson = JSON.stringify(
      toPublicAssessment(advancedForexFoundationsQuizV1),
    );
    expect(publicJson).not.toContain("correctChoiceIds");
    expect(publicJson).not.toContain("explanation");
    const context = getForexQuizContext(
      "advanced-forex",
      "advanced-forex-foundations",
    )!;
    expect(context.lessonIds).toHaveLength(3);
    expect(context.module.assessmentRequirements).toContainEqual({
      assessmentId: advancedForexFoundationsQuizV1.id,
      completionPolicy: "any-passed-version",
    });
  });
  it("grades all 18 questions at the 70% threshold with exact multiple-answer selection", () => {
    const quiz = advancedForexFoundationsQuizV1;
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
      "/learn/forex/level-10/quiz",
    ])
      expect(urls.filter((url) => url.endsWith(path))).toHaveLength(1);
    [4, 6, 4, 4, 3, 3, 3, 3, 3, 3].forEach((count, level) =>
      expect(
        getPublishedLessons({ learningPath: "forex", level: `level-${level}` }),
      ).toHaveLength(count),
    );
    expect(getGenericForexLevelContext("level-11")).toBeUndefined();
  });
});
