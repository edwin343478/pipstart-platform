import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
vi.mock("@/app/admin/staff/content/lesson-actions", () => ({
  runLessonEditorAction: vi.fn(),
}));
import { StaffLessonEditor } from "./staff-lesson-editor";
import { StaffLessonPreview } from "./staff-lesson-preview";
import {
  LessonBlockFields,
  newLessonBlock,
  lessonBlockLabels,
} from "./lesson-block-fields";
import { initialLessonEditor } from "@/lib/content/lesson-editor-state";
import { LESSON_DRAFT_RISK } from "@/lib/content/lesson-create-contract";
import type {
  LessonDraftContent,
  LessonDraftView,
} from "@/lib/content/lesson-draft-contract";
const creation = { path: "forex" as const, parent: "module" };
describe("connected lesson editor presentation and safe preview", () => {
  it("labels new identity, parent, metadata, reason, layout and disclosure controls", () => {
    const html = renderToStaticMarkup(
      <StaffLessonEditor item={null} creation={creation} />,
    );
    for (const label of [
      "New lesson",
      "Permanent identity",
      "Parent module identity",
      "Order within module",
      "Estimated minutes",
      "SEO title",
      "Learning objectives",
      "Change reason",
      "Lesson layout",
      "Sources",
      "Add source",
      "At least one HTTPS source is required",
      "Save lesson draft",
      "Preview lesson",
    ])
      expect(html).toContain(label);
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('href="/admin/staff/content"');
    expect(html).toContain("Owner may need to assign");
    expect(html).toContain("Protected disclosure");
    expect(html).toContain(LESSON_DRAFT_RISK);
    expect(html).not.toContain("Confirm publish");
  });
  it("keeps server-rendered editor controls inert until hydration", () => {
    const html = renderToStaticMarkup(
      <StaffLessonEditor item={null} creation={creation} />,
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toMatch(/<fieldset disabled="">/);
    expect(html).toMatch(/<button type="submit" disabled="">/);
  });
  it("keeps existing hierarchy and source indexes off editable controls", () => {
    const s = initialLessonEditor(null),
      item: LessonDraftView = {
        id: "lesson",
        path: "forex",
        parent: "module",
        revision: 2,
        bodySha256: "a".repeat(64),
        fields: { ...s.fields, title: "<script>alert(1)</script>" },
        content: s.content,
        protectedBlockIndexes: [1],
      };
    const html = renderToStaticMarkup(
      <StaffLessonEditor item={item} creation={creation} />,
    );
    expect(html).toContain("Edit lesson");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("Choose a permanent identity");
    expect(html).not.toContain("Lesson layout");
    expect(html).not.toContain("sourceIndex");
  });
  it.each(Object.keys(lessonBlockLabels) as (keyof typeof lessonBlockLabels)[])(
    "renders structured %s controls without raw JSON",
    (type) => {
      const html = renderToStaticMarkup(
        <LessonBlockFields
          block={newLessonBlock(type, ["/approved.svg"])}
          assets={["/approved.svg"]}
          onChange={() => {}}
        />,
      );
      expect(html).toMatch(/<(label|fieldset)/);
      expect(html).not.toContain("JSON");
      expect(html).not.toContain("dangerouslySetInnerHTML");
    },
  );
  it.each(["flat", "sections"] as const)(
    "keeps %s preview readable while disabling links and progress controls",
    (mode) => {
      const fields = {
          ...initialLessonEditor(null).fields,
          title: "<script>Title</script>",
        },
        blocks = [
          {
            sourceIndex: null,
            value: {
              type: "learningLink" as const,
              title: "Tool",
              description: "Description",
              href: "/tools" as const,
            },
          },
          {
            sourceIndex: null,
            value: {
              type: "references" as const,
              items: [{ title: "Source", url: "https://example.com" as const }],
            },
          },
          {
            sourceIndex: null,
            value: {
              type: "keyPoint" as const,
              points: ["Check"],
              checklist: true,
            },
          },
        ],
        content: LessonDraftContent =
          mode === "flat"
            ? { mode, blocks }
            : {
                mode,
                sections: [{ sourceIndex: null, title: "Section", blocks }],
              };
      const html = renderToStaticMarkup(
        <StaffLessonPreview fields={fields} content={content} />,
      );
      expect(html).toContain("&lt;script&gt;");
      expect(html).not.toContain("inert=");
      expect(html).not.toMatch(/href=/);
      expect(html).toContain('disabled=""');
      expect(html).toContain("No progress");
      expect(html).not.toContain("/api/");
    },
  );
  it("refuses to render malformed or unsafe preview blocks", () => {
    const s = initialLessonEditor(null);
    const html = renderToStaticMarkup(
      <StaffLessonPreview
        fields={s.fields}
        content={{
          mode: "flat",
          blocks: [
            {
              sourceIndex: null,
              value: {
                type: "learningLink",
                title: "Unsafe",
                description: "Text",
                href: "javascript:alert(1)" as never,
              },
            },
          ],
        }}
      />,
    );
    expect(html).toContain("Complete the block fields");
    expect(html).not.toContain("javascript:");
  });
  it("exposes worked practice answers in passive preview without assessment mutation", () => {
    const s = initialLessonEditor(null);
    const html = renderToStaticMarkup(
      <StaffLessonPreview
        fields={s.fields}
        content={{
          mode: "flat",
          blocks: [
            {
              sourceIndex: null,
              value: {
                type: "practice",
                title: "Practice",
                prompts: ["Question"],
                answers: ["Worked solution"],
              },
            },
          ],
        }}
      />,
    );
    expect(html).toContain("Worked solution");
    expect(html).toMatch(/<details[^>]*open/);
    expect(html).not.toContain("Submit attempt");
  });
});
