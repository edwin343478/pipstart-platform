import { describe, expect, it } from "vitest";

import { toPublicAssessment } from "./assessment";
import { forexFoundationsQuizV1 } from "./assessment-registry";
import {
  coerceAssessmentAnswers,
  normalizeAssessmentPresentation,
  orderedAssessmentQuestions,
  unansweredAssessmentQuestionIds,
  updateAssessmentAnswer,
} from "./assessment-ux";

const assessment = toPublicAssessment(forexFoundationsQuizV1);

describe("assessment learner UX helpers", () => {
  it("honors frozen question and choice order while safely filling missing ids", () => {
    const first = assessment.questions[0]!;
    const second = assessment.questions[1]!;
    const presentation = normalizeAssessmentPresentation(assessment, {
      publicSnapshot: assessment,
      questionOrder: [second.id, first.id],
      choiceOrder: {
        [second.id]: [...second.choices].reverse().map((choice) => choice.id),
      },
    });
    const ordered = orderedAssessmentQuestions(presentation);

    expect(ordered[0]?.id).toBe(second.id);
    expect(ordered[0]?.choices.map((choice) => choice.id)).toEqual(
      [...second.choices].reverse().map((choice) => choice.id),
    );
    expect(ordered.map((question) => question.id)).toHaveLength(
      assessment.questions.length,
    );
  });

  it("replaces radio answers and toggles exact-set multiple answers", () => {
    const single = assessment.questions.find(
      (question) => question.type === "single-choice",
    )!;
    const multiple = assessment.questions.find(
      (question) => question.type === "multiple-choice",
    )!;
    let answers = updateAssessmentAnswer(
      {},
      single,
      single.choices[0]!.id,
      true,
    );
    answers = updateAssessmentAnswer(
      answers,
      single,
      single.choices[1]!.id,
      true,
    );
    expect(answers[single.id]).toEqual([single.choices[1]!.id]);

    answers = updateAssessmentAnswer(
      answers,
      multiple,
      multiple.choices[0]!.id,
      true,
    );
    answers = updateAssessmentAnswer(
      answers,
      multiple,
      multiple.choices[1]!.id,
      true,
    );
    answers = updateAssessmentAnswer(
      answers,
      multiple,
      multiple.choices[0]!.id,
      false,
    );
    expect(answers[multiple.id]).toEqual([multiple.choices[1]!.id]);
  });

  it("coerces persisted drafts without trusting malformed values", () => {
    expect(
      coerceAssessmentAnswers({
        question: ["choice", "choice", 42],
        invalid: "not-an-array",
      }),
    ).toEqual({ question: ["choice"] });
  });

  it("identifies unanswered questions for submit confirmation", () => {
    const first = assessment.questions[0]!;
    expect(
      unansweredAssessmentQuestionIds(assessment, {
        [first.id]: [first.choices[0]!.id],
      }),
    ).toHaveLength(assessment.questions.length - 1);
  });
});
