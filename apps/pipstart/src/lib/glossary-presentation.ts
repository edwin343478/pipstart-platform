import type { PublishedGlossaryEntry } from "./glossary-publication";
import type { GlossaryBrowseSelection } from "./glossary-browse";
export type GlossaryDisplayTerm = Pick<
  PublishedGlossaryEntry,
  "id" | "course" | "slug" | "name" | "href" | "meanings" | "relatedTerms"
>;
// Explicit allowlist: editorial evidence and discovery data stay on the server.
export function glossaryDisplayTerm(
  term: PublishedGlossaryEntry,
): GlossaryDisplayTerm {
  return {
    id: term.id,
    course: term.course,
    slug: term.slug,
    name: term.name,
    href: term.href,
    meanings: term.meanings.map((m) => ({
      definition: m.definition,
      example: m.example,
      confusionNote: m.confusionNote,
      lessons: m.lessons.map((l) => ({
        title: l.title,
        href: l.href,
        relation: l.relation,
      })),
    })),
    relatedTerms: term.relatedTerms?.map((t) => ({
      id: t.id,
      name: t.name,
      href: t.href,
    })),
  };
}
export function glossaryBrowseSelection(
  value: GlossaryBrowseSelection,
): GlossaryBrowseSelection {
  return {
    query: value.query,
    course: value.course,
    category: value.category,
    letter: value.letter,
  };
}
