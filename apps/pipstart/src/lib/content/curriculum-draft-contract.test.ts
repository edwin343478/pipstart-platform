import { describe, expect, it } from "vitest";
import {
  validDraftFields,
  validDraftInput,
  mergeDraftFields,
  type CurriculumDraftFields,
} from "./curriculum-draft-contract";
export const fields: CurriculumDraftFields = {
  title: "Course title",
  description: "Course description",
  order: 2,
  lessonContextTitle: "Context",
  lessonQuizLabel: "Quiz",
  seoTitle: "Search title",
  seoDescription: "Search description",
};
describe("MP06b1 exact course/module draft contract", () => {
  it("accepts only explicit load/create/save commands", () => {
    expect(validDraftInput({ kind: "load", id: "course-1" })).toBe(true);
    expect(
      validDraftInput({
        kind: "create",
        id: "new-course",
        family: "course",
        path: "forex",
        parent: null,
        level: "level-10",
        fields,
        reason: "Create",
      }),
    ).toBe(true);
    expect(
      validDraftInput({
        kind: "create",
        id: "new-module",
        family: "module",
        path: "crypto",
        parent: "course-1",
        level: null,
        fields,
        reason: "Create",
      }),
    ).toBe(true);
    expect(
      validDraftInput({
        kind: "save",
        id: "course-1",
        baseRevision: 3,
        baseSha256: "a".repeat(64),
        fields,
        reason: "Edit",
      }),
    ).toBe(true);
  });
  it.each([
    "quiz",
    "../course",
    "course/id",
    "Course",
    "bad id",
    "x".repeat(101),
  ])("refuses ambiguous/new permanent IDs %s", (id) =>
    expect(validDraftInput({ kind: "load", id })).toBe(false),
  );
  it.each([
    null,
    {},
    { ...fields, body: {} },
    { ...fields, title: " " },
    { ...fields, title: "x".repeat(201) },
    { ...fields, description: "" },
    { ...fields, order: 0 },
    { ...fields, order: 1.5 },
    { ...fields, order: 10001 },
    { ...fields, seoDescription: "x".repeat(301) },
    { ...fields, title: "a\nb" },
  ])("refuses malformed/overbroad draft fields %#", (v) =>
    expect(validDraftFields(v)).toBe(false),
  );
  it("refuses caller actor/body/status/identity changes and wrong base/hash", () => {
    const command = {
      kind: "save",
      id: "course-1",
      baseRevision: 1,
      baseSha256: "a".repeat(64),
      fields,
      reason: "Edit",
    };
    for (const v of [
      { ...command, actor: "owner" },
      { ...command, body: {} },
      { ...command, status: "approved" },
      { ...command, parent: "other" },
      { ...command, baseRevision: 0 },
      { ...command, baseSha256: "bad" },
      { ...command, reason: "" },
    ])
      expect(validDraftInput(v)).toBe(false);
    expect(
      validDraftInput({
        kind: "create",
        id: "course-1",
        family: "course",
        path: "forex",
        parent: null,
        level: "level-11",
        fields,
        reason: "Create",
      }),
    ).toBe(false);
  });
  it("preserves every unedited nested metadata/placement/presentation field without mutating the original", () => {
    const body = {
      opaque: { keep: true },
      metadata: {
        title: "Old",
        description: "Old",
        level: "level-3",
        status: "published",
        disclosure: { required: true },
        placement: {
          order: 1,
          assessmentRequirements: [{ assessmentId: "quiz-1" }],
        },
        presentation: {
          future: { keep: true },
          seo: { title: "Old", description: "Old", future: "keep" },
        },
      },
    };
    const before = structuredClone(body),
      merged = mergeDraftFields(body, fields)!;
    expect(body).toEqual(before);
    expect(merged).toMatchObject({
      opaque: body.opaque,
      metadata: {
        title: fields.title,
        level: "level-3",
        status: "published",
        disclosure: body.metadata.disclosure,
        placement: {
          order: 2,
          assessmentRequirements:
            body.metadata.placement.assessmentRequirements,
        },
        presentation: {
          future: { keep: true },
          seo: { title: fields.seoTitle, future: "keep" },
        },
      },
    });
  });
  it("clears only blank controlled presentation fields, preserving unknown sibling fields", () => {
    const result = mergeDraftFields(
      {
        metadata: {
          title: "Old",
          placement: { order: 1 },
          presentation: {
            lessonContextTitle: "Old",
            lessonQuizLabel: "Old",
            seo: { title: "Old", description: "Old", future: "keep" },
            future: "keep",
          },
        },
      },
      {
        ...fields,
        lessonContextTitle: "",
        lessonQuizLabel: "",
        seoTitle: "",
        seoDescription: "",
      },
    )!;
    expect(result.metadata.presentation).toEqual({
      seo: { future: "keep" },
      future: "keep",
    });
  });
  it("refuses opaque malformed containers rather than replacing and destroying them", () => {
    for (const metadata of [
      { title: "Old", placement: [] },
      { title: "Old", presentation: "unknown" },
      { title: "Old", presentation: { seo: [] } },
    ])
      expect(mergeDraftFields({ metadata }, fields)).toBeNull();
  });
});
