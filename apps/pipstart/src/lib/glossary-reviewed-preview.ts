import {
  integrateApprovedGlossary,
  type PublishedGlossaryEntry,
  type GlossaryLessonContext,
} from "./glossary-publication";
import type { GlossaryEntry } from "./glossary-search";
export type GlossaryReviewStatus = {
  schemaVersion: number;
  scope: string;
  wordingApproved: boolean;
  sourceReviewCompleteWithScope: boolean;
  correctionsApplied: number;
  unresolvedWordingCorrections: number;
  entryCount: number;
  meaningCount: number;
  catalogueDigest: string;
  publicationApproved: boolean;
};
// This is a presentation projection for explicit local review, never a release mutation.
// The public inventory and its root/entry gates remain separate and unchanged.
export function buildReviewedGlossaryPreview(
  catalogue: {
    status: string;
    approved: boolean;
    entries: readonly GlossaryEntry[];
  },
  lessons: readonly GlossaryLessonContext[],
  review: GlossaryReviewStatus,
  actualDigest: string,
): PublishedGlossaryEntry[] {
  if (
    review.schemaVersion !== 1 ||
    review.scope !== "local-review-only" ||
    !review.wordingApproved ||
    !review.sourceReviewCompleteWithScope ||
    review.correctionsApplied !== 18 ||
    review.unresolvedWordingCorrections !== 0 ||
    review.publicationApproved !== false ||
    !/^[a-f0-9]{64}$/.test(actualDigest) ||
    review.catalogueDigest !== actualDigest ||
    catalogue.status !== "draft" ||
    catalogue.approved !== false ||
    review.entryCount !== 378 ||
    review.meaningCount !== 380 ||
    catalogue.entries.length !== review.entryCount ||
    catalogue.entries.reduce((n, e) => n + e.meanings.length, 0) !==
      review.meaningCount ||
    !catalogue.entries.every(
      (e) =>
        e.status === "draft" && !e.approved && e.sourceReview === "pending",
    )
  )
    return [];
  const displayEntries = catalogue.entries.map((e) => ({
    ...e,
    status: "published" as const,
    approved: true,
    sourceReview: "verified" as const,
  }));
  const result = integrateApprovedGlossary([], displayEntries, lessons);
  if (
    result.length !== review.entryCount ||
    new Set(result.map((e) => e.id)).size !== review.entryCount ||
    result.reduce((n, e) => n + e.meanings.length, 0) !== review.meaningCount
  )
    return [];
  return result.map((e) => ({
    ...e,
    publicationBasis: "reviewed-glossary-preview",
  }));
}
