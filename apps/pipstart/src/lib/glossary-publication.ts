import {
  isPublicGlossaryEntry,
  type GlossaryEntry,
  type GlossaryCourse,
} from "./glossary-search";
export type GlossaryLessonContext = {
  id: string;
  learningPath: GlossaryCourse;
  title: string;
  href: string;
};
export type PublishedGlossaryEntry = Omit<GlossaryEntry, "meanings"> & {
  meanings: {
    definition: string;
    example?: string;
    confusionNote?: string;
    lessons: { title: string; href: string; relation?: string }[];
  }[];
  publicationBasis:
    | "approved-published-lesson"
    | "existing-public-glossary"
    | "approved-glossary-catalogue"
    | "reviewed-glossary-preview";
  relatedTerms?: { id: string; name: string; href: string }[];
};
// Caller supplies only entries that pass the catalogue-level release gate.
// Entry-level gates are checked again; unpublished related targets are omitted.
export function integrateApprovedGlossary(
  legacy: readonly PublishedGlossaryEntry[],
  approved: readonly GlossaryEntry[],
  lessons: readonly GlossaryLessonContext[],
): PublishedGlossaryEntry[] {
  const result = new Map(legacy.map((e) => [e.id, e]));
  for (const e of approved) {
    if (
      !isPublicGlossaryEntry(e) ||
      e.id !== e.course + ":" + e.slug ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.slug) ||
      e.href !==
        (e.course === "forex" ? "/glossary#" : "/glossary/crypto#") + e.slug
    )
      continue;
    const contexts = (e.lessonLinks ?? []).map((link) =>
      lessons.find(
        (l) =>
          l.learningPath === e.course &&
          l.id === link.lessonId &&
          l.href === link.href,
      ),
    );
    if (contexts.some((l) => !l)) continue;
    const linked = contexts.filter((l): l is GlossaryLessonContext => !!l);
    const meanings = e.meanings.map((m) => {
      // Preserve per-meaning contexts rather than assigning every related lesson
      // to both retained meanings of Slashing or Wash trading.
      const selected =
        m.lessons === undefined
          ? linked
          : m.lessons.map((p) => linked.find((l) => l.href === p.href));
      if (selected.some((l) => !l)) return null;
      return {
        ...m,
        lessons: selected
          .filter((l): l is GlossaryLessonContext => !!l)
          .map((l) => ({
            title: l.title,
            href: l.href,
            relation: e.lessonLinks?.find((link) => link.href === l.href)
              ?.relation,
          })),
      };
    });
    if (!meanings.length || meanings.some((m) => !m)) continue;
    result.set(e.id, {
      ...e,
      meanings: meanings.filter((m): m is NonNullable<typeof m> => !!m),
      publicationBasis: "approved-glossary-catalogue",
    });
  }
  const entries = [...result.values()];
  return entries.map((e) =>
    e.publicationBasis !== "approved-glossary-catalogue"
      ? e
      : {
          ...e,
          relatedTerms: (e.relatedEntries ?? []).flatMap((r) => {
            const target = result.get(r.id);
            return target && target.id !== e.id
              ? [{ id: target.id, name: target.name, href: target.href }]
              : [];
          }),
        },
  );
}

// Release callers must reject partial catalogue replacement, even when legacy
// entries happen to keep the aggregate counts unchanged.
export function assertApprovedGlossaryCoverage(
  result: readonly PublishedGlossaryEntry[],
  approved: readonly GlossaryEntry[],
) {
  const ids = new Set(approved.map((e) => e.id));
  if (
    ids.size !== approved.length ||
    result.length !== approved.length ||
    new Set(result.map((e) => e.id)).size !== approved.length
  )
    throw new Error("Approved glossary identity coverage is incomplete.");
  for (const expected of approved) {
    const actual = result.find((e) => e.id === expected.id);
    if (
      !actual ||
      actual.publicationBasis !== "approved-glossary-catalogue" ||
      actual.href !== expected.href ||
      actual.name !== expected.name ||
      actual.meanings.length !== expected.meanings.length ||
      expected.meanings.some((m, i) => {
        const a = actual.meanings[i];
        const contexts = m.lessons ?? expected.lessonLinks ?? [];
        return (
          a.definition !== m.definition ||
          a.example !== m.example ||
          a.confusionNote !== m.confusionNote ||
          contexts.length !== a.lessons.length ||
          contexts.some((l, j) => l.href !== a.lessons[j].href)
        );
      })
    )
      throw new Error("Incomplete approved glossary entry: " + expected.id);
  }
}
