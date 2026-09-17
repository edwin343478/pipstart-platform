import { describe, expect, it } from "vitest";

import {
  gradeAssessment,
  toPublicAssessment,
  type AssessmentDefinition,
} from "./assessment";
import {
  assessmentRegistry,
  assertValidAssessmentRegistry,
  getAssessment,
  getContinuableAssessment,
  getCurrentPublishedAssessment,
} from "./assessment-registry";

const foundQuiz = getAssessment("forex-foundations-quiz", 1);
if (!foundQuiz) throw new Error("Forex Foundations quiz v1 is missing");
const quiz: AssessmentDefinition = foundQuiz;

function correctAnswers(assessment: AssessmentDefinition = quiz) {
  return Object.fromEntries(
    assessment.questions.map((question) => [
      question.id,
      [...question.correctChoiceIds],
    ]),
  );
}

function cloneQuiz(
  changes: Partial<AssessmentDefinition>,
): AssessmentDefinition {
  return { ...quiz, id: `test-${Math.random()}`, status: "draft", ...changes };
}

describe("Milestone 13 trusted assessment core", () => {
  it("registers six Forex questions using all supported types and unique ids", () => {
    expect(quiz.questions).toHaveLength(6);
    expect(new Set(quiz.questions.map((question) => question.type))).toEqual(
      new Set(["single-choice", "multiple-answer", "true-false"]),
    );
    expect(new Set(quiz.questions.map((question) => question.id)).size).toBe(6);
  });

  it("does not expose answers, explanations or publication status publicly", () => {
    const serialized = JSON.stringify(toPublicAssessment(quiz));
    expect(serialized).not.toContain("correctChoiceIds");
    expect(serialized).not.toContain("explanation");
    expect(serialized).not.toContain('"status"');
  });

  it("grades perfect, unanswered, 4/6 and 5/6 outcomes correctly", () => {
    expect(gradeAssessment(quiz, correctAnswers()).passed).toBe(true);

    const four = correctAnswers();
    delete four[quiz.questions[0]!.id];
    delete four[quiz.questions[1]!.id];
    expect(gradeAssessment(quiz, four).passed).toBe(false);

    const five = correctAnswers();
    delete five[quiz.questions[0]!.id];
    const fiveGrade = gradeAssessment(quiz, five);
    expect(fiveGrade.passed).toBe(true);
    expect(fiveGrade.questions[0]?.answered).toBe(false);
    expect(fiveGrade.questions[0]?.correct).toBe(false);
  });

  it("requires an exact set for multiple-answer and deduplicates submissions", () => {
    const question = quiz.questions.find(
      (item) => item.type === "multiple-answer",
    );
    if (!question) throw new Error("Multiple-answer question missing");
    const oneQuestion = cloneQuiz({
      questions: [question],
      passingPercentage: 100,
    });

    expect(
      gradeAssessment(oneQuestion, {
        [question.id]: [...question.correctChoiceIds],
      }).passed,
    ).toBe(true);

    expect(
      gradeAssessment(oneQuestion, {
        [question.id]: question.correctChoiceIds.slice(0, -1),
      }).passed,
    ).toBe(false);

    const wrong = question.choices.find(
      (choice) => !question.correctChoiceIds.includes(choice.id),
    );
    if (!wrong) throw new Error("Wrong choice missing");
    expect(
      gradeAssessment(oneQuestion, {
        [question.id]: [...question.correctChoiceIds, wrong.id],
      }).passed,
    ).toBe(false);

    const single = quiz.questions.find((item) => item.type === "single-choice");
    if (!single) throw new Error("Single-choice question missing");
    const singleQuiz = cloneQuiz({
      questions: [single],
      passingPercentage: 100,
    });
    const correct = single.correctChoiceIds[0]!;
    expect(
      gradeAssessment(singleQuiz, { [single.id]: [correct, correct] }).score,
    ).toBe(1);
  });

  it("rejects unknown question and choice ids", () => {
    expect(() => gradeAssessment(quiz, { unknown: ["x"] })).toThrow(
      /Unknown assessment question/,
    );
    expect(() =>
      gradeAssessment(quiz, { [quiz.questions[0]!.id]: ["unknown-choice"] }),
    ).toThrow(/Unknown choice/);
  });

  it("rejects malformed definitions and duplicate versions", () => {
    expect(() =>
      assertValidAssessmentRegistry([cloneQuiz({ passingPercentage: 0 })]),
    ).toThrow(/invalid passing percentage/);
    expect(() =>
      assertValidAssessmentRegistry([cloneQuiz({ questions: [] })]),
    ).toThrow(/no questions/);
    expect(() => assertValidAssessmentRegistry([quiz, quiz])).toThrow(
      /Duplicate assessment version/,
    );

    const malformed = {
      ...quiz.questions[0]!,
      correctChoiceIds: ["missing-choice"],
    };
    expect(() =>
      assertValidAssessmentRegistry([cloneQuiz({ questions: [malformed] })]),
    ).toThrow(/Unknown correct choice/);
  });

  it("supports version lookup and validates published curriculum references", () => {
    expect(getAssessment("forex-foundations-quiz", 1)).toBe(quiz);
    expect(getAssessment("forex-foundations-quiz", 2)).toBeUndefined();
    expect(getCurrentPublishedAssessment("forex-foundations-quiz")).toBe(quiz);
    expect(() =>
      assertValidAssessmentRegistry(assessmentRegistry),
    ).not.toThrow();

    expect(() =>
      assertValidAssessmentRegistry([
        { ...quiz, id: "bad-course", courseId: "missing-course" },
      ]),
    ).toThrow(/Unknown published course/);
  });

  it("accepts explicit lifecycle states and keeps the current version continuable", () => {
    expect(getContinuableAssessment("forex-foundations-quiz", 1)).toBe(quiz);
    const retired = cloneQuiz({ status: "retired" });
    const withdrawn = cloneQuiz({ status: "withdrawn" });
    expect(() => assertValidAssessmentRegistry([quiz, retired])).not.toThrow();
    expect(() => assertValidAssessmentRegistry([quiz, withdrawn])).not.toThrow();
  });

  it("requires assessment ownership, review dates, sources and retake pacing", () => {
    expect(() =>
      assertValidAssessmentRegistry([
        cloneQuiz({ governance: { ...quiz.governance, sources: [] } }),
      ]),
    ).toThrow(/requires at least one source/);
    expect(() =>
      assertValidAssessmentRegistry([
        cloneQuiz({
          governance: {
            ...quiz.governance,
            nextReviewAt: "2025-01-01",
          },
        }),
      ]),
    ).toThrow(/next review/);
    expect(() =>
      assertValidAssessmentRegistry([cloneQuiz({ retakeCooldownSeconds: -1 })]),
    ).toThrow(/retake cooldown/);
  });

  it("returns post-submit review data", () => {
    const grade = gradeAssessment(quiz, correctAnswers());
    expect(grade.questions[0]?.correctChoiceIds.length).toBeGreaterThan(0);
    expect(grade.questions[0]?.explanation.length).toBeGreaterThan(0);
  });
});
