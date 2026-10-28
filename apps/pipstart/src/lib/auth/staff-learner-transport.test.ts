import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  runLearnerProviderTransport,
  validLearnerProviderInput,
} from "./staff-learner-transport";
const actor = "d1000000-0000-4000-8000-000000000003",
  target = "d1000000-0000-4000-8000-000000000005",
  request = "d9000000-0000-4000-8000-000000000001",
  dispatch = "d8000000-0000-4000-8000-000000000001",
  nonce = "b".repeat(64),
  token = "a".repeat(64);
const command = {
  request,
  target,
  operation: "auth_resume",
  until: null,
  reason: "access_change",
};
const response = (data: unknown, error: unknown = null) => ({ data, error });
const rpcReply = (v: unknown) => ({ abortSignal: () => Promise.resolve(v) });
function fixture() {
  const userRpc = vi.fn((name: string) =>
    rpcReply(
      name === "pipstart_staff_access"
        ? response({
            authorized: true,
            user_id: actor,
            roles: ["administrator"],
            capabilities: [
              "staff.enter",
              "people.read",
              "people.manage_learners",
            ],
          })
        : name === "pipstart_staff_learner_prepare"
          ? response({ request_id: request, status: "intent_recorded" })
          : response({
              request_id: request,
              dispatch_id: dispatch,
              permit: nonce,
              expires_at: "2099-01-01T00:00:00Z",
              status: "execution_permitted",
            }),
    ),
  );
  const serviceRpc = vi.fn((name: string, p: Record<string, unknown>) =>
    rpcReply(
      name === "pipstart_staff_learner_provider_take"
        ? response({
            request_id: request,
            status: "dispatch_authorized",
            dispatch_id: dispatch,
            target_id: target,
            operation: "auth_resume",
            factor_id: null,
            suspend_until: null,
          })
        : response({
            request_id: request,
            status: "recorded",
            state: p.p_outcome,
          }),
    ),
  );
  const update = vi
      .fn()
      .mockResolvedValue(
        response({ user: { id: target, banned_until: null } }),
      ),
    get = vi
      .fn()
      .mockResolvedValue(
        response({ user: { id: target, banned_until: null } }),
      );
  const user = {
      auth: {
        getUser: vi.fn().mockResolvedValue(response({ user: { id: actor } })),
      },
      rpc: userRpc,
    } as unknown as SupabaseClient,
    service = { rpc: serviceRpc } as unknown as SupabaseClient,
    provider = {
      getUserById: get,
      updateUserById: update,
    } as unknown as NonNullable<
      Parameters<typeof runLearnerProviderTransport>[2]
    >;
  return { user, service, provider, userRpc, serviceRpc, update, get };
}
beforeEach(() => {
  vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
  vi.stubEnv("PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED", "true");
});
afterEach(() => vi.unstubAllEnvs());
describe("one-use learner provider transport", () => {
  it("is default off before any identity, RPC or provider call", async () => {
    vi.stubEnv("PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED", "false");
    const f = fixture();
    expect(
      await runLearnerProviderTransport(f.user, f.service, f.provider, {
        mode: "dispatch",
        command,
        token,
      }),
    ).toEqual({ kind: "disabled" });
    expect(f.userRpc).not.toHaveBeenCalled();
    expect(f.update).not.toHaveBeenCalled();
  });
  it.each([
    { mode: "dispatch", command, token, actor },
    { mode: "dispatch", command: { ...command, target: actor }, token: "bad" },
    { mode: "inspect", request, token, permit: nonce },
    null,
  ])("rejects expanded or malformed inputs %#", (v) => {
    expect(validLearnerProviderInput(v)).toBe(false);
  });
  it("records the exact command then performs one bound claim, take, provider call and outcome append", async () => {
    const f = fixture();
    const r = await runLearnerProviderTransport(f.user, f.service, f.provider, {
      mode: "dispatch",
      command,
      token,
    });
    expect(r).toEqual({ kind: "recorded", request, outcome: "succeeded" });
    expect(f.update).toHaveBeenCalledExactlyOnceWith(target, {
      ban_duration: "none",
    });
    expect(f.serviceRpc).toHaveBeenCalledWith(
      "pipstart_staff_learner_provider_take",
      { p_request: request, p_dispatch: dispatch, p_permit: nonce },
    );
    expect(f.userRpc.mock.calls.map((c) => c[0])).toEqual([
      "pipstart_staff_access",
      "pipstart_staff_learner_prepare",
      "pipstart_staff_learner_claim",
    ]);
    expect(JSON.stringify(r)).not.toContain(nonce);
    expect(JSON.stringify(r)).not.toContain(token);
  });
  it("does not execute on repeated claim or malformed success", async () => {
    const f = fixture();
    f.userRpc.mockImplementation((name) =>
      rpcReply(
        name === "pipstart_staff_access"
          ? response({
              authorized: true,
              user_id: actor,
              roles: ["owner"],
              capabilities: ["staff.enter", "people.manage_learners"],
            })
          : name === "pipstart_staff_learner_prepare"
            ? response({ request_id: request, status: "intent_recorded" })
            : response({
                request_id: request,
                status: "not_dispatchable",
                state: "dispatched",
              }),
      ),
    );
    expect(
      (
        await runLearnerProviderTransport(f.user, f.service, f.provider, {
          mode: "dispatch",
          command,
          token,
        })
      ).kind,
    ).toBe("unknown");
    expect(f.serviceRpc).not.toHaveBeenCalled();
    expect(f.update).not.toHaveBeenCalled();
  });
  it("fails closed when identity/grants are not bound to the live user", async () => {
    const f = fixture();
    f.userRpc.mockImplementation(() =>
      rpcReply(
        response({
          authorized: true,
          user_id: target,
          roles: ["owner"],
          capabilities: ["staff.enter", "people.manage_learners"],
        }),
      ),
    );
    expect(
      (
        await runLearnerProviderTransport(f.user, f.service, f.provider, {
          mode: "dispatch",
          command,
          token,
        })
      ).kind,
    ).toBe("denied");
    expect(f.update).not.toHaveBeenCalled();
  });
  it("does not call the provider after a denied or lost service take", async () => {
    const f = fixture();
    f.serviceRpc.mockImplementation(() =>
      rpcReply(response(null, { code: "42501" })),
    );
    expect(
      (
        await runLearnerProviderTransport(f.user, f.service, f.provider, {
          mode: "dispatch",
          command,
          token,
        })
      ).kind,
    ).toBe("unknown");
    expect(f.update).not.toHaveBeenCalled();
    expect(f.serviceRpc).toHaveBeenCalledTimes(1);
  });
  it("records uncertainty after provider response loss without retry", async () => {
    const f = fixture();
    f.update.mockRejectedValue(Error("private provider details"));
    expect(
      await runLearnerProviderTransport(f.user, f.service, f.provider, {
        mode: "dispatch",
        command,
        token,
      }),
    ).toEqual({ kind: "recorded", request, outcome: "unknown" });
    expect(f.update).toHaveBeenCalledTimes(1);
    expect(f.serviceRpc).toHaveBeenCalledWith(
      "pipstart_staff_learner_provider_result",
      expect.objectContaining({ p_outcome: "unknown" }),
    );
  });
  it("keeps uncertainty when result recording fails, without repeating the update", async () => {
    const f = fixture();
    const original = f.serviceRpc.getMockImplementation()!;
    f.serviceRpc.mockImplementation((name, p) =>
      name.endsWith("_result")
        ? rpcReply(response(null, { code: "timeout" }))
        : original(name, p),
    );
    expect(
      (
        await runLearnerProviderTransport(f.user, f.service, f.provider, {
          mode: "dispatch",
          command,
          token,
        })
      ).kind,
    ).toBe("unknown");
    expect(f.update).toHaveBeenCalledTimes(1);
  });
  it("inspection calls getUserById only and never records a causal success", async () => {
    const f = fixture();
    f.serviceRpc.mockImplementation(() =>
      rpcReply(
        response({
          request_id: request,
          status: "inspection_authorized",
          target_id: target,
          operation: "auth_resume",
          suspend_until: null,
          state: "unknown",
        }),
      ),
    );
    const r = await runLearnerProviderTransport(f.user, f.service, f.provider, {
      mode: "inspect",
      request,
      token,
    });
    expect(r).toEqual({
      kind: "observed",
      request,
      journalState: "unknown",
      observation: "desired",
    });
    expect(f.get).toHaveBeenCalledExactlyOnceWith(target);
    expect(f.update).not.toHaveBeenCalled();
    expect(
      f.userRpc.mock.calls.some(
        (c) => c[0] === "pipstart_staff_learner_prepare",
      ),
    ).toBe(false);
    expect(f.serviceRpc).toHaveBeenCalledTimes(1);
  });
});
