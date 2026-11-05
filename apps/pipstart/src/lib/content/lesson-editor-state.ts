import type {
  LessonDraftContent,
  LessonDraftFields,
  LessonDraftResult,
  LessonDraftView,
  LessonEditableBlock,
} from "./lesson-draft-contract";
import { LESSON_DRAFT_RISK } from "./lesson-create-contract";
export type LessonEditorPhase =
  "idle" | "busy" | "saved" | "conflict" | "uncertain" | "denied";
export type LessonBuffer = {
  fields: LessonDraftFields;
  content: LessonDraftContent;
  reason: string;
};
export type LessonEditorState = LessonBuffer & {
  phase: LessonEditorPhase;
  message: string;
  base: LessonDraftView | null;
  latest: LessonDraftView | null;
  clean: string;
};
export const lessonBuffer = (v: LessonBuffer) =>
  JSON.stringify({ fields: v.fields, content: v.content, reason: v.reason });
export function initialLessonEditor(
  base: LessonDraftView | null,
): LessonEditorState {
  const buffer: LessonBuffer = base
    ? {
        fields: structuredClone(base.fields),
        content: structuredClone(base.content),
        reason: "",
      }
    : {
        fields: {
          title: "",
          description: "",
          estimatedMinutes: 5,
          objectives: [""],
          seoTitle: "",
          seoDescription: "",
          sources: [],
        },
        content: {
          mode: "flat",
          blocks: [
            { sourceIndex: null, value: { type: "paragraph", children: "" } },
            {
              sourceIndex: null,
              value: { type: "riskNotice", children: LESSON_DRAFT_RISK },
            },
          ],
        },
        reason: "",
      };
  return {
    ...buffer,
    base,
    latest: null,
    phase: "idle",
    message: "",
    clean: lessonBuffer(buffer),
  };
}
export type LessonEditorEvent =
  | { type: "edit"; buffer: Partial<LessonBuffer> }
  | { type: "busy" }
  | { type: "invalid" }
  | {
      type: "result";
      result: LessonDraftResult;
      identity: { id: string; path: "forex" | "crypto"; parent: string };
    }
  | { type: "latest"; result: LessonDraftResult }
  | { type: "use-latest" };
export function lessonEditorReducer(
  s: LessonEditorState,
  e: LessonEditorEvent,
): LessonEditorState {
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
          message:
            "Checking current access and saving this exact lesson draft…",
        }
      : s;
  if (e.type === "invalid")
    return {
      ...s,
      message:
        "Check the lesson fields, blocks and reason. Your entered work is preserved.",
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
          ...initialLessonEditor(s.latest),
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
          ...e.identity,
          revision: r.revision,
          bodySha256: r.bodySha256,
          fields: structuredClone(s.fields),
          content: structuredClone(s.content),
          protectedBlockIndexes: s.base?.protectedBlockIndexes ?? [],
        },
        reason: "",
        phase: "saved" as const,
        latest: null,
        message:
          "Private lesson draft saved. Reload it before editing again. No learner content was published.",
      };
      return { ...next, clean: lessonBuffer(next) };
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
              : "Request refused or unavailable. Check fields and parent access. Your work is preserved.",
    };
  }
  return s;
}
export const protectedLessonBlock = (b: LessonEditableBlock) =>
  ["riskNotice", "riskStatement", "affiliateDisclosure"].includes(b.type);
export function lessonAssets(content: LessonDraftContent): string[] {
  const blocks =
    content.mode === "flat"
      ? content.blocks
      : content.sections.flatMap((s) => s.blocks);
  return [
    ...new Set(
      blocks.flatMap(({ value: b }) =>
        b.type === "diagram"
          ? [b.src, ...(b.desktopSrc ? [b.desktopSrc] : [])]
          : [],
      ),
    ),
  ];
}
