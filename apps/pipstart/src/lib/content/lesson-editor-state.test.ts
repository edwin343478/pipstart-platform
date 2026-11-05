import { describe, it, expect } from "vitest";
import {
  initialLessonEditor,
  lessonEditorReducer,
  lessonBuffer,
} from "./lesson-editor-state";
const identity = { id: "lesson", path: "forex" as const, parent: "module" };
describe("lesson editor recovery state", () => {
  it.each([
    "invalid",
    "unavailable",
    "conflict",
    "uncertain",
    "denied",
  ] as const)("preserves entered fields and blocks after %s", (kind) => {
    const s = initialLessonEditor(null);
    s.fields.title = "Entered";
    s.reason = "Reason";
    const next = lessonEditorReducer(s, {
      type: "result",
      result: { kind },
      identity,
    });
    expect(next.fields).toEqual(s.fields);
    expect(next.content).toEqual(s.content);
    expect(next.reason).toBe("Reason");
    expect(next.phase).toBe(
      ["invalid", "unavailable"].includes(kind) ? "idle" : kind,
    );
  });
  it("blocks edits and repeat saves after uncertainty or acknowledgement", () => {
    for (const result of [
      { kind: "uncertain" as const },
      {
        kind: "saved" as const,
        id: "lesson",
        revision: 1,
        bodySha256: "b".repeat(64),
      },
    ]) {
      const s = lessonEditorReducer(initialLessonEditor(null), {
        type: "result",
        result,
        identity,
      });
      expect(lessonEditorReducer(s, { type: "busy" })).toBe(s);
      expect(
        lessonEditorReducer(s, { type: "edit", buffer: { reason: "Again" } }),
      ).toBe(s);
    }
  });
  it("never treats unexpected ready as a successful write", () =>
    expect(
      lessonEditorReducer(initialLessonEditor(null), {
        type: "result",
        result: { kind: "ready", item: null as never },
        identity,
      }).phase,
    ).toBe("uncertain"));
  it("loads latest without replacing work, and resets only after explicit adoption", () => {
    const s = initialLessonEditor(null);
    s.fields.title = "Entered";
    const item = {
      ...identity,
      revision: 5,
      bodySha256: "a".repeat(64),
      fields: { ...s.fields, title: "Latest" },
      content: s.content,
      protectedBlockIndexes: [1],
    };
    const next = lessonEditorReducer(s, {
      type: "latest",
      result: { kind: "ready", item },
    });
    expect(next.fields.title).toBe("Entered");
    expect(lessonEditorReducer(next, { type: "use-latest" }).fields.title).toBe(
      "Latest",
    );
    expect(lessonEditorReducer(next, { type: "use-latest" }).phase).toBe(
      "idle",
    );
  });
  it("a failed latest read does not clear conflict or uncertainty", () => {
    for (const phase of ["conflict", "uncertain"] as const) {
      const s = { ...initialLessonEditor(null), phase };
      expect(
        lessonEditorReducer(s, {
          type: "latest",
          result: { kind: "unavailable" },
        }).phase,
      ).toBe(phase);
    }
  });
  it("records a clean acknowledged draft but requires authoritative reload", () => {
    const s = lessonEditorReducer(initialLessonEditor(null), {
      type: "result",
      result: {
        kind: "saved",
        id: "lesson",
        revision: 1,
        bodySha256: "b".repeat(64),
      },
      identity,
    });
    expect(s.phase).toBe("saved");
    expect(lessonBuffer(s)).toBe(s.clean);
    expect(s.base?.revision).toBe(1);
  });
});
