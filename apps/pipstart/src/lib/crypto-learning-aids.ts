import type { LessonDocument } from "../content/lesson-content";

export function cryptoTermName(term: string) {
  return term.replace(/^Definition\s*[—–-]\s*/i, "").trim();
}
export function cryptoTermSlug(term: string) {
  return cryptoTermName(term)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
export function getCryptoLessonTermSlugs(document: LessonDocument) {
  return [
    ...new Set(
      document.blocks
        .filter((block) => block.type === "definition")
        .map((block) => cryptoTermSlug(block.term)),
    ),
  ];
}
export type CryptoGlossaryEntry = {
  slug: string;
  name: string;
  meanings: {
    definition: string;
    lessons: { title: string; href: string }[];
  }[];
};
// Pure builder. Only the server registry imports course documents.
// Duplicate terms retain distinct approved meanings and their lesson context.
export function buildCryptoGlossary(
  documents: readonly (LessonDocument & { href: string })[],
) {
  const entries = new Map<string, CryptoGlossaryEntry>();
  for (const document of documents) {
    if (
      document.metadata.learningPath !== "crypto" ||
      document.metadata.status !== "published" ||
      !document.metadata.approved
    )
      continue;
    for (const block of document.blocks) {
      if (block.type !== "definition") continue;
      const slug = cryptoTermSlug(block.term);
      const entry = entries.get(slug) ?? {
        slug,
        name: cryptoTermName(block.term),
        meanings: [],
      };
      let meaning = entry.meanings.find(
        (item) => item.definition === block.children,
      );
      if (!meaning) {
        meaning = { definition: block.children, lessons: [] };
        entry.meanings.push(meaning);
      }
      if (!meaning.lessons.some((lesson) => lesson.href === document.href))
        meaning.lessons.push({
          title: document.metadata.title,
          href: document.href,
        });
      entries.set(slug, entry);
    }
  }
  for (const [name, definition] of [
    [
      "Bitcoin",
      "The first widely adopted decentralized cryptocurrency, introduced as a peer-to-peer electronic cash system.",
    ],
    [
      "Blockchain",
      "A shared record of transactions stored across a network of computers.",
    ],
  ]) {
    const slug = cryptoTermSlug(name);
    if (!entries.has(slug))
      entries.set(slug, {
        slug,
        name,
        meanings: [{ definition, lessons: [] }],
      });
  }
  return [...entries.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "en"),
  );
}
