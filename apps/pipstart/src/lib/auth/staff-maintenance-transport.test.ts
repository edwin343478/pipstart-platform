import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { runMaintenanceTransport } from "./staff-maintenance-transport";
const request = "d9000000-0000-4000-8000-000000000001",
  actor = "d1000000-0000-4000-8000-000000000003",
  target = "d1000000-0000-4000-8000-000000000005",
  permitId = "d7000000-0000-4000-8000-000000000001",
  dispatch = "d8000000-0000-4000-8000-000000000001",
  token = "a".repeat(64),
  permit = "b".repeat(64);
const proof = {
  request,
  mode: "dispatch",
  token,
  expiresAt: "2099-01-01T00:00:00Z",
};
const reply = (data: unknown, error: unknown = null) => ({
  abortSignal: () => Promise.resolve({ data, error }),
});
function fixture() {
  const getUser = vi
    .fn()
    .mockResolvedValue({ data: { user: { id: actor } }, error: null });
  const claim = vi.fn(() =>
    reply({
      request_id: request,
      permit_id: permitId,
      permit,
      expires_at: proof.expiresAt,
      status: "execution_permitted",
    }),
  );
  const update = vi.fn().mockResolvedValue({
    data: { user: { id: target, banned_until: null } },
    error: null,
  });
  const inspect = vi.fn().mockResolvedValue({
    data: { user: { id: target, banned_until: null } },
    error: null,
  });
  const rpc = vi.fn((name: string, p: Record<string, unknown>) =>
    reply(
      name.endsWith("_take")
        ? {
            request_id: request,
            status: "dispatch_authorized",
            dispatch_id: dispatch,
            target_id: target,
            operation: "auth_resume",
            factor_id: null,
            suspend_until: null,
          }
        : { request_id: request, status: "recorded", state: p.p_outcome },
    ),
  );
  return {
    getUser,
    claim,
    update,
    inspect,
    rpc,
    user: { auth: { getUser }, rpc: claim } as unknown as SupabaseClient,
    service: {
      auth: { admin: { updateUserById: update, getUserById: inspect } },
      rpc,
    } as unknown as SupabaseClient,
  };
}
beforeEach(() => {
  vi.stubEnv("PIPSTART_M22_STAFF_MAINTENANCE_ENABLED", "true");
  vi.stubEnv("PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED", "true");
});
afterEach(() => vi.unstubAllEnvs());
describe("paused Owner maintenance server boundary", () => {
  it.each([
    "PIPSTART_M22_STAFF_MAINTENANCE_ENABLED",
    "PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED",
  ])("defaults closed when %s is not exact true", async (key) => {
    vi.stubEnv(key, "TRUE");
    const f = fixture();
    expect(await runMaintenanceTransport(f.user, f.service, proof)).toEqual({
      kind: "disabled",
    });
    expect(f.claim).not.toHaveBeenCalled();
  });
  it.each([
    null,
    { ...proof, actor },
    { ...proof, target },
    { ...proof, mode: "retire" },
    { ...proof, token: "bad" },
    { ...proof, expiresAt: "bad" },
    { ...proof, request: request.toUpperCase() },
  ])("rejects malformed or extra authority fields %#", async (input) => {
    const f = fixture();
    expect(await runMaintenanceTransport(f.user, f.service, input)).toEqual({
      kind: "invalid",
    });
    expect(f.getUser).not.toHaveBeenCalled();
  });
  it("rejects expired proof before any call", async () => {
    const f = fixture();
    expect(
      await runMaintenanceTransport(f.user, f.service, {
        ...proof,
        expiresAt: "2020-01-01",
      }),
    ).toEqual({ kind: "denied" });
    expect(f.claim).not.toHaveBeenCalled();
  });
  it("requires a provider-validated user", async () => {
    const f = fixture();
    f.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect(await runMaintenanceTransport(f.user, f.service, proof)).toEqual({
      kind: "denied",
    });
    expect(f.claim).not.toHaveBeenCalled();
  });
  it("does not call provider after denied claim", async () => {
    const f = fixture();
    f.claim.mockImplementation(() => reply(null, { code: "42501" }));
    expect(await runMaintenanceTransport(f.user, f.service, proof)).toEqual({
      kind: "denied",
    });
    expect(f.rpc).not.toHaveBeenCalled();
    expect(f.update).not.toHaveBeenCalled();
  });
  it.each(["permit", "permit_id", "request_id", "status", "expires_at"])(
    "refuses malformed claim %s",
    async (key) => {
      const f = fixture();
      f.claim.mockImplementation(() =>
        reply({
          request_id: request,
          permit_id: permitId,
          permit,
          expires_at: proof.expiresAt,
          status: "execution_permitted",
          [key]: "bad",
        }),
      );
      expect(await runMaintenanceTransport(f.user, f.service, proof)).toEqual({
        kind: "unknown",
      });
      expect(f.rpc).not.toHaveBeenCalled();
    },
  );
  it("performs exactly one bound dispatch and records its matching acknowledgment", async () => {
    const f = fixture();
    expect(await runMaintenanceTransport(f.user, f.service, proof)).toEqual({
      kind: "recorded",
      request,
      outcome: "succeeded",
    });
    expect(f.claim).toHaveBeenCalledWith("pipstart_staff_maintenance_claim", {
      p_request: request,
      p_mode: "dispatch",
      p_token: token,
    });
    expect(f.update).toHaveBeenCalledExactlyOnceWith(target, {
      ban_duration: "none",
    });
    expect(f.rpc).toHaveBeenNthCalledWith(
      1,
      "pipstart_staff_maintenance_take",
      {
        p_request: request,
        p_permit_id: permitId,
        p_permit: permit,
        p_token: token,
      },
    );
    expect(f.rpc).toHaveBeenNthCalledWith(
      2,
      "pipstart_staff_maintenance_result",
      {
        p_request: request,
        p_permit_id: permitId,
        p_permit: permit,
        p_dispatch: dispatch,
        p_outcome: "succeeded",
      },
    );
  });
  it("keeps lost provider response uncertain and never retries", async () => {
    const f = fixture();
    f.update.mockRejectedValue(Error("private detail"));
    expect(await runMaintenanceTransport(f.user, f.service, proof)).toEqual({
      kind: "recorded",
      request,
      outcome: "unknown",
    });
    expect(f.update).toHaveBeenCalledTimes(1);
  });
  it("does not dispatch after a lost take response", async () => {
    const f = fixture();
    f.rpc.mockImplementation(() => ({
      abortSignal: () => Promise.reject(Error("lost")),
    }));
    expect(await runMaintenanceTransport(f.user, f.service, proof)).toEqual({
      kind: "unknown",
    });
    expect(f.update).not.toHaveBeenCalled();
  });
  it("keeps an acknowledgment recording loss uncertain", async () => {
    const f = fixture();
    f.rpc.mockImplementation((name: string) =>
      name.endsWith("_result")
        ? reply(null, { code: "lost" })
        : reply({
            request_id: request,
            status: "dispatch_authorized",
            dispatch_id: dispatch,
            target_id: target,
            operation: "auth_resume",
            factor_id: null,
            suspend_until: null,
          }),
    );
    expect(await runMaintenanceTransport(f.user, f.service, proof)).toEqual({
      kind: "unknown",
    });
    expect(f.update).toHaveBeenCalledTimes(1);
  });
  it("inspection only reads provider and does not resolve the journal", async () => {
    const f = fixture();
    f.rpc.mockImplementation(() =>
      reply({
        request_id: request,
        status: "inspection_authorized",
        target_id: target,
        operation: "auth_resume",
        suspend_until: null,
        state: "unknown",
      }),
    );
    expect(
      await runMaintenanceTransport(f.user, f.service, {
        ...proof,
        mode: "inspect",
      }),
    ).toEqual({
      kind: "observed",
      request,
      journalState: "unknown",
      observation: "desired",
    });
    expect(f.update).not.toHaveBeenCalled();
    expect(f.inspect).toHaveBeenCalledTimes(1);
    expect(f.rpc).toHaveBeenCalledTimes(1);
  });
});
