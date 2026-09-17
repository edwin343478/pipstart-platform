import type { toPublicAssessment } from "./assessment";

export type PublicAssessment = ReturnType<typeof toPublicAssessment>;
export type PublicAssessmentQuestion = PublicAssessment["questions"][number];
export type AssessmentClientAnswers = Record<string, string[]>;

export type AssessmentPresentation = {
  choiceOrder: Record<string, string[]>;
  publicSnapshot: PublicAssessment;
  questionOrder: string[];
};

function orderedIds(validIds: readonly string[], requested: readonly string[]) {
  const valid = new Set(validIds);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const id of requested) {
    if (valid.has(id) && !seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }
  for (const id of validIds) {
    if (!seen.has(id)) result.push(id);
  }
  return result;
}

export function coerceAssessmentAnswers(
  value: unknown,
): AssessmentClientAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const answers: AssessmentClientAnswers = {};
  for (const [questionId, rawChoices] of Object.entries(value)) {
    if (!Array.isArray(rawChoices)) continue;
    answers[questionId] = [
      ...new Set(
        rawChoices.filter(
          (choice): choice is string => typeof choice === "string",
        ),
      ),
    ];
  }
  return answers;
}

export function normalizeAssessmentPresentation(
  fallback: PublicAssessment,
  value: {
    choiceOrder?: unknown;
    publicSnapshot?: unknown;
    questionOrder?: unknown;
  },
): AssessmentPresentation {
  const snapshot =
    value.publicSnapshot &&
    typeof value.publicSnapshot === "object" &&
    (value.publicSnapshot as { id?: unknown }).id === fallback.id
      ? (value.publicSnapshot as PublicAssessment)
      : fallback;
  const normalizedSnapshot = {
    ...snapshot,
    questions: snapshot.questions.map((question) => ({
      ...question,
      type:
        (question.type as string) === "multiple-choice"
          ? ("multiple-answer" as const)
          : question.type,
    })),
  };
  const questionOrder = Array.isArray(value.questionOrder)
    ? value.questionOrder.filter((id): id is string => typeof id === "string")
    : [];
  const choiceOrder: Record<string, string[]> = {};
  if (value.choiceOrder && typeof value.choiceOrder === "object") {
    for (const [questionId, rawChoices] of Object.entries(value.choiceOrder)) {
      if (Array.isArray(rawChoices)) {
        choiceOrder[questionId] = rawChoices.filter(
          (id): id is string => typeof id === "string",
        );
      }
    }
  }

  return { choiceOrder, publicSnapshot: normalizedSnapshot, questionOrder };
}

export function orderedAssessmentQuestions(
  presentation: AssessmentPresentation,
) {
  const questionsById = new Map(
    presentation.publicSnapshot.questions.map((question) => [
      question.id,
      question,
    ]),
  );
  const questionIds = orderedIds(
    presentation.publicSnapshot.questions.map((question) => question.id),
    presentation.questionOrder,
  );

  return questionIds.flatMap((questionId) => {
    const question = questionsById.get(questionId);
    if (!question) return [];
    const choicesById = new Map(
      question.choices.map((choice) => [choice.id, choice]),
    );
    const choiceIds = orderedIds(
      question.choices.map((choice) => choice.id),
      presentation.choiceOrder[question.id] ?? [],
    );
    return [
      {
        ...question,
        choices: choiceIds.flatMap((choiceId) => {
          const choice = choicesById.get(choiceId);
          return choice ? [choice] : [];
        }),
      },
    ];
  });
}

export function updateAssessmentAnswer(
  answers: AssessmentClientAnswers,
  question: PublicAssessmentQuestion,
  choiceId: string,
  checked: boolean,
): AssessmentClientAnswers {
  if (question.type !== "multiple-answer") {
    if (!checked) return answers;
    return { ...answers, [question.id]: [choiceId] };
  }

  const selected = new Set(answers[question.id] ?? []);
  if (checked) selected.add(choiceId);
  else selected.delete(choiceId);
  return { ...answers, [question.id]: [...selected] };
}

export function unansweredAssessmentQuestionIds(
  assessment: PublicAssessment,
  answers: AssessmentClientAnswers,
) {
  return assessment.questions
    .filter((question) => (answers[question.id]?.length ?? 0) === 0)
    .map((question) => question.id);
}
