export type AssessmentQuestionType = "single-choice" | "multiple-choice" | "true-false";
export type AssessmentPublicationStatus = "draft" | "published";

export type AssessmentChoice = { id: string; label: string };

export type AssessmentQuestion = {
  id: string;
  prompt: string;
  explanation: string;
  type: AssessmentQuestionType;
  choices: readonly AssessmentChoice[];
  correctChoiceIds: readonly string[];
};

export type AssessmentDefinition = {
  id: string;
  version: number;
  title: string;
  scope: "lesson" | "module" | "course";
  learningPath: "crypto" | "forex";
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  passingPercentage: number;
  status: AssessmentPublicationStatus;
  questions: readonly AssessmentQuestion[];
};

export type AssessmentAnswers = Readonly<Record<string, readonly string[]>>;

export function toPublicAssessment(assessment: AssessmentDefinition) {
  return {
    id: assessment.id,
    version: assessment.version,
    title: assessment.title,
    scope: assessment.scope,
    learningPath: assessment.learningPath,
    courseId: assessment.courseId,
    moduleId: assessment.moduleId,
    lessonId: assessment.lessonId,
    passingPercentage: assessment.passingPercentage,
    questions: assessment.questions.map(({ id, prompt, type, choices }) => ({
      id,
      prompt,
      type,
      choices: choices.map((choice) => ({ ...choice })),
    })),
  };
}

function sameSet(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((value) => rightSet.has(value));
}

export function gradeAssessment(
  assessment: AssessmentDefinition,
  answers: AssessmentAnswers,
) {
  if (assessment.questions.length === 0) {
    throw new Error("Cannot grade an assessment with no questions");
  }

  const questionsById = new Map(
    assessment.questions.map((question) => [question.id, question]),
  );

  for (const [questionId, submitted] of Object.entries(answers)) {
    const question = questionsById.get(questionId);
    if (!question) throw new Error(`Unknown assessment question: ${questionId}`);
    const known = new Set(question.choices.map((choice) => choice.id));
    for (const choiceId of submitted) {
      if (!known.has(choiceId)) {
        throw new Error(`Unknown choice "${choiceId}" for question "${questionId}"`);
      }
    }
  }

  const questions = assessment.questions.map((question) => {
    const submittedChoiceIds = [...new Set(answers[question.id] ?? [])];
    return {
      questionId: question.id,
      answered: submittedChoiceIds.length > 0,
      submittedChoiceIds,
      correctChoiceIds: [...question.correctChoiceIds],
      correct: sameSet(submittedChoiceIds, question.correctChoiceIds),
      explanation: question.explanation,
    };
  });

  const correctCount = questions.filter((question) => question.correct).length;
  const maxScore = questions.length;

  return {
    quizId: assessment.id,
    quizVersion: assessment.version,
    correctCount,
    score: correctCount,
    maxScore,
    percentage: Math.round((correctCount * 100) / maxScore),
    passed: correctCount * 100 >= assessment.passingPercentage * maxScore,
    questions,
  };
}
