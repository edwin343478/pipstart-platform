import { draftId, object } from "./curriculum-draft-contract";
import {
  lessonContentSchema,
  lessonFieldsSchema,
  type LessonDraftContent,
  type LessonDraftFields,
} from "./lesson-draft-contract";
import { checkContentBody } from "./validate";
export const LESSON_DRAFT_RISK =
  "Learning material is educational, not personal financial advice. Trading involves risk and you can lose money.";
export type LessonCreation = {
  kind: "create";
  id: string;
  path: "forex" | "crypto";
  parent: string;
  order: number;
  fields: LessonDraftFields;
  content: LessonDraftContent;
  reason: string;
};
export function parseLessonCreation(v: unknown): LessonCreation | null {
  if (
    !object(v) ||
    Object.keys(v).sort().join(",") !==
      "content,fields,id,kind,order,parent,path,reason" ||
    v.kind !== "create" ||
    !draftId(v.id) ||
    !draftId(v.parent) ||
    !["forex", "crypto"].includes(String(v.path)) ||
    !Number.isSafeInteger(v.order) ||
    Number(v.order) < 1 ||
    Number(v.order) > 10000 ||
    typeof v.reason !== "string" ||
    !v.reason.trim() ||
    v.reason !== v.reason.trim() ||
    [...v.reason].length > 200 ||
    /[\u0000-\u001f\u007f]/.test(v.reason)
  )
    return null;
  const f = lessonFieldsSchema.safeParse(v.fields),
    c = lessonContentSchema.safeParse(v.content);
  if (!f.success || !c.success) return null;
  const entries =
    c.data.mode === "flat"
      ? c.data.blocks
      : c.data.sections.flatMap((s) => s.blocks);
  if (
    entries.some((b) => b.sourceIndex !== null || b.value.type === "diagram") ||
    (c.data.mode === "sections" &&
      c.data.sections.some((s) => s.sourceIndex !== null)) ||
    !entries.some(
      (b) =>
        b.value.type === "riskNotice" && b.value.children === LESSON_DRAFT_RISK,
    )
  )
    return null;
  return {
    kind: "create",
    id: v.id,
    path: v.path as "forex" | "crypto",
    parent: v.parent,
    order: Number(v.order),
    fields: f.data,
    content: c.data,
    reason: v.reason,
  };
}
export function newLessonBody(
  command: LessonCreation,
  course: string,
  level: string,
) {
  const content = structuredClone(command.content),
    blocks =
      content.mode === "flat"
        ? content.blocks.map((b) => b.value)
        : content.sections.flatMap((s) => s.blocks.map((b) => b.value));
  const body = {
    metadata: {
      ...structuredClone(command.fields),
      slug: command.id,
      learningPath: command.path,
      course,
      module: command.parent,
      level,
      position: command.order,
      placement: { order: command.order },
      prerequisites: [],
      relatedLessonIds: [],
      relatedTermSlugs: [],
      author: "Editorial draft",
      reviewer: "Review pending",
      publishedDate: "",
      reviewDate: "",
      status: "draft",
      approved: false,
      riskWarningRequired: true,
      affiliateDisclosureRequired: false,
    },
    blocks,
    ...(content.mode === "sections"
      ? {
          sections: content.sections.map((s) => ({
            title: s.title,
            ...(s.shortTitle === undefined ? {} : { shortTitle: s.shortTitle }),
            blocks: s.blocks.map((b) => b.value),
          })),
        }
      : {}),
  };
  return checkContentBody("lesson", body).ok ? body : null;
}
