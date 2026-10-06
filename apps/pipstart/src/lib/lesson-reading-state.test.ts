import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { LessonBlocks } from "../components/lesson-blocks";
import { getPublishedLessons } from "../content/lesson-registry";
import {
  emptyReadingState,
  readingStorageKey,
  readReadingState,
  resolveReadingState,
  sectionIds,
} from "./lesson-reading-state";

const sections = [
  { title: "First ideas", blocks: [] },
  { title: "Café example", blocks: [] },
  { title: "Café example", blocks: [] },
];
describe("lesson reading state", () => {
  it("creates repeatable bookmark IDs including duplicate and accented titles", () => {
    expect(sectionIds(sections)).toEqual([
      "first-ideas",
      "cafe-example",
      "cafe-example-2",
    ]);
  });
  it("keeps records separate by lesson and content revision", () => {
    const key = readingStorageKey("one", sections);
    expect(readingStorageKey("one", [...sections])).toBe(key);
    expect(readingStorageKey("two", sections)).not.toBe(key);
    expect(
      readingStorageKey("one", [{ title: "Changed", blocks: [] }]),
    ).not.toBe(key);
  });
  it.each(["", "broken", "null", "42"])(
    "recovers safely from invalid stored data: %s",
    (raw) => {
      expect(readReadingState(raw)).toEqual(emptyReadingState);
    },
  );
  it("ignores malformed values and deduplicates checked item IDs", () => {
    expect(
      readReadingState(
        JSON.stringify({
          section: 42,
          showAll: "true",
          checked: ["a", 1, "a", null],
        }),
      ),
    ).toEqual({ section: undefined, showAll: false, checked: ["a"] });
  });
  it("gives a valid shared URL priority over the saved section and preference", () => {
    const state = resolveReadingState(
      JSON.stringify({ section: "first", showAll: true, checked: ["x"] }),
      "?section=last&all=0",
      ["first", "last"],
    );
    expect(state).toMatchObject({
      activeIndex: 1,
      showAll: false,
      checked: ["x"],
    });
  });
  it("restores a saved location and safely handles unknown sections", () => {
    expect(
      resolveReadingState('{"section":"last"}', "", ["first", "last"])
        .activeIndex,
    ).toBe(1);
    expect(
      resolveReadingState("", "?section=invalid", ["first", "last"])
        .activeIndex,
    ).toBe(0);
  });
  it("explicitly marks all 21 final checklists in Levels 4–10", () => {
    const lessons = getPublishedLessons({ learningPath: "forex" });
    expect(lessons).toHaveLength(39);
    const later = lessons.filter(
      (lesson) => Number(lesson.level.replace("level-", "")) >= 4,
    );
    expect(later).toHaveLength(21);
    for (const lesson of later) {
      const checks = lesson.sections
        ?.flatMap((section) => section.blocks)
        .filter((block) => block.type === "keyPoint" && block.checklist);
      expect(checks?.length, lesson.id).toBeGreaterThan(0);
    }
  });
  it("renders controlled ticks using the existing approved checklist card", () => {
    const html = renderToStaticMarkup(
      createElement(LessonBlocks, {
        blocks: [
          {
            type: "keyPoint",
            title: "Before you mark this lesson complete",
            points: ["One", "Two"],
            checklist: true,
          },
        ],
        checklistState: {
          prefix: "final",
          checked: ["final:0:1"],
          onChange: () => undefined,
        },
      }),
    );
    expect((html.match(/type="checkbox"/g) ?? []).length).toBe(2);
    expect((html.match(/checked=""/g) ?? []).length).toBe(1);
  });
});

it("an explicit lesson-card start wins over a saved section without discarding ticks", () => {
  expect(
    resolveReadingState(
      JSON.stringify({ section: "last", showAll: true, checked: ["done"] }),
      "?section=1&all=0",
      ["first", "last"],
    ),
  ).toMatchObject({ activeIndex: 0, showAll: false, checked: ["done"] });
  expect(
    resolveReadingState(
      JSON.stringify({ section: "last", showAll: true, checked: ["done"] }),
      "",
      ["first", "last"],
    ),
  ).toMatchObject({ activeIndex: 1, showAll: true, checked: ["done"] });
});
