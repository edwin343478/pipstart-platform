import type {
  QuizDraftFields,
  QuizDraftQuestion,
  QuizDraftResult,
  QuizDraftView,
} from "./quiz-draft-contract";
export type QuizEditorPhase =
  "idle" | "busy" | "saved" | "conflict" | "uncertain" | "denied";
export type QuizBuffer = {
  fields: QuizDraftFields;
  questions: QuizDraftQuestion[];
  reason: string;
};
export type QuizEditorState = QuizBuffer & {
  phase: QuizEditorPhase;
  message: string;
  base: QuizDraftView;
  latest: QuizDraftView | null;
  clean: string;
};
export const quizBuffer = (v: QuizBuffer) =>
  JSON.stringify({
    fields: v.fields,
    questions: v.questions,
    reason: v.reason,
  });
export function initialQuizEditor(base: QuizDraftView): QuizEditorState {
  const buffer: QuizBuffer = {
    fields: structuredClone(base.fields),
    questions: structuredClone(base.questions),
    reason: "",
  };
  return {
    ...buffer,
    base,
    latest: null,
    phase: "idle",
    message: "",
    clean: quizBuffer(buffer),
  };
}
export type QuizEditorEvent =
  | { type: "edit"; buffer: Partial<QuizBuffer> }
  | { type: "busy" }
  | { type: "invalid" }
  | { type: "result"; result: QuizDraftResult }
  | { type: "latest"; result: QuizDraftResult }
  | { type: "use-latest" };
export function quizEditorReducer(
  s: QuizEditorState,
  e: QuizEditorEvent,
): QuizEditorState {
  if (e.type === "edit")
    return ["busy", "uncertain", "denied", "saved"].includes(s.phase)
      ? s
      : { ...s, ...e.buffer };
  if (e.type === "busy")
    return s.phase === "idle"
      ? {
          ...s,
          phase: "busy",
          latest: null,
          message: "Checking current access and saving this exact quiz draft…",
        }
      : s;
  if (e.type === "invalid")
    return {
      ...s,
      message:
        "Check the quiz fields, questions and change reason. Your entered work is preserved.",
    };
  if (e.type === "latest")
    return e.result.kind === "ready"
      ? {
          ...s,
          latest: e.result.item,
          message:
            "Latest draft loaded for comparison. Your entered work has not changed.",
        }
      : {
          ...s,
          latest: null,
          phase: e.result.kind === "denied" ? "denied" : s.phase,
          message:
            "Latest draft could not be read. Your entered work remains; no write was sent.",
        };
  if (e.type === "use-latest")
    return s.latest
      ? {
          ...initialQuizEditor(s.latest),
          message:
            "Latest draft loaded. Enter any changes again before saving.",
        }
      : s;
  if (e.type === "result") {
    const r = e.result;
    if (r.kind === "saved") {
      const next = {
        ...s,
        base: {
          ...s.base,
          revision: r.revision,
          bodySha256: r.bodySha256,
          version: r.version,
          nextVersion: r.version,
          approved: false,
          fields: structuredClone(s.fields),
          questions: structuredClone(s.questions),
        },
        reason: "",
        phase: "saved" as const,
        latest: null,
        message: `Private quiz draft saved as version ${r.version}. Reload it before editing again. Nothing was approved or published.`,
      };
      return { ...next, clean: quizBuffer(next) };
    }
    const phase =
      r.kind === "conflict"
        ? "conflict"
        : r.kind === "uncertain" || r.kind === "ready"
          ? "uncertain"
          : r.kind === "denied"
            ? "denied"
            : "idle";
    return {
      ...s,
      phase,
      latest: null,
      message:
        phase === "conflict"
          ? "A newer draft exists. Your work is preserved. Load latest and compare; saving remains blocked."
          : phase === "uncertain"
            ? "Save outcome uncertain. Do not resend. Load the latest permitted draft and compare before deciding what to do."
            : phase === "denied"
              ? "Current access was refused. Saving is blocked; entered work remains in this tab."
              : "The store refused this draft or is unavailable. Nothing was saved. Load latest to check the current version; your work is preserved.",
    };
  }
  return s;
}
