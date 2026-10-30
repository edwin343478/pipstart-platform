import { describe, expect, it } from "vitest";

import {
  buildContentSnapshot,
  parseContentSnapshot,
  resolveContentSource,
} from "./source";

const course = {
  id: "x-course",
  family: "course" as const,
  learningPath: "crypto" as const,
  parentId: null,
  revisionNo: 1,
  body: { metadata: { title: "Course", level: "level-2" } },
};
const moduleRow = {
  id: "x-module",
  family: "module" as const,
  learningPath: "crypto" as const,
  parentId: "x-course",
  revisionNo: 2,
  body: { metadata: { title: "Module" } },
};
const sealed = () =>
  buildContentSnapshot([course, moduleRow], "2026-10-30T00:00:00.000Z");
const text = (value: unknown) => JSON.stringify(value);

describe("M22 MP05c-2 content source switch", () => {
  it("reads code unless the snapshot source is chosen", () => {
    const read = () => {
      throw new Error("must not read");
    };
    expect(resolveContentSource({}, read)).toBeNull();
    expect(
      resolveContentSource({ PIPSTART_CONTENT_SOURCE: "code" }, read),
    ).toBeNull();
    expect(() =>
      resolveContentSource({ PIPSTART_CONTENT_SOURCE: "store" }, read),
    ).toThrow('Unknown PIPSTART_CONTENT_SOURCE "store"');
  });

  it("refuses the snapshot source in Production, before reading anything", () => {
    expect(() =>
      resolveContentSource(
        {
          PIPSTART_CONTENT_SOURCE: "snapshot",
          PIPSTART_CONTENT_SNAPSHOT: "snapshot.json",
          VERCEL_ENV: "production",
        },
        () => {
          throw new Error("must not read");
        },
      ),
    ).toThrow("refused in Production");
    expect(() =>
      resolveContentSource({ PIPSTART_CONTENT_SOURCE: "snapshot" }),
    ).toThrow("PIPSTART_CONTENT_SNAPSHOT must name the snapshot file");
  });

  it("serves the verified rows of a sealed snapshot outside Production", () => {
    const rows = resolveContentSource(
      {
        PIPSTART_CONTENT_SOURCE: "snapshot",
        PIPSTART_CONTENT_SNAPSHOT: "snapshot.json",
        VERCEL_ENV: "preview",
      },
      (path) => (path === "snapshot.json" ? text(sealed()) : ""),
    );
    expect(rows).toEqual([
      {
        id: "x-course",
        family: "course",
        learningPath: "crypto",
        parentId: null,
        body: course.body,
      },
      {
        id: "x-module",
        family: "module",
        learningPath: "crypto",
        parentId: "x-course",
        body: moduleRow.body,
      },
    ]);
  });

  it.each([
    [
      "a changed body",
      (s: ReturnType<typeof sealed>) => {
        s.items[1]!.body = { metadata: { title: "Changed" } };
      },
      "body does not match its SHA-256",
    ],
    [
      "a dropped item",
      (s: ReturnType<typeof sealed>) => {
        s.items.pop();
      },
      "does not match its seal",
    ],
    [
      "a revision that is not approved",
      (s: ReturnType<typeof sealed>) => {
        (s.items[0] as { state: string }).state = "draft";
      },
      "not an approved revision",
    ],
    [
      "a child before its parent",
      (s: ReturnType<typeof sealed>) => {
        s.items.reverse();
      },
      "must come earlier",
    ],
    [
      "a parent in another path",
      (s: ReturnType<typeof sealed>) => {
        s.items[1]!.learningPath = "forex";
      },
      "another learning path",
    ],
    [
      "an invalid body",
      (s: ReturnType<typeof sealed>) => {
        s.items[0]!.body = { metadata: { title: " " } };
      },
      "Title is required",
    ],
    [
      "a duplicate ID",
      (s: ReturnType<typeof sealed>) => {
        s.items[1]!.id = "x-course";
      },
      "duplicate ID",
    ],
    [
      "an unknown format",
      (s: ReturnType<typeof sealed>) => {
        (s as { version: number }).version = 2;
      },
      "unknown format or version",
    ],
  ])("refuses the whole snapshot for %s", (_, damage, reason) => {
    const snapshot = sealed();
    damage(snapshot);
    expect(() => parseContentSnapshot(text(snapshot))).toThrow(reason);
  });

  it("refuses text that is not a snapshot", () => {
    expect(() => parseContentSnapshot("not json")).toThrow("not valid JSON");
    expect(() => parseContentSnapshot("[]")).toThrow("not an object");
    expect(() =>
      parseContentSnapshot(text({ ...sealed(), items: [] })),
    ).toThrow("no items");
  });
});
