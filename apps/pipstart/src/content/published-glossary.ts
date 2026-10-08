import "server-only";
import { cryptoTermName, cryptoTermSlug } from "../lib/crypto-learning-aids";
import type { GlossaryCourse } from "../lib/glossary-search";
import { getPublicGlossaryCatalogue } from "./glossary-catalogue";
import {
  cryptoGlossaryEntries,
  forexLessonDocuments,
  publishedLessons,
  type PublishedLesson,
} from "./lesson-registry";

import {
  integrateApprovedGlossary,
  assertApprovedGlossaryCoverage,
  type PublishedGlossaryEntry,
} from "../lib/glossary-publication";
export type { PublishedGlossaryEntry } from "../lib/glossary-publication";

// Existing sources remain the fallback. Approved catalogue content is merged
// only after both root and entry publication gates pass.
const discovery = new Map<
  string,
  { aliases: PublishedGlossaryEntry["aliases"]; category: string }
>();
function entry(
  course: GlossaryCourse,
  name: string,
  basis: PublishedGlossaryEntry["publicationBasis"],
): PublishedGlossaryEntry {
  const slug = cryptoTermSlug(name),
    id = course + ":" + slug,
    meta = discovery.get(id);
  return {
    id,
    course,
    slug,
    name: cryptoTermName(name),
    href: (course === "forex" ? "/glossary#" : "/glossary/crypto#") + slug,
    status: "published",
    approved: true,
    sourceReview: "verified",
    category: meta?.category ?? "Foundations and market basics",
    aliases: meta?.aliases ?? [],
    meanings: [],
    publicationBasis: basis,
  };
}

// verified denotes matching already-published source provenance, not a new financial certification.
export function buildPublishedForexGlossary(
  lessons: readonly PublishedLesson[],
) {
  const entries = new Map<string, PublishedGlossaryEntry>();
  for (const lesson of lessons) {
    if (
      lesson.learningPath !== "forex" ||
      lesson.status !== "published" ||
      !lesson.approved
    )
      continue;
    for (const block of lesson.blocks) {
      if (block.type !== "definition") continue;
      const value = entry("forex", block.term, "approved-published-lesson");
      const term = entries.get(value.slug) ?? value;
      let meaning = term.meanings.find((m) => m.definition === block.children);
      if (!meaning) {
        meaning = { definition: block.children, lessons: [] };
        term.meanings.push(meaning);
      }
      if (!meaning.lessons.some((l) => l.href === lesson.href))
        meaning.lessons.push({ title: lesson.title, href: lesson.href });
      entries.set(term.slug, term);
    }
  }
  // Keep these two existing public entries even though they are not explicit lesson definition blocks.
  for (const [name, definition] of [
    [
      "Pipette",
      "A fractional pip, used by brokers that quote prices to one extra decimal place.",
    ],
    [
      "Position size",
      "The number of units of currency controlled in a single trade.",
    ],
  ]) {
    const value = entry("forex", name, "existing-public-glossary");
    if (!entries.has(value.slug)) {
      value.meanings.push({ definition, lessons: [] });
      entries.set(value.slug, value);
    }
  }
  return [...entries.values()];
}

const forex = buildPublishedForexGlossary(forexLessonDocuments);
const crypto = cryptoGlossaryEntries.map((e) => ({
  ...entry("crypto", e.name, "existing-public-glossary"),
  slug: e.slug,
  id: "crypto:" + e.slug,
  href: "/glossary/crypto#" + e.slug,
  meanings: e.meanings,
}));
export const legacyPublishedGlossary = [...forex, ...crypto];
const integrated = integrateApprovedGlossary(
  [...forex, ...crypto],
  getPublicGlossaryCatalogue(),
  publishedLessons,
);
assertApprovedGlossaryCoverage(integrated, getPublicGlossaryCatalogue());
if (
  integrated.length !== 378 ||
  integrated.reduce((n, e) => n + e.meanings.length, 0) !== 380
)
  throw new Error(
    "Incomplete approved glossary release; no partial inventory returned.",
  );
export function getPublishedCourseGlossary(
  course: GlossaryCourse,
): readonly PublishedGlossaryEntry[] {
  return integrated.filter((e) => e.course === course);
}
