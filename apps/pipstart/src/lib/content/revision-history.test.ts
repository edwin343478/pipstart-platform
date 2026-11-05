import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readRevisionHistory } from "./revision-history";
import {
  parseHistory,
  parseRevision,
  validHistoryInput,
} from "./revision-history-contract";
const actor = "d1000000-0000-4000-8000-000000000001";
const sha = (n: number) => String(n).repeat(64).slice(0, 64);
const at = "2026-11-02T10:00:00.000Z";
const body = (text: string, title = "Lesson") => ({
  metadata: {
    title,
    description: "Description",
    estimatedMinutes: 5,
    objectives: ["Understand"],
    seoTitle: "Search",
    seoDescription: "Description",
    riskWarningRequired: true,
    affiliateDisclosureRequired: false,
    reviewer: "PRIVATE_REVIEWER",
  },
  blocks: [{ type: "paragraph", children: text, opaque: "PRIVATE_BLOCK" }],
});
const summary = (n: number, extra: Record<string, unknown> = {}) => ({
  revision_no: n,
  body_sha256: sha(n),
  base_revision: n - 1,
  author_is_me: true,
  state: n === 3 ? "draft" : "superseded",
  reason: "Reason " + n,
  created_at: at,
  decisions: [],
  imported: false,
  ...extra,
});
const history = (rows: unknown[], latest = 3) => ({
  item_id: "lesson-1",
  latest_revision: latest,
  revisions: rows,
});
const revision = (n: number, b: unknown, latest = 3) => ({
  item_id: "lesson-1",
  latest_revision: latest,
  revision: {
    revision_no: n,
    schema_version: 1,
    body: b,
    body_sha256: sha(n),
    base_revision: n - 1,
    author_is_me: false,
    state: "superseded",
    created_at: at,
  },
  decisions: [{ kind: "single_person", note: null, by_me: false, at }],
  imported: false,
});
const item = (b: unknown, latest = 3) => ({
  item: {
    id: "lesson-1",
    family: "lesson",
    learning_path: "forex",
    parent_id: "module-1",
    latest_revision: latest,
    trashed: false,
    on_hold: false,
  },
  revision: {
    revision_no: latest,
    schema_version: 1,
    body: b,
    body_sha256: sha(latest),
    base_revision: latest - 1,
    author_is_me: true,
    state: "draft",
    created_at: at,
  },
  decisions: [],
  review_required: false,
});
const data = (v: unknown, error: unknown = null) => ({
  abortSignal: () => Promise.resolve({ data: v, error }),
});
function fixture(replies: Record<string, unknown>) {
  const getUser = vi
    .fn()
    .mockResolvedValue({ data: { user: { id: actor } }, error: null });
  const rpc = vi.fn((fn: string) => {
    if (fn === "pipstart_staff_access")
      return data({
        authorized: true,
        user_id: actor,
        roles: ["author"],
        capabilities: ["staff.enter"],
      });
    const reply = replies[fn];
    return reply instanceof Error
      ? data(null, { code: reply.message, message: "private SQL detail" })
      : data(reply);
  });
  return {
    getUser,
    rpc,
    client: { auth: { getUser }, rpc } as unknown as SupabaseClient,
  };
}
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());
describe("revision history input and DTO contract", () => {
  it("accepts only exact read inputs", () => {
    expect(
      validHistoryInput({ kind: "history", id: "lesson-1", before: null }),
    ).toBe(true);
    expect(
      validHistoryInput({ kind: "history", id: "lesson-1", before: 2 }),
    ).toBe(true);
    expect(
      validHistoryInput({ kind: "compare", id: "lesson-1", from: 1 }),
    ).toBe(true);
    for (const bad of [
      { kind: "history", id: "lesson-1", before: 1 },
      { kind: "history", id: "lesson-1" },
      { kind: "history", id: "Lesson 1", before: null },
      { kind: "compare", id: "lesson-1", from: 0 },
      { kind: "compare", id: "lesson-1", from: 1.5 },
      { kind: "compare", id: "lesson-1", from: 1, actor },
      { kind: "save", id: "lesson-1" },
      null,
    ])
      expect(validHistoryInput(bad)).toBe(false);
  });
  it("parses a newest-first page with a lookahead cursor", () => {
    const rows = Array.from({ length: 21 }, (_, i) =>
      summary(30 - i, { state: i ? "superseded" : "draft" }),
    );
    const page = parseHistory(history(rows, 30), "lesson-1", null);
    expect(page?.rows).toHaveLength(20);
    expect(page?.next).toBe(11);
    expect(page?.rows[0]).toEqual({
      revision: 30,
      state: "draft",
      bodySha256: sha(30),
      baseRevision: 29,
      authorIsMe: true,
      reason: "Reason 30",
      createdAt: at,
      decisions: [],
      imported: false,
    });
    expect(
      parseHistory(history([summary(2), summary(1)]), "lesson-1", 3)?.next,
    ).toBeNull();
  });
  it("fails closed on reordered, unbounded, foreign or extra-field pages", () => {
    const ok = [summary(3), summary(2), summary(1)];
    expect(parseHistory(history(ok), "lesson-1", null)).not.toBeNull();
    for (const bad of [
      history([summary(2), summary(3)]),
      history([summary(3), summary(3)]),
      history([summary(2), summary(1)]),
      history([summary(4)]),
      history([{ ...summary(3), body: {} }]),
      history([summary(3, { reason: "" })]),
      history([summary(3, { decisions: [{ kind: "approved_by_me" }] })]),
      { ...history(ok), item_id: "lesson-2" },
      { ...history(ok), extra: true },
      history(
        Array.from({ length: 22 }, (_, i) => summary(40 - i)),
        40,
      ),
    ])
      expect(parseHistory(bad, "lesson-1", null)).toBeNull();
    expect(parseHistory(history([summary(3)]), "lesson-1", 3)).toBeNull();
  });
  it("parses one exact revision and keeps the body server-side", () => {
    const r = parseRevision(revision(2, body("Two")), "lesson-1", 2);
    expect(r?.ref).toEqual({
      revision: 2,
      state: "superseded",
      bodySha256: sha(2),
      createdAt: at,
    });
    expect(r?.latest).toBe(3);
    expect(parseRevision(revision(2, body("Two")), "lesson-1", 1)).toBeNull();
    expect(parseRevision(revision(4, body("Two")), "lesson-1", 4)).toBeNull();
    expect(
      parseRevision({ ...revision(2, body("Two")), extra: 1 }, "lesson-1", 2),
    ).toBeNull();
  });
});
describe("live read-only revision boundary", () => {
  it("defaults closed without the exact staff flag and refuses bad input before Auth", async () => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "1");
    const f = fixture({});
    expect(
      await readRevisionHistory(f.client, {
        kind: "history",
        id: "lesson-1",
        before: null,
      }),
    ).toEqual({ kind: "denied" });
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
    expect(
      await readRevisionHistory(f.client, {
        kind: "compare",
        id: "lesson-1",
        from: 0,
      }),
    ).toEqual({ kind: "invalid" });
    expect(f.getUser).not.toHaveBeenCalled();
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it("reads one bounded history page through the user-context RPC", async () => {
    const f = fixture({
      pipstart_editorial_history: history([summary(3), summary(2), summary(1)]),
    });
    const result = await readRevisionHistory(f.client, {
      kind: "history",
      id: "lesson-1",
      before: null,
    });
    expect(result.kind).toBe("history");
    expect(f.rpc).toHaveBeenLastCalledWith("pipstart_editorial_history", {
      p_id: "lesson-1",
      p_before: null,
      p_limit: 21,
    });
  });
  it("compares an earlier revision with the latest without sending bodies", async () => {
    const f = fixture({
      pipstart_editorial_item: item(body("Three", "Lesson v3")),
      pipstart_editorial_revision: revision(2, body("Two")),
    });
    const result = await readRevisionHistory(f.client, {
      kind: "compare",
      id: "lesson-1",
      from: 2,
    });
    expect(result).toEqual({
      kind: "compare",
      id: "lesson-1",
      from: {
        revision: 2,
        state: "superseded",
        bodySha256: sha(2),
        createdAt: at,
      },
      to: { revision: 3, state: "draft", bodySha256: sha(3), createdAt: at },
      comparison: {
        fields: [{ label: "Title", before: "Lesson", after: "Lesson v3" }],
        lines: [
          { op: "removed", position: 1, label: "Paragraph", text: "Two" },
          { op: "added", position: 1, label: "Paragraph", text: "Three" },
        ],
        unchangedLines: 0,
        truncated: false,
      },
    });
    expect(JSON.stringify(result)).not.toContain("PRIVATE");
    expect(f.rpc).toHaveBeenCalledWith("pipstart_editorial_revision", {
      p_id: "lesson-1",
      p_revision: 2,
    });
  });
  it("refuses comparing the latest with itself or a newer revision", async () => {
    const f = fixture({ pipstart_editorial_item: item(body("Three")) });
    expect(
      await readRevisionHistory(f.client, {
        kind: "compare",
        id: "lesson-1",
        from: 3,
      }),
    ).toEqual({ kind: "invalid" });
    expect(f.rpc).not.toHaveBeenCalledWith(
      "pipstart_editorial_revision",
      expect.anything(),
    );
  });
  it("reports a save between the two reads instead of comparing stale content", async () => {
    const f = fixture({
      pipstart_editorial_item: item(body("Three")),
      pipstart_editorial_revision: revision(2, body("Two"), 4),
    });
    expect(
      await readRevisionHistory(f.client, {
        kind: "compare",
        id: "lesson-1",
        from: 2,
      }),
    ).toEqual({ kind: "stale" });
  });
  it("reports bodies outside the editable projection as unsupported", async () => {
    const f = fixture({
      pipstart_editorial_item: item(body("Three")),
      pipstart_editorial_revision: revision(2, { metadata: { title: "Old" } }),
    });
    expect(
      await readRevisionHistory(f.client, {
        kind: "compare",
        id: "lesson-1",
        from: 2,
      }),
    ).toEqual({ kind: "unsupported" });
  });
  it("maps store refusals without SQL detail", async () => {
    for (const [code, kind] of [
      ["42501", "denied"],
      ["22023", "invalid"],
      ["PT409", "unavailable"],
      ["XX000", "unavailable"],
    ]) {
      const f = fixture({ pipstart_editorial_history: Error(code) });
      const result = await readRevisionHistory(f.client, {
        kind: "history",
        id: "lesson-1",
        before: null,
      });
      expect(result).toEqual({ kind });
      expect(JSON.stringify(result)).not.toContain("private");
    }
  });
  it("refuses unauthenticated or non-staff sessions before any editorial read", async () => {
    const f = fixture({});
    f.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect(
      await readRevisionHistory(f.client, {
        kind: "history",
        id: "lesson-1",
        before: null,
      }),
    ).toEqual({ kind: "denied" });
    expect(f.rpc).not.toHaveBeenCalled();
  });
});
