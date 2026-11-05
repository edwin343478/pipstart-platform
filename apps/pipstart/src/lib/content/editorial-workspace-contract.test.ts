import { describe, expect, it } from "vitest";
import {
  canOpenContentWorkspace,
  parseWorkspaceDetail,
  parseWorkspaceList,
  validWorkspaceInput,
} from "./editorial-workspace-contract";
export const row = {
  id: "lesson-1",
  family: "lesson",
  learning_path: "forex",
  category: null,
  parent_id: "module-1",
  latest_revision: 2,
  state: "approved",
  trashed: false,
};
export const item = {
  item: {
    id: "lesson-1",
    family: "lesson",
    learning_path: "forex",
    parent_id: "module-1",
    latest_revision: 2,
    trashed: false,
    on_hold: false,
  },
  revision: {
    revision_no: 2,
    schema_version: 1,
    body: {
      metadata: { title: "Spread <test>" },
      blocks: [{ type: "paragraph", children: "private body sentinel" }],
    },
    body_sha256: "a".repeat(64),
    base_revision: 1,
    author_is_me: false,
    state: "approved",
    created_at: "2026-10-30T12:00:00Z",
  },
  decisions: [
    {
      kind: "imported",
      note: "seed provenance",
      by_me: false,
      at: "2026-10-30T12:00:00Z",
    },
  ],
  review_required: false,
};
describe("workspace exact read contracts", () => {
  it.each([
    null,
    {},
    { kind: "list", after: "", actor: "posted" },
    { kind: "item", id: "bad id" },
    { kind: "save", id: "x" },
  ])("rejects unknown or overbroad requests %#", (v) =>
    expect(validWorkspaceInput(v)).toBe(false),
  );
  it("accepts only bounded read request shapes", () => {
    expect(validWorkspaceInput({ kind: "list", after: "" })).toBe(true);
    expect(validWorkspaceInput({ kind: "item", id: "path:item-1" })).toBe(true);
  });
  it("returns a bounded keyset page with a lookahead cursor", () => {
    const rows = Array.from({ length: 26 }, (_, n) => ({
      ...row,
      id: `lesson-${n}`,
    }));
    const page = parseWorkspaceList(rows, "");
    expect(page?.rows).toHaveLength(25);
    expect(page?.next).toBe("lesson-24");
  });
  it("distinguishes an empty permitted page from failure", () =>
    expect(parseWorkspaceList([], "")).toEqual({ rows: [], next: null }));
  it.each(
    [
      [{ ...row, key: "private" }],
      [row, row],
      [{ ...row, latest_revision: -1 }],
      [{ ...row, state: "published" }],
      [{ ...row, category: "technical" }],
      [{ ...row, parent_id: null }],
      [{ ...row, learning_path: "other" }],
    ].map((value) => ({ value })),
  )("rejects malformed list or leaked fields %#", ({ value }) =>
    expect(parseWorkspaceList(value, "")).toBeNull(),
  );
  it("refuses an included cursor or oversized response", () => {
    expect(parseWorkspaceList([row], row.id)).toBeNull();
    expect(
      parseWorkspaceList(
        Array.from({ length: 27 }, (_, n) => ({ ...row, id: `x${n}` })),
        "",
      ),
    ).toBeNull();
  });
  it("allows analysis only with its actual root/category contract", () =>
    expect(
      parseWorkspaceList(
        [
          {
            ...row,
            family: "analysis",
            learning_path: null,
            parent_id: null,
            category: "technical",
          },
        ],
        "",
      ),
    ).not.toBeNull());
  it("recognizes imported provenance and strips body from browser detail", () => {
    const d = parseWorkspaceDetail(item, "lesson-1");
    expect(d?.decisions[0].kind).toBe("imported");
    expect(d?.title).toBe("Spread <test>");
    expect(JSON.stringify(d)).not.toContain("private body sentinel");
    expect(d).not.toHaveProperty("body");
  });
  it.each([
    { ...item, item: { ...item.item, id: "other" } },
    { ...item, item: { ...item.item, family: "quiz" } },
    { ...item, revision: { ...item.revision, body_sha256: "bad" } },
    { ...item, revision: { ...item.revision, revision_no: 1 } },
    { ...item, revision: { ...item.revision, base_revision: 2 } },
    {
      ...item,
      decisions: [{ ...item.decisions[0], kind: "automatic_review" }],
    },
    { ...item, extra: "secret" },
  ])("refuses malformed detail or unrelated response %#", (v) =>
    expect(parseWorkspaceDetail(v, "lesson-1")).toBeNull(),
  );
  it("permits assigned authors even without global content.read", () =>
    expect(
      canOpenContentWorkspace({
        authorized: true,
        user_id: "x",
        roles: ["author"],
        capabilities: ["staff.enter"],
      }),
    ).toBe(true));
  it("does not invent content navigation for maintenance moderators", () =>
    expect(
      canOpenContentWorkspace({
        authorized: true,
        user_id: "x",
        roles: ["moderator"],
        capabilities: ["staff.enter", "maintenance.assigned"],
      }),
    ).toBe(false));
});
