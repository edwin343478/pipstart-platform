import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readEditorialWorkspace } from "./editorial-workspace";
const actor = "d1000000-0000-4000-8000-000000000001";
const row = {
  id: "lesson-1",
  family: "lesson",
  learning_path: "forex",
  category: null,
  parent_id: "module-1",
  latest_revision: 1,
  state: "draft",
  trashed: false,
};
const data = (v: unknown, error: unknown = null) => ({
  abortSignal: () => Promise.resolve({ data: v, error }),
});
function fixture() {
  const getUser = vi
    .fn()
    .mockResolvedValue({ data: { user: { id: actor } }, error: null });
  const rpc = vi.fn((fn: string) =>
    data(
      fn === "pipstart_staff_access"
        ? {
            authorized: true,
            user_id: actor,
            roles: ["owner"],
            capabilities: ["staff.enter", "content.read"],
          }
        : [row],
    ),
  );
  return {
    getUser,
    rpc,
    client: { auth: { getUser }, rpc } as unknown as SupabaseClient,
  };
}
beforeEach(() => vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true"));
afterEach(() => vi.unstubAllEnvs());
describe("live read-only editorial boundary", () => {
  it("defaults closed without the exact staff flag", async () => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "TRUE");
    const f = fixture();
    expect(
      await readEditorialWorkspace(f.client, { kind: "list", after: "" }),
    ).toEqual({ kind: "denied" });
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it("refuses posted actors and mutations before any Auth or RPC call", async () => {
    const f = fixture();
    expect(
      await readEditorialWorkspace(f.client, {
        kind: "list",
        after: "",
        actor,
      }),
    ).toEqual({ kind: "invalid" });
    expect(
      await readEditorialWorkspace(f.client, { kind: "save", id: "lesson-1" }),
    ).toEqual({ kind: "invalid" });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it("uses only the verified user context and the bounded existing list RPC", async () => {
    const f = fixture();
    expect(
      await readEditorialWorkspace(f.client, { kind: "list", after: "" }),
    ).toEqual({ kind: "list", page: { rows: [row], next: null } });
    expect(f.rpc).toHaveBeenNthCalledWith(2, "pipstart_editorial_list", {
      p_after: "",
      p_limit: 26,
    });
    expect(f.rpc.mock.calls.map((x) => x[0])).toEqual([
      "pipstart_staff_access",
      "pipstart_editorial_list",
    ]);
  });
  it("refuses a changed Auth identity", async () => {
    const f = fixture();
    f.getUser
      .mockResolvedValueOnce({ data: { user: { id: actor } }, error: null })
      .mockResolvedValue({ data: { user: { id: "other" } }, error: null });
    expect(
      await readEditorialWorkspace(f.client, { kind: "list", after: "" }),
    ).toEqual({ kind: "denied" });
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it("rechecks access for every read", async () => {
    const f = fixture();
    await readEditorialWorkspace(f.client, { kind: "list", after: "" });
    f.rpc.mockImplementation(() => data({ authorized: false }));
    expect(
      await readEditorialWorkspace(f.client, { kind: "item", id: "lesson-1" }),
    ).toEqual({ kind: "denied" });
    expect(
      f.rpc.mock.calls.filter((x) => x[0] === "pipstart_staff_access"),
    ).toHaveLength(2);
  });
  it("supports resource-scoped authors through the authoritative filtered list", async () => {
    const f = fixture();
    f.rpc.mockImplementation((fn) =>
      data(
        fn === "pipstart_staff_access"
          ? {
              authorized: true,
              user_id: actor,
              roles: ["author"],
              capabilities: ["staff.enter"],
            }
          : [],
      ),
    );
    expect(
      await readEditorialWorkspace(f.client, { kind: "list", after: "" }),
    ).toEqual({ kind: "list", page: { rows: [], next: null } });
  });
  it("honors the item's database denial and strips raw errors", async () => {
    const f = fixture();
    const original = f.rpc.getMockImplementation()!;
    f.rpc.mockImplementation((fn) =>
      fn === "pipstart_editorial_item"
        ? data(null, {
            code: "42501",
            message: "private schema and account data",
          })
        : original(fn),
    );
    expect(
      await readEditorialWorkspace(f.client, { kind: "item", id: "lesson-1" }),
    ).toEqual({ kind: "denied" });
  });
  it("rejects malformed responses without leaking them", async () => {
    const f = fixture();
    const original = f.rpc.getMockImplementation()!;
    f.rpc.mockImplementation((fn) =>
      fn === "pipstart_editorial_list"
        ? data([{ ...row, secret: "private" }])
        : original(fn),
    );
    expect(
      await readEditorialWorkspace(f.client, { kind: "list", after: "" }),
    ).toEqual({ kind: "unavailable" });
  });
  it("bounds RPC reads with an abort signal", async () => {
    const f = fixture(),
      abortSignal = vi.fn(() => Promise.resolve({ data: [row], error: null })),
      original = f.rpc.getMockImplementation()!;
    f.rpc.mockImplementation((fn) =>
      fn === "pipstart_editorial_list" ? { abortSignal } : original(fn),
    );
    await readEditorialWorkspace(f.client, { kind: "list", after: "" });
    expect(abortSignal).toHaveBeenCalledWith(expect.any(AbortSignal));
  });
});
