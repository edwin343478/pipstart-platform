import { describe, it, expect } from "vitest";
import {
  LESSON_DRAFT_RISK,
  newLessonBody,
  parseLessonCreation,
} from "./lesson-create-contract";
import { initialLessonEditor } from "./lesson-editor-state";
import { projectLessonBody } from "./lesson-draft-contract";
function command() {
  const s = initialLessonEditor(null);
  return {
    kind: "create",
    id: "new-lesson",
    path: "forex",
    parent: "module",
    order: 2,
    fields: {
      ...s.fields,
      title: "Lesson",
      description: "Description",
      objectives: ["Understand"],
      seoTitle: "Lesson",
      seoDescription: "Description",
    },
    content: {
      mode: "flat",
      blocks: [
        { sourceIndex: null, value: { type: "paragraph", children: "Text" } },
        {
          sourceIndex: null,
          value: { type: "riskNotice", children: LESSON_DRAFT_RISK },
        },
      ],
    },
    reason: "Create lesson",
  };
}
describe("lesson creation contract", () => {
  it("creates an unapproved draft with fixed hierarchy and no fabricated publication or review", () => {
    const c = parseLessonCreation(command())!;
    expect(c).not.toBeNull();
    const body = newLessonBody(c, "course", "level-1")!;
    expect(body.metadata).toMatchObject({
      slug: "new-lesson",
      module: "module",
      course: "course",
      level: "level-1",
      position: 2,
      placement: { order: 2 },
      status: "draft",
      approved: false,
      publishedDate: "",
      reviewDate: "",
      sources: [],
      riskWarningRequired: true,
    });
    expect(projectLessonBody(body)).not.toBeNull();
  });
  it.each([
    { actor: "spoof" },
    { approved: true },
    { order: 0 },
    { order: "2" },
    { id: "../bad" },
    { path: "other" },
    { reason: " bad " },
    { parent: "bad/path" },
  ])("refuses malformed/overbroad creation %#", (change) =>
    expect(parseLessonCreation({ ...command(), ...change })).toBeNull(),
  );
  it("refuses old source indexes and arbitrary diagram assets", () => {
    const c = command();
    c.content.blocks[0].sourceIndex = 0 as never;
    expect(parseLessonCreation(c)).toBeNull();
    expect(
      parseLessonCreation({
        ...command(),
        content: {
          mode: "flat",
          blocks: [
            {
              sourceIndex: null,
              value: {
                type: "diagram",
                src: "/new.svg",
                alt: "Diagram",
                width: 1,
                height: 1,
              },
            },
            command().content.blocks[1],
          ],
        },
      }),
    ).toBeNull();
  });
  it("requires the fixed creation risk notice", () => {
    const c = command();
    c.content.blocks.pop();
    expect(parseLessonCreation(c)).toBeNull();
  });
  it("accepts named sections and derives exact matching flattened blocks", () => {
    const c = command(),
      parsed = parseLessonCreation({
        ...c,
        content: {
          mode: "sections",
          sections: [
            { sourceIndex: null, title: "First", blocks: c.content.blocks },
          ],
        },
      })!;
    const body = newLessonBody(parsed, "course", "level-1")!;
    expect(body.blocks).toEqual(body.sections![0].blocks);
    expect(projectLessonBody(body)).not.toBeNull();
  });
  it("snapshots caller input", () => {
    const c = command(),
      parsed = parseLessonCreation(c)!;
    c.fields.title = "Changed";
    expect(parsed.fields.title).toBe("Lesson");
  });
});
