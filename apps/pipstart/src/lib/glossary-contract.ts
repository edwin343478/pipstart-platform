import type { GlossaryEntry } from "./glossary-search";
export const canonicalGlossaryJson = (v: unknown): string =>
  Array.isArray(v)
    ? "[" + v.map(canonicalGlossaryJson).join(",") + "]"
    : v && typeof v === "object"
      ? "{" +
        Object.keys(v)
          .sort()
          .map(
            (k) =>
              JSON.stringify(k) +
              ":" +
              canonicalGlossaryJson((v as Record<string, unknown>)[k]),
          )
          .join(",") +
        "}"
      : JSON.stringify(v);
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;
const strings = (v: unknown, fields: string[]) =>
  object(v) && fields.every((k) => text(v[k]));
// Validate runtime teaching/search fields before trusting imported catalogue JSON.
export function assertGlossaryEntries(
  value: unknown,
): asserts value is readonly GlossaryEntry[] {
  if (!Array.isArray(value))
    throw new Error("Glossary entries must be an array.");
  const ids = new Set<string>();
  for (const e of value) {
    if (
      !object(e) ||
      !strings(e, ["id", "slug", "name", "href", "category"]) ||
      !["forex", "crypto"].includes(String(e.course)) ||
      !["draft", "published"].includes(String(e.status)) ||
      typeof e.approved !== "boolean" ||
      !["pending", "verified"].includes(String(e.sourceReview)) ||
      e.id !== e.course + ":" + e.slug ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(e.slug)) ||
      e.href !==
        (e.course === "forex" ? "/glossary#" : "/glossary/crypto#") + e.slug ||
      !Array.isArray(e.aliases) ||
      !e.aliases.every((a) => strings(a, ["value", "kind"])) ||
      !Array.isArray(e.meanings) ||
      !e.meanings.length ||
      !e.meanings.every(
        (m) =>
          object(m) &&
          text(m.definition) &&
          ["example", "confusionNote"].every(
            (k) => m[k] === undefined || typeof m[k] === "string",
          ) &&
          (m.lessons === undefined ||
            (Array.isArray(m.lessons) &&
              m.lessons.every((l) => strings(l, ["title", "href"])))),
      ) ||
      (e.lessonLinks !== undefined &&
        (!Array.isArray(e.lessonLinks) ||
          !e.lessonLinks.every((l) =>
            strings(l, ["lessonId", "href", "relation"]),
          ))) ||
      (e.relatedEntries !== undefined &&
        (!Array.isArray(e.relatedEntries) ||
          !e.relatedEntries.every((l) => strings(l, ["id", "kind"])))) ||
      ids.has(String(e.id))
    )
      throw new Error(
        "Invalid glossary entry: " + (object(e) ? String(e.id) : "unknown"),
      );
    ids.add(String(e.id));
  }
}
