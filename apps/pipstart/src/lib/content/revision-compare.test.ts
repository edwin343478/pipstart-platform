import { describe, it, expect } from "vitest";
import { compareRevisionBodies, MAX_COMPARED_LINES } from "./revision-compare";
const lesson = (blocks: unknown[], extra: Record<string, unknown> = {}) => ({
  opaque: "PRIVATE_BODY_FIELD",
  metadata: {
    title: "Lesson",
    description: "Description",
    estimatedMinutes: 5,
    objectives: ["Understand"],
    seoTitle: "Search",
    seoDescription: "Description",
    riskWarningRequired: true,
    affiliateDisclosureRequired: false,
    reviewer: "PRIVATE_REVIEWER",
    ...extra,
  },
  blocks,
});
const p = (children: string, more: Record<string, unknown> = {}) => ({
  type: "paragraph",
  children,
  ...more,
});
const curriculum = (metadata: Record<string, unknown> = {}) => ({
  metadata: {
    title: "Module",
    description: "About",
    placement: { order: 1, assessmentRequirements: ["PRIVATE_KEEP"] },
    presentation: { seo: { title: "SEO" } },
    ...metadata,
  },
});
describe("revision comparison through editable projections", () => {
  it("reports changed lesson fields and only the added or removed content", () => {
    const c = compareRevisionBodies(
      "lesson",
      lesson([p("One"), p("Two"), { type: "riskNotice", children: "Risk" }]),
      lesson(
        [
          p("One"),
          p("Two, edited"),
          { type: "riskNotice", children: "Risk" },
          p("Three"),
        ],
        { title: "Lesson v2", objectives: ["Understand", "Apply"] },
      ),
    );
    expect(c?.fields).toEqual([
      { label: "Title", before: "Lesson", after: "Lesson v2" },
      { label: "Learning objective 2", before: "", after: "Apply" },
    ]);
    expect(c?.lines).toEqual([
      { op: "removed", position: 2, label: "Paragraph", text: "Two" },
      { op: "added", position: 2, label: "Paragraph", text: "Two, edited" },
      { op: "added", position: 4, label: "Paragraph", text: "Three" },
    ]);
    expect(c?.unchangedLines).toBe(2);
    expect(c?.truncated).toBe(false);
  });
  it("never exposes fields outside the editable projection", () => {
    const c = compareRevisionBodies(
      "lesson",
      lesson([p("One", { opaque: "PRIVATE_BLOCK" })]),
      lesson([p("One", { opaque: "PRIVATE_BLOCK_CHANGED" })], {
        reviewer: "PRIVATE_REVIEWER_CHANGED",
      }),
    );
    expect(c).toEqual({
      fields: [],
      lines: [],
      unchangedLines: 1,
      truncated: false,
    });
    expect(JSON.stringify(c)).not.toContain("PRIVATE");
  });
  it("shows section titles and layout changes in order", () => {
    const flat = lesson([p("One"), p("Two")]);
    const sectioned = {
      ...lesson([p("One"), p("Two")]),
      sections: [
        { title: "Start", shortTitle: "S", blocks: [p("One")] },
        { title: "End", blocks: [p("Two")] },
      ],
    };
    const c = compareRevisionBodies("lesson", flat, sectioned);
    expect(c?.fields).toEqual([
      { label: "Lesson layout", before: "Flat", after: "Sections" },
    ]);
    expect(c?.lines).toEqual([
      { op: "added", position: 1, label: "Section", text: "Start · S" },
      { op: "added", position: 3, label: "Section", text: "End" },
    ]);
  });
  it("summarises structured blocks readably", () => {
    const c = compareRevisionBodies(
      "lesson",
      lesson([p("Base")]),
      lesson([
        p("Base"),
        {
          type: "keyPoint",
          title: "Check",
          points: ["A", "B"],
          checklist: true,
        },
        {
          type: "references",
          items: [{ title: "Source", url: "https://example.com" }],
        },
      ]),
    );
    expect(c?.lines.map((l) => [l.label, l.text])).toEqual([
      ["Key point", "Check · A · B · checklist: yes"],
      ["References", "Source · https://example.com"],
    ]);
  });
  it("compares course and module fields, including the course level", () => {
    expect(
      compareRevisionBodies(
        "module",
        curriculum(),
        curriculum({
          description: "About, edited",
          placement: { order: 2 },
          presentation: { lessonQuizLabel: "Quiz" },
        }),
      )?.fields,
    ).toEqual([
      { label: "Description", before: "About", after: "About, edited" },
      { label: "Order", before: "1", after: "2" },
      { label: "Quiz link label", before: "", after: "Quiz" },
      { label: "SEO title", before: "SEO", after: "" },
    ]);
    expect(
      compareRevisionBodies(
        "course",
        curriculum({ level: "level-1" }),
        curriculum({ level: "level-2" }),
      )?.fields,
    ).toEqual([{ label: "Level", before: "level-1", after: "level-2" }]);
  });
  it("lists added, removed and changed lesson sources", () => {
    const c = compareRevisionBodies(
      "lesson",
      lesson([p("One")], {
        sources: [{ title: "A", url: "https://a.example" }],
      }),
      lesson([p("One")], {
        sources: [
          { title: "A2", url: "https://a.example" },
          { title: "B", url: "https://b.example" },
        ],
      }),
    );
    expect(c?.fields).toEqual([
      {
        label: "Source 1",
        before: "A · https://a.example",
        after: "A2 · https://a.example",
      },
      { label: "Source 2", before: "", after: "B · https://b.example" },
    ]);
  });
  it("names numbers inside blocks", () => {
    const c = compareRevisionBodies(
      "lesson",
      lesson([p("Base")]),
      lesson([p("Base"), { type: "heading", level: 3, children: "Next" }]),
    );
    expect(c?.lines).toEqual([
      { op: "added", position: 2, label: "Heading", text: "level: 3 · Next" },
    ]);
  });
  it("refuses bodies that do not fit the family projection", () => {
    expect(
      compareRevisionBodies("lesson", lesson([p("One")]), { metadata: {} }),
    ).toBeNull();
    expect(
      compareRevisionBodies("lesson", lesson([{ type: "script" }]), lesson([])),
    ).toBeNull();
    expect(
      compareRevisionBodies("module", curriculum(), {
        metadata: { title: "M" },
      }),
    ).toBeNull();
    expect(
      compareRevisionBodies(
        "course",
        curriculum(),
        curriculum({ level: "level-1" }),
      ),
    ).toBeNull();
    expect(compareRevisionBodies("module", null, curriculum())).toBeNull();
  });
  it("bounds long texts and the number of reported lines", () => {
    const long = "x".repeat(1500);
    const c = compareRevisionBodies(
      "lesson",
      lesson([p("Base")]),
      lesson([
        p("Base"),
        ...Array.from({ length: 320 }, (_, i) =>
          p(i === 0 ? long : "Line " + i),
        ),
      ]),
    );
    expect(c?.lines).toHaveLength(MAX_COMPARED_LINES);
    expect(c?.truncated).toBe(true);
    expect([...(c?.lines[0].text ?? "")]).toHaveLength(1001);
  });
});
