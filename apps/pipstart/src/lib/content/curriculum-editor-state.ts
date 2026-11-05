import type {
  CurriculumDraftFields,
  CurriculumDraftResult,
  CurriculumDraftView,
} from "./curriculum-draft-contract";
export const emptyDraftFields: CurriculumDraftFields = {
  title: "",
  description: "",
  order: 1,
  lessonContextTitle: "",
  lessonQuizLabel: "",
  seoTitle: "",
  seoDescription: "",
};
export type EditorPhase =
  "idle" | "busy" | "conflict" | "uncertain" | "denied" | "saved";
export type EditorState = {
  fields: CurriculumDraftFields;
  reason: string;
  phase: EditorPhase;
  message: string;
  base: CurriculumDraftView | null;
  latest: CurriculumDraftView | null;
  clean: string;
};
export const draftBuffer = (fields: CurriculumDraftFields, reason: string) =>
  JSON.stringify({ fields, reason });
export function initialEditor(item: CurriculumDraftView | null): EditorState {
  const fields = item ? { ...item.fields } : { ...emptyDraftFields };
  return {
    fields,
    reason: "",
    phase: "idle",
    message: "",
    base: item,
    latest: null,
    clean: draftBuffer(fields, ""),
  };
}
export type EditorEvent =
  | { type: "field"; name: keyof CurriculumDraftFields; value: string | number }
  | { type: "reason"; value: string }
  | { type: "busy" }
  | { type: "invalid" }
  | {
      type: "result";
      result: CurriculumDraftResult;
      identity: Omit<CurriculumDraftView, "fields" | "revision" | "bodySha256">;
    }
  | { type: "latest"; result: CurriculumDraftResult }
  | { type: "use-latest" }
  | { type: "available" };
export function editorReducer(s: EditorState, e: EditorEvent): EditorState {
  if (e.type === "field")
    return { ...s, fields: { ...s.fields, [e.name]: e.value } };
  if (e.type === "reason") return { ...s, reason: e.value };
  if (e.type === "busy")
    return {
      ...s,
      phase: "busy",
      message: "Checking current access and saving this exact draft…",
    };
  if (e.type === "invalid")
    return {
      ...s,
      phase: "idle",
      message:
        "Check the fields, remove leading/trailing spaces and line breaks, and give a change reason. Your values are preserved.",
    };
  if (e.type === "latest") {
    if (e.result.kind === "ready")
      return {
        ...s,
        latest: e.result.item,
        message:
          "Latest permitted draft loaded for comparison. Your entered values have not changed.",
      };
    return {
      ...s,
      latest: null,
      phase: e.result.kind === "denied" ? "denied" : s.phase,
      message:
        "The latest draft could not be read. Your entered values are preserved; no write was sent.",
    };
  }
  if (e.type === "use-latest" && s.latest)
    return {
      ...initialEditor(s.latest),
      message: "Latest draft loaded. Enter any changes again before saving.",
    };
  if (e.type === "available")
    return {
      ...s,
      message:
        "The request was unavailable. Your entered values are preserved.",
    };
  if (e.type === "result") {
    const r = e.result;
    if (r.kind === "saved") {
      const base = {
        ...e.identity,
        fields: { ...s.fields },
        revision: r.revision,
        bodySha256: r.bodySha256,
        id: r.id,
      };
      return {
        ...s,
        base,
        reason: "",
        phase: "saved",
        latest: null,
        clean: draftBuffer(s.fields, ""),
        message:
          "Draft saved. This did not publish content. Reload the saved draft before another save.",
      };
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
        r.kind === "conflict"
          ? "A newer revision exists. Your changes are preserved. Load the latest draft to compare; no overwrite was sent."
          : phase === "uncertain"
            ? "The save outcome is uncertain. Do not resend it. Load the latest permitted draft and compare before deciding what to do."
            : r.kind === "denied"
              ? "Staff access changed. Saving is blocked. Your entered values remain in this tab."
              : "The request was refused or unavailable. Check the fields, identity and parent access. Your values are preserved.",
    };
  }
  return s;
}
