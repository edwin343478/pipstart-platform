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
    lessons: { title: string; href: string }[];
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
          .map((l) => ({ title: l.title, href: l.href })),
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
