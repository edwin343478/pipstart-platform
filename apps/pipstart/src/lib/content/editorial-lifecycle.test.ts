import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runEditorialLifecycle } from "./editorial-lifecycle";
import { validLifecycleInput } from "./editorial-lifecycle-contract";
const actor = "d1000000-0000-4000-8000-000000000001";
const sha = "a".repeat(64);
const item = (extra: Record<string, unknown> = {}) => ({
  item: {
    id: "lesson-1",
    family: "lesson",
    learning_path: "forex",
    parent_id: "module-1",
    latest_revision: 3,
    trashed: false,
    on_hold: false,
    ...extra,
  },
  revision: {
    revision_no: 3,
    schema_version: 1,
    body: { metadata: { title: "Lesson" } },
    body_sha256: sha,
    base_revision: 2,
    author_is_me: false,
    state: "draft",
    created_at: "2026-11-05T10:00:00.000Z",
  },
  decisions: [],
  review_required: false,
});
const data = (v: unknown, error: unknown = null) => ({
  abortSignal: () => Promise.resolve({ data: v, error }),
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
const command = (action: string, reason: string | null = "Retired") => ({
  action,
  id: "lesson-1",
  revision: 3,
  sha,
  reason,
});
const writes = (f: ReturnType<typeof fixture>) =>
  f.rpc.mock.calls.filter(
    (c) => !["pipstart_staff_access", "pipstart_editorial_item"].includes(c[0]),
  );
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());
describe("lifecycle input contract", () => {
  it("requires a reason except to release a hold", () => {
    for (const ok of [
      command("archive"),
      command("restore"),
      command("hold"),
      command("release", null),
    ])
      expect(validLifecycleInput(ok)).toBe(true);
    for (const bad of [
      command("archive", null),
      command("archive", ""),
      command("archive", " padded "),
      command("archive", "x".repeat(201)),
      command("archive", "line\nbreak"),
      command("release"),
      command("delete"),
      { ...command("archive"), actor },
      { ...command("archive"), revision: 0 },
      null,
    ])
      expect(validLifecycleInput(bad)).toBe(false);
  });
});
describe("archive, restore and hold", () => {
  it("defaults closed and refuses bad input before Auth", async () => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "on");
    const f = fixture("owner");
    expect(await runEditorialLifecycle(f.client, command("archive"))).toEqual({
      kind: "denied",
    });
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
    expect(
      await runEditorialLifecycle(f.client, command("archive", null)),
    ).toEqual({ kind: "invalid" });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it("archives through one user-context trash call", async () => {
    const f = fixture("author", {
      pipstart_editorial_trash: { item_id: "lesson-1", trashed: true },
    });
    expect(await runEditorialLifecycle(f.client, command("archive"))).toEqual({
      kind: "done",
      id: "lesson-1",
      action: "archive",
      revision: 3,
    });
    expect(writes(f)).toEqual([
      ["pipstart_editorial_trash", { p_id: "lesson-1", p_reason: "Retired" }],
    ]);
  });
  it("restores as a new draft revision", async () => {
    const f = fixture(
      "editor",
      {
        pipstart_editorial_restore: {
          item_id: "lesson-1",
          revision_no: 4,
          body_sha256: "b".repeat(64),
          state: "draft",
        },
      },
      item({ trashed: true }),
    );
    expect(
      await runEditorialLifecycle(f.client, command("restore", "Needed again")),
    ).toEqual({ kind: "done", id: "lesson-1", action: "restore", revision: 4 });
    expect(writes(f)).toEqual([
      [
        "pipstart_editorial_restore",
        { p_id: "lesson-1", p_reason: "Needed again" },
      ],
    ]);
  });
  it("places and releases an Owner hold", async () => {
    const hold = fixture("owner", {
      pipstart_editorial_hold: { item_id: "lesson-1", held: true },
    });
    expect(
      await runEditorialLifecycle(hold.client, command("hold", "Legal review")),
    ).toMatchObject({ kind: "done", action: "hold" });
    expect(writes(hold)).toEqual([
      [
        "pipstart_editorial_hold",
        { p_id: "lesson-1", p_reason: "Legal review" },
      ],
    ]);
    const release = fixture(
      "owner",
      { pipstart_editorial_hold: { item_id: "lesson-1", held: false } },
      item({ on_hold: true }),
    );
    expect(
      await runEditorialLifecycle(release.client, command("release", null)),
    ).toMatchObject({ kind: "done", action: "release" });
    expect(writes(release)).toEqual([
      ["pipstart_editorial_hold", { p_id: "lesson-1", p_reason: null }],
    ]);
  });
  it.each([
    ["archive", "reviewer"],
    ["restore", "author"],
    ["hold", "editor"],
    ["release", "author"],
  ])("refuses %s for a %s before reading or writing", async (action, role) => {
    const f = fixture(role);
    expect(
      await runEditorialLifecycle(
        f.client,
        command(action, action === "release" ? null : "Reason"),
      ),
    ).toEqual({ kind: "denied" });
    expect(f.rpc).not.toHaveBeenCalledWith(
      "pipstart_editorial_item",
      expect.anything(),
    );
  });
  it("refuses actions that do not fit the item as stored, without writing", async () => {
    for (const [read, c, kind] of [
      [item({ on_hold: true }), command("archive"), "held"],
      [item({ trashed: true }), command("archive"), "state"],
      [item(), command("restore"), "state"],
      [item({ on_hold: true }), command("hold"), "state"],
      [item(), command("release", null), "state"],
      [item(), { ...command("archive"), revision: 2 }, "conflict"],
      [item(), { ...command("archive"), sha: "c".repeat(64) }, "conflict"],
    ] as const) {
      const f = fixture("owner", {}, read);
      expect(await runEditorialLifecycle(f.client, c)).toEqual({ kind });
      expect(writes(f)).toEqual([]);
    }
  });
  it.each([
    ["42501", "denied"],
    ["55000", "state"],
    ["22023", "invalid"],
    ["57014", "uncertain"],
    ["lost", "uncertain"],
  ])("maps store reply %s to %s without retrying", async (code, kind) => {
    const f = fixture("owner", { pipstart_editorial_trash: Error(code) });
    const r = await runEditorialLifecycle(f.client, command("archive"));
    expect(r).toEqual({ kind });
    expect(JSON.stringify(r)).not.toContain("private");
    expect(writes(f)).toHaveLength(1);
  });
  it("treats an unexpected acknowledgement as uncertain", async () => {
    for (const [fn, reply, c, read] of [
      [
        "pipstart_editorial_trash",
        { item_id: "lesson-1", trashed: false },
        command("archive"),
        item(),
      ],
      [
        "pipstart_editorial_trash",
        { item_id: "lesson-2", trashed: true },
        command("archive"),
        item(),
      ],
      [
        "pipstart_editorial_hold",
        { item_id: "lesson-1", held: false },
        command("hold"),
        item(),
      ],
      [
        "pipstart_editorial_restore",
        {
          item_id: "lesson-1",
          revision_no: 3,
          body_sha256: sha,
          state: "draft",
        },
        command("restore"),
        item({ trashed: true }),
      ],
      [
        "pipstart_editorial_restore",
        null,
        command("restore"),
        item({ trashed: true }),
      ],
    ] as const) {
      const f = fixture("owner", { [fn]: reply }, read);
      expect(await runEditorialLifecycle(f.client, c)).toEqual({
        kind: "uncertain",
      });
    }
  });
});
