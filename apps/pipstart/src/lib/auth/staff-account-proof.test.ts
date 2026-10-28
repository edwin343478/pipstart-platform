import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authorizeStaffAccountRequest } from "./staff-account-proof";
const { verify } = vi.hoisted(() => ({ verify: vi.fn() }));
vi.mock("./staff-mfa-flow", () => ({ verifyStaffFactor: verify }));
const actor = "a1000000-0000-4000-8000-000000000001",
  request = "a2000000-0000-4000-8000-000000000002",
  factor = "a3000000-0000-4000-8000-000000000003";
function fixture() {
  const identity = vi
    .fn()
    .mockResolvedValue({ data: { user: { id: actor } }, error: null });
  const abortSignal = vi.fn().mockResolvedValue({
    data: { status: "issued", expires_at: "2099-01-01T00:00:00Z" },
    error: null,
  });
  const rpc = vi.fn((_name: string, _args: Record<string, unknown>) => ({
    abortSignal,
  }));
  return {
    client: { auth: { getUser: identity }, rpc } as unknown as SupabaseClient,
    identity,
    rpc,
    abortSignal,
  };
}
beforeEach(() => {
  verify.mockReset();
  verify.mockResolvedValue({ kind: "verified" });
});
afterEach(() => {
  vi.resetAllMocks();
});
describe("paused Owner account proof preparation", () => {
  it("binds a fresh verification to exact request and mode", async () => {
    const f = fixture();
    const result = await authorizeStaffAccountRequest(
      f.client,
      actor,
      request,
      "dispatch",
      factor,
      "123456",
    );
    expect(result.kind).toBe("ready");
    expect(verify).toHaveBeenCalledExactlyOnceWith(
      f.client,
      actor,
      factor,
      "123456",
    );
    expect(f.identity).toHaveBeenCalledTimes(2);
    const args = f.rpc.mock.calls[0] as unknown as [
      string,
      { p_request: string; p_mode: string; p_token: string },
    ];
    expect(args[0]).toBe("pipstart_staff_account_receipt");
    expect(args[1]).toEqual({
      p_request: request,
      p_mode: "dispatch",
      p_token: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
    if (result.kind === "ready") {
      expect(Object.isFrozen(result.proof)).toBe(true);
      expect(Object.keys(result.proof).sort()).toEqual([
        "expiresAt",
        "mode",
        "request",
        "token",
      ]);
    }
  });
  it("binds inspection separately", async () => {
    const f = fixture();
    await authorizeStaffAccountRequest(
      f.client,
      actor,
      request,
      "inspect",
      factor,
      "123456",
    );
    expect(f.rpc.mock.calls[0][1].p_mode).toBe("inspect");
  });
  it.each(["bad", "", request.toUpperCase()])(
    "rejects invalid request %s before MFA",
    async (id) => {
      const f = fixture();
      expect(
        await authorizeStaffAccountRequest(
          f.client,
          actor,
          id,
          "dispatch",
          factor,
          "123456",
        ),
      ).toEqual({ kind: "invalid" });
      expect(verify).not.toHaveBeenCalled();
      expect(f.rpc).not.toHaveBeenCalled();
    },
  );
  it("denies changed initial identity", async () => {
    const f = fixture();
    f.identity.mockResolvedValue({
      data: { user: { id: request } },
      error: null,
    });
    expect(
      await authorizeStaffAccountRequest(
        f.client,
        actor,
        request,
        "dispatch",
        factor,
        "123456",
      ),
    ).toEqual({ kind: "denied" });
    expect(verify).not.toHaveBeenCalled();
  });
  it("denies identity change after verification", async () => {
    const f = fixture();
    f.identity
      .mockResolvedValueOnce({ data: { user: { id: actor } }, error: null })
      .mockResolvedValueOnce({ data: { user: null }, error: null });
    expect(
      await authorizeStaffAccountRequest(
        f.client,
        actor,
        request,
        "dispatch",
        factor,
        "123456",
      ),
    ).toEqual({ kind: "denied" });
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it.each(["rejected", "invalid", "unknown", "unavailable", "changed"])(
    "does not issue proof after %s MFA",
    async (kind) => {
      const f = fixture();
      verify.mockResolvedValue({ kind });
      const result = await authorizeStaffAccountRequest(
        f.client,
        actor,
        request,
        "dispatch",
        factor,
        "123456",
      );
      expect(result.kind).toBe(
        ["invalid", "rejected"].includes(kind) ? kind : "unknown",
      );
      expect(f.rpc).not.toHaveBeenCalled();
    },
  );
  it("treats DB Owner denial as denial, not a role from metadata", async () => {
    const f = fixture();
    f.abortSignal.mockResolvedValue({ data: null, error: { code: "42501" } });
    expect(
      await authorizeStaffAccountRequest(
        f.client,
        actor,
        request,
        "dispatch",
        factor,
        "123456",
      ),
    ).toEqual({ kind: "denied" });
  });
  it.each([
    null,
    [],
    {},
    { status: "issued", expires_at: "bad" },
    { status: "issued", expires_at: "2099-01-01", actor },
  ])("refuses malformed receipt %j", async (data) => {
    const f = fixture();
    f.abortSignal.mockResolvedValue({ data, error: null });
    expect(
      await authorizeStaffAccountRequest(
        f.client,
        actor,
        request,
        "dispatch",
        factor,
        "123456",
      ),
    ).toEqual({ kind: "unknown" });
  });
  it("does not retry lost receipt response or return provider errors", async () => {
    const f = fixture();
    f.abortSignal.mockRejectedValue(new Error("sensitive provider data"));
    expect(
      await authorizeStaffAccountRequest(
        f.client,
        actor,
        request,
        "dispatch",
        factor,
        "123456",
      ),
    ).toEqual({ kind: "unknown" });
    expect(f.rpc).toHaveBeenCalledTimes(1);
  });
});
