import { describe, expect, it } from "vitest";
import {
  editorReducer,
  initialEditor,
  draftBuffer,
} from "./curriculum-editor-state";
import type { CurriculumDraftView } from "./curriculum-draft-contract";
const item: CurriculumDraftView = {
  id: "course-1",
  family: "course",
  path: "forex",
  parent: null,
  level: "level-1",
  revision: 1,
  bodySha256: "a".repeat(64),
  fields: {
    title: "Original",
    description: "Description",
    order: 1,
    lessonContextTitle: "",
    lessonQuizLabel: "",
    seoTitle: "",
    seoDescription: "",
  },
};
const identity = {
  id: item.id,
  family: item.family,
  path: item.path,
  parent: item.parent,
  level: item.level,
};
describe("connected editor state and preservation", () => {
  it("starts clean without a hidden sample-data fallback", () => {
    const s = initialEditor(null);
    expect(s.fields.title).toBe("");
    expect(s.base).toBeNull();
    expect(draftBuffer(s.fields, s.reason)).toBe(s.clean);
  });
  it.each([
    "conflict",
    "uncertain",
    "denied",
    "invalid",
    "unavailable",
  ] as const)("preserves exact entered values/reason on %s", (kind) => {
    const s = editorReducer(
        { ...initialEditor(item), reason: "My reason" },
        { type: "field", name: "title", value: "My unsaved title" },
      ),
      result = editorReducer(s, { type: "result", result: { kind }, identity });
    expect(result.fields.title).toBe("My unsaved title");
    expect(result.reason).toBe("My reason");
    expect(result.base).toEqual(item);
    expect(result.message).not.toContain("Draft saved");
    expect(result.phase).toBe(
      ["conflict", "uncertain", "denied"].includes(kind) ? kind : "idle",
    );
  });
  it("does not silently rebase when latest is fetched", () => {
    const s = {
      ...initialEditor(item),
      phase: "conflict" as const,
      fields: { ...item.fields, title: "My changes" },
    };
    const latest = {
      ...item,
      revision: 2,
      bodySha256: "b".repeat(64),
      fields: { ...item.fields, title: "Other editor" },
    };
    const loaded = editorReducer(s, {
      type: "latest",
      result: { kind: "ready", item: latest },
    });
    expect(loaded.base?.revision).toBe(1);
    expect(loaded.fields.title).toBe("My changes");
    expect(loaded.phase).toBe("conflict");
    expect(loaded.latest?.fields.title).toBe("Other editor");
    const replaced = editorReducer(loaded, { type: "use-latest" });
    expect(replaced.fields.title).toBe("Other editor");
    expect(replaced.base?.revision).toBe(2);
    expect(replaced.phase).toBe("idle");
  });
  it("blocks another save until the acknowledged draft is reloaded", () => {
    const s = {
      ...initialEditor(item),
      reason: "Edit",
      fields: { ...item.fields, title: "Changed" },
    };
    const result = editorReducer(s, {
      type: "result",
      result: {
        kind: "saved",
        id: "course-1",
        revision: 2,
        bodySha256: "b".repeat(64),
      },
      identity,
    });
    expect(result.phase).toBe("saved");
    expect(result.base?.revision).toBe(2);
    expect(result.reason).toBe("");
    expect(result.clean).toBe(draftBuffer(result.fields, ""));
  });
  it("does not unlock an uncertain write on a failed latest read", () => {
    const s = { ...initialEditor(item), phase: "uncertain" as const };
    const result = editorReducer(s, {
      type: "latest",
      result: { kind: "unavailable" },
    });
    expect(result.phase).toBe("uncertain");
    expect(result.latest).toBeNull();
  });
});
