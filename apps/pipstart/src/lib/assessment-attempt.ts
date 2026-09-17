import {
  gradeAssessment,
  toPublicAssessment,
  type AssessmentAnswers,
  type AssessmentDefinition,
} from "./assessment";

const MAX_ANSWER_PAYLOAD_BYTES = 16_384;
const MAX_ANSWER_QUESTIONS = 100;
const MAX_CHOICES_PER_QUESTION = 20;
const MAX_IDENTIFIER_LENGTH = 128;

export type AssessmentAttemptPresentation = {
  choiceOrder: Record<string, string[]>;
  publicSnapshot: ReturnType<typeof toPublicAssessment>;
  questionOrder: string[];
};

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new Error("Assessment random source must return a value from 0 to 1.");
    }
    const target = Math.floor(value * (index + 1));
    [result[index], result[target]] = [result[target]!, result[index]!];
  }
  return result;
}

export function createAssessmentAttemptPresentation(
  assessment: AssessmentDefinition,
  random: () => number = Math.random,
): AssessmentAttemptPresentation {
  return {
    questionOrder: assessment.questions.map((question) => question.id),
    choiceOrder: Object.fromEntries(
      assessment.questions.map((question) => [
        question.id,
        shuffled(
          question.choices.map((choice) => choice.id),
          random,
        ),
      ]),
    ),
    publicSnapshot: toPublicAssessment(assessment),
  };
}

export function parseAssessmentAnswers(input: unknown): AssessmentAnswers {
  let serialized: string;
  try {
    serialized = JSON.stringify(input);
  } catch {
    throw new Error("Assessment answers are not valid JSON.");
  }

  if (typeof serialized !== "string") {
    throw new Error("Assessment answers are not valid JSON.");
  }
  if (serialized.length > MAX_ANSWER_PAYLOAD_BYTES) {
    throw new Error("Assessment answer payload is too large.");
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Assessment answers must be an object.");
  }

  const entries = Object.entries(input);
  if (entries.length > MAX_ANSWER_QUESTIONS) {
    throw new Error("Assessment answer payload has too many questions.");
  }

  const parsed: Record<string, string[]> = {};
  for (const [questionId, rawChoices] of entries) {
    if (!questionId || questionId.length > MAX_IDENTIFIER_LENGTH) {
      throw new Error("Assessment question id is invalid.");
    }
    if (!Array.isArray(rawChoices) || rawChoices.length > MAX_CHOICES_PER_QUESTION) {
      throw new Error(`Assessment answers for "${questionId}" are invalid.`);
    }

    const choices: string[] = [];
    for (const choiceId of rawChoices) {
      if (
        typeof choiceId !== "string" ||
        !choiceId ||
        choiceId.length > MAX_IDENTIFIER_LENGTH
      ) {
        throw new Error(`Assessment choice for "${questionId}" is invalid.`);
      }
      choices.push(choiceId);
    }
    parsed[questionId] = [...new Set(choices)];
  }

  return parsed;
}

export function normalizeAssessmentAnswers(
  assessment: AssessmentDefinition,
  input: unknown,
): Record<string, string[]> {
  const grade = gradeAssessment(assessment, parseAssessmentAnswers(input));
  return Object.fromEntries(
    grade.questions
      .filter((question) => question.answered)
      .map((question) => [question.questionId, [...question.submittedChoiceIds]]),
  );
}

export function createAssessmentRateLimiter(limit: number, windowMs: number) {
  if (!Number.isInteger(limit) || limit <= 0 || windowMs <= 0) {
    throw new Error("Assessment rate limiter configuration is invalid.");
  }

  const windows = new Map<string, { count: number; resetAt: number }>();

  return {
    consume(key: string, now = Date.now()): boolean {
      if (!key) return false;

      const current = windows.get(key);
      if (!current || current.resetAt <= now) {
        windows.set(key, { count: 1, resetAt: now + windowMs });
      } else if (current.count >= limit) {
        return false;
      } else {
        current.count += 1;
      }

      if (windows.size > 10_000) {
        for (const [storedKey, window] of windows) {
          if (window.resetAt <= now) windows.delete(storedKey);
        }
      }
      return true;
    },
  };
}
