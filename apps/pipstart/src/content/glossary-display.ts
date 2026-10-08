import "server-only";
import { createHash } from "node:crypto";
import type { Metadata } from "next";
import draft from "./glossary-catalogue.draft.json";
import review from "./glossary-review-status.json";
import { publishedLessons } from "./lesson-registry";
import { getPublishedCourseGlossary } from "./published-glossary";
import { buildReviewedGlossaryPreview } from "../lib/glossary-reviewed-preview";
import type { PublishedGlossaryEntry } from "../lib/glossary-publication";
import type { GlossaryCourse, GlossaryEntry } from "../lib/glossary-search";
import {
  canonicalGlossaryJson as canonical,
  assertGlossaryEntries,
} from "../lib/glossary-contract";
assertGlossaryEntries(draft.entries);
let reviewed: readonly PublishedGlossaryEntry[] | undefined;
export function isGlossaryReviewMode() {
  const enabled = process.env.PIPSTART_M17_GLOSSARY_REVIEW === "1";
  if (
    enabled &&
    (process.env.VERCEL_ENV === "production" ||
      process.env.CONTEXT === "production")
  )
    throw new Error(
      "Local glossary review mode must not run on a production deployment.",
    );
  return enabled;
}
export function getGlossaryPageMetadata(): Metadata {
  return isGlossaryReviewMode()
    ? { robots: { index: false, follow: false } }
    : { robots: { index: true, follow: true } };
}
export function getDisplayedCourseGlossary(
  course: GlossaryCourse,
): readonly PublishedGlossaryEntry[] {
  if (!isGlossaryReviewMode()) return getPublishedCourseGlossary(course);
  if (!reviewed) {
    const actual = createHash("sha256").update(canonical(draft)).digest("hex");
    reviewed = buildReviewedGlossaryPreview(
      {
        status: draft.status,
        approved: draft.approved,
        entries: draft.entries as readonly GlossaryEntry[],
      },
      publishedLessons,
      review,
      actual,
    );
    if (reviewed.length !== 378)
      throw new Error(
        "The local glossary review does not match the approved, source-reviewed catalogue. No preview content was returned.",
      );
  }
  return reviewed.filter((e) => e.course === course);
}
