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
  calculateDrawdown,
} from "../lib/calculator-engine";
import { getForexQuizContext } from "../lib/forex-quiz-context";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { getCurrentPublishedAssessment } from "../lib/assessment-registry";
import { psychologyFoundationsQuizV1 } from "../lib/psychology-foundations-assessment";
vi.mock("./learn/forex/level-1/quiz/quiz-client", () => ({
  ForexFoundationsQuiz: () => null,
}));
import GenericSegment from "./learn/forex/[level]/[segment]/page";
import sitemap from "./sitemap";

const lessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-8",
});
const slugs = [
  "emotions-around-a-decision",
  "how-thinking-can-go-wrong",
  "a-repeatable-practice-habit",
];
describe("Milestone 15 complete Level 8", () => {
  it("publishes the three manuscript lessons through all hierarchy and lesson routes", () => {
    expect(lessons.map((l) => l.id)).toEqual(slugs);
    expect(lessons.map((l) => l.sections?.length)).toEqual([13, 14, 14]);
    expect(getGenericForexLevelRootLesson("level-8")?.lesson.id).toBe(slugs[0]);
    expect(getGenericForexSecondSegment("level-8", "psychology")?.kind).toBe(
      "course",
    );
    expect(
      getGenericForexModule("level-8", "psychology", "psychology-foundations"),
    ).toBeDefined();
    expect(getGenericForexLevelContext("level-8")?.progressKey).toBe(
      "pipstart:learn:forex:level-8:psychology:progress",
    );
    expect(getGenericForexLevelContext("level-8")?.quizTarget).toMatchObject({
      href: "/learn/forex/level-8/quiz",
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
          getGenericForexSecondSegment("level-8", lesson.slug),
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
          contextTitle="Psychology Foundations"
          contextHref="/learn/forex/level-8/psychology"
        />,
      );
      expect(markup).toContain("Show all sections at once");
      expect(markup).toContain(`Section 1 of ${lesson.sections!.length}`);
      expect(markup).toContain(`${lesson.sections![1].title}`);
      expect(markup).toContain("/learn/forex/level-8/quiz");
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
  it("checks the late-entry table against actual AUD/USD contract and calculator results", () => {
    const table = lessons[0].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented AUD/USD long comparison"),
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Late-entry table missing");
    const entries = [Number(table.rows[0][1]), Number(table.rows[0][2])];
    for (const [i, entry] of entries.entries()) {
      const column = i + 1;
      const exit = Number(table.rows[1][column]);
      const pips = Number(table.rows[2][column].replace(" pips", ""));
      const lots = Number(table.rows[3][column].replace(" lot", ""));
      const cash = Number(table.rows[4][column].replace("US$", ""));
      expect((entry - exit) / 0.0001).toBeCloseTo(pips);
      expect(
        -calculateProfitLoss("long", "AUD/USD", lots, entry, exit, 1, "USD")
          .profitLoss,
      ).toBeCloseTo(cash);
    }
    expect(entries.map((entry) => entry < 0.66)).toEqual([true, false]);
    expect(0.66 < 0.66).toBe(false);
    expect(0.6635 < entries[1]).toBe(true);
    expect(
      calculatePipValue("AUD/USD", 0.01, 1, "USD").valuePerPip,
    ).toBeCloseTo(0.1);
  });
  it("checks the full-sample price/fee table and drawdown arithmetic against real tools", () => {
    const table = lessons[1].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented equal-size set"),
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Sample table missing");
    const gain = calculateProfitLoss(
      "long",
      "EUR/USD",
      0.01,
      1.1,
      1.108,
      1,
      "USD",
    ).profitLoss;
    const loss = calculateProfitLoss(
      "long",
      "EUR/USD",
      0.01,
      1.1,
      1.094,
      1,
      "USD",
    ).profitLoss;
    expect(gain).toBeCloseTo(8);
    expect(loss).toBeCloseTo(-6);
    const count = Number(table.rows[0][1]) + Number(table.rows[1][1]);
    expect(count).toBe(Number(table.rows[2][1]));
    expect(
      gain * Number(table.rows[0][1]) +
        loss * Number(table.rows[1][1]) -
        count * 0.5,
    ).toBeCloseTo(-18);
    expect(calculateDrawdown(1000, 20, "percent", "USD")).toMatchObject({
      amountLost: 200,
      remainingBalance: 800,
      recoveryPercent: 25,
    });
    expect(
      calculatePositionSize(1000, 1, 20, 1, "EUR/USD", "USD"),
    ).toMatchObject({ lots: 0.05, riskAmount: 10 });
    expect(
      -calculateProfitLoss("long", "EUR/USD", 0.1, 1.1, 1.098, 1, "USD")
        .profitLoss,
    ).toBeCloseTo(20);
    const escalation = lessons[0].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented escalation"),
    );
    if (!escalation || escalation.type !== "comparisonTable")
      throw new Error("Escalation table missing");
    let cumulative = 0;
    for (const row of escalation.rows) {
      cumulative += Number(row[1].replace("US$", ""));
      expect(cumulative).toBe(Number(row[2].replace("US$", "")));
    }
    expect(cumulative).toBe(150);
  });
  it("keeps unclear process cases and valid skips visible in the authored weekly record", () => {
    const table = lessons[2].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("Invented six-session process review"),
    );
    if (!table || table.type !== "comparisonTable")
      throw new Error("Process table missing");
    expect(table.rows).toHaveLength(6);
    const followed = table.rows.filter((row) => row[1] === "Followed").length;
    const assessable = table.rows.filter((row) => row[1] !== "Unclear").length;
    expect(followed).toBe(4);
    expect(assessable).toBe(5);
    expect((followed / assessable) * 100).toBe(80);
    expect(
      table.rows.some(
        (row) => row[1] === "Breached" && row[2].includes("gain"),
      ),
    ).toBe(true);
    expect(
      table.rows.some(
        (row) => row[1] === "Followed" && row[2].includes("loss"),
      ),
    ).toBe(true);
    expect(
      table.rows.filter((row) => row[2].includes("no order")),
    ).toHaveLength(2);
    const routine = lessons[2].blocks.find(
      (b) =>
        b.type === "comparisonTable" &&
        b.caption?.startsWith("A twenty-minute"),
    );
    if (!routine || routine.type !== "comparisonTable")
      throw new Error("Routine table missing");
    expect(routine.rows).toHaveLength(3);
    expect(routine.rows.map((row) => row[0])).toEqual([
      "First 5 minutes",
      "Next 10 minutes",
      "Final 5 minutes",
    ]);
  });
  it("resolves the real quiz page with a sanitized assessment", async () => {
    const page = await GenericSegment({
      params: Promise.resolve({ level: "level-8", segment: "quiz" }),
    });
    expect(page.props.assessment.id).toBe("psychology-foundations-quiz");
    expect(getCurrentPublishedAssessment(page.props.assessment.id)).toBe(
      psychologyFoundationsQuizV1,
    );
    const publicJson = JSON.stringify(
      toPublicAssessment(psychologyFoundationsQuizV1),
    );
    expect(publicJson).not.toContain("correctChoiceIds");
    expect(publicJson).not.toContain("explanation");
    const context = getForexQuizContext(
      "psychology",
      "psychology-foundations",
    )!;
    expect(context.lessonIds).toHaveLength(3);
    expect(context.module.assessmentRequirements).toContainEqual({
      assessmentId: psychologyFoundationsQuizV1.id,
      completionPolicy: "any-passed-version",
    });
  });
  it("grades all 18 questions at the 70% threshold with exact multiple-answer selection", () => {
    const quiz = psychologyFoundationsQuizV1;
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
      "/learn/forex/level-8/quiz",
    ])
      expect(urls.filter((url) => url.endsWith(path))).toHaveLength(1);
    [4, 6, 4, 4, 3, 3, 3, 3].forEach((count, level) =>
      expect(
        getPublishedLessons({ learningPath: "forex", level: `level-${level}` }),
      ).toHaveLength(count),
    );
    expect(getGenericForexLevelContext("level-11")).toBeUndefined();
  });
});
