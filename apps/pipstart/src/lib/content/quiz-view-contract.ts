import { draftId, object } from "./curriculum-draft-contract";
import type {
  QuizDraftFields,
  QuizDraftQuestion,
  QuizDraftView,
} from "./quiz-draft-contract";

// M22 audit Package 5 (D4): one exact quiz revision, read-only, for staff who review or edit quizzes.
// It carries only the editable projection (fields, questions, answer key, explanations) and the
// review record, never hidden attributes. Staff pages only: it is never prerendered or cached.
export type QuizGovernanceView = {
  author: string;
  reviewer: string;
  reviewedAt: string;
  nextReviewAt: string;
  sources: string[];
};
export type QuizReadView = {
  id: string;
  path: "forex" | "crypto";
  parent: string;
  scope: QuizDraftView["scope"];
  revision: number;
  latestRevision: number;
  state: string;
  bodySha256: string;
  version: number;
  trashed: boolean;
  onHold: boolean;
  fields: QuizDraftFields;
  questions: QuizDraftQuestion[];
  governance: QuizGovernanceView | null;
};
export type QuizViewInput = { id: string; revision: number | null };
export type QuizViewResult =
  | { kind: "ready"; view: QuizReadView }
  | { kind: "invalid" | "denied" | "unavailable" };

export function parseQuizViewInput(v: unknown): QuizViewInput | null {
  return object(v) &&
    Object.keys(v).sort().join(",") === "id,revision" &&
    draftId(v.id) &&
    (v.revision === null ||
      (typeof v.revision === "number" &&
        Number.isSafeInteger(v.revision) &&
        v.revision >= 1 &&
        v.revision <= 2147483646))
    ? { id: v.id as string, revision: v.revision as number | null }
    : null;
}

const line = (v: unknown, max: number) =>
  typeof v === "string" && [...v].length <= max ? v : null;
/** The review record of a quiz body; null when it is missing or malformed (shown as such). */
export function projectQuizGovernance(
  body: unknown,
): QuizGovernanceView | null {
  if (!object(body) || !object(body.metadata)) return null;
  const g = body.metadata.governance;
  if (!object(g) || !Array.isArray(g.sources) || g.sources.length > 20)
    return null;
  const author = line(g.author, 300),
    reviewer = line(g.reviewer, 300),
    reviewedAt = line(g.reviewedAt, 40),
    nextReviewAt = line(g.nextReviewAt, 40),
    sources = g.sources.map((s) => line(s, 300));
  if (
    author === null ||
    reviewer === null ||
    reviewedAt === null ||
    nextReviewAt === null ||
    sources.some((s) => s === null)
  )
    return null;
  return {
    author,
    reviewer,
    reviewedAt,
    nextReviewAt,
    sources: sources as string[],
  };
}
