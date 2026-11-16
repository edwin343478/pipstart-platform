// M22 MP10b: deterministic checks of the internal references in content (owner decision D4).
// A content body may point at a /tools page (learningLink.href) and at public images (diagram
// src/desktopSrc, partner image.src). Each must exist in this deployment; the list of targets is
// generated from the repository (reference-targets.ts) and never read from the filesystem at
// runtime. Make live refuses a revision with a missing target. The live-generation report adds the
// structure: every parent and every quiz course/module/lesson reference must be in the generation.
// External URLs are not checked here (MP10d); no network access is made.
import { referenceTargets } from "./reference-targets";

export type ReferenceProblem =
  "missing-page" | "missing-image" | "missing-parent" | "missing-quiz-target";

export type ReferenceFinding = {
  itemId: string;
  /** Where in the body, for example "blocks[4].src". */
  field: string;
  reference: string;
  problem: ReferenceProblem;
};

export type ReferenceItem = {
  id: string;
  family: string;
  parentId: string | null;
  body: unknown;
};

const assets: ReadonlySet<string> = new Set(referenceTargets.assets);
const tools: ReadonlySet<string> = new Set(referenceTargets.tools);
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** Every missing page or image referenced anywhere in one body, in document order. */
export function bodyReferenceFindings(
  itemId: string,
  body: unknown,
): ReferenceFinding[] {
  const out: ReferenceFinding[] = [];
  const image = (field: string, v: unknown) => {
    if (typeof v === "string" && !assets.has(v))
      out.push({ itemId, field, reference: v, problem: "missing-image" });
  };
  const visit = (node: unknown, at: string) => {
    if (Array.isArray(node)) {
      node.forEach((child, i) => visit(child, `${at}[${i}]`));
      return;
    }
    if (!object(node)) return;
    if (node.type === "learningLink" && typeof node.href === "string") {
      const href = node.href.split(/[?#]/)[0];
      if (!tools.has(href))
        out.push({
          itemId,
          field: `${at}.href`,
          reference: node.href,
          problem: "missing-page",
        });
    }
    if (node.type === "diagram") {
      image(`${at}.src`, node.src);
      image(`${at}.desktopSrc`, node.desktopSrc);
    }
    if (at === "" && object(node.image)) image("image.src", node.image.src);
    for (const [key, child] of Object.entries(node))
      if (Array.isArray(child) || object(child))
        visit(child, at ? `${at}.${key}` : key);
  };
  visit(body, "");
  return out;
}

/** The full report for one generation: body references plus parents and quiz targets. */
export function referenceReport(
  items: readonly ReferenceItem[],
): ReferenceFinding[] {
  const ids = new Set(items.map((i) => i.id));
  const out: ReferenceFinding[] = [];
  for (const item of items) {
    if (item.parentId !== null && !ids.has(item.parentId))
      out.push({
        itemId: item.id,
        field: "parent",
        reference: item.parentId,
        problem: "missing-parent",
      });
    if (
      item.family === "quiz" &&
      object(item.body) &&
      object(item.body.metadata)
    )
      for (const key of ["courseId", "moduleId", "lessonId"] as const) {
        const target = item.body.metadata[key];
        if (typeof target === "string" && !ids.has(target))
          out.push({
            itemId: item.id,
            field: `metadata.${key}`,
            reference: target,
            problem: "missing-quiz-target",
          });
      }
    out.push(...bodyReferenceFindings(item.id, item.body));
  }
  return out;
}

/** The items of a sealed generation snapshot (format 2), with its partners and their links. */
export function snapshotReferenceItems(snapshotText: string): ReferenceItem[] {
  const data: unknown = JSON.parse(snapshotText);
  if (!object(data) || !Array.isArray(data.items))
    throw new Error("Snapshot has no items");
  const out: ReferenceItem[] = [];
  for (const raw of data.items as unknown[]) {
    if (
      !object(raw) ||
      typeof raw.id !== "string" ||
      typeof raw.family !== "string"
    )
      throw new Error("Snapshot item is malformed");
    out.push({
      id: raw.id,
      family: raw.family,
      parentId: typeof raw.parentId === "string" ? raw.parentId : null,
      body: raw.body,
    });
  }
  if (Array.isArray(data.partners))
    for (const p of data.partners as unknown[]) {
      if (!object(p) || typeof p.id !== "string") continue;
      out.push({ id: p.id, family: "partner", parentId: null, body: p.body });
      if (Array.isArray(p.links))
        for (const l of p.links as unknown[])
          if (object(l) && typeof l.id === "string")
            out.push({
              id: l.id,
              family: "link",
              parentId: p.id,
              body: l.body,
            });
    }
  return out;
}

const problemText: Record<ReferenceProblem, string> = {
  "missing-page": "links to a page that does not exist",
  "missing-image": "uses an image that does not exist",
  "missing-parent": "belongs to an item that is not live",
  "missing-quiz-target": "refers to course content that is not live",
};
/** One plain line per finding, for staff. */
export function describeFinding(f: ReferenceFinding): string {
  return `${f.field} ${problemText[f.problem]}: ${f.reference}`;
}
