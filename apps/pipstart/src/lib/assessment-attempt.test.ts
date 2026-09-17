import { describe, expect, it } from "vitest";

import { gradeAssessment } from "./assessment";
import {
  createAssessmentRateLimiter,
  createAssessmentAttemptPresentation,
  normalizeAssessmentAnswers,
  parseAssessmentAnswers,
} from "./assessment-attempt";
import { forexFoundationsQuizV1 } from "./assessment-registry";

describe("assessment attempt boundary", () => {
  it("keeps question order fixed while freezing a shuffled choice order", () => {
    const presentation = createAssessmentAttemptPresentation(
      forexFoundationsQuizV1,
      () => 0,
    );

    expect(presentation.questionOrder).toEqual(
      forexFoundationsQuizV1.questions.map((question) => question.id),
    );
    for (const question of forexFoundationsQuizV1.questions) {
      expect(new Set(presentation.choiceOrder[question.id])).toEqual(
        new Set(question.choices.map((choice) => choice.id)),
      );
    }
    expect(JSON.stringify(presentation.publicSnapshot)).not.toContain(
      "correctChoiceIds",
    );
    expect(JSON.stringify(presentation.publicSnapshot)).not.toContain(
      "explanation",
    );
  });

  it("rejects malformed and oversized answer payloads before grading", () => {
    expect(() => parseAssessmentAnswers(null)).toThrow(/must be an object/);
    expect(() => parseAssessmentAnswers([])).toThrow(/must be an object/);
    expect(() =>
      parseAssessmentAnswers({ question: new Array(21).fill("choice") }),
    ).toThrow(/are invalid/);
    expect(() =>
      parseAssessmentAnswers({ question: ["x".repeat(129)] }),
    ).toThrow(/choice.*invalid/i);
  });

  it("normalizes duplicate selections and still uses trusted grading", () => {
    const question = forexFoundationsQuizV1.questions[0]!;
    const correct = question.correctChoiceIds[0]!;
    const normalized = normalizeAssessmentAnswers(forexFoundationsQuizV1, {
      [question.id]: [correct, correct],
    });

    expect(normalized[question.id]).toEqual([correct]);
    const grade = gradeAssessment(forexFoundationsQuizV1, normalized);
    expect(grade.questions[0]?.correct).toBe(true);
  });

  it("limits repeated anonymous grading requests in a fixed window", () => {
    const limiter = createAssessmentRateLimiter(2, 1_000);

    expect(limiter.consume("client", 1_000)).toBe(true);
    expect(limiter.consume("client", 1_100)).toBe(true);
    expect(limiter.consume("client", 1_200)).toBe(false);
    expect(limiter.consume("client", 2_000)).toBe(true);
    expect(limiter.consume("other-client", 2_000)).toBe(true);
  });
});
