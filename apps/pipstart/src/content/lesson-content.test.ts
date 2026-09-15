import { describe, expect, it } from "vitest";

import type {
  LessonBlock,
  LessonDocument,
  LessonMetadata,
} from "./lesson-content";
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

    const impossibleDate = validDocument();
    impossibleDate.metadata.reviewDate = "2026-02-31";
    expect(() => validateLessonForPublication(impossibleDate)).toThrow(
      "reviewDate is invalid",
    );

    const futureDate = validDocument();
    futureDate.metadata.publishedDate = "2999-01-01";
    futureDate.metadata.reviewDate = "2999-01-01";
    expect(() => validateLessonForPublication(futureDate)).toThrow(
      "cannot be in the future",
    );

    const malformedHttpsSource = validDocument();
    (malformedHttpsSource.metadata.sources[0] as { url: string }).url =
      "https://";
    expect(() => validateLessonForPublication(malformedHttpsSource)).toThrow(
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

  it.each<[string, LessonBlock, string]>([
    [
      "definition",
      { type: "definition", term: "", children: "" },
      "definition",
    ],
    ["example", { type: "example", children: "" }, "example content"],
    [
      "warning",
      { type: "warning", title: "", children: "Warning" },
      "warning title",
    ],
    ["key point", { type: "keyPoint", points: [] }, "key point"],
    [
      "formula",
      { type: "formula", expression: "", explanation: "" },
      "formula",
    ],
    ["exercise", { type: "exercise", prompt: "" }, "exercise prompt"],
    [
      "diagram",
      {
        type: "diagram",
        alt: "Diagram",
        height: 0,
        src: "//remote.example/image.png",
        width: -1,
      },
      "diagram",
    ],
    [
      "comparison table",
      {
        type: "comparisonTable",
        caption: "",
        columns: ["Same", "Same"],
        rows: [["value"]],
      },
      "comparison table",
    ],
    [
      "risk notice",
      { type: "riskNotice", children: "" },
      "risk notice content",
    ],
    [
      "affiliate disclosure",
      { type: "affiliateDisclosure", children: "" },
      "affiliate disclosure content",
    ],
    [
      "quiz preview",
      { type: "quizPreview", title: "", questionCount: 0 },
      "quiz preview",
    ],
  ])("rejects invalid %s blocks", (_name, block, message) => {
    const document = validDocument();
    document.blocks = [block];
    expect(() => validateLessonForPublication(document)).toThrow(message);
  });

  it("rejects unknown blocks defensively", () => {
    const document = validDocument();
    document.blocks = [{ type: "unsupported" } as unknown as LessonBlock];
    expect(() => validateLessonForPublication(document)).toThrow(
      "unknown lesson block",
    );
  });

  it("validates published lesson and glossary relationships", () => {
    const first = validDocument();
    first.metadata.slug = "first";
    first.metadata.relatedLessonIds = ["second"];
    first.metadata.relatedTermSlugs = ["pip"];

    const second = validDocument();
    second.metadata.slug = "second";
    second.metadata.position = 2;
    second.metadata.relatedLessonIds = ["first"];

    expect(() =>
      selectPublishableLessons([first, second], {
        validTermSlugs: ["pip"],
      }),
    ).not.toThrow();

    first.metadata.relatedLessonIds = ["missing"];
    expect(() => selectPublishableLessons([first, second])).toThrow(
      "missing related lesson",
    );

    first.metadata.relatedLessonIds = ["first"];
    expect(() => selectPublishableLessons([first, second])).toThrow(
      "cannot reference itself",
    );

    first.metadata.relatedLessonIds = ["second"];
    second.metadata.status = "draft";
    second.metadata.approved = false;
    expect(() => selectPublishableLessons([first, second])).toThrow(
      "unpublished related lesson",
    );

    first.metadata.relatedLessonIds = [];
    first.metadata.relatedTermSlugs = ["unknown-term"];
    expect(() =>
      selectPublishableLessons([first], { validTermSlugs: ["pip"] }),
    ).toThrow("missing glossary term");
  });

  it("validates prerequisite relationships", () => {
    const lesson = validDocument();
    lesson.metadata.prerequisites = ["missing"];
    expect(() => selectPublishableLessons([lesson])).toThrow(
      "missing prerequisite",
    );
  });
});
