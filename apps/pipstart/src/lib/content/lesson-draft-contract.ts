import type { LessonBlock, LessonSource } from "../../content/lesson-content";
import { draftId, object } from "./curriculum-draft-contract";
export type LessonEditableBlock = LessonBlock;
export type LessonDraftFields = {
  title: string;
  description: string;
  estimatedMinutes: number;
  objectives: string[];
  seoTitle: string;
  seoDescription: string;
  sources: LessonSource[];
};
export type LessonBlockEntry = {
  sourceIndex: number | null;
  value: LessonEditableBlock;
};
export type LessonDraftContent =
  | { mode: "flat"; blocks: LessonBlockEntry[] }
  | {
      mode: "sections";
      sections: {
        sourceIndex: number | null;
        title: string;
        shortTitle?: string;
        blocks: LessonBlockEntry[];
      }[];
    };
export type LessonDraftInput =
  | { kind: "load"; id: string }
  | {
      kind: "save";
      id: string;
      baseRevision: number;
      baseSha256: string;
      fields: LessonDraftFields;
      content: LessonDraftContent;
      reason: string;
    };
type Rule = (v: unknown) => boolean;
const text = (v: unknown, max = 12000): v is string =>
  typeof v === "string" &&
  v.length > 0 &&
  v.length <= max &&
  !!v.trim() &&
  !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v);
const title: Rule = (v) => text(v, 200);
const integer = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= min && v <= max;
const list =
  (rule: Rule, min = 1, max = 100): Rule =>
  (v) =>
    Array.isArray(v) &&
    v.length >= min &&
    v.length <= max &&
    v.every((item) => rule(item));
const lines = list(text),
  optionalLines = list(text, 0);
const contentText: Rule = (v) => text(v) || lines(v);
const asset: Rule = (v) =>
  typeof v === "string" &&
  v.length <= 512 &&
  /^\/[a-zA-Z0-9_/-]+\.(?:svg|png|jpg|jpeg|webp|gif)$/.test(v) &&
  !v.includes("..") &&
  !v.includes("//");
const https: Rule = (v) => {
  if (typeof v !== "string" || v.length > 2048 || /[\s\u0000-\u001f]/.test(v))
    return false;
  try {
    const u = new URL(v);
    return (
      u.protocol === "https:" && !!u.hostname && !u.username && !u.password
    );
  } catch {
    return false;
  }
};
function shape(
  v: unknown,
  required: Record<string, Rule>,
  optional: Record<string, Rule> = {},
): v is Record<string, unknown> {
  return (
    object(v) &&
    Object.keys(v).every(
      (k) => Object.hasOwn(required, k) || Object.hasOwn(optional, k),
    ) &&
    Object.entries(required).every(
      ([k, test]) => Object.hasOwn(v, k) && test(v[k]),
    ) &&
    Object.entries(optional).every(
      ([k, test]) => !Object.hasOwn(v, k) || test(v[k]),
    )
  );
}
const source: Rule = (v) => shape(v, { title, url: https });
const rules: Record<
  LessonBlock["type"],
  [Record<string, Rule>, Record<string, Rule>?]
> = {
  heading: [{ children: text }, { level: (v) => v === 2 || v === 3 }],
  paragraph: [{ children: text }],
  learningLink: [
    {
      title,
      description: text,
      href: (v) =>
        typeof v === "string" && /^\/tools(?:\/[a-z0-9-]+)?$/.test(v),
    },
  ],
  section: [{ title: (v) => v === "" || title(v), paragraphs: lines }],
  references: [{ items: list(source) }],
  riskStatement: [{ children: text }],
  list: [
    { items: lines },
    { style: (v) => v === "ordered" || v === "unordered" },
  ],
  quote: [{ children: text }],
  reflection: [
    { title, points: lines },
    { introduction: optionalLines, closing: optionalLines },
  ],
  takeaway: [{ children: contentText }, { title }],
  definition: [{ term: title, children: text }],
  example: [{ children: contentText }, { title }],
  warning: [{ children: contentText }, { title }],
  keyPoint: [
    { points: lines },
    { title, checklist: (v) => typeof v === "boolean" },
  ],
  formula: [{ expression: text, explanation: text }],
  exercise: [{ prompt: text }],
  practice: [{ title, prompts: lines, answers: lines }],
  diagram: [
    {
      alt: text,
      src: asset,
      width: (v) => integer(v, 1, 10000),
      height: (v) => integer(v, 1, 10000),
    },
    { desktopSrc: asset, description: lines, caption: text },
  ],
  comparisonTable: [
    { columns: list(title, 1, 20), rows: list(list(text, 1, 20)) },
    { caption: text },
  ],
  riskNotice: [{ children: contentText }],
  affiliateDisclosure: [{ children: text }],
  quizPreview: [{ title, questionCount: (v) => integer(v, 1, 100) }],
};
function validBlock(v: unknown): v is LessonEditableBlock {
  if (!object(v) || typeof v.type !== "string" || !Object.hasOwn(rules, v.type))
    return false;
  const [required, optional] = rules[v.type as LessonBlock["type"]];
  if (!shape(v, { type: (t) => t === v.type, ...required }, optional))
    return false;
  const b = v as unknown as LessonBlock;
  if (b.type === "practice" && b.prompts.length !== b.answers.length)
    return false;
  if (
    b.type === "comparisonTable" &&
    (new Set(b.columns.map((c) => c.trim())).size !== b.columns.length ||
      b.rows.some((r) => r.length !== b.columns.length))
  )
    return false;
  return !(
    b.type === "diagram" &&
    b.src.startsWith("/lessons/crypto/") &&
    b.caption?.trim() === b.alt.trim()
  );
}
const index: Rule = (v) => v === null || integer(v, 0, 499);
const entry: Rule = (v) => shape(v, { sourceIndex: index, value: validBlock });
const section: Rule = (v) =>
  shape(
    v,
    { sourceIndex: index, title, blocks: list(entry, 1, 500) },
    { shortTitle: title },
  );
function validContent(v: unknown): v is LessonDraftContent {
  if (!object(v)) return false;
  if (v.mode === "flat")
    return shape(v, { mode: (m) => m === "flat", blocks: list(entry, 1, 500) });
  if (
    v.mode !== "sections" ||
    !shape(v, {
      mode: (m) => m === "sections",
      sections: list(section, 1, 100),
    })
  )
    return false;
  return (
    (v.sections as { blocks: unknown[] }[]).reduce(
      (n, s) => n + s.blocks.length,
      0,
    ) <= 500
  );
}
const validFields = (v: unknown): v is LessonDraftFields =>
  shape(v, {
    title,
    description: (v) => text(v, 2000),
    estimatedMinutes: (v) => integer(v, 1, 1440),
    objectives: list(title),
    seoTitle: title,
    seoDescription: (v) => text(v, 300),
    // Drafts may be saved without sources; review and publication require at least one.
    sources: list(source, 0, 50),
  });
function validInput(v: unknown): v is LessonDraftInput {
  if (!object(v)) return false;
  if (v.kind === "load")
    return shape(v, { kind: (k) => k === "load", id: draftId });
  return (
    v.kind === "save" &&
    shape(v, {
      kind: (k) => k === "save",
      id: draftId,
      baseRevision: (v) => integer(v, 1, 2147483646),
      baseSha256: (v) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v),
      fields: validFields,
      content: validContent,
      reason: (v) => text(v, 200) && v === v.trim() && !/[\r\n\t]/.test(v),
    })
  );
}
function schema<T>(valid: (v: unknown) => v is T) {
  return {
    safeParse(v: unknown): { success: true; data: T } | { success: false } {
      return valid(v)
        ? { success: true, data: structuredClone(v) }
        : { success: false };
    },
  };
}
export const lessonBlockSchema = schema(validBlock),
  lessonContentSchema = schema(validContent),
  lessonFieldsSchema = schema(validFields),
  lessonDraftInputSchema = schema(validInput);
export type LessonDraftView = {
  id: string;
  path: "forex" | "crypto";
  parent: string;
  revision: number;
  bodySha256: string;
  fields: LessonDraftFields;
  content: LessonDraftContent;
  protectedBlockIndexes: number[];
};
export type LessonDraftResult =
  | { kind: "ready"; item: LessonDraftView }
  | { kind: "saved"; id: string; revision: number; bodySha256: string }
  | { kind: "invalid" | "denied" | "unavailable" | "conflict" | "uncertain" };
const disclosure = (v: Record<string, unknown>) =>
  ["riskNotice", "riskStatement", "affiliateDisclosure"].includes(
    String(v.type),
  );
/** Pick only the explicitly supported block fields; extra imported attributes stay server-side. */
function editableBlock(v: unknown): LessonEditableBlock | null {
  if (!object(v) || typeof v.type !== "string") return null;
  const shapes: Record<LessonBlock["type"], readonly string[]> = {
    heading: ["level", "children"],
    paragraph: ["children"],
    learningLink: ["title", "description", "href"],
    section: ["title", "paragraphs"],
    references: ["items"],
    riskStatement: ["children"],
    list: ["style", "items"],
    quote: ["children"],
    reflection: ["title", "introduction", "points", "closing"],
    takeaway: ["title", "children"],
    definition: ["term", "children"],
    example: ["title", "children"],
    warning: ["title", "children"],
    keyPoint: ["title", "points", "checklist"],
    formula: ["expression", "explanation"],
    exercise: ["prompt"],
    practice: ["title", "prompts", "answers"],
    diagram: [
      "desktopSrc",
      "description",
      "alt",
      "caption",
      "height",
      "src",
      "width",
    ],
    comparisonTable: ["caption", "columns", "rows"],
    riskNotice: ["children"],
    affiliateDisclosure: ["children"],
    quizPreview: ["title", "questionCount"],
  };
  if (!Object.hasOwn(shapes, v.type)) return null;
  const projected: Record<string, unknown> = { type: v.type };
  for (const key of shapes[v.type as LessonBlock["type"]])
    if (v[key] !== undefined) projected[key] = structuredClone(v[key]);
  const parsed = lessonBlockSchema.safeParse(projected);
  return parsed.success ? parsed.data : null;
}
export function projectLessonBody(body: unknown): {
  fields: LessonDraftFields;
  content: LessonDraftContent;
  protectedBlockIndexes: number[];
} | null {
  if (
    !object(body) ||
    !object(body.metadata) ||
    !Array.isArray(body.blocks) ||
    body.blocks.length > 500
  )
    return null;
  if (
    typeof body.metadata.riskWarningRequired !== "boolean" ||
    typeof body.metadata.affiliateDisclosureRequired !== "boolean"
  )
    return null;
  const m = body.metadata,
    parsed = lessonFieldsSchema.safeParse({
      title: m.title,
      description: m.description,
      estimatedMinutes: m.estimatedMinutes,
      objectives: m.objectives,
      seoTitle: m.seoTitle,
      seoDescription: m.seoDescription,
      // Store bodies need not carry a sources list; a missing one is an empty list.
      sources: m.sources ?? [],
    });
  if (!parsed.success) return null;
  const blocks = body.blocks.map((b, i) => ({
    sourceIndex: i,
    value: editableBlock(b),
  }));
  if (blocks.some((b) => !b.value)) return null;
  let content: unknown = { mode: "flat", blocks };
  if (body.sections !== undefined) {
    if (!Array.isArray(body.sections) || body.sections.length > 100)
      return null;
    let offset = 0;
    const sections = [];
    for (const [i, s] of body.sections.entries()) {
      if (!object(s) || !Array.isArray(s.blocks)) return null;
      for (const block of s.blocks) {
        if (JSON.stringify(block) !== JSON.stringify(body.blocks[offset++]))
          return null;
      }
      sections.push({
        sourceIndex: i,
        title: s.title,
        ...(s.shortTitle === undefined ? {} : { shortTitle: s.shortTitle }),
        blocks: blocks.slice(offset - s.blocks.length, offset),
      });
    }
    if (offset !== blocks.length) return null;
    content = { mode: "sections", sections };
  }
  const c = lessonContentSchema.safeParse(content);
  if (!c.success) return null;
  return {
    fields: parsed.data,
    content: c.data,
    protectedBlockIndexes: body.blocks.flatMap((b, i) =>
      object(b) && disclosure(b) ? [i] : [],
    ),
  };
}
/** Merge against the latest server-read body. Source indexes are revision-bound, never persistent IDs. */
export function mergeLessonDraft(
  body: unknown,
  fields: LessonDraftFields,
  content: LessonDraftContent,
): Record<string, unknown> | null {
  const original = projectLessonBody(body);
  if (
    !original ||
    !object(body) ||
    !object(body.metadata) ||
    !Array.isArray(body.blocks) ||
    !lessonFieldsSchema.safeParse(fields).success ||
    !lessonContentSchema.safeParse(content).success ||
    original.content.mode !== content.mode
  )
    return null;
  const originals = body.blocks,
    used = new Set<number>(),
    assets = new Set<string>();
  for (const b of originals)
    if (object(b) && b.type === "diagram")
      for (const key of ["src", "desktopSrc"])
        if (typeof b[key] === "string") assets.add(b[key]);
  const mergeBlock = (e: LessonBlockEntry): Record<string, unknown> | null => {
    const i = e.sourceIndex,
      v = e.value;
    let old: Record<string, unknown> = {};
    if (i !== null) {
      if (used.has(i) || !object(originals[i]) || originals[i].type !== v.type)
        return null;
      used.add(i);
      old = originals[i];
      if (
        disclosure(old) &&
        JSON.stringify(editableBlock(old)) !== JSON.stringify(v)
      )
        return null;
    }
    if (
      v.type === "diagram" &&
      (!assets.has(v.src) ||
        (v.desktopSrc !== undefined && !assets.has(v.desktopSrc)))
    )
      return null;
    const result = { ...structuredClone(old) };
    const prior = editableBlock(old);
    if (prior) for (const key of Object.keys(prior)) delete result[key];
    return Object.assign(result, structuredClone(v));
  };
  const next = structuredClone(body);
  const all: Record<string, unknown>[] = [];
  if (content.mode === "flat") {
    for (const e of content.blocks) {
      const b = mergeBlock(e);
      if (!b) return null;
      all.push(b);
    }
  } else {
    const oldSections = body.sections as Record<string, unknown>[],
      sectionUsed = new Set<number>(),
      sections = [];
    for (const s of content.sections) {
      let prior: Record<string, unknown> = {};
      if (s.sourceIndex !== null) {
        if (
          sectionUsed.has(s.sourceIndex) ||
          !object(oldSections[s.sourceIndex])
        )
          return null;
        sectionUsed.add(s.sourceIndex);
        prior = oldSections[s.sourceIndex];
      }
      const blocks = [];
      for (const e of s.blocks) {
        const b = mergeBlock(e);
        if (!b) return null;
        blocks.push(b);
        all.push(b);
      }
      const section: Record<string, unknown> = {
        ...structuredClone(prior),
        title: s.title,
        blocks,
      };
      delete section.shortTitle;
      if (s.shortTitle !== undefined) section.shortTitle = s.shortTitle;
      sections.push(section);
    }
    next.sections = sections;
  }
  if (original.protectedBlockIndexes.some((i) => !used.has(i))) return null;
  const m = body.metadata;
  if (
    (m.riskWarningRequired === true &&
      !all.some((b) =>
        ["riskNotice", "riskStatement"].includes(String(b.type)),
      )) ||
    (m.affiliateDisclosureRequired === true &&
      !all.some((b) => b.type === "affiliateDisclosure"))
  )
    return null;
  next.metadata = { ...structuredClone(m), ...structuredClone(fields) };
  // Never add an empty sources list to a body that had none.
  if (m.sources === undefined && !fields.sources.length)
    delete (next.metadata as Record<string, unknown>).sources;
  next.blocks = all;
  if (new TextEncoder().encode(JSON.stringify(next)).length > 262144)
    return null;
  return next;
}
