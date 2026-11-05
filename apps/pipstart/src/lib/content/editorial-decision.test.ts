import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runEditorialDecision } from "./editorial-decision";
import { validDecisionInput } from "./editorial-decision-contract";
const actor = "d1000000-0000-4000-8000-000000000001";
const sha = "a".repeat(64);
const at = "2026-11-05T10:00:00.000Z";
const lessonBody = (sources: unknown[] | undefined) => ({
  metadata: {
    title: "Lesson",
    description: "Description",
    estimatedMinutes: 5,
    objectives: ["Understand"],
    seoTitle: "Search",
    seoDescription: "Description",
    riskWarningRequired: true,
    affiliateDisclosureRequired: false,
    ...(sources ? { sources } : {}),
  },
  blocks: [{ type: "paragraph", children: "Text" }],
});
const source = { title: "CFTC", url: "https://www.cftc.gov/a" };
const item = (
  family = "lesson",
  body: unknown = lessonBody([source]),
  extra: Record<string, unknown> = {},
) => ({
  item: {
    id: "lesson-1",
    family,
    learning_path: "forex",
    parent_id: family === "course" ? null : "module-1",
    latest_revision: 3,
    trashed: false,
    on_hold: false,
    ...extra,
  },
  revision: {
    revision_no: 3,
    schema_version: 1,
    body,
    body_sha256: sha,
    base_revision: 2,
    author_is_me: false,
    state: "draft",
    created_at: at,
  },
  decisions: [],
  review_required: false,
});
const data = (v: unknown, error: unknown = null) => ({
  abortSignal: () => Promise.resolve({ data: v, error }),
});
const result = (state: string, more: Record<string, unknown> = {}) => ({
  item_id: "lesson-1",
  revision_no: 3,
  body_sha256: sha,
  state,
  ...more,
});
function fixture(
  role: string,
  replies: Record<string, unknown> = {},
  read: unknown = item(),
) {
  const getUser = vi
    .fn()
    .mockResolvedValue({ data: { user: { id: actor } }, error: null });
  const rpc = vi.fn((fn: string) => {
    if (fn === "pipstart_staff_access")
      return data({
        authorized: true,
        user_id: actor,
        roles: [role],
        capabilities: ["staff.enter"],
      });
    if (fn === "pipstart_editorial_item") return data(read);
    const reply = replies[fn];
    if (reply instanceof Error)
      return reply.message === "lost"
        ? { abortSignal: () => Promise.reject(Error("socket closed")) }
        : data(null, { code: reply.message, message: "private SQL detail" });
    return data(reply);
  });
  return {
    getUser,
    rpc,
    client: { auth: { getUser }, rpc } as unknown as SupabaseClient,
  };
}
const command = (action: string, note: string | null = null) => ({
  action,
  id: "lesson-1",
  revision: 3,
  sha,
  note,
});
const writes = (f: ReturnType<typeof fixture>) =>
  f.rpc.mock.calls.filter(
    (c) => !["pipstart_staff_access", "pipstart_editorial_item"].includes(c[0]),
  );
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());
describe("decision input contract", () => {
  it("accepts exact decisions and requires a note only to request changes", () => {
    for (const ok of [
      command("submit"),
      command("approve"),
      command("approve", "Checked"),
      command("publish", "Owner check"),
      command("changes", "Add a second source"),
    ])
      expect(validDecisionInput(ok)).toBe(true);
    for (const bad of [
      command("changes"),
      command("submit", "note"),
      command("approve", " padded "),
      command("approve", ""),
      command("publish", "x".repeat(1001)),
      command("archive"),
      { ...command("submit"), actor },
      { ...command("submit"), revision: 0 },
      { ...command("submit"), sha: "A".repeat(64) },
      { ...command("submit"), id: "Lesson 1" },
      null,
    ])
      expect(validDecisionInput(bad)).toBe(false);
  });
});
describe("review and publication decisions", () => {
  it("defaults closed and refuses bad input before Auth", async () => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "yes");
    const f = fixture("owner");
    expect(await runEditorialDecision(f.client, command("publish"))).toEqual({
      kind: "denied",
    });
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
    expect(await runEditorialDecision(f.client, command("changes"))).toEqual({
      kind: "invalid",
    });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it.each([
    [
      "submit",
      "author",
      "pipstart_editorial_submit",
      "submitted",
      { p_id: "lesson-1", p_revision: 3, p_sha: sha },
    ],
    [
      "approve",
      "reviewer",
      "pipstart_editorial_review",
      "approved",
      {
        p_id: "lesson-1",
        p_revision: 3,
        p_sha: sha,
        p_approve: true,
        p_note: "Checked",
      },
    ],
    [
      "changes",
      "reviewer",
      "pipstart_editorial_review",
      "changes_requested",
      {
        p_id: "lesson-1",
        p_revision: 3,
        p_sha: sha,
        p_approve: false,
        p_note: "Checked",
      },
    ],
    [
      "publish",
      "owner",
      "pipstart_editorial_approve_single_person",
      "approved",
      { p_id: "lesson-1", p_revision: 3, p_sha: sha, p_note: "Checked" },
    ],
  ])(
    "%s as %s sends exactly one user-context write",
    async (action, role, fn, state, args) => {
      const f = fixture(role, { [fn]: result(state) });
      expect(
        await runEditorialDecision(
          f.client,
          command(action, action === "submit" ? null : "Checked"),
        ),
      ).toEqual({ kind: "done", id: "lesson-1", revision: 3, state });
      expect(writes(f)).toEqual([[fn, args]]);
    },
  );
  it.each([
    ["submit", "reviewer"],
    ["approve", "author"],
    ["changes", "editor"],
    ["publish", "editor"],
    ["publish", "reviewer"],
  ])("refuses %s for a %s before reading or writing", async (action, role) => {
    const f = fixture(role);
    expect(
      await runEditorialDecision(
        f.client,
        command(action, action === "changes" ? "Note" : null),
      ),
    ).toEqual({ kind: "denied" });
    expect(f.rpc).not.toHaveBeenCalledWith(
      "pipstart_editorial_item",
      expect.anything(),
    );
  });
  it("refuses a lesson without sources before any write, except a changes request", async () => {
    for (const body of [lessonBody(undefined), lessonBody([])]) {
      const f = fixture("owner", {}, item("lesson", body));
      expect(await runEditorialDecision(f.client, command("publish"))).toEqual({
        kind: "sources",
      });
      expect(await runEditorialDecision(f.client, command("submit"))).toEqual({
        kind: "sources",
      });
      expect(writes(f)).toEqual([]);
    }
    const f = fixture(
      "reviewer",
      { pipstart_editorial_review: result("changes_requested") },
      item("lesson", lessonBody([])),
    );
    expect(
      await runEditorialDecision(f.client, command("changes", "Add a source")),
    ).toMatchObject({ kind: "done", state: "changes_requested" });
  });
  it("needs no sources for courses and modules", async () => {
    const f = fixture(
      "owner",
      { pipstart_editorial_approve_single_person: result("approved") },
      item("module", { metadata: { title: "Module" } }),
    );
    expect(
      await runEditorialDecision(f.client, command("publish")),
    ).toMatchObject({
      kind: "done",
    });
  });
  it("refuses a stale revision or hash, and archived content, without writing", async () => {
    const stale = [
      [item(), { ...command("publish"), revision: 2 }],
      [item(), { ...command("publish"), sha: "b".repeat(64) }],
    ] as const;
    for (const [read, c] of stale) {
      const f = fixture("owner", {}, read);
      expect(await runEditorialDecision(f.client, c)).toEqual({
        kind: "conflict",
      });
      expect(writes(f)).toEqual([]);
    }
    const f = fixture(
      "owner",
      {},
      item("lesson", lessonBody([source]), { trashed: true }),
    );
    expect(await runEditorialDecision(f.client, command("publish"))).toEqual({
      kind: "state",
    });
    expect(writes(f)).toEqual([]);
  });
  it.each([
    ["42501", "denied"],
    ["PT409", "conflict"],
    ["55000", "state"],
    ["22023", "invalid"],
    ["57014", "uncertain"],
    ["lost", "uncertain"],
  ])("maps store reply %s to %s without retrying", async (code, kind) => {
    const f = fixture("owner", {
      pipstart_editorial_approve_single_person: Error(code),
    });
    const r = await runEditorialDecision(f.client, command("publish"));
    expect(r).toEqual({ kind });
    expect(JSON.stringify(r)).not.toContain("private");
    expect(writes(f)).toHaveLength(1);
  });
  it("treats an unexpected acknowledgement as uncertain", async () => {
    for (const reply of [
      result("draft"),
      result("approved", { revision_no: 4 }),
      result("approved", { body_sha256: "b".repeat(64) }),
      result("approved", { extra: true }),
      null,
    ]) {
      const f = fixture("owner", {
        pipstart_editorial_approve_single_person: reply,
      });
      expect(await runEditorialDecision(f.client, command("publish"))).toEqual({
        kind: "uncertain",
      });
    }
  });
  it("snapshots the input before Auth awaits", async () => {
    const f = fixture("owner", {
      pipstart_editorial_approve_single_person: result("approved"),
    });
    const input = command("publish");
    const pending = runEditorialDecision(f.client, input);
    input.id = "lesson-2";
    input.revision = 9;
    await pending;
    expect((writes(f)[0] as unknown[])[1]).toMatchObject({
      p_id: "lesson-1",
      p_revision: 3,
    });
  });
});
