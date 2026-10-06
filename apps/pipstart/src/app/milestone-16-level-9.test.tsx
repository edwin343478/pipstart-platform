import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("../components/lesson-bookmark-button", () => ({
  LessonBookmarkButton: () => null,
}));
import { cryptoLessons } from "./learn/crypto/level-9/lessons";
import { CryptoLessonPage } from "./learn/crypto/level-9/crypto-lesson";
import { generateStaticParams } from "./learn/crypto/level-9/[lesson]/page";
import { cryptoPlanningPracticeQuizV1 } from "../lib/crypto-planning-and-practice-assessment";
import { getCurrentPublishedAssessment } from "../lib/assessment-registry";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { getCryptoOrientationQuizClientContext } from "../lib/crypto-orientation-quiz-context";
import { getCurriculumModule } from "../lib/curriculum";
import { prepareLessonPageData } from "../lib/lesson-page-server-data";
import { assertUniqueCurriculumIds } from "../lib/permanent-progress-catalogue";
import {
  calculateGainRecovery,
  calculateDrawdown,
  calculateRiskReward,
} from "../lib/calculator-engine";
const titles = [
  "Emotions Biases and Attention in Crypto Markets",
  "Write a Crypto Plan and Define Testable Rules",
  "Test Without Looking Ahead",
  "Read Results Honestly and Build a Practice Routine",
];
describe("Milestone 16 approved Crypto Level 9", () => {
  it("publishes four complete lessons with sequential prerequisites and all published routes", () => {
    expect(cryptoLessons.map((x) => x.title)).toEqual(titles);
    expect(cryptoLessons.map((x) => x.position)).toEqual([1, 2, 3, 4]);
    expect(cryptoLessons.map((x) => x.sections?.length)).toEqual([5, 4, 3, 3]);
    expect(cryptoLessons[0]).toMatchObject({
      id: "emotions-biases-and-attention-in-crypto-markets",
      href: "/learn/crypto/level-9",
      course: "crypto-planning-and-practice",
      module: "psychology-planning-and-paper-practice",
      prerequisites: ["dca-rebalancing-exits-and-useful-records"],
    });
    expect(generateStaticParams()).toEqual(
      cryptoLessons.slice(1).map((x) => ({ lesson: x.slug })),
    );
    expect(assertUniqueCurriculumIds()).toBeUndefined();
    for (const [index, lesson] of cryptoLessons.entries()) {
      expect(lesson.approved).toBe(true);
      expect(lesson.author).not.toBe(lesson.reviewer);
      expect(lesson.sources.length).toBeGreaterThan(0);
      expect(lesson.sources.every((x) => x.url.startsWith("https://"))).toBe(
        true,
      );
      if (index)
        expect(lesson.prerequisites).toEqual([cryptoLessons[index - 1].id]);
      expect(JSON.stringify(lesson.blocks)).not.toMatch(
        /G20|Example using G20|\*\*/,
      );
      expect(lesson.blocks.filter((x) => x.type === "practice")).toHaveLength(
        2,
      );
      for (const block of lesson.blocks)
        if (block.type === "keyPoint")
          expect(block.points.every((x) => !/[☐□✓•]/.test(x))).toBe(true);
    }
  });
  it("retains the approved native tables, manuscript diagrams and accessible formulas", () => {
    const blocks = cryptoLessons.flatMap((x) => x.blocks);
    expect(blocks.filter((x) => x.type === "comparisonTable")).toHaveLength(10);
    expect(blocks.filter((x) => x.type === "formula")).toHaveLength(6);
    const diagrams = blocks.filter((x) => x.type === "diagram");
    expect(diagrams).toHaveLength(5);
    for (const diagram of diagrams)
      expect(
        fs.existsSync(path.join(process.cwd(), "public", diagram.src)),
      ).toBe(true);
  });
  it("renders full content before enhancement with closed practice, correct quiz and compact sidebar", () => {
    for (const lesson of cryptoLessons) {
      const html = renderToStaticMarkup(<CryptoLessonPage lesson={lesson} />);
      expect(html).toContain('data-enhanced="false"');
      expect(html).toContain("References and further reading");
      expect(html).toContain("Lesson completion check");
      expect(html.match(/Compare with the worked answers/g)).toHaveLength(2);
      expect(html).not.toMatch(/<details[^>]*\sopen(?:[= >])/);
      expect(html).toContain("?section=1&amp;all=0");
      expect(html).toContain('href="/learn/crypto/level-9/quiz"');
      expect(html).not.toContain('href="/learn/forex/level-9/quiz"');
      const data = prepareLessonPageData({
        path: "crypto",
        lesson,
        lessons: cryptoLessons,
        contextTitle: "Psychology Planning and Paper Practice",
        contextHref: "/learn/crypto/level-9/crypto-planning-and-practice",
      });
      expect(data.registeredQuiz?.href).toBe("/learn/crypto/level-9/quiz");
      expect(
        data.lessons.every(
          (x) => Object.keys(x).sort().join(",") === "href,id,title",
        ),
      ).toBe(true);
    }
  });
  it("uses approved fifteen questions and explained key, server grading and existing completion policy", () => {
    const quiz = getCurrentPublishedAssessment(
      "crypto-planning-and-practice-quiz",
    )!;
    expect(quiz).toBe(cryptoPlanningPracticeQuizV1);
    expect(quiz.questions).toHaveLength(15);
    expect(quiz.questions.map((x) => x.correctChoiceIds[0])).toEqual([
      "b",
      "a",
      "c",
      "c",
      "c",
      "d",
      "c",
      "a",
      "a",
      "b",
      "d",
      "a",
      "c",
      "a",
      "c",
    ]);
    expect(
      quiz.questions.every((x) => x.explanation.includes("Correct choice")),
    ).toBe(true);
    const selections = (count: number) =>
      Object.fromEntries(
        quiz.questions.slice(0, count).map((x) => [x.id, x.correctChoiceIds]),
      );
    expect(gradeAssessment(quiz, selections(15))).toMatchObject({
      passed: true,
      percentage: 100,
    });
    expect(gradeAssessment(quiz, selections(12))).toMatchObject({
      passed: true,
      percentage: 80,
    });
    expect(gradeAssessment(quiz, selections(11)).passed).toBe(false);
    const publicData = JSON.stringify(toPublicAssessment(quiz));
    expect(publicData).not.toContain("correctChoiceIds");
    for (const question of toPublicAssessment(quiz).questions) {
      expect(question).not.toHaveProperty("correctChoiceIds");
      expect(question).not.toHaveProperty("explanation");
    }
    const context = getCryptoOrientationQuizClientContext(
      "crypto-planning-and-practice",
      "psychology-planning-and-paper-practice",
    )!;
    expect(context.lessons).toHaveLength(4);
    expect(context.progressKey).toBe(
      "pipstart:learn:crypto:level-9:crypto-planning-and-practice:progress",
    );
    expect(
      getCurriculumModule("crypto", "psychology-planning-and-paper-practice")
        ?.assessmentRequirements,
    ).toEqual([
      { assessmentId: quiz.id, completionPolicy: "any-passed-version" },
    ]);
  });
  it("highlights compatible tools and checks recovery bases and the observed paper drawdown", () => {
    const links = cryptoLessons
      .flatMap((x) => x.blocks)
      .filter((x) => x.type === "learningLink");
    expect(links).toHaveLength(5);
    expect(new Set(links.map((x) => x.href))).toEqual(
      new Set([
        "/tools/gain-recovery-calculator",
        "/tools/drawdown-calculator",
        "/tools/risk-reward-calculator",
      ]),
    );
    for (const lesson of cryptoLessons) {
      const count = lesson.blocks.filter(
        (x) => x.type === "learningLink",
      ).length;
      const html = renderToStaticMarkup(<CryptoLessonPage lesson={lesson} />);
      expect((html.match(/Practise with a PipStart tool/g) ?? []).length).toBe(
        count,
      );
    }
    for (const [balance, required, periods] of [
      [500, 100, 15],
      [250, 300, 29],
      [100, 900, 48],
    ]) {
      const result = calculateGainRecovery(balance, 1000, 5, "USD");
      expect(result.totalGainNeeded).toBeCloseTo(required, 8);
      expect(result.periods).toBe(periods);
    }
    const observed = calculateDrawdown(1038, 88, "amount", "USD");
    expect(observed.remainingBalance).toBe(950);
    expect(observed.drawdownPercent.toFixed(2)).toBe("8.48");
    expect(observed.recoveryPercent.toFixed(2)).toBe("9.26");
    expect(
      calculateRiskReward("long", 50000, 47500, 55000).ratio.toFixed(2),
    ).toBe("2.00");
    expect(
      links
        .filter((x) => x.href.endsWith("gain-recovery-calculator"))
        .every((x) => x.description.includes("not a loss-percentage input")),
    ).toBe(true);
    expect(
      links
        .filter((x) => x.href.endsWith("drawdown-calculator"))
        .every((x) =>
          x.description.includes("does not ingest a full equity series"),
        ),
    ).toBe(true);
  });
});
