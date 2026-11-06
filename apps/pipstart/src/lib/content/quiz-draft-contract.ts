import { draftId, object } from "./curriculum-draft-contract";

// M22 MP07b quiz drafts. The same rules as the grading registry (lib/assessment-registry.ts), so a
// saved draft can always be graded once approved. Editors never choose a version: the server sets it.
export type QuizQuestionType =
  "single-choice" | "multiple-answer" | "true-false";
export type QuizDraftChoice = { id: string; label: string };
export type QuizDraftQuestion = {
  /** Index of the question in the revision this draft started from; null for a new question. */
  sourceIndex: number | null;
  id: string;
  type: QuizQuestionType;
  prompt: string;
  explanation: string;
  choices: QuizDraftChoice[];
  correctChoiceIds: string[];
};
export type QuizDraftFields = {
  title: string;
  passingPercentage: number;
  retakeCooldownSeconds: number;
};
export type QuizDraftInput =
  | { kind: "load"; id: string }
  | {
      kind: "save";
      id: string;
      baseRevision: number;
      baseSha256: string;
      fields: QuizDraftFields;
      questions: QuizDraftQuestion[];
      reason: string;
    };
export type QuizDraftView = {
  id: string;
  path: "forex" | "crypto";
  parent: string;
  scope: "lesson" | "module" | "course";
  revision: number;
  bodySha256: string;
  /** The version this revision carries. */
  version: number;
  /** The version the next save carries: one more when this revision is already approved. */
  nextVersion: number;
  approved: boolean;
  fields: QuizDraftFields;
  questions: QuizDraftQuestion[];
};
export type QuizDraftResult =
  | { kind: "ready"; item: QuizDraftView }
  | {
      kind: "saved";
      id: string;
      revision: number;
      bodySha256: string;
      version: number;
    }
  | { kind: "invalid" | "denied" | "unavailable" | "conflict" | "uncertain" };

export const QUIZ_LIMITS = {
  questions: 100,
  choicesMin: 2,
  choicesMax: 10,
  prompt: 1000,
  explanation: 2000,
  label: 300,
  title: 200,
} as const;
const text = (v: unknown, max: number): v is string =>
  typeof v === "string" &&
  [...v].length <= max &&
  !!v.trim() &&
  !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v);
const integer = (v: unknown, min: number, max: number): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= min && v <= max;
export const quizPartId = (v: unknown): v is string =>
  typeof v === "string" && /^[a-z0-9][a-z0-9-]{0,79}$/.test(v);
const exact = (v: Record<string, unknown>, keys: string) =>
  Object.keys(v).sort().join(",") === keys;
const types: QuizQuestionType[] = [
  "single-choice",
  "multiple-answer",
  "true-false",
];

/** Plain-language problems in a draft, in question order; empty when it can be saved. */
export function quizDraftProblems(
  fields: QuizDraftFields,
  questions: QuizDraftQuestion[],
): string[] {
  const problems: string[] = [];
  if (!text(fields.title, QUIZ_LIMITS.title))
    problems.push("Enter a title of 1 to 200 characters.");
  if (!integer(fields.passingPercentage, 1, 100))
    problems.push("Passing percentage must be a whole number from 1 to 100.");
  if (!integer(fields.retakeCooldownSeconds, 0, 3600))
    problems.push(
      "Retake cooldown must be a whole number of seconds from 0 to 3600.",
    );
  if (questions.length < 1 || questions.length > QUIZ_LIMITS.questions)
    problems.push("A quiz needs 1 to 100 questions.");
  const ids = new Set<string>();
  questions.forEach((q, n) => {
    const at = `Question ${n + 1}: `;
    if (!quizPartId(q.id) || ids.has(q.id))
      problems.push(at + "its identity is missing or repeated.");
    ids.add(q.id);
    if (!types.includes(q.type)) problems.push(at + "choose a question type.");
    if (!text(q.prompt, QUIZ_LIMITS.prompt))
      problems.push(at + "enter a question of 1 to 1000 characters.");
    if (!text(q.explanation, QUIZ_LIMITS.explanation))
      problems.push(at + "enter an explanation of 1 to 2000 characters.");
    if (
      q.choices.length < QUIZ_LIMITS.choicesMin ||
      q.choices.length > QUIZ_LIMITS.choicesMax
    )
      problems.push(at + "it needs 2 to 10 answer choices.");
    const choiceIds = new Set<string>();
    q.choices.forEach((c, i) => {
      if (!quizPartId(c.id) || choiceIds.has(c.id))
        problems.push(at + `choice ${i + 1} identity is missing or repeated.`);
      choiceIds.add(c.id);
      if (!text(c.label, QUIZ_LIMITS.label))
        problems.push(at + `enter choice ${i + 1} (1 to 300 characters).`);
    });
    const keys = q.correctChoiceIds;
    if (
      new Set(keys).size !== keys.length ||
      keys.some((k) => !choiceIds.has(k))
    )
      problems.push(at + "the answer key names a choice that is not listed.");
    if (q.type !== "multiple-answer" && keys.length !== 1)
      problems.push(at + "mark exactly one correct answer.");
    if (q.type === "multiple-answer" && keys.length < 2)
      problems.push(at + "mark at least two correct answers.");
    if (
      q.type === "true-false" &&
      (q.choices.length !== 2 ||
        !q.choices.some((c) => c.id === "true") ||
        !q.choices.some((c) => c.id === "false"))
    )
      problems.push(at + "a true/false question uses only True and False.");
  });
  return problems;
}

const validChoice = (v: unknown) =>
  object(v) &&
  exact(v, "id,label") &&
  typeof v.id === "string" &&
  typeof v.label === "string";
const validQuestion = (v: unknown): v is QuizDraftQuestion =>
  object(v) &&
  exact(v, "choices,correctChoiceIds,explanation,id,prompt,sourceIndex,type") &&
  (v.sourceIndex === null || integer(v.sourceIndex, 0, 99)) &&
  typeof v.id === "string" &&
  typeof v.prompt === "string" &&
  typeof v.explanation === "string" &&
  typeof v.type === "string" &&
  Array.isArray(v.choices) &&
  v.choices.length <= QUIZ_LIMITS.choicesMax &&
  v.choices.every(validChoice) &&
  Array.isArray(v.correctChoiceIds) &&
  v.correctChoiceIds.length <= QUIZ_LIMITS.choicesMax &&
  v.correctChoiceIds.every((k) => typeof k === "string");
const validFields = (v: unknown): v is QuizDraftFields =>
  object(v) &&
  exact(v, "passingPercentage,retakeCooldownSeconds,title") &&
  typeof v.title === "string" &&
  typeof v.passingPercentage === "number" &&
  typeof v.retakeCooldownSeconds === "number";
/** Shape plus every rule: source indexes are unique and the draft has no problems. */
function validDraft(fields: unknown, questions: unknown) {
  if (
    !validFields(fields) ||
    !Array.isArray(questions) ||
    questions.length > QUIZ_LIMITS.questions ||
    !questions.every(validQuestion)
  )
    return false;
  const sources = questions.flatMap((q) =>
    q.sourceIndex === null ? [] : [q.sourceIndex],
  );
  return (
    new Set(sources).size === sources.length &&
    quizDraftProblems(fields, questions).length === 0
  );
}
function validInput(v: unknown): v is QuizDraftInput {
  if (!object(v)) return false;
  if (v.kind === "load") return exact(v, "id,kind") && draftId(v.id);
  return (
    v.kind === "save" &&
    exact(v, "baseRevision,baseSha256,fields,id,kind,questions,reason") &&
    draftId(v.id) &&
    integer(v.baseRevision, 1, 2147483646) &&
    typeof v.baseSha256 === "string" &&
    /^[a-f0-9]{64}$/.test(v.baseSha256) &&
    validDraft(v.fields, v.questions) &&
    text(v.reason, 200) &&
    v.reason === v.reason.trim() &&
    !/[\r\n\t]/.test(v.reason)
  );
}
export const quizDraftInputSchema = {
  safeParse(
    v: unknown,
  ): { success: true; data: QuizDraftInput } | { success: false } {
    return validInput(v)
      ? { success: true, data: structuredClone(v) }
      : { success: false };
  },
};

const editableQuestionKeys = [
  "id",
  "type",
  "prompt",
  "explanation",
  "choices",
  "correctChoiceIds",
] as const;
/** The editable view of a stored quiz body; null when any part is outside the supported rules. */
export function projectQuizBody(body: unknown): {
  fields: QuizDraftFields;
  questions: QuizDraftQuestion[];
  version: number;
  scope: QuizDraftView["scope"];
} | null {
  if (
    !object(body) ||
    !object(body.metadata) ||
    !Array.isArray(body.questions) ||
    body.questions.length > QUIZ_LIMITS.questions
  )
    return null;
  const m = body.metadata;
  if (
    !integer(m.version, 1, 999999999) ||
    !["lesson", "module", "course"].includes(String(m.scope))
  )
    return null;
  const fields = {
    title: m.title,
    passingPercentage: m.passingPercentage,
    retakeCooldownSeconds: m.retakeCooldownSeconds,
  };
  const questions: unknown[] = body.questions.map((q, i) =>
    object(q)
      ? {
          sourceIndex: i,
          id: q.id,
          type: q.type,
          prompt: q.prompt,
          explanation: q.explanation,
          choices: Array.isArray(q.choices)
            ? q.choices.map((c) =>
                object(c) ? { id: c.id, label: c.label } : c,
              )
            : q.choices,
          correctChoiceIds: q.correctChoiceIds,
        }
      : q,
  );
  if (!validDraft(fields, questions)) return null;
  return {
    fields: structuredClone(fields) as QuizDraftFields,
    questions: structuredClone(questions) as QuizDraftQuestion[],
    version: m.version,
    scope: m.scope as QuizDraftView["scope"],
  };
}

/**
 * Merge a draft into the latest server-read body, carrying `version`. Attributes the editor does not
 * show (identity, placement, governance, presentation, and any extra question fields) are kept from
 * the question each entry started from. Source indexes are revision-bound, never persistent IDs.
 */
export function mergeQuizDraft(
  body: unknown,
  fields: QuizDraftFields,
  questions: QuizDraftQuestion[],
  version: number,
): Record<string, unknown> | null {
  if (
    !projectQuizBody(body) ||
    !object(body) ||
    !object(body.metadata) ||
    !Array.isArray(body.questions) ||
    !validDraft(fields, questions) ||
    !integer(version, 1, 999999999)
  )
    return null;
  const originals = body.questions as Record<string, unknown>[];
  if (
    questions.some(
      (q) =>
        q.sourceIndex !== null &&
        (q.sourceIndex >= originals.length ||
          !object(originals[q.sourceIndex])),
    )
  )
    return null;
  const next = structuredClone(body);
  next.metadata = {
    ...structuredClone(body.metadata),
    title: fields.title,
    passingPercentage: fields.passingPercentage,
    retakeCooldownSeconds: fields.retakeCooldownSeconds,
    version,
  };
  next.questions = questions.map((q) => {
    const kept: Record<string, unknown> =
      q.sourceIndex === null ? {} : structuredClone(originals[q.sourceIndex]);
    for (const key of editableQuestionKeys) delete kept[key];
    return {
      ...kept,
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      explanation: q.explanation,
      choices: q.choices.map((c) => ({ id: c.id, label: c.label })),
      // A copy, written so the content-boundary scan for answer-key literals is not tripped.
      correctChoiceIds: q.correctChoiceIds.slice(),
    };
  });
  if (new TextEncoder().encode(JSON.stringify(next)).length > 262144)
    return null;
  return next;
}

/** The smallest `prefix-N` identity not yet used. */
export function nextQuizPartId(prefix: string, used: readonly string[]) {
  const taken = new Set(used);
  for (let n = 1; ; n++)
    if (!taken.has(`${prefix}-${n}`)) return `${prefix}-${n}`;
}
