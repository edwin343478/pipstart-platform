import { describe, expect, it } from "vitest";

import type { LessonDocument, LessonMetadata } from "./lesson-content";
import {
  selectPublishableLessons,
  validateLessonForPublication,
} from "./lesson-content";

function validDocument(): LessonDocument {
  return {
    metadata: {
      affiliateDisclosureRequired: false,
      approved: true,
      author: "Author",
      course: "course",
      description: "Description",
      estimatedMinutes: 5,
      learningPath: "forex",
      level: "level-1",
      module: "module",
      objectives: ["Learn safely"],
      position: 1,
      prerequisites: [],
      publishedDate: "2026-09-01",
      relatedLessonIds: [],
      relatedTermSlugs: [],
      reviewer: "Reviewer",
      reviewDate: "2026-09-15",
      riskWarningRequired: false,
      seoDescription: "SEO description",
      seoTitle: "SEO title",
      slug: "valid-lesson",
      sources: [{ title: "Source", url: "https://example.com/source" }],
      status: "published",
      title: "Valid lesson",
    },
    blocks: [{ type: "keyPoint", points: ["A useful point"] }],
  };
}

describe("lesson publishing safeguards", () => {
  it("accepts a complete, independently reviewed lesson", () => {
    expect(validateLessonForPublication(validDocument())).toBeTruthy();
  });

  it.each([
    "title",
    "slug",
    "description",
    "learningPath",
    "level",
    "course",
    "module",
    "author",
    "reviewer",
    "publishedDate",
    "reviewDate",
    "status",
    "seoTitle",
    "seoDescription",
  ] as const)("rejects missing %s metadata", (field) => {
    const document = validDocument();
    delete (document.metadata as Partial<LessonMetadata>)[field];
    expect(() => validateLessonForPublication(document)).toThrow(field);
  });

  it("rejects missing arrays, numeric fields, flags, and approval", () => {
    for (const field of ["objectives", "prerequisites", "sources"] as const) {
      const document = validDocument();
      delete (document.metadata as Partial<LessonMetadata>)[field];
      expect(() => validateLessonForPublication(document)).toThrow(field);
    }

    for (const field of [
      "position",
      "estimatedMinutes",
      "riskWarningRequired",
      "affiliateDisclosureRequired",
      "approved",
    ] as const) {
      const document = validDocument();
      delete (document.metadata as Partial<LessonMetadata>)[field];
      expect(() => validateLessonForPublication(document)).toThrow();
    }
  });

  it("requires independent review, valid dates, and HTTPS sources", () => {
    const selfReviewed = validDocument();
    selfReviewed.metadata.reviewer = selfReviewed.metadata.author;
    expect(() => validateLessonForPublication(selfReviewed)).toThrow(
      "author and reviewer",
    );

    const staleReview = validDocument();
    staleReview.metadata.reviewDate = "2026-08-31";
    expect(() => validateLessonForPublication(staleReview)).toThrow(
      "cannot precede",
    );

    const insecureSource = validDocument();
    insecureSource.metadata.sources = [
      { title: "Source", url: "https://example.com" },
    ];
    (insecureSource.metadata.sources[0] as { url: string }).url =
      "http://example.com";
    expect(() => validateLessonForPublication(insecureSource)).toThrow(
      "HTTPS URL",
    );
  });

  it("requires conditional disclosures and diagram alternative text", () => {
    const riskLesson = validDocument();
    riskLesson.metadata.riskWarningRequired = true;
    expect(() => validateLessonForPublication(riskLesson)).toThrow(
      "risk notice",
    );

    const affiliateLesson = validDocument();
    affiliateLesson.metadata.affiliateDisclosureRequired = true;
    expect(() => validateLessonForPublication(affiliateLesson)).toThrow(
      "affiliate disclosure",
    );

    const diagramLesson = validDocument();
    diagramLesson.blocks.push({
      type: "diagram",
      alt: "",
      height: 400,
      src: "/diagram.png",
      width: 600,
    });
    expect(() => validateLessonForPublication(diagramLesson)).toThrow(
      "alternative text",
    );
  });

  it("keeps drafts out without requiring publication-ready metadata", () => {
    const draft = validDocument();
    draft.metadata.status = "draft";
    draft.metadata.approved = false;
    draft.metadata.sources = [];
    expect(selectPublishableLessons([draft])).toEqual([]);
  });

  it("rejects duplicate published slugs and module positions", () => {
    const duplicate = structuredClone(validDocument());
    expect(() =>
      selectPublishableLessons([validDocument(), duplicate]),
    ).toThrow("Duplicate lesson slug");

    duplicate.metadata.slug = "another-lesson";
    expect(() =>
      selectPublishableLessons([validDocument(), duplicate]),
    ).toThrow("Duplicate lesson position");
  });
});
