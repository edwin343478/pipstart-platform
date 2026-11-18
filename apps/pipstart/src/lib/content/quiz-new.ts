// Starting points for new quiz questions and new quizzes. A plain module (not "use client"), because the quiz page
// (a server component) builds the new-quiz view: a function exported from a client module reaches server code only
// as a reference, and calling it there fails the request (found by the Package 6 journey, run 4).
import {
  nextQuizPartId,
  type QuizDraftQuestion,
  type QuizDraftView,
  type QuizQuestionType,
} from "./quiz-draft-contract";

const trueFalse = () => [
  { id: "true", label: "True" },
  { id: "false", label: "False" },
];
const noKey = (): string[] => [];

/** A new question of a type, with fresh identities and an empty answer key. */
export function newQuizQuestion(
  type: QuizQuestionType,
  used: readonly string[],
): QuizDraftQuestion {
  return {
    sourceIndex: null,
    id: nextQuizPartId("question", used),
    type,
    prompt: "",
    explanation: "",
    choices:
      type === "true-false"
        ? trueFalse()
        : [
            { id: "choice-1", label: "" },
            { id: "choice-2", label: "" },
          ],
    correctChoiceIds: noKey(),
  };
}

/** Package 5: where a new quiz is created; the server derives everything else. */
export type QuizEditorCreation = { path: "forex" | "crypto"; parent: string };
/** The empty starting point for a new module quiz: version 1 and one starter question. */
export function newQuizView(creation: QuizEditorCreation): QuizDraftView {
  return {
    id: "",
    path: creation.path,
    parent: creation.parent,
    scope: "module",
    revision: 0,
    bodySha256: "0".repeat(64),
    version: 1,
    nextVersion: 1,
    approved: false,
    fields: { title: "", passingPercentage: 70, retakeCooldownSeconds: 0 },
    questions: [newQuizQuestion("single-choice", [])],
  };
}
