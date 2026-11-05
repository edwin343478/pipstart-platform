import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/app/admin/staff/content/draft-actions", () => ({
  runCurriculumDraftAction: vi.fn(),
}));
import { StaffCurriculumEditor } from "./staff-curriculum-editor";
import type { CurriculumDraftView } from "@/lib/content/curriculum-draft-contract";
const creation = {
  family: "course" as const,
  path: "forex" as const,
  parent: "",
  level: "level-1",
};
describe("connected curriculum editor presentation", () => {
  it("keeps server-rendered editor controls inert until hydration", () => {
    const html = renderToStaticMarkup(
      <StaffCurriculumEditor item={null} creation={creation} />,
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toMatch(/<fieldset disabled="">/);
    expect(html).toMatch(/<button type="submit" disabled="">/);
  });
  it("labels the complete draft contract with native bounded controls and no publication action", () => {
    const html = renderToStaticMarkup(
      <StaffCurriculumEditor item={null} creation={creation} />,
    );
    for (const label of [
      "Permanent identity",
      "Learning path",
      "Level",
      "Title",
      "Description",
      "Order within parent",
      "Lesson context label",
      "Lesson quiz label",
      "SEO title",
      "SEO description",
      "Change reason",
      "Save draft",
    ])
      expect(html).toContain(label);
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('type="number"');
    expect(html).toContain('max="10000"');
    expect(html).not.toContain("Confirm publish");
    expect(html).not.toContain("PRIVATE");
  });
  it("uses a plain document-navigation return link for native leave protection", () => {
    const html = renderToStaticMarkup(
      <StaffCurriculumEditor item={null} creation={creation} />,
    );
    expect(html).toContain('href="/admin/staff/content"');
    expect(html).toContain("New course");
  });
  it("keeps existing identity/path/parent immutable and safely escapes edited text", () => {
    const item: CurriculumDraftView = {
      id: "course-1",
      family: "course",
      path: "forex",
      parent: null,
      level: "level-1",
      revision: 3,
      bodySha256: "a".repeat(64),
      fields: {
        title: "<script>title</script>",
        description: "Text",
        order: 1,
        lessonContextTitle: "",
        lessonQuizLabel: "",
        seoTitle: "",
        seoDescription: "",
      },
    };
    const html = renderToStaticMarkup(
      <StaffCurriculumEditor item={item} creation={creation} />,
    );
    expect(html).toContain("Edit course");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain('name="content-id"');
    expect(html).toContain("Add module to this course");
    expect(html).toContain("Base revision");
    expect(html).toContain("Load latest for comparison");
  });
  it("explains current parent authorization and no implicit assignment on module creation", () => {
    const html = renderToStaticMarkup(
      <StaffCurriculumEditor
        item={null}
        creation={{ ...creation, family: "module", parent: "course-1" }}
      />,
    );
    expect(html).toContain("Parent course identity");
    expect(html).toContain("Owner may need to assign");
    expect(html).not.toContain(">Level<select");
  });
});
