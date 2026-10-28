import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
const mocks = vi.hoisted(() => ({ live: vi.fn(), verify: vi.fn() }));
vi.mock("./staff-role-flow", () => ({ readLiveStaffAccess: mocks.live }));
vi.mock("./staff-mfa-flow", () => ({ verifyStaffFactor: mocks.verify }));
import {
  prepareLearnerProvider,
  prepareLearnerInspection,
  readLearnerDelivery,
  parseLearnerDelivery,
} from "./staff-learner-flow";
const actor = "d1000000-0000-4000-8000-000000000003",
  target = "d1000000-0000-4000-8000-000000000005",
  request = "d9000000-0000-4000-8000-000000000001";
const command = {
  request,
  target,
  operation: "auth_resume",
  until: null,
  reason: "access_change",
};
const access = {
  authorized: true,
  user_id: actor,
  roles: ["administrator"],
  capabilities: ["people.manage_learners"],
};
function fixture(
  data: unknown = { status: "issued", expires_at: "2099-01-01T00:00:00Z" },
) {
  const rpc = vi.fn((...args: [string, Record<string, unknown>]) => ({
    abortSignal: () =>
      Promise.resolve({ data: args.length === 2 ? data : null, error: null }),
  }));
  return { rpc, client: { rpc } as unknown as SupabaseClient };
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.live.mockResolvedValue({ kind: "authorized", access });
  mocks.verify.mockResolvedValue({ kind: "verified" });
});
afterEach(() => vi.unstubAllEnvs());
describe("learner fresh verification controller", () => {
  it("freezes the exact review and obtains a bound receipt without recording or sending", async () => {
    const f = fixture();
    const r = await prepareLearnerProvider(
      f.client,
      actor,
      command,
      "factor",
      "123456",
    );
    expect(r.kind).toBe("ready");
    if (r.kind !== "ready") throw Error("Expected proof");
    expect(Object.isFrozen(r.proof.command)).toBe(true);
    expect(r.proof.token).toMatch(/^[a-f0-9]{64}$/);
    expect(f.rpc).toHaveBeenCalledTimes(1);
    expect(f.rpc).toHaveBeenCalledWith(
      "pipstart_staff_learner_receipt",
      expect.objectContaining({
        p_request: request,
        p_target: target,
        p_operation: "auth_resume",
        p_until: null,
        p_reason: "access_change",
      }),
    );
    expect(f.rpc.mock.calls.some((c) => String(c[0]).includes("prepare"))).toBe(
      false,
    );
  });
  it("rechecks revocation after MFA and refuses to mint a receipt", async () => {
    const f = fixture();
    mocks.live
      .mockResolvedValueOnce({ kind: "authorized", access })
      .mockResolvedValueOnce({ kind: "denied" });
    expect(
      (
        await prepareLearnerProvider(
          f.client,
          actor,
          command,
          "factor",
          "123456",
        )
      ).kind,
    ).toBe("denied");
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it("keeps rejected MFA separate from transport uncertainty", async () => {
    const f = fixture();
    mocks.verify.mockResolvedValue({ kind: "rejected" });
    expect(
      (
        await prepareLearnerProvider(
          f.client,
          actor,
          command,
          "factor",
          "000000",
        )
      ).kind,
    ).toBe("rejected");
    expect(f.rpc).not.toHaveBeenCalled();
  });
  it("rejects an expanded receipt response", async () => {
    const f = fixture({
      status: "issued",
      expires_at: "2099-01-01T00:00:00Z",
      secret: "unexpected",
    });
    expect(
      (
        await prepareLearnerProvider(
          f.client,
          actor,
          command,
          "factor",
          "123456",
        )
      ).kind,
    ).toBe("unknown");
  });
  it("requires a new verification and dedicated receipt for inspection", async () => {
    const f = fixture();
    expect(
      (
        await prepareLearnerInspection(
          f.client,
          actor,
          request,
          "factor",
          "123456",
        )
      ).kind,
    ).toBe("ready");
    expect(mocks.verify).toHaveBeenCalledTimes(1);
    expect(f.rpc).toHaveBeenCalledWith(
      "pipstart_staff_learner_inspection_receipt",
      { p_request: request, p_token: expect.stringMatching(/^[a-f0-9]{64}$/) },
    );
  });
  it("reads only the bound minimized record and refuses a different target", async () => {
    const data = {
      request_id: request,
      target_id: target,
      operation: "auth_resume",
      suspend_until: null,
      status: "delivery_state",
      state: "unknown",
    };
    const f = fixture(data);
    expect(
      (await readLearnerDelivery(f.client, actor, request, target)).kind,
    ).toBe("ready");
    expect(
      parseLearnerDelivery({ ...data, target_id: actor }, request, target),
    ).toEqual({ kind: "unavailable" });
    expect(
      parseLearnerDelivery(
        { ...data, email: "private@example.invalid" },
        request,
        target,
      ),
    ).toEqual({ kind: "unavailable" });
    expect(
      parseLearnerDelivery(
        { ...data, state: "provider_surely_finished" },
        request,
        target,
      ),
    ).toEqual({ kind: "unavailable" });
  });
});
