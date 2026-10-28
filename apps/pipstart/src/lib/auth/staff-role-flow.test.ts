import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const verification = vi.hoisted(() => vi.fn());
vi.mock("./staff-mfa-flow", () => ({ verifyStaffFactor: verification }));
import {
  completeRoleIntent,
  mayChangeRole,
  prepareRoleIntent,
  readLiveStaffAccess,
  readLiveStaffPeople,
  validRoleCommand,
  STAFF_ROLES,
  type LiveStaffAccess,
  type RoleCommand,
  type RoleIntent,
} from "./staff-role-flow";
const actor = "2d734acd-a974-45f1-aabc-bc9b0a37fb40",
  target = "d81ca71d-b4ba-4ef2-83df-0417222bfe5c";
const command: RoleCommand = {
  target,
  operation: "grant_role",
  value: "author",
  reason: "staff_onboarding",
};
function access(
  capabilities: LiveStaffAccess["capabilities"] = [
    "staff.enter",
    "people.read",
    "roles.manage",
  ],
): LiveStaffAccess {
  return { authorized: true, user_id: actor, roles: ["owner"], capabilities };
}
function fixture() {
  const live = { value: access() };
  const results: Record<string, { data: unknown; error: unknown }> = {
    pipstart_staff_people: {
      data: {
        items: [
          {
            user_id: target,
            display_name: "Test Person",
            created_at: "2026-10-27T00:00:00Z",
            staff_active: true,
            staff_roles: ["author"],
          },
        ],
        next_after: null,
      },
      error: null,
    },
    pipstart_staff_receipt: {
      data: { status: "issued", expires_at: "2026-10-27T12:00:00Z" },
      error: null,
    },
  };
  const abort = vi.fn(async (name: string, args: Record<string, unknown>) =>
    name === "pipstart_staff_access"
      ? { data: live.value, error: null }
      : name === "pipstart_staff_change"
        ? {
            data: {
              status: args.p_token === "" ? "already_recorded" : "changed",
              request_id: args.p_request,
            },
            error: null,
          }
        : results[name],
  );
  const rpc = vi.fn((name: string, args: Record<string, unknown>) => ({
    abortSignal: (signal: AbortSignal) => {
      expect(signal).toBeInstanceOf(AbortSignal);
      return abort(name, args);
    },
  }));
  const getUser = vi.fn().mockResolvedValue({
    data: { user: { id: actor, user_metadata: { role: "owner" } } },
    error: null,
  });
  return {
    client: { auth: { getUser }, rpc } as unknown as SupabaseClient,
    getUser,
    rpc,
    abort,
    live,
    results,
  };
}
const intent: RoleIntent = {
  actor,
  command,
  request: "40000000-0000-4000-8000-000000000001",
  token: "a".repeat(64),
  expiresAt: "2026-10-27T12:00:00Z",
};
beforeEach(() =>
  verification.mockReset().mockResolvedValue({ kind: "verified" }),
);
afterEach(() => vi.useRealTimers());
describe("live people read boundary", () => {
  it("loads a bounded minimized page after checking the live identity and grants", async () => {
    const f = fixture();
    const result = await readLiveStaffPeople(f.client, actor, "Test");
    expect(result.kind).toBe("ready");
    expect(f.rpc.mock.calls.map((c) => c[0])).toEqual([
      "pipstart_staff_access",
      "pipstart_staff_people",
    ]);
    expect(f.rpc.mock.calls[1][1]).toEqual({
      p_after: null,
      p_limit: 25,
      p_query: "Test",
      p_user: null,
    });
    expect(result).not.toHaveProperty("email");
  });
  it.each(["x", " trailing ", "x".repeat(61)])(
    "rejects invalid search %s without a provider call",
    async (query) => {
      const f = fixture();
      expect((await readLiveStaffPeople(f.client, actor, query)).kind).toBe(
        "invalid",
      );
      expect(f.getUser).not.toHaveBeenCalled();
    },
  );
  it("refuses malformed cursors", async () => {
    const f = fixture();
    expect((await readLiveStaffPeople(f.client, actor, "", "bad")).kind).toBe(
      "invalid",
    );
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it("ignores editable owner metadata when people.read is absent", async () => {
    const f = fixture();
    f.live.value = access(["staff.enter"]);
    expect((await readLiveStaffPeople(f.client, actor)).kind).toBe("denied");
    expect(f.rpc).toHaveBeenCalledTimes(1);
  });
  it("refuses another signed-in account before querying staff data", async () => {
    const f = fixture();
    f.getUser.mockResolvedValue({
      data: { user: { id: target } },
      error: null,
    });
    expect((await readLiveStaffPeople(f.client, actor)).kind).toBe("denied");
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it("does not display private fields from a malformed people response", async () => {
    const f = fixture();
    f.results.pipstart_staff_people.data = {
      items: [{ email: "private-sentinel" }],
      next_after: null,
    };
    expect(await readLiveStaffPeople(f.client, actor)).toEqual({
      kind: "unavailable",
    });
  });
  it("rejects a repeated or regressing keyset page", async () => {
    const f = fixture();
    expect((await readLiveStaffPeople(f.client, actor, "", target)).kind).toBe(
      "unavailable",
    );
  });
  it("fails closed on a revoked DB grant", async () => {
    const f = fixture();
    f.results.pipstart_staff_people = {
      data: null,
      error: { code: "42501", message: "private-sentinel" },
    };
    expect(await readLiveStaffPeople(f.client, actor)).toEqual({
      kind: "denied",
    });
  });
  it("redacts failed reads and does not fall back to Auth exports", async () => {
    const f = fixture();
    f.abort.mockRejectedValue(Error("private-sentinel"));
    expect(await readLiveStaffPeople(f.client, actor)).toEqual({
      kind: "unavailable",
    });
  });
  it("bounds stalled identity lookup", async () => {
    vi.useFakeTimers();
    const f = fixture();
    f.getUser.mockReturnValue(new Promise(() => {}));
    const result = readLiveStaffAccess(f.client, actor);
    await vi.advanceTimersByTimeAsync(8000);
    expect(await result).toEqual({ kind: "unavailable" });
    expect(f.rpc).not.toHaveBeenCalled();
  });
});
describe("role commands and fresh receipt preparation", () => {
  it.each(STAFF_ROLES)("accepts the fixed role %s for an Owner", (value) => {
    expect(mayChangeRole(access(), { ...command, value })).toBe(true);
  });
  it.each(["owner", "administrator"] as const)(
    "does not offer delegated %s grants",
    (value) => {
      expect(
        mayChangeRole(access(["staff.enter", "roles.delegate"]), {
          ...command,
          value,
        }),
      ).toBe(false);
    },
  );
  it("refuses self-grants and delegated self-edits", () => {
    expect(mayChangeRole(access(), { ...command, target: actor })).toBe(false);
    expect(
      mayChangeRole(access(["staff.enter", "roles.delegate"]), {
        ...command,
        target: actor,
        operation: "revoke_role",
      }),
    ).toBe(false);
  });
  it.each([
    { ...command, extra: true },
    { ...command, target: "bad" },
    { ...command, operation: "suspend" },
    { ...command, value: "superuser" },
    { ...command, reason: "free text" },
  ])("rejects malformed or widened commands %#", (value) =>
    expect(validRoleCommand(value as RoleCommand)).toBe(false),
  );
  it("verifies once, rechecks live grants, then binds an unguessable in-memory token to the exact command", async () => {
    const f = fixture();
    const result = await prepareRoleIntent(
      f.client,
      actor,
      command,
      target,
      "012345",
    );
    expect(result.kind).toBe("ready");
    expect(verification).toHaveBeenCalledExactlyOnceWith(
      f.client,
      actor,
      target,
      "012345",
    );
    expect(f.rpc.mock.calls.map((c) => c[0])).toEqual([
      "pipstart_staff_access",
      "pipstart_staff_access",
      "pipstart_staff_receipt",
    ]);
    if (result.kind !== "ready") throw Error("expected ready");
    expect(result.intent.token).toMatch(/^[a-f0-9]{64}$/);
    expect(Object.isFrozen(result.intent)).toBe(true);
    expect(Object.isFrozen(result.intent.command)).toBe(true);
    expect(f.rpc.mock.calls[2][1]).toEqual({
      p_target: target,
      p_operation: "grant_role",
      p_value: "author",
      p_kind: "",
      p_id: "",
      p_token: result.intent.token,
    });
    expect(result.intent).not.toHaveProperty("code");
  });
  it("does not mutate roles during preparation", async () => {
    const f = fixture();
    await prepareRoleIntent(f.client, actor, command, target, "012345");
    expect(f.rpc.mock.calls.some((c) => c[0] === "pipstart_staff_change")).toBe(
      false,
    );
  });
  it("freezes the command before the async verification step", async () => {
    const f = fixture();
    const mutable = { ...command };
    verification.mockImplementation(async () => {
      mutable.value = "owner";
      return { kind: "verified" };
    });
    const result = await prepareRoleIntent(
      f.client,
      actor,
      mutable,
      target,
      "012345",
    );
    expect(result.kind === "ready" && result.intent.command.value).toBe(
      "author",
    );
  });
  it("stops before verification if grants were revoked", async () => {
    const f = fixture();
    f.live.value = access(["staff.enter"]);
    expect(
      (await prepareRoleIntent(f.client, actor, command, target, "012345"))
        .kind,
    ).toBe("denied");
    expect(verification).not.toHaveBeenCalled();
  });
  it("rechecks revocation after successful verification", async () => {
    const f = fixture();
    verification.mockImplementation(async () => {
      f.live.value = access(["staff.enter"]);
      return { kind: "verified" };
    });
    expect(
      (await prepareRoleIntent(f.client, actor, command, target, "012345"))
        .kind,
    ).toBe("denied");
    expect(
      f.rpc.mock.calls.some((c) => c[0] === "pipstart_staff_receipt"),
    ).toBe(false);
  });
  it.each(["invalid", "rejected", "unknown", "changed"])(
    "does not issue a receipt after verification result %s",
    async (kind) => {
      const f = fixture();
      verification.mockResolvedValue({ kind });
      const result = await prepareRoleIntent(
        f.client,
        actor,
        command,
        target,
        "012345",
      );
      expect(result.kind).toBe(
        ["invalid", "rejected"].includes(kind) ? kind : "unknown",
      );
      expect(f.rpc).toHaveBeenCalledTimes(1);
    },
  );
  it("does not retry an uncertain receipt issuance", async () => {
    const f = fixture();
    f.results.pipstart_staff_receipt = {
      data: null,
      error: { message: "secret-sentinel" },
    };
    expect(
      await prepareRoleIntent(f.client, actor, command, target, "012345"),
    ).toEqual({ kind: "unknown" });
    expect(
      f.rpc.mock.calls.filter((c) => c[0] === "pipstart_staff_receipt"),
    ).toHaveLength(1);
  });
  it.each([
    { status: "issued", expires_at: "bad" },
    {
      status: "issued",
      expires_at: "2026-10-27T12:00:00Z",
      secret: "sentinel",
    },
    { status: "success", expires_at: "2026-10-27T12:00:00Z" },
  ])("refuses unexpected receipt shapes %#", async (data) => {
    const f = fixture();
    f.results.pipstart_staff_receipt = { data, error: null };
    expect(
      (await prepareRoleIntent(f.client, actor, command, target, "012345"))
        .kind,
    ).toBe("unknown");
  });
});
describe("confirmed role mutation and outcome reconciliation", () => {
  it("rechecks identity and grants before the single exact user-context mutation", async () => {
    const f = fixture();
    expect(await completeRoleIntent(f.client, intent)).toEqual({
      kind: "complete",
      status: "changed",
      request: intent.request,
    });
    expect(f.rpc.mock.calls[1]).toEqual([
      "pipstart_staff_change",
      {
        p_target: target,
        p_operation: "grant_role",
        p_value: "author",
        p_kind: "",
        p_id: "",
        p_token: intent.token,
        p_request: intent.request,
        p_reason: "staff_onboarding",
      },
    ]);
  });
  it("checks an unknown outcome using the same request with an empty proof token", async () => {
    const f = fixture();
    expect(await completeRoleIntent(f.client, intent, true)).toEqual({
      kind: "complete",
      status: "already_recorded",
      request: intent.request,
    });
    expect(f.rpc.mock.calls[1][1].p_token).toBe("");
    expect(f.rpc.mock.calls[1][1].p_request).toBe(intent.request);
  });
  it("does not call an absent audit record a confirmed failure", async () => {
    const f = fixture();
    f.abort.mockImplementation(async (name) =>
      name === "pipstart_staff_access"
        ? { data: access(), error: null }
        : { data: null, error: { code: "42501" } },
    );
    expect(await completeRoleIntent(f.client, intent, true)).toEqual({
      kind: "unknown",
    });
  });
  it("denies an already-open tab after revocation", async () => {
    const f = fixture();
    f.live.value = access(["staff.enter"]);
    expect((await completeRoleIntent(f.client, intent)).kind).toBe("denied");
    expect(f.rpc).toHaveBeenCalledTimes(1);
  });
  it("denies a switched account before any mutation", async () => {
    const f = fixture();
    f.getUser.mockResolvedValue({
      data: { user: { id: target } },
      error: null,
    });
    expect((await completeRoleIntent(f.client, intent)).kind).toBe("denied");
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it.each(["42501", "22023"])(
    "treats a transactional DB refusal %s as rejected",
    async (code) => {
      const f = fixture();
      f.abort.mockImplementation(async (name) =>
        name === "pipstart_staff_access"
          ? { data: access(), error: null }
          : { data: null, error: { code, message: "private-sentinel" } },
      );
      expect(await completeRoleIntent(f.client, intent)).toEqual({
        kind: "rejected",
      });
    },
  );
  it("does not retry an uncertain mutation or report it as success", async () => {
    const f = fixture();
    f.abort.mockImplementation(async (name) => {
      if (name === "pipstart_staff_access")
        return { data: access(), error: null };
      throw Error("private-sentinel");
    });
    expect(await completeRoleIntent(f.client, intent)).toEqual({
      kind: "unknown",
    });
    expect(
      f.rpc.mock.calls.filter((c) => c[0] === "pipstart_staff_change"),
    ).toHaveLength(1);
  });
  it.each([
    { status: "changed", request_id: target },
    { status: "changed", request_id: intent.request, email: "sentinel" },
    { status: "success", request_id: intent.request },
  ])("refuses malformed mutation success %#", async (data) => {
    const f = fixture();
    f.abort.mockImplementation(async (name) =>
      name === "pipstart_staff_access"
        ? { data: access(), error: null }
        : { data, error: null },
    );
    expect((await completeRoleIntent(f.client, intent)).kind).toBe("unknown");
  });
  it("refuses malformed in-memory intents", async () => {
    const f = fixture();
    expect(
      (await completeRoleIntent(f.client, { ...intent, token: "bad" })).kind,
    ).toBe("invalid");
    expect(f.getUser).not.toHaveBeenCalled();
  });
});
