import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
const mocks = vi.hoisted(() => ({ publication: vi.fn(), admin: vi.fn() }));
vi.mock("./publication", () => ({ runPublication: mocks.publication }));
vi.mock("../supabase/admin", () => ({
  createSupabaseAdminClient: mocks.admin,
}));
import {
  runPublicationDelivery,
  runPublicationWithDelivery,
} from "./publication-delivery";
import { validDeliveryInput } from "./publication-delivery-contract";
const actor = "d1000000-0000-4000-8000-000000000001",
  seal = "a".repeat(64);
const hook =
  "https://api.vercel.com/v1/integrations/deploy/TEST_ONLY_NOT_A_SECRET";
function fixture(role = "owner") {
  let generation = 4,
    state = "pending",
    attempts = 0;
  const response = (data: unknown, error: unknown = null) => ({
    abortSignal: vi.fn(async () => ({ data, error })),
  });
  const getUser = vi.fn(async () => ({
    data: { user: { id: actor } },
    error: null,
  }));
  const rpc = vi.fn((fn: string) =>
    fn === "pipstart_staff_access"
      ? response(
          role === "learner"
            ? { authorized: false }
            : {
                authorized: true,
                user_id: actor,
                roles: [role],
                capabilities: ["staff.enter"],
              },
        )
      : response({
          generation,
          refresh: { state, attempts, updated_at: "2026-11-06T10:00:00Z" },
        }),
  );
  const adminRpc = vi.fn((fn: string, args?: Record<string, unknown>) => {
    if (fn === "pipstart_publication_snapshot")
      return response({
        generation,
        snapshot_sha256: seal,
        snapshot: { PRIVATE_KEY: "NEVER_RETURN" },
      });
    if (fn === "pipstart_publication_verify_observed") {
      if (
        args?.p_generation !== generation ||
        args?.p_snapshot_sha256 !== seal ||
        args?.p_expected_attempts !== attempts ||
        !["processing", "failed"].includes(String(args?.p_expected_state)) ||
        (state !== "verified" && state !== args?.p_expected_state)
      )
        return response(null, { code: "PT409" });
      state = "verified";
      return response({ generation, state, attempts });
    }
    if (fn !== "pipstart_publication_refresh")
      throw Error("Unreviewed privileged operation");
    const next = args?.p_state;
    if (!(
      (["pending", "failed"].includes(state) &&
        next === "processing" &&
        attempts < 20) ||
      (state === "processing" && ["verified", "failed"].includes(String(next)))
    ))
      return response(null, { code: "55000", message: hook });
    state = String(next);
    if (state === "processing") attempts++;
    return response({ generation, state, attempts });
  });
  const send = vi.fn(async () => Response.json({ job: { id: "test-only" } }));
  const admin = vi.fn(() => ({ rpc: adminRpc }) as unknown as SupabaseClient);
  const client = { auth: { getUser }, rpc } as unknown as SupabaseClient;
  return {
    client,
    rpc,
    adminRpc,
    getUser,
    send,
    admin,
    deps: { send: send as typeof fetch, admin },
    set: (s: string, a = 0, g = 4) => {
      state = s;
      attempts = a;
      generation = g;
    },
    get: () => ({ state, attempts, generation }),
  };
}
const retry = { action: "retry", generation: 4 },
  check = { action: "check", generation: 4 };
const deployed = (patch: Record<string, unknown> = {}) =>
  Response.json({
    format: "pipstart-deployment-generation",
    generation: 4,
    snapshotSha256: seal,
    groups: ["analysis"],
    ...patch,
  });
beforeEach(() => {
  vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
  vi.stubEnv("PIPSTART_DEPLOY_HOOK_URL", hook);
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://pipstart.net");
  vi.stubEnv("PIPSTART_STORE_FAMILIES", "analysis");
  mocks.publication.mockReset();
  mocks.admin.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe("MP08b2b delivery boundary", () => {
  it("accepts exact commands only", () => {
    expect(validDeliveryInput(retry)).toBe(true);
    for (const v of [
      { ...retry, url: hook },
      { ...retry, generation: 0 },
      { ...retry, generation: 1.5 },
      { ...retry, generation: "4" },
      { action: "publish", generation: 4 },
      null,
    ])
      expect(validDeliveryInput(v)).toBe(false);
  });
  it("defaults closed and refuses malformed commands before Auth/admin/network", async () => {
    const f = fixture();
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "false");
    expect(await runPublicationDelivery(f.client, retry, f.deps)).toEqual({
      kind: "denied",
    });
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
    expect(
      await runPublicationDelivery(f.client, { ...retry, url: hook }, f.deps),
    ).toEqual({ kind: "invalid" });
    expect(f.getUser).not.toHaveBeenCalled();
    expect(f.admin).not.toHaveBeenCalled();
    expect(f.send).not.toHaveBeenCalled();
  });
  it.each(["author", "reviewer", "learner"])(
    "refuses %s before privileged operations",
    async (role) => {
      const f = fixture(role);
      expect(await runPublicationDelivery(f.client, retry, f.deps)).toEqual({
        kind: "denied",
      });
      expect(f.admin).not.toHaveBeenCalled();
      expect(f.send).not.toHaveBeenCalled();
    },
  );
  it("rechecks live session revocation", async () => {
    const f = fixture();
    f.getUser
      .mockResolvedValueOnce({ data: { user: { id: actor } }, error: null })
      .mockResolvedValueOnce({
        data: { user: { id: "another" } },
        error: null,
      });
    expect(await runPublicationDelivery(f.client, retry, f.deps)).toEqual({
      kind: "denied",
    });
    expect(f.admin).not.toHaveBeenCalled();
  });
  it("leaves absent delivery configuration pending", async () => {
    const f = fixture();
    vi.stubEnv("PIPSTART_DEPLOY_HOOK_URL", "");
    expect(await runPublicationDelivery(f.client, retry, f.deps)).toEqual({
      kind: "not-configured",
    });
    expect(f.get().state).toBe("pending");
    expect(f.admin).not.toHaveBeenCalled();
  });
  it.each([
    "http://api.vercel.com/v1/integrations/deploy/test",
    "https://evil.example/deploy",
    "https://api.vercel.com.evil.example/v1/integrations/deploy/test",
    "https://api.vercel.com/v1/integrations/deploy/test?redirect=x",
    "https://u:p@api.vercel.com/v1/integrations/deploy/test",
    "https://api.vercel.com:8443/v1/integrations/deploy/test",
    "http://127.0.0.1:1/test",
  ])("refuses unsafe production hook %#", async (url) => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PIPSTART_DEPLOY_HOOK_URL", url);
    const f = fixture();
    expect(await runPublicationDelivery(f.client, retry, f.deps)).toEqual({
      kind: "not-configured",
    });
    expect(f.send).not.toHaveBeenCalled();
  });
  it("claims before exactly one anonymous POST; no secrets returned", async () => {
    const f = fixture("editor");
    expect(await runPublicationDelivery(f.client, retry, f.deps)).toEqual({
      kind: "started",
    });
    expect(f.get()).toEqual({
      state: "processing",
      attempts: 1,
      generation: 4,
    });
    expect(f.send).toHaveBeenCalledTimes(1);
    const [url, init] = f.send.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe(hook);
    expect(init.method).toBe("POST");
    expect(init.redirect).toBe("error");
    expect(init.headers).toBeUndefined();
    expect(f.adminRpc.mock.calls.map((c) => c[0])).toEqual([
      "pipstart_publication_refresh",
    ]);
  });
  it("concurrent triggers have one SQL winner and one network send", async () => {
    const f = fixture();
    const r = await Promise.all([
      runPublicationDelivery(f.client, retry, f.deps),
      runPublicationDelivery(f.client, retry, f.deps),
    ]);
    expect(r.map((v) => v.kind).sort()).toEqual(["started", "state"]);
    expect(f.send).toHaveBeenCalledTimes(1);
    expect(f.get().attempts).toBe(1);
  });
  it.each(["processing", "verified", "superseded"])(
    "never triggers an existing %s job",
    async (state) => {
      const f = fixture();
      f.set(state, 1);
      expect(await runPublicationDelivery(f.client, retry, f.deps)).toEqual({
        kind: "state",
      });
      expect(f.send).not.toHaveBeenCalled();
    },
  );
  it("retries failed jobs only below the SQL cap", async () => {
    const f = fixture();
    f.set("failed", 19);
    expect(await runPublicationDelivery(f.client, retry, f.deps)).toEqual({
      kind: "started",
    });
    f.set("failed", 20);
    expect(await runPublicationDelivery(f.client, retry, f.deps)).toEqual({
      kind: "state",
    });
    expect(f.send).toHaveBeenCalledTimes(1);
  });
  it("does not send when claim acknowledgment is lost", async () => {
    const f = fixture();
    f.adminRpc.mockImplementationOnce(() => ({
      abortSignal: vi.fn(async () => {
        throw Error(hook);
      }),
    }));
    expect(await runPublicationDelivery(f.client, retry, f.deps)).toEqual({
      kind: "unknown",
    });
    expect(f.send).not.toHaveBeenCalled();
  });
  it("refuses stale generation without claiming", async () => {
    const f = fixture();
    f.set("pending", 0, 5);
    expect(await runPublicationDelivery(f.client, retry, f.deps)).toEqual({
      kind: "superseded",
    });
    expect(f.admin).not.toHaveBeenCalled();
  });
  it("marks rejected hook failed with a sanitized note, never retries", async () => {
    const f = fixture();
    f.send.mockResolvedValue(new Response(hook, { status: 503 }));
    const result = await runPublicationDelivery(f.client, retry, f.deps);
    expect(result).toEqual({ kind: "failed" });
    expect(f.get().state).toBe("failed");
    expect(f.send).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(f.adminRpc.mock.calls)).not.toContain(hook);
    expect(JSON.stringify(result)).not.toContain(hook);
  });
  it.each(["headers", "body"])(
    "bounds stalled %s even if transport ignores abort",
    async (where) => {
      vi.useFakeTimers();
      const f = fixture();
      f.send.mockImplementation(() =>
        where === "headers"
          ? new Promise<Response>(() => {})
          : Promise.resolve(new Response(new ReadableStream({ start() {} }))),
      );
      const task = runPublicationDelivery(f.client, retry, f.deps);
      await vi.advanceTimersByTimeAsync(8100);
      expect(await task).toEqual({ kind: "failed" });
      expect(f.send).toHaveBeenCalledTimes(1);
    },
  );
  it("refuses oversized successful hook bodies", async () => {
    const f = fixture();
    f.send.mockResolvedValue(new Response("x".repeat(4097)));
    expect(await runPublicationDelivery(f.client, retry, f.deps)).toEqual({
      kind: "failed",
    });
  });
  it("checks anonymously without resending publication or hook and verifies exact evidence", async () => {
    const f = fixture();
    f.set("processing", 2);
    f.send.mockResolvedValue(deployed());
    expect(await runPublicationDelivery(f.client, check, f.deps)).toEqual({
      kind: "verified",
    });
    expect(f.get().state).toBe("verified");
    const [url, init] = f.send.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://pipstart.net/live-generation.json");
    expect(init.credentials).toBe("omit");
    expect(init.cache).toBe("no-store");
    expect(init.headers).toEqual({ Accept: "application/json" });
    expect(
      JSON.stringify(await runPublicationDelivery(f.client, check, f.deps)),
    ).not.toContain("PRIVATE_KEY");
  });
  it.each([
    { generation: 3 },
    { generation: null, snapshotSha256: null, groups: [] },
  ])("reports older/no store deployment without mutation %#", async (patch) => {
    const f = fixture();
    f.set("processing", 1);
    f.send.mockResolvedValue(deployed(patch));
    expect(await runPublicationDelivery(f.client, check, f.deps)).toEqual({
      kind: "delivering",
    });
    expect(f.get().state).toBe("processing");
    expect(f.adminRpc.mock.calls.map((c) => c[0])).toEqual([
      "pipstart_publication_snapshot",
    ]);
  });
  it.each([
    { snapshotSha256: "b".repeat(64) },
    { groups: [] },
    { groups: ["curriculum"] },
    { groups: ["analysis", "analysis"] },
    { generation: 5 },
    { extra: "private" },
    { format: "wrong" },
  ])("never verifies mismatched evidence %#", async (patch) => {
    const f = fixture();
    f.set("processing", 1);
    f.send.mockResolvedValue(deployed(patch));
    expect(await runPublicationDelivery(f.client, check, f.deps)).toEqual({
      kind: "different",
    });
    expect(f.get().state).toBe("processing");
  });
  it.each(["unreachable", "invalid", "oversized"])(
    "leaves delivery unchanged when live site is %s",
    async (mode) => {
      const f = fixture();
      f.set("processing", 1);
      f.send.mockImplementation(async () => {
        if (mode === "unreachable") throw Error(hook);
        return new Response(mode === "invalid" ? "bad json" : "x".repeat(4097));
      });
      expect(await runPublicationDelivery(f.client, check, f.deps)).toEqual({
        kind: "unreachable",
      });
      expect(f.get().state).toBe("processing");
    },
  );
  it("requires explicitly switched groups before verification", async () => {
    const f = fixture();
    vi.stubEnv("PIPSTART_STORE_FAMILIES", "");
    expect(await runPublicationDelivery(f.client, check, f.deps)).toEqual({
      kind: "not-configured",
    });
    expect(f.send).not.toHaveBeenCalled();
  });
  it("refuses a changed generation between check and commit", async () => {
    const f = fixture();
    f.set("processing", 1);
    f.send.mockImplementation(async () => {
      f.set("processing", 1, 5);
      return deployed();
    });
    expect(await runPublicationDelivery(f.client, check, f.deps)).toEqual({
      kind: "superseded",
    });
    expect(f.adminRpc.mock.calls.map((c) => c[0])).toEqual([
      "pipstart_publication_snapshot",
    ]);
  });
  it("preserves uncertain publication without delivery", async () => {
    const f = fixture();
    mocks.publication.mockResolvedValue({ kind: "uncertain" });
    expect(await runPublicationWithDelivery(f.client, {})).toEqual({
      kind: "uncertain",
    });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it("never retriggers a replayed publication", async () => {
    const f = fixture();
    mocks.publication.mockResolvedValue({
      kind: "done",
      generation: 4,
      replayed: true,
    });
    expect(await runPublicationWithDelivery(f.client, {})).toEqual({
      kind: "done",
      generation: 4,
      replayed: true,
    });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it("keeps confirmed publication done when delivery unavailable", async () => {
    const f = fixture();
    mocks.publication.mockResolvedValue({
      kind: "done",
      generation: 4,
      replayed: false,
    });
    vi.stubEnv("PIPSTART_DEPLOY_HOOK_URL", "");
    expect(await runPublicationWithDelivery(f.client, {})).toEqual({
      kind: "done",
      generation: 4,
      replayed: false,
      delivery: "not-configured",
    });
  });
});

// Delivery is composed only after the user-context publication has a confirmed new result.
it.each(["baseline", "publish", "withdraw", "restore"])(
  "automatically requests one delivery after confirmed %s",
  async (action) => {
    const f = fixture();
    mocks.publication.mockResolvedValue({
      kind: "done",
      generation: 4,
      replayed: false,
    });
    mocks.admin.mockReturnValue(f.admin());
    vi.stubGlobal("fetch", f.send);
    expect(await runPublicationWithDelivery(f.client, { action })).toEqual({
      kind: "done",
      generation: 4,
      replayed: false,
      delivery: "started",
    });
    expect(mocks.publication).toHaveBeenCalledTimes(1);
    expect(f.send).toHaveBeenCalledTimes(1);
  },
);

describe("MP08 observed deployment reconciliation", () => {
  it.each(["processing", "failed"])(
    "verifies %s at the attempt cap with GET only and no new attempt",
    async (state) => {
      const f = fixture();
      f.set(state, 20);
      f.send.mockImplementation(async () => deployed());
      expect(await runPublicationDelivery(f.client, check, f.deps)).toEqual({
        kind: "verified",
      });
      expect(f.get()).toEqual({
        state: "verified",
        attempts: 20,
        generation: 4,
      });
      expect(f.send).toHaveBeenCalledTimes(1);
      expect(
        (f.send.mock.calls[0] as unknown as [string, RequestInit])[1].method,
      ).toBe("GET");
      expect(f.adminRpc.mock.calls.map((c) => c[0])).toEqual([
        "pipstart_publication_snapshot",
        "pipstart_publication_verify_observed",
      ]);
      expect(await runPublicationDelivery(f.client, check, f.deps)).toEqual({
        kind: "verified",
      });
      expect(f.get().attempts).toBe(20);
    },
  );
  it.each(["author", "reviewer", "learner"])(
    "denies %s check without network/admin calls",
    async (role) => {
      const f = fixture(role);
      f.set("failed", 1);
      expect(await runPublicationDelivery(f.client, check, f.deps)).toEqual({
        kind: "denied",
      });
      expect(f.send).not.toHaveBeenCalled();
      expect(f.admin).not.toHaveBeenCalled();
    },
  );
  it.each(["attempt", "state"])(
    "refuses concurrent %s change during observation",
    async (mode) => {
      const f = fixture();
      f.set("failed", 1);
      f.send.mockImplementation(async () => {
        f.set("processing", mode === "attempt" ? 2 : 1);
        return deployed();
      });
      expect(await runPublicationDelivery(f.client, check, f.deps)).toEqual({
        kind: "state",
      });
      expect(f.adminRpc.mock.calls.map((c) => c[0])).toEqual([
        "pipstart_publication_snapshot",
      ]);
    },
  );
  it.each([
    { generation: 5 },
    { snapshotSha256: "b".repeat(64) },
    { groups: ["curriculum"] },
  ])("keeps failed receipt untouched for mismatch %#", async (patch) => {
    const f = fixture();
    f.set("failed", 1);
    f.send.mockResolvedValue(deployed(patch));
    expect(await runPublicationDelivery(f.client, check, f.deps)).toEqual({
      kind: "different",
    });
    expect(f.get().state).toBe("failed");
    expect(f.adminRpc.mock.calls.map((c) => c[0])).toEqual([
      "pipstart_publication_snapshot",
    ]);
  });
  it.each(["55000", "PT409", "XX000"])(
    "handles verification RPC %s without POST",
    async (code) => {
      const f = fixture();
      f.set("failed", 1);
      f.send.mockResolvedValue(deployed());
      const original = f.adminRpc.getMockImplementation()!;
      f.adminRpc.mockImplementation((fn, args) =>
        fn === "pipstart_publication_verify_observed"
          ? {
              abortSignal: vi.fn(async () => ({ data: null, error: { code } })),
            }
          : original(fn, args),
      );
      expect(await runPublicationDelivery(f.client, check, f.deps)).toEqual({
        kind: code === "XX000" ? "unknown" : "state",
      });
      expect(f.send).toHaveBeenCalledTimes(1);
      expect(f.get().state).toBe("failed");
    },
  );
});
