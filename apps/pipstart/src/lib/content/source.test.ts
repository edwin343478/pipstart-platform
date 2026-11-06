import { describe, expect, it } from "vitest";

import { buildImportManifest } from "./import/manifest";
import {
  buildContentSnapshot,
  type ContentSnapshot,
  parseContentSnapshot,
  parseContentSnapshotFile,
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
        (s as { version: number }).version = 3;
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

let manifest: ReturnType<typeof buildImportManifest> | undefined;
describe("M22 MP07a quiz versions in the snapshot", { timeout: 60_000 }, () => {
  const quizAt = async (version: number) => {
    const quiz = (await (manifest ??= buildImportManifest())).find(
      (item) => item.family === "quiz",
    )!;
    const body = JSON.parse(JSON.stringify(quiz.body)) as {
      metadata: Record<string, unknown>;
    };
    body.metadata.version = version;
    return { id: quiz.id, version, revisionNo: version + 3, body };
  };
  const withVersions = async () =>
    buildContentSnapshot([course, moduleRow], "2026-11-06T00:00:00.000Z", [
      await quizAt(1),
      await quizAt(2),
    ]);

  it("serves every sealed quiz version as a quiz row", async () => {
    const snapshot = await withVersions();
    const parsed = parseContentSnapshotFile(text(snapshot));
    expect(parsed.rows.map((row) => row.id)).toEqual(["x-course", "x-module"]);
    expect(
      parsed.quizVersions.map((row) => [
        row.id,
        row.family,
        (row.body.metadata as { version: number }).version,
      ]),
    ).toEqual([
      [snapshot.quizVersions[0]!.id, "quiz", 1],
      [snapshot.quizVersions[0]!.id, "quiz", 2],
    ]);
  });

  it("still reads a format 1 snapshot, with no quiz history", () => {
    const { items, itemsSha256, format, exportedAt } = sealed();
    const v1 = text({ format, version: 1, exportedAt, items, itemsSha256 });
    expect(parseContentSnapshotFile(v1).quizVersions).toEqual([]);
    expect(parseContentSnapshot(v1)).toHaveLength(2);
  });

  it.each([
    [
      "a missing quiz version list",
      (s: ContentSnapshot) => {
        delete (s as Partial<ContentSnapshot>).quizVersions;
      },
      "no quiz version list",
    ],
    [
      "a changed quiz body",
      (s: ContentSnapshot) => {
        (s.quizVersions[0]!.body.metadata as { title: string }).title =
          "Changed";
      },
      "body does not match its SHA-256",
    ],
    [
      "a body that carries another version",
      (s: ContentSnapshot) => {
        s.quizVersions[0]!.version = 3;
      },
      "body does not carry this version",
    ],
    [
      "a duplicate version",
      (s: ContentSnapshot) => {
        s.quizVersions[1] = s.quizVersions[0]!;
      },
      "duplicate version",
    ],
    [
      "a dropped version",
      (s: ContentSnapshot) => {
        s.quizVersions.pop();
      },
      "the quiz version list does not match its seal",
    ],
    [
      "an invalid quiz body",
      (s: ContentSnapshot) => {
        s.quizVersions[0]!.body.questions = [];
      },
      "A quiz needs 1 to 100 questions",
    ],
  ])("refuses the whole snapshot for %s", async (_, damage, reason) => {
    const snapshot = await withVersions();
    damage(snapshot);
    expect(() => parseContentSnapshot(text(snapshot))).toThrow(reason);
  });
});
