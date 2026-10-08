import type { GlossaryEntry } from "./glossary-search";
import type { GlossaryReviewStatus } from "./glossary-reviewed-preview";
export type GlossaryReleaseStatus = {
  schemaVersion: number;
  scope: string;
  publicationApproved: boolean;
  personalReviewApproved: boolean;
  approvalDate: string;
  entryCount: number;
  meaningCount: number;
  catalogueDigest: string;
};
// The archived editorial flags are immutable evidence. This separate release
// decision promotes only the exact personally reviewed, digest-bound snapshot.
export function releaseGlossaryEntries(
  catalogue: {
    status: string;
    approved: boolean;
    entries: readonly GlossaryEntry[];
  },
  review: GlossaryReviewStatus,
  release: GlossaryReleaseStatus,
  actualDigest: string,
): GlossaryEntry[] {
  if (!release.publicationApproved) return [];
  if (
    release.schemaVersion !== 1 ||
    release.scope !== "approved-public-release" ||
    release.publicationApproved !== true ||
    release.personalReviewApproved !== true ||
    release.approvalDate !== "2026-10-08" ||
    release.entryCount !== 378 ||
    release.meaningCount !== 380 ||
    !/^[a-f0-9]{64}$/.test(actualDigest) ||
    release.catalogueDigest !== actualDigest ||
    review.catalogueDigest !== actualDigest ||
    review.schemaVersion !== 1 ||
    review.scope !== "local-review-only" ||
    review.publicationApproved !== false ||
    !review.wordingApproved ||
    !review.sourceReviewCompleteWithScope ||
    review.correctionsApplied !== 18 ||
    review.unresolvedWordingCorrections !== 0 ||
    review.entryCount !== 378 ||
    review.meaningCount !== 380 ||
    catalogue.status !== "draft" ||
    catalogue.approved !== false ||
    catalogue.entries.length !== 378 ||
    catalogue.entries.reduce((n, e) => n + e.meanings.length, 0) !== 380 ||
    !catalogue.entries.every(
      (e) =>
        e.status === "draft" &&
        e.approved === false &&
        e.sourceReview === "pending",
    )
  )
    throw new Error(
      "Glossary release does not match the approved source-reviewed snapshot.",
    );
  return catalogue.entries.map((e) => ({
    ...e,
    status: "published",
    approved: true,
    sourceReview: "verified",
  }));
}
