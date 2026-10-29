import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const factory = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: factory,
}));
import { readStaffGate } from "./staff-gate";
const actor = "2d734acd-a974-45f1-aabc-bc9b0a37fb40";
const other = "d81ca71d-b4ba-4ef2-83df-0417222bfe5c";
function fixture() {
  const rpcResult = vi.fn().mockResolvedValue({
    data: {
      authorized: true,
      user_id: actor,
      roles: ["author"],
      capabilities: ["staff.enter"],
    },
    error: null,
  });
  const enrolResult = vi.fn().mockResolvedValue({ data: true, error: null });
  const rpc = vi.fn((name: string) => ({
    abortSignal:
      name === "pipstart_staff_enrolment_allowed" ? enrolResult : rpcResult,
  }));
  const getUser = vi.fn().mockResolvedValue({
    data: {
      user: {
        id: actor,
        user_metadata: { role: "owner" },
        factors: [{ id: other, status: "verified", factor_type: "totp" }],
      },
    },
    error: null,
  });
  const aal = vi.fn().mockResolvedValue({
    data: { currentLevel: "aal2", nextLevel: "aal2" },
    error: null,
  });
  factory.mockResolvedValue({
    auth: { getUser, mfa: { getAuthenticatorAssuranceLevel: aal } },
    rpc,
  });
  return { rpc, rpcResult, enrolResult, getUser, aal };
}
// The challenge path may ask only whether the caller is staff, never for staff data.
function onlyEnrolmentChecked(rpc: ReturnType<typeof vi.fn>) {
  expect(rpc).toHaveBeenCalledTimes(1);
  expect(rpc).toHaveBeenCalledWith("pipstart_staff_enrolment_allowed");
}
beforeEach(() => {
  vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
  factory.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
describe("live staff read gate", () => {
  it("rejects stale assurance after the provider reports no verified TOTP", async () => {
    const f = fixture();
    f.getUser.mockResolvedValue({
      data: { user: { id: actor, factors: [] } },
      error: null,
    });
    expect(await readStaffGate()).toEqual({ kind: "challenge", userId: actor });
    onlyEnrolmentChecked(f.rpc);
  });
  it("stays closed by default without contacting a provider", async () => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "");
    expect(await readStaffGate()).toEqual({ kind: "denied" });
    expect(factory).not.toHaveBeenCalled();
  });
  it("rejects missing server configuration", async () => {
    factory.mockResolvedValue(null);
    expect(await readStaffGate()).toEqual({ kind: "unavailable" });
  });
  it("does not query staff data for an unauthenticated identity", async () => {
    const f = fixture();
    f.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect(await readStaffGate()).toEqual({ kind: "signed-out" });
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it.each([
    ["aal1", "aal1"],
    ["aal1", "aal2"],
    ["aal2", "aal1"],
  ])(
    "exposes no staff data at assurance %s/%s",
    async (currentLevel, nextLevel) => {
      const f = fixture();
      f.aal.mockResolvedValue({
        data: { currentLevel, nextLevel },
        error: null,
      });
      expect(await readStaffGate()).toEqual({
        kind: "challenge",
        userId: actor,
      });
      onlyEnrolmentChecked(f.rpc);
    },
  );
  it("offers no enrolment or step-up to a non-member", async () => {
    const f = fixture();
    f.getUser.mockResolvedValue({
      data: { user: { id: actor, factors: [] } },
      error: null,
    });
    for (const data of [false, null, "true", 1, { allowed: true }]) {
      f.rpc.mockClear();
      f.enrolResult.mockResolvedValue({ data, error: null });
      expect(await readStaffGate()).toEqual({ kind: "denied" });
      onlyEnrolmentChecked(f.rpc);
    }
    expect(f.enrolResult.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
  });
  it("fails closed when the membership check errors or throws", async () => {
    const f = fixture();
    f.aal.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal2" },
      error: null,
    });
    f.enrolResult.mockResolvedValue({ data: true, error: { code: "42501" } });
    expect(await readStaffGate()).toEqual({ kind: "unavailable" });
    f.enrolResult.mockRejectedValue(Error("private backend error"));
    expect(await readStaffGate()).toEqual({ kind: "unavailable" });
    expect(f.rpc).not.toHaveBeenCalledWith(
      "pipstart_staff_access",
      expect.anything(),
    );
  });
  it("requires authoritative RPC grants, not editable owner metadata", async () => {
    const f = fixture();
    f.rpcResult.mockResolvedValue({ data: { authorized: false }, error: null });
    expect(await readStaffGate()).toEqual({ kind: "denied" });
  });
  it("rejects foreign-user and malformed RPC payloads", async () => {
    const f = fixture();
    f.rpcResult.mockResolvedValue({
      data: {
        authorized: true,
        user_id: other,
        roles: ["owner"],
        capabilities: ["staff.enter"],
      },
      error: null,
    });
    expect(await readStaffGate()).toEqual({ kind: "unavailable" });
  });
  it("uses a bounded user-context RPC and rechecks revocation on the next call", async () => {
    const f = fixture();
    expect((await readStaffGate()).kind).toBe("authorized");
    expect(f.rpc).toHaveBeenCalledWith("pipstart_staff_access", {
      p_kind: "",
      p_id: "",
    });
    expect(f.rpcResult.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
    f.rpcResult.mockResolvedValue({ data: { authorized: false }, error: null });
    expect(await readStaffGate()).toEqual({ kind: "denied" });
    expect(f.getUser).toHaveBeenCalledTimes(2);
  });
  it("does not substitute legacy roles on RPC failure", async () => {
    const f = fixture();
    f.rpcResult.mockRejectedValue(Error("private backend error"));
    expect(await readStaffGate()).toEqual({ kind: "unavailable" });
  });
  it("bounds a stalled Auth lookup", async () => {
    vi.useFakeTimers();
    const f = fixture();
    f.getUser.mockReturnValue(new Promise(() => {}));
    const read = readStaffGate();
    await vi.advanceTimersByTimeAsync(8000);
    expect(await read).toEqual({ kind: "unavailable" });
    expect(f.rpc).not.toHaveBeenCalled();
  });
});
