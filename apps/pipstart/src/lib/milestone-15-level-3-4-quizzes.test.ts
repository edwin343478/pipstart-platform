import { describe, expect, it } from "vitest";
import { chartFoundationsQuizV1 } from "./chart-foundations-assessment";
import { technicalToolFoundationsQuizV1 } from "./technical-tool-foundations-assessment";
import { gradeAssessment, toPublicAssessment } from "./assessment";
import {
  getCurrentPublishedAssessment,
  assertValidAssessmentRegistry,
} from "./assessment-registry";
import { getForexQuizContext } from "./forex-quiz-context";
import {
  getGenericForexSecondSegment,
  getGenericForexSecondSegmentParams,
} from "./forex-level-routing";

const cases = [
  {
    level: 3,
    quiz: chartFoundationsQuizV1,
    lessons: 4,
    questions: 12,
    minimum: 9,
  },
  {
    level: 4,
    quiz: technicalToolFoundationsQuizV1,
    lessons: 3,
    questions: 15,
    minimum: 11,
  },
];
describe("Level 3 and 4 registered quizzes", () => {
  it("validates every registered assessment and curriculum requirement", () => {
    expect(() => assertValidAssessmentRegistry()).not.toThrow();
  });
  it.each(cases)(
    "publishes Level $level through the existing quiz route and context",
    ({ level, quiz, lessons, questions }) => {
      expect(getCurrentPublishedAssessment(quiz.id)).toBe(quiz);
      expect(quiz.questions).toHaveLength(questions);
      const context = getForexQuizContext(quiz.courseId, quiz.moduleId)!;
      expect(context.quiz.href).toBe(`/learn/forex/level-${level}/quiz`);
      expect(context.lessonIds).toHaveLength(lessons);
      expect(context.lessonIds).not.toContain(quiz.id);
      expect(context.levelLabel).toBe(`Level ${level}`);
      expect(context.module.assessmentRequirements).toContainEqual({
        assessmentId: quiz.id,
        completionPolicy: "any-passed-version",
      });
      expect(getGenericForexSecondSegment(`level-${level}`, "quiz")?.kind).toBe(
        "quiz",
      );
      expect(getGenericForexSecondSegmentParams()).toContainEqual({
        level: `level-${level}`,
        segment: "quiz",
      });
      const publicJson = JSON.stringify(toPublicAssessment(quiz));
      expect(publicJson).not.toContain("correctChoiceIds");
      expect(publicJson).not.toContain("explanation");
    },
  );
  it.each(cases)(
    "grades Level $level at the 70 percent boundary",
    ({ quiz, minimum, questions }) => {
      const answers = (count: number) =>
        Object.fromEntries(
          quiz.questions.slice(0, count).map((q) => [q.id, q.correctChoiceIds]),
        );
      expect(gradeAssessment(quiz, answers(questions))).toMatchObject({
        score: questions,
        passed: true,
      });
      expect(gradeAssessment(quiz, answers(minimum)).passed).toBe(true);
      expect(gradeAssessment(quiz, answers(minimum - 1)).passed).toBe(false);
      expect(gradeAssessment(quiz, {})).toMatchObject({
        score: 0,
        passed: false,
      });
      const multiple = quiz.questions.find(
        (q) => q.type === "multiple-answer",
      )!;
      expect(
        gradeAssessment(quiz, {
          [multiple.id]: multiple.correctChoiceIds.slice(0, 1),
        }).score,
      ).toBe(0);
    },
  );
  it("keeps level-specific progress and return links separate", () => {
    const three = getForexQuizContext("charts", "chart-foundations")!;
    const four = getForexQuizContext(
      "technical-tools",
      "technical-tool-foundations",
    )!;
    expect(three.progressKey).not.toBe(four.progressKey);
    expect(three.module.href).toContain("/level-3/");
    expect(four.module.href).toContain("/level-4/");
    expect(
      getForexQuizContext("charts", "technical-tool-foundations"),
    ).toBeUndefined();
  });
});
