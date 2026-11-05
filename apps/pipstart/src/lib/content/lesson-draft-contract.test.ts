import { describe, it, expect } from "vitest";
import { lessonBlockTypes } from "./contract";
import { buildImportManifest } from "./import/manifest";
import {
  lessonBlockSchema,
  lessonDraftInputSchema,
  mergeLessonDraft,
  projectLessonBody,
} from "./lesson-draft-contract";
const body = () => ({
  opaque: "PRIVATE",
  metadata: {
    title: "Lesson",
    description: "Description",
    estimatedMinutes: 5,
    objectives: ["Understand"],
    seoTitle: "Search",
    seoDescription: "Description",
    slug: "permanent",
    riskWarningRequired: true,
    affiliateDisclosureRequired: true,
    approved: true,
    author: "Original",
    reviewer: "Reviewer",
    publishedDate: "2020-01-01",
    reviewDate: "2020-01-02",
    placement: { assessmentRequirements: ["keep"] },
  },
  blocks: [
    { type: "paragraph", children: "One", opaque: "BLOCK_PRIVATE" },
    { type: "riskNotice", children: "Risk" },
    { type: "affiliateDisclosure", children: "Affiliate" },
  ],
});
const fixtures = [
  { type: "heading", children: "Heading" },
  { type: "paragraph", children: "Text" },
  { type: "learningLink", title: "Tool", description: "Tool", href: "/tools" },
  { type: "section", title: "Section", paragraphs: ["Text"] },
  {
    type: "references",
    items: [{ title: "Source", url: "https://example.com" }],
  },
  { type: "riskStatement", children: "Risk" },
  { type: "list", items: ["Item"] },
  { type: "quote", children: "Quote" },
  { type: "reflection", title: "Reflect", points: ["Point"] },
  { type: "takeaway", children: ["Takeaway"] },
  { type: "definition", term: "Term", children: "Definition" },
  { type: "example", children: "Example" },
  { type: "warning", children: "Warning" },
  { type: "keyPoint", points: ["Point"] },
  { type: "formula", expression: "a+b", explanation: "Sum" },
  { type: "exercise", prompt: "Try" },
  { type: "practice", title: "Practice", prompts: ["Q"], answers: ["A"] },
  {
    type: "diagram",
    src: "/lessons/forex/chart.svg",
    alt: "Chart",
    width: 100,
    height: 100,
  },
  { type: "comparisonTable", columns: ["A", "B"], rows: [["1", "2"]] },
  { type: "riskNotice", children: "Risk" },
  { type: "affiliateDisclosure", children: "Disclosure" },
  { type: "quizPreview", title: "Quiz", questionCount: 3 },
];
describe("MP06c1 supported lesson drafts", () => {
  it.each(fixtures)("supports $type with exact keys", (v) => {
    expect(lessonBlockSchema.safeParse(v).success).toBe(true);
    expect(
      lessonBlockSchema.safeParse({ ...v, rawHtml: "unsafe" }).success,
    ).toBe(false);
  });
  it("covers the entire accepted block union", () =>
    expect(fixtures.map((v) => v.type)).toEqual([...lessonBlockTypes]));
  it("projects and round-trips every imported lesson without changes", async () => {
    const lessons = (await buildImportManifest()).filter(
      (v) => v.family === "lesson",
    );
    expect(lessons.length).toBeGreaterThan(50);
    for (const item of lessons) {
      const view = projectLessonBody(item.body);
      expect(view, "projection " + item.id).not.toBeNull();
      expect(
        mergeLessonDraft(item.body, view!.fields, view!.content),
        "round trip " + item.id,
      ).toEqual(item.body);
    }
  });
  it("keeps identity, references, approval, dates, placement and opaque data server-side", () => {
    const original = body(),
      v = projectLessonBody(original)!;
    expect(JSON.stringify(v)).not.toContain("PRIVATE");
    expect(JSON.stringify(v)).not.toContain("permanent");
    const next = mergeLessonDraft(
      original,
      { ...v.fields, title: "New" },
      v.content,
    )!;
    expect(next).toEqual({
      ...original,
      metadata: { ...original.metadata, title: "New" },
    });
    expect(original.metadata.title).toBe("Lesson");
  });
  it("moves blocks with their original opaque data and supports new plain text", () => {
    const original = body(),
      v = projectLessonBody(original)!;
    if (v.content.mode !== "flat") throw Error();
    const next = mergeLessonDraft(original, v.fields, {
      mode: "flat",
      blocks: [
        v.content.blocks[1],
        { sourceIndex: null, value: { type: "heading", children: "New" } },
        v.content.blocks[0],
        v.content.blocks[2],
      ],
    })!;
    expect((next.blocks as Record<string, unknown>[])[2].opaque).toBe(
      "BLOCK_PRIVATE",
    );
  });
  it("rejects duplicate, absent, negative or mismatched source indexes", () => {
    const original = body(),
      v = projectLessonBody(original)!;
    if (v.content.mode !== "flat") throw Error();
    for (const entry of [
      { sourceIndex: 0, value: { type: "heading", children: "Different" } },
      { sourceIndex: 499, value: { type: "paragraph", children: "Bad" } },
      { sourceIndex: -1, value: { type: "paragraph", children: "Bad" } },
      v.content.blocks[0],
    ])
      expect(
        mergeLessonDraft(original, v.fields, {
          mode: "flat",
          blocks: [...v.content.blocks, entry],
        } as typeof v.content),
      ).toBeNull();
  });
  it("refuses changes or removal of existing disclosure blocks", () => {
    const original = body(),
      v = projectLessonBody(original)!;
    if (v.content.mode !== "flat") throw Error();
    expect(
      mergeLessonDraft(original, v.fields, {
        mode: "flat",
        blocks: v.content.blocks.slice(0, 2),
      }),
    ).toBeNull();
    v.content.blocks[1].value = { type: "riskNotice", children: "Weakened" };
    expect(mergeLessonDraft(original, v.fields, v.content)).toBeNull();
  });
  it("requires missing mandatory disclosures before saving", () => {
    const original = body();
    original.blocks = original.blocks.slice(0, 1);
    const v = projectLessonBody(original)!;
    expect(mergeLessonDraft(original, v.fields, v.content)).toBeNull();
  });
  it("preserves section extensions and regenerates the flat blocks exactly", () => {
    const original = {
      ...body(),
      sections: [
        {
          title: "First",
          shortTitle: "Short",
          opaque: "SECTION_PRIVATE",
          blocks: body().blocks,
        },
      ],
    };
    const v = projectLessonBody(original)!;
    if (v.content.mode !== "sections") throw Error();
    v.content.sections[0].title = "Renamed";
    delete v.content.sections[0].shortTitle;
    const next = mergeLessonDraft(original, v.fields, v.content)!;
    expect(next.sections).toEqual([
      { title: "Renamed", opaque: "SECTION_PRIVATE", blocks: original.blocks },
    ]);
    expect(next.blocks).toEqual(original.blocks);
    expect(JSON.stringify(v)).not.toContain("SECTION_PRIVATE");
  });
  it("refuses section flattening drift or silent conversion", () => {
    const original = {
      ...body(),
      sections: [{ title: "First", blocks: body().blocks.slice(1) }],
    };
    expect(projectLessonBody(original)).toBeNull();
    const v = projectLessonBody(body())!;
    expect(
      mergeLessonDraft(body(), v.fields, {
        mode: "sections",
        sections: [
          {
            sourceIndex: null,
            title: "First",
            blocks: v.content.mode === "flat" ? v.content.blocks : [],
          },
        ],
      }),
    ).toBeNull();
  });
  it.each([
    "javascript:alert(1)",
    "http://example.com",
    "https://user:secret@example.com",
    "https://example.com\n",
  ])("rejects unsafe source URL %s", (url) =>
    expect(
      lessonBlockSchema.safeParse({
        type: "references",
        items: [{ title: "Source", url }],
      }).success,
    ).toBe(false),
  );
  it.each([
    "//evil.com/a.svg",
    "/a/../secret.svg",
    "/a.svg?bad",
    "/a.svg#bad",
    "/a\\b.svg",
    "https://example.com/a.svg",
  ])("rejects unsafe diagram path %s", (src) =>
    expect(lessonBlockSchema.safeParse({ ...fixtures[17], src }).success).toBe(
      false,
    ),
  );
  it("allows safe alt text edits but refuses unregistered diagram assets", () => {
    const original = { ...body(), blocks: [...body().blocks, fixtures[17]] };
    const v = projectLessonBody(original)!;
    if (v.content.mode !== "flat") throw Error();
    const diagram = v.content.blocks[3].value;
    if (diagram.type !== "diagram") throw Error();
    diagram.alt = "Accessible description";
    expect(mergeLessonDraft(original, v.fields, v.content)).not.toBeNull();
    diagram.src = "/other.svg";
    expect(mergeLessonDraft(original, v.fields, v.content)).toBeNull();
  });
  it("rejects mismatched practice pairs, tables and invalid heading levels", () => {
    for (const b of [
      { ...fixtures[16], answers: ["1", "2"] },
      { ...fixtures[18], rows: [["1"]] },
      { ...fixtures[18], columns: ["Same", " Same "] },
      { ...fixtures[0], level: 1 },
    ])
      expect(lessonBlockSchema.safeParse(b).success).toBe(false);
  });
  it("rejects overbroad metadata, coercion and excessive block counts", () => {
    const v = projectLessonBody(body())!,
      command = {
        kind: "save",
        id: "lesson",
        baseRevision: 1,
        baseSha256: "a".repeat(64),
        fields: v.fields,
        content: v.content,
        reason: "Edit",
      };
    expect(lessonDraftInputSchema.safeParse(command).success).toBe(true);
    for (const c of [
      { ...command, actor: "fake" },
      { ...command, fields: { ...v.fields, approved: true } },
      { ...command, baseRevision: "1" },
      {
        ...command,
        content: {
          mode: "flat",
          blocks: Array(501).fill({ sourceIndex: null, value: fixtures[0] }),
        },
      },
    ])
      expect(lessonDraftInputSchema.safeParse(c).success).toBe(false);
  });
  it("refuses malformed/unknown blocks and bodies over the store byte limit", () => {
    expect(
      projectLessonBody({
        ...body(),
        blocks: [{ type: "future", children: "Text" }],
      }),
    ).toBeNull();
    const original = { ...body(), huge: "a".repeat(262144) },
      v = projectLessonBody(original)!;
    expect(mergeLessonDraft(original, v.fields, v.content)).toBeNull();
  });
});
describe("MP06d2a lesson sources", () => {
  const src = {
    title: "CFTC advisory",
    url: "https://www.cftc.gov/advisory" as const,
  };
  const withSources = (sources: unknown) => {
    const b = body();
    (b.metadata as Record<string, unknown>).sources = sources;
    return b;
  };
  it("projects existing sources and reads a missing list as empty", () => {
    expect(projectLessonBody(withSources([src]))?.fields.sources).toEqual([
      src,
    ]);
    expect(projectLessonBody(body())?.fields.sources).toEqual([]);
  });
  it("refuses sources outside the HTTPS citation shape", () => {
    for (const bad of [
      [{ title: "Plain", url: "http://example.com" }],
      [{ title: "", url: "https://example.com" }],
      [{ ...src, publisher: "extra" }],
      [{ title: "x".repeat(201), url: "https://example.com" }],
      Array.from({ length: 51 }, () => src),
      "https://example.com",
    ])
      expect(projectLessonBody(withSources(bad))).toBeNull();
  });
  it("saves edited sources and never adds an empty list to a body without one", () => {
    const view = projectLessonBody(withSources([src]))!;
    const merged = mergeLessonDraft(
      withSources([src]),
      {
        ...view.fields,
        sources: [
          src,
          { title: "Second", url: "https://example.org/b" as const },
        ],
      },
      view.content,
    );
    expect((merged?.metadata as Record<string, unknown>).sources).toEqual([
      src,
      { title: "Second", url: "https://example.org/b" },
    ]);
    const plain = projectLessonBody(body())!;
    const untouched = mergeLessonDraft(body(), plain.fields, plain.content);
    expect(Object.hasOwn(untouched?.metadata as object, "sources")).toBe(false);
    const cleared = mergeLessonDraft(
      withSources([src]),
      { ...view.fields, sources: [] },
      view.content,
    );
    expect((cleared?.metadata as Record<string, unknown>).sources).toEqual([]);
  });
});
