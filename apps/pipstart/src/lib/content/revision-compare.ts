import { object, projectCurriculumFields } from "./curriculum-draft-contract";
import {
  projectLessonBody,
  type LessonDraftContent,
} from "./lesson-draft-contract";

// Comparison of two revision bodies through the same editable projections the editors use, so
// imported attributes the editors never show (and any private field) never reach the browser.
export type FieldChange = { label: string; before: string; after: string };
export type ContentLineChange = {
  op: "added" | "removed";
  position: number;
  label: string;
  text: string;
};
export type RevisionComparison = {
  fields: FieldChange[];
  lines: ContentLineChange[];
  unchangedLines: number;
  truncated: boolean;
};
export const MAX_COMPARED_LINES = 300;
const MAX_TEXT = 1000;
type Line = { label: string; text: string };
const clip = (v: string) => {
  const chars = [...v];
  return chars.length > MAX_TEXT ? chars.slice(0, MAX_TEXT).join("") + "…" : v;
};
const typeLabel = (type: string) => {
  const words = type.replace(/([A-Z])/g, " $1").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};
function words(v: unknown, key = ""): string[] {
  if (typeof v === "string") return v ? [v] : [];
  if (typeof v === "number") return [key ? `${key}: ${v}` : String(v)];
  if (typeof v === "boolean") return [`${key}: ${v ? "yes" : "no"}`];
  if (Array.isArray(v)) return v.flatMap((x) => words(x, key));
  if (object(v))
    return Object.entries(v).flatMap(([k, x]) =>
      k === "type" ? [] : words(x, k),
    );
  return [];
}
function contentLines(content: LessonDraftContent): Line[] {
  const block = (b: { value: { type: string } }): Line => ({
    label: typeLabel(b.value.type),
    text: clip(words(b.value).join(" · ")),
  });
  if (content.mode === "flat") return content.blocks.map(block);
  return content.sections.flatMap((section) => [
    {
      label: "Section",
      text: clip(
        [section.title, section.shortTitle].filter(Boolean).join(" · "),
      ),
    },
    ...section.blocks.map(block),
  ]);
}
/** Longest common subsequence: lines only in `before` are removed, only in `after` added. */
function lineChanges(before: Line[], after: Line[]) {
  const key = (l: Line) => l.label + "\u0000" + l.text;
  const a = before.map(key),
    b = after.map(key),
    table = Array.from({ length: a.length + 1 }, () =>
      new Array<number>(b.length + 1).fill(0),
    );
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      table[i][j] =
        a[i] === b[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
  const lines: ContentLineChange[] = [];
  let i = 0,
    j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      i++;
      j++;
    } else if (
      i < a.length &&
      (j === b.length || table[i + 1][j] >= table[i][j + 1])
    ) {
      lines.push({ op: "removed", position: i + 1, ...before[i] });
      i++;
    } else {
      lines.push({ op: "added", position: j + 1, ...after[j] });
      j++;
    }
  }
  return { lines, unchanged: table[0][0] };
}
function fieldChanges(rows: [string, unknown, unknown][]): FieldChange[] {
  const show = (v: unknown) =>
    clip(v === null || v === undefined ? "" : String(v));
  return rows
    .filter(([, before, after]) => show(before) !== show(after))
    .map(([label, before, after]) => ({
      label,
      before: show(before),
      after: show(after),
    }));
}
const source = (v: { title: string; url: string } | undefined) =>
  v ? v.title + " · " + v.url : "";
function lessonFields(
  before: NonNullable<ReturnType<typeof projectLessonBody>>,
  after: NonNullable<ReturnType<typeof projectLessonBody>>,
) {
  const objectives = Math.max(
    before.fields.objectives.length,
    after.fields.objectives.length,
  );
  return fieldChanges([
    ["Title", before.fields.title, after.fields.title],
    ["Description", before.fields.description, after.fields.description],
    [
      "Estimated minutes",
      before.fields.estimatedMinutes,
      after.fields.estimatedMinutes,
    ],
    ...Array.from(
      { length: objectives },
      (_, i): [string, unknown, unknown] => [
        `Learning objective ${i + 1}`,
        before.fields.objectives[i],
        after.fields.objectives[i],
      ],
    ),
    ["SEO title", before.fields.seoTitle, after.fields.seoTitle],
    [
      "SEO description",
      before.fields.seoDescription,
      after.fields.seoDescription,
    ],
    ...Array.from(
      {
        length: Math.max(
          before.fields.sources.length,
          after.fields.sources.length,
        ),
      },
      (_, i): [string, unknown, unknown] => [
        `Source ${i + 1}`,
        source(before.fields.sources[i]),
        source(after.fields.sources[i]),
      ],
    ),
    [
      "Lesson layout",
      before.content.mode === "flat" ? "Flat" : "Sections",
      after.content.mode === "flat" ? "Flat" : "Sections",
    ],
  ]);
}
/** Null when either body does not fit the editable projection of its family. */
export function compareRevisionBodies(
  family: "course" | "module" | "lesson",
  before: unknown,
  after: unknown,
): RevisionComparison | null {
  let fields: FieldChange[],
    lines: ContentLineChange[] = [],
    unchanged = 0;
  if (family === "lesson") {
    const a = projectLessonBody(before),
      b = projectLessonBody(after);
    if (!a || !b) return null;
    fields = lessonFields(a, b);
    const changes = lineChanges(
      contentLines(a.content),
      contentLines(b.content),
    );
    lines = changes.lines;
    unchanged = changes.unchanged;
  } else {
    if (!object(before) || !object(after)) return null;
    if (!object(before.metadata) || !object(after.metadata)) return null;
    const a = projectCurriculumFields(family, before.metadata),
      b = projectCurriculumFields(family, after.metadata);
    if (!a || !b) return null;
    fields = fieldChanges([
      ["Title", a.fields.title, b.fields.title],
      ["Description", a.fields.description, b.fields.description],
      ["Order", a.fields.order, b.fields.order],
      ...(family === "course"
        ? [["Level", a.level, b.level] as [string, unknown, unknown]]
        : []),
      [
        "Lesson context title",
        a.fields.lessonContextTitle,
        b.fields.lessonContextTitle,
      ],
      ["Quiz link label", a.fields.lessonQuizLabel, b.fields.lessonQuizLabel],
      ["SEO title", a.fields.seoTitle, b.fields.seoTitle],
      ["SEO description", a.fields.seoDescription, b.fields.seoDescription],
    ]);
  }
  return {
    fields,
    lines: lines.slice(0, MAX_COMPARED_LINES),
    unchangedLines: unchanged,
    truncated: lines.length > MAX_COMPARED_LINES,
  };
}
