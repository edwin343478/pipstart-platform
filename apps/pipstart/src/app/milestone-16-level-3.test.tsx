import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("../components/lesson-bookmark-button", () => ({
  LessonBookmarkButton: () => null,
}));
import { cryptoLessons } from "./learn/crypto/level-3/lessons";
import { CryptoLessonPage } from "./learn/crypto/level-3/crypto-lesson";
import { generateStaticParams } from "./learn/crypto/level-3/[lesson]/page";
import { cryptoExchangeQuizV1 } from "../lib/crypto-exchange-assessment";
import { getCurrentPublishedAssessment } from "../lib/assessment-registry";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { getCryptoOrientationQuizClientContext } from "../lib/crypto-orientation-quiz-context";
import { getCurriculumModule } from "../lib/curriculum";
import { prepareLessonPageData } from "../lib/lesson-page-server-data";
import { assertUniqueCurriculumIds } from "../lib/permanent-progress-catalogue";
const titles = [
  "Choose an Exchange Service by What It Does",
  "Read a Spot Market and an Order Book",
  "Orders, Fees and the Cost of Execution",
  "Stablecoins and What the Peg Promises",
  "Deposits, Withdrawals and Exchange Failure",
];
describe("Milestone 16 approved Crypto Level 3", () => {
  it("publishes five complete lessons with sequential prerequisites and all published routes", () => {
    expect(cryptoLessons.map((x) => x.title)).toEqual(titles);
    expect(cryptoLessons.map((x) => x.position)).toEqual([1, 2, 3, 4, 5]);
    expect(cryptoLessons.map((x) => x.sections?.length)).toEqual([
      5, 3, 4, 3, 5,
    ]);
    expect(cryptoLessons[0]).toMatchObject({
      id: "choose-a-crypto-exchange-service",
      href: "/learn/crypto/level-3",
      course: "crypto-exchanges-and-markets",
      module: "exchanges-stablecoins-and-orders",
      prerequisites: ["respond-to-a-crypto-compromise"],
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
  it("retains ten native tables, three manuscript diagrams and six accessible calculations", () => {
    const blocks = cryptoLessons.flatMap((x) => x.blocks);
    expect(blocks.filter((x) => x.type === "comparisonTable")).toHaveLength(10);
    expect(blocks.filter((x) => x.type === "formula")).toHaveLength(6);
    const diagrams = blocks.filter((x) => x.type === "diagram");
    expect(diagrams).toHaveLength(3);
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
      expect(html).toContain('href="/learn/crypto/level-3/quiz"');
      expect(html).not.toContain('href="/learn/forex/level-3/quiz"');
      const data = prepareLessonPageData({
        path: "crypto",
        lesson,
        lessons: cryptoLessons,
        contextTitle: "Exchanges, Stablecoins and Market Orders",
        contextHref: "/learn/crypto/level-3/crypto-exchanges-and-markets",
      });
      expect(data.registeredQuiz?.href).toBe("/learn/crypto/level-3/quiz");
      expect(
        data.lessons.every(
          (x) => Object.keys(x).sort().join(",") === "href,id,title",
        ),
      ).toBe(true);
    }
  });
  it("uses approved fifteen questions and explained key, server grading and existing completion policy", () => {
    const quiz = getCurrentPublishedAssessment("crypto-exchange-markets-quiz")!;
    expect(quiz).toBe(cryptoExchangeQuizV1);
    expect(quiz.questions).toHaveLength(15);
    expect(quiz.questions.map((x) => x.correctChoiceIds[0])).toEqual([
      "c",
      "d",
      "a",
      "c",
      "b",
      "d",
      "a",
      "d",
      "b",
      "a",
      "c",
      "a",
      "c",
      "d",
      "b",
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
      "crypto-exchanges-and-markets",
      "exchanges-stablecoins-and-orders",
    )!;
    expect(context.lessons).toHaveLength(5);
    expect(context.progressKey).toBe(
      "pipstart:learn:crypto:level-3:crypto-exchanges-and-markets:progress",
    );
    expect(
      getCurriculumModule("crypto", "exchanges-stablecoins-and-orders")
        ?.assessmentRequirements,
    ).toEqual([
      { assessmentId: quiz.id, completionPolicy: "any-passed-version" },
    ]);
  });
});
