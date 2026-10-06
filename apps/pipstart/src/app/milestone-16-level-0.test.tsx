import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("../components/lesson-bookmark-button", () => ({
  LessonBookmarkButton: () => null,
}));
import {
  cryptoOrientationLessons,
  getCryptoOrientationHierarchy,
} from "../lib/crypto-orientation-routing";
import { cryptoOrientationQuizV1 } from "../lib/crypto-orientation-assessment";
import { gradeAssessment, toPublicAssessment } from "../lib/assessment";
import { getCurrentPublishedAssessment } from "../lib/assessment-registry";
import { getCryptoOrientationQuizClientContext } from "../lib/crypto-orientation-quiz-context";
import { assertUniqueCurriculumIds } from "../lib/permanent-progress-catalogue";
import { prepareLessonPageData } from "../lib/lesson-page-server-data";
import { CryptoOrientationLesson } from "./learn/crypto/level-0/crypto-orientation-lesson";
import { cryptoLessons } from "./learn/crypto/level-1/lessons";
const expectedTitles = [
  "Start Here and Understand Cryptocurrency",
  "Using Owning Investing and Trading Crypto",
  "Understand the Different Ways Money Can Be Lost",
  "Spot Scams and Build a Safe Learning Routine",
];
describe("Milestone 16 approved Crypto Level 0", () => {
  it("publishes all four complete manuscript lessons in order, preserving Bitcoin isolation", () => {
    expect(cryptoOrientationLessons.map((x) => x.title)).toEqual(
      expectedTitles,
    );
    expect(cryptoOrientationLessons.map((x) => x.position)).toEqual([
      1, 2, 3, 4,
    ]);
    expect(cryptoLessons[0].id).toBe("what-is-bitcoin");
    expect(cryptoLessons.every((x) => x.level === "level-1")).toBe(true);
    expect(assertUniqueCurriculumIds()).toBeUndefined();
    for (const lesson of cryptoOrientationLessons) {
      expect(lesson.sections).toHaveLength(5);
      expect(
        lesson.sections?.slice(0, 5).every((x) => x.blocks.length > 0),
      ).toBe(true);
      expect(lesson.blocks.filter((x) => x.type === "practice").length).toBe(2);
      expect(
        lesson.blocks
          .filter((x) => x.type === "practice")
          .flatMap((x) => x.answers).length,
      ).toBeGreaterThanOrEqual(4);
      expect(lesson.sources.every((x) => x.url.startsWith("https://"))).toBe(
        true,
      );
      expect(lesson.author).not.toBe(lesson.reviewer);
      expect(JSON.stringify(lesson.blocks)).not.toMatch(
        /G20|Example using G20/,
      );
      expect(
        lesson.blocks.filter((x) => x.type === "keyPoint" && x.checklist),
      ).toHaveLength(1);
      expect(
        lesson.blocks.filter((x) => x.type === "keyPoint" && !x.checklist),
      ).toHaveLength(1);
    }
  });
  it("uses native tables, manuscript diagrams and a distinguished calculator link", () => {
    const blocks = cryptoOrientationLessons.flatMap((x) => x.blocks);
    expect(blocks.filter((x) => x.type === "comparisonTable")).toHaveLength(5);
    const diagrams = blocks.filter((x) => x.type === "diagram");
    expect(diagrams).toHaveLength(3);
    for (const diagram of diagrams)
      expect(
        fs.existsSync(path.join(process.cwd(), "public", diagram.src)),
      ).toBe(true);
    expect(blocks.filter((x) => x.type === "learningLink")).toEqual([
      expect.objectContaining({ href: "/tools/drawdown-calculator" }),
    ]);
  });
  it("renders late sections and references before enhancement and keeps sidebar payloads compact", () => {
    for (const lesson of cryptoOrientationLessons) {
      const html = renderToStaticMarkup(
        <CryptoOrientationLesson lesson={lesson} />,
      );
      expect(html).toContain('data-enhanced="false"');
      expect(html).toContain("Worked answers");
      expect(html).toContain("Lesson completion check");
      expect(html).toContain("References and further reading");
      expect(html).toContain('href="/learn/crypto"');
      const data = prepareLessonPageData({
        path: "crypto",
        lesson,
        lessons: cryptoOrientationLessons,
        contextTitle: "Orientation and Safety",
        contextHref: "/learn/crypto/level-0/crypto-orientation",
      });
      expect(data.registeredQuiz?.href).toBe("/learn/crypto/level-0/quiz");
      expect(
        data.lessons.every(
          (x) => Object.keys(x).sort().join(",") === "href,id,title",
        ),
      ).toBe(true);
    }
    const html = renderToStaticMarkup(
      <CryptoOrientationLesson lesson={cryptoOrientationLessons[3]} />,
    );
    expect(html).toContain('href="/learn/crypto/level-0/quiz"');
    expect(html).not.toContain('href="/learn/forex/level-1"');
  });
  it("registers the quiz, preserves all explained answers and strips answers from public data", () => {
    const quiz = getCurrentPublishedAssessment("crypto-orientation-quiz")!;
    expect(quiz).toBe(cryptoOrientationQuizV1);
    expect(quiz.questions).toHaveLength(10);
    expect(quiz.questions.map((q) => q.correctChoiceIds[0])).toEqual([
      "b",
      "c",
      "d",
      "a",
      "b",
      "c",
      "d",
      "a",
      "b",
      "c",
    ]);
    const correct = Object.fromEntries(
      quiz.questions.map((q) => [q.id, q.correctChoiceIds]),
    );
    expect(gradeAssessment(quiz, correct)).toMatchObject({
      percentage: 100,
      passed: true,
    });
    const eight = Object.fromEntries(
      quiz.questions.slice(0, 8).map((q) => [q.id, q.correctChoiceIds]),
    );
    expect(gradeAssessment(quiz, eight)).toMatchObject({
      percentage: 80,
      passed: true,
    });
    const seven = Object.fromEntries(
      quiz.questions.slice(0, 7).map((q) => [q.id, q.correctChoiceIds]),
    );
    expect(gradeAssessment(quiz, seven).passed).toBe(false);
    const publicData = JSON.stringify(toPublicAssessment(quiz));
    expect(publicData).not.toContain("correctChoiceIds");
    expect(publicData).not.toContain("explanation");
    expect(
      quiz.questions.every(
        (q) =>
          q.explanation.includes("Correct choice") &&
          q.explanation.includes("D."),
      ),
    ).toBe(true);
    const context = getCryptoOrientationQuizClientContext(
      quiz.courseId,
      quiz.moduleId,
    )!;
    expect(context.progressKey).toBe(
      "pipstart:learn:crypto:level-0:crypto-orientation:progress",
    );
    expect(context.lessons).toHaveLength(4);
    expect(
      getCryptoOrientationHierarchy().module.assessmentRequirements,
    ).toEqual([
      { assessmentId: quiz.id, completionPolicy: "any-passed-version" },
    ]);
  });
});

it("keeps ordinary Crypto text unbolded, avoids duplicate marks and closes answers initially", () => {
  for (const lesson of cryptoOrientationLessons) {
    for (const block of lesson.blocks) {
      if (block.type === "paragraph")
        expect(block.children).not.toContain("**");
      if (block.type === "keyPoint")
        expect(block.points.every((x) => !/[☐□✓•]/.test(x))).toBe(true);
    }
    const html = renderToStaticMarkup(
      <CryptoOrientationLesson lesson={lesson} />,
    );
    expect((html.match(/Compare with the worked answers/g) || []).length).toBe(
      2,
    );
    expect(html).not.toMatch(/<details[^>]*\sopen(?:[= >])/);
    expect(html).toContain("?section=1&amp;all=0");
  }
});
