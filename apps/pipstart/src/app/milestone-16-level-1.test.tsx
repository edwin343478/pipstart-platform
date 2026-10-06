import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("../components/lesson-bookmark-button", () => ({
  LessonBookmarkButton: () => null,
}));
import { cryptoLessons } from "./learn/crypto/level-1/lessons";
import { CryptoLessonPage } from "./learn/crypto/level-1/crypto-lesson";
import { generateStaticParams } from "./learn/crypto/level-1/[lesson]/page";
import { cryptoBitcoinQuizV1 } from "../lib/crypto-bitcoin-assessment";
import { getCurrentPublishedAssessment } from "../lib/assessment-registry";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { getCryptoOrientationQuizClientContext } from "../lib/crypto-orientation-quiz-context";
import { getCurriculumModule } from "../lib/curriculum";
import { prepareLessonPageData } from "../lib/lesson-page-server-data";
import { assertUniqueCurriculumIds } from "../lib/permanent-progress-catalogue";
const titles = [
  "What Is Bitcoin",
  "How a Shared Ledger Is Checked and Secured",
  "Keys, Signatures and Bitcoin Transactions",
  "Mining, Fees, Confirmations and Finality",
  "Supply, Halvings and Common Bitcoin Claims",
];
describe("Milestone 16 approved Crypto Level 1", () => {
  it("publishes five complete lessons with stable Bitcoin identity and all additional routes", () => {
    expect(cryptoLessons.map((x) => x.title)).toEqual(titles);
    expect(cryptoLessons.map((x) => x.position)).toEqual([1, 2, 3, 4, 5]);
    expect(cryptoLessons.map((x) => x.sections?.length)).toEqual([
      5, 5, 5, 6, 5,
    ]);
    expect(cryptoLessons[0]).toMatchObject({
      id: "what-is-bitcoin",
      href: "/learn/crypto/level-1",
      course: "bitcoin",
      module: "bitcoin-foundations",
      prerequisites: ["crypto-scams-and-safe-learning"],
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
  it("retains eight native tables, six manuscript diagrams and twelve accessible calculations", () => {
    const blocks = cryptoLessons.flatMap((x) => x.blocks);
    expect(blocks.filter((x) => x.type === "comparisonTable")).toHaveLength(8);
    expect(blocks.filter((x) => x.type === "formula")).toHaveLength(12);
    const diagrams = blocks.filter((x) => x.type === "diagram");
    expect(diagrams).toHaveLength(6);
    for (const diagram of diagrams)
      expect(
        fs.existsSync(path.join(process.cwd(), "public", diagram.src)),
      ).toBe(true);
    expect(blocks).toContainEqual(
      expect.objectContaining({
        type: "formula",
        expression: "New BTC per day ≈ 144 blocks × subsidy per block",
      }),
    );
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
      expect(html).toContain('href="/learn/crypto/level-1/quiz"');
      expect(html).not.toContain('href="/learn/forex/level-1/quiz"');
      const data = prepareLessonPageData({
        path: "crypto",
        lesson,
        lessons: cryptoLessons,
        contextTitle: "Bitcoin and Shared Ledgers",
        contextHref: "/learn/crypto/level-1/bitcoin",
      });
      expect(data.registeredQuiz?.href).toBe("/learn/crypto/level-1/quiz");
      expect(
        data.lessons.every(
          (x) => Object.keys(x).sort().join(",") === "href,id,title",
        ),
      ).toBe(true);
    }
  });
  it("uses approved fifteen questions and explained key, server grading and existing completion policy", () => {
    const quiz = getCurrentPublishedAssessment("bitcoin-foundations-quiz")!;
    expect(quiz).toBe(cryptoBitcoinQuizV1);
    expect(quiz.questions).toHaveLength(15);
    expect(quiz.questions.map((x) => x.correctChoiceIds[0])).toEqual([
      "b",
      "b",
      "d",
      "a",
      "b",
      "c",
      "d",
      "a",
      "c",
      "d",
      "a",
      "a",
      "c",
      "d",
      "d",
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
    expect(publicData).not.toContain("explanation");
    const context = getCryptoOrientationQuizClientContext(
      "bitcoin",
      "bitcoin-foundations",
    )!;
    expect(context.lessons).toHaveLength(5);
    expect(context.progressKey).toBe("pipstart:learn:crypto:level-1:progress");
    expect(
      getCurriculumModule("crypto", "bitcoin-foundations")
        ?.assessmentRequirements,
    ).toEqual([
      { assessmentId: quiz.id, completionPolicy: "any-passed-version" },
    ]);
  });
});
