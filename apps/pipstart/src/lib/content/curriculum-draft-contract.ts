import type { LearningPath } from "./contract";
import { routeSegment } from "./routes";
export type CurriculumDraftFields = {
  title: string;
  description: string;
  order: number;
  lessonContextTitle: string;
  lessonQuizLabel: string;
  seoTitle: string;
  seoDescription: string;
};
export type CurriculumDraftInput =
  | { kind: "load"; id: string }
  | {
      kind: "save";
      id: string;
      baseRevision: number;
      baseSha256: string;
      fields: CurriculumDraftFields;
      reason: string;
    }
  | {
      kind: "create";
      id: string;
      family: "course" | "module";
      path: LearningPath;
      parent: string | null;
      level: string | null;
      fields: CurriculumDraftFields;
      reason: string;
    };
export type CurriculumDraftView = {
  id: string;
  family: "course" | "module";
  path: LearningPath;
  parent: string | null;
  level: string | null;
  revision: number;
  bodySha256: string;
  fields: CurriculumDraftFields;
};
export type CurriculumDraftResult =
  | { kind: "ready"; item: CurriculumDraftView }
  | { kind: "saved"; id: string; revision: number; bodySha256: string }
  | { kind: "invalid" | "denied" | "unavailable" | "conflict" | "uncertain" };
export const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const exact = (v: Record<string, unknown>, keys: string) =>
  Object.keys(v).sort().join(",") === keys;
const text = (v: unknown, max: number, required = false): v is string =>
  typeof v === "string" &&
  v === v.trim() &&
  [...v].length <= max &&
  (!required || v.length > 0) &&
  !/[\u0000-\u001f\u007f]/.test(v);
export const draftId = (v: unknown): v is string =>
  typeof v === "string" &&
  v.length <= 100 &&
  routeSegment.test(v) &&
  v !== "quiz";
export const curriculumLevel = (v: unknown): v is string =>
  typeof v === "string" && /^level-(?:[0-9]|10)$/.test(v);
export function validDraftFields(v: unknown): v is CurriculumDraftFields {
  return (
    object(v) &&
    exact(
      v,
      "description,lessonContextTitle,lessonQuizLabel,order,seoDescription,seoTitle,title",
    ) &&
    text(v.title, 200, true) &&
    text(v.description, 2000, true) &&
    Number.isSafeInteger(v.order) &&
    Number(v.order) >= 1 &&
    Number(v.order) <= 10000 &&
    text(v.lessonContextTitle, 200) &&
    text(v.lessonQuizLabel, 200) &&
    text(v.seoTitle, 200) &&
    text(v.seoDescription, 300)
  );
}
export function validDraftInput(v: unknown): v is CurriculumDraftInput {
  if (!object(v) || !draftId(v.id)) return false;
  if (v.kind === "load") return exact(v, "id,kind");
  if (!validDraftFields(v.fields) || !text(v.reason, 200, true)) return false;
  if (v.kind === "save")
    return (
      exact(v, "baseRevision,baseSha256,fields,id,kind,reason") &&
      Number.isSafeInteger(v.baseRevision) &&
      Number(v.baseRevision) >= 1 &&
      Number(v.baseRevision) < 2147483647 &&
      typeof v.baseSha256 === "string" &&
      /^[a-f0-9]{64}$/.test(v.baseSha256)
    );
  return (
    v.kind === "create" &&
    exact(v, "family,fields,id,kind,level,parent,path,reason") &&
    ["forex", "crypto"].includes(String(v.path)) &&
    (v.family === "course"
      ? v.parent === null && curriculumLevel(v.level)
      : v.family === "module" && draftId(v.parent) && v.level === null)
  );
}
/** The editable curriculum fields of one revision body; null when the shape is not editable. */
export function projectCurriculumFields(
  family: "course" | "module",
  metadata: Record<string, unknown>,
): { fields: CurriculumDraftFields; level: string | null } | null {
  const m = metadata;
  if (
    !object(m.placement) ||
    (m.presentation !== undefined && !object(m.presentation))
  )
    return null;
  const p = object(m.presentation) ? m.presentation : {};
  if (p.seo !== undefined && !object(p.seo)) return null;
  const seo = object(p.seo) ? p.seo : {};
  const fields = {
    title: m.title,
    description: m.description,
    order: m.placement.order,
    lessonContextTitle: p.lessonContextTitle ?? "",
    lessonQuizLabel: p.lessonQuizLabel ?? "",
    seoTitle: seo.title ?? "",
    seoDescription: seo.description ?? "",
  };
  if (
    !validDraftFields(fields) ||
    (family === "course" && !curriculumLevel(m.level))
  )
    return null;
  return { fields, level: family === "course" ? (m.level as string) : null };
}
/** Merge only named fields, preserving all unedited imported and future metadata. Server use only. */
export function mergeDraftFields(
  body: Record<string, unknown>,
  fields: CurriculumDraftFields,
) {
  if (!object(body.metadata)) return null;
  const m = body.metadata;
  if (
    (m.placement !== undefined && !object(m.placement)) ||
    (m.presentation !== undefined && !object(m.presentation))
  )
    return null;
  const placement = {
    ...(m.placement as Record<string, unknown> | undefined),
    order: fields.order,
  };
  const presentation = {
    ...(m.presentation as Record<string, unknown> | undefined),
  };
  if (presentation.seo !== undefined && !object(presentation.seo)) return null;
  const seo = { ...(presentation.seo as Record<string, unknown> | undefined) };
  for (const [key, value] of [
    ["title", fields.seoTitle],
    ["description", fields.seoDescription],
  ]) {
    if (value) seo[key] = value;
    else delete seo[key];
  }
  if (Object.keys(seo).length) presentation.seo = seo;
  else delete presentation.seo;
  for (const [key, value] of [
    ["lessonContextTitle", fields.lessonContextTitle],
    ["lessonQuizLabel", fields.lessonQuizLabel],
  ]) {
    if (value) presentation[key] = value;
    else delete presentation[key];
  }
  const metadata: { title: string } & Record<string, unknown> = {
    ...m,
    title: fields.title,
    description: fields.description,
    placement,
  };
  if (Object.keys(presentation).length) metadata.presentation = presentation;
  else delete metadata.presentation;
  return { ...body, metadata };
}
