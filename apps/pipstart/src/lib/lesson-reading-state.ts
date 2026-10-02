import type { LessonSection } from "../content/lesson-content";

export type ReadingState = {
  section?: string;
  showAll: boolean;
  checked: string[];
};
export const emptyReadingState: ReadingState = { showAll: false, checked: [] };

export function sectionIds(sections: readonly LessonSection[]) {
  const seen = new Map<string, number>();
  return sections.map((section) => {
    const slug =
      section.title
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "section";
    const occurrence = (seen.get(slug) ?? 0) + 1;
    seen.set(slug, occurrence);
    return occurrence === 1 ? slug : `${slug}-${occurrence}`;
  });
}

// A content change starts a new local reading/checklist record. This is not an
// assessment version, account progress record, or proof of lesson completion.
export function readingStorageKey(
  lessonId: string,
  sections: readonly LessonSection[],
) {
  const text = JSON.stringify(sections);
  let version = 2166136261;
  for (let index = 0; index < text.length; index++) {
    version ^= text.charCodeAt(index);
    version = Math.imul(version, 16777619);
  }
  return `pipstart:reading:v1:${lessonId}:${(version >>> 0).toString(16)}`;
}

export function readReadingState(raw: string): ReadingState {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyReadingState;
    const value = parsed as Record<string, unknown>;
    return {
      section: typeof value.section === "string" ? value.section : undefined,
      showAll: value.showAll === true,
      checked: Array.isArray(value.checked)
        ? [
            ...new Set(
              value.checked.filter(
                (item): item is string => typeof item === "string",
              ),
            ),
          ]
        : [],
    };
  } catch {
    return emptyReadingState;
  }
}

export function resolveReadingState(
  raw: string,
  search: string,
  ids: readonly string[],
) {
  const saved = readReadingState(raw);
  const params = new URLSearchParams(search);
  const requested = params.get("section");
  const activeIndex = Math.max(
    0,
    ids.indexOf(
      requested && ids.includes(requested) ? requested : (saved.section ?? ""),
    ),
  );
  return {
    ...saved,
    activeIndex,
    showAll: params.has("all") ? params.get("all") === "1" : saved.showAll,
  };
}
