import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  runStaffAccountProvider,
  type StaffAccountJournal,
} from "./staff-account-provider";
import type { AccountProof } from "./staff-account-proof";
const request = "a1000000-0000-4000-8000-000000000001",
  target = "a2000000-0000-4000-8000-000000000002",
  dispatch = "a3000000-0000-4000-8000-000000000003";
const proof: AccountProof = {
  request,
  mode: "dispatch",
  token: "a".repeat(64),
  expiresAt: "2099-01-01T00:00:00Z",
};
function fixture() {
  const take = vi.fn().mockResolvedValue({
    request_id: request,
    status: "dispatch_authorized",
    dispatch_id: dispatch,
    target_id: target,
    operation: "auth_resume",
    factor_id: null,
    suspend_until: null,
  });
  const result = vi.fn(
    async (_request: string, _dispatch: string, outcome: string) => ({
      request_id: request,
      status: "recorded",
      state: outcome,
    }),
  );
  const update = vi.fn().mockResolvedValue({
    data: { user: { id: target, banned_until: null } },
    error: null,
  });
  const get = vi.fn().mockResolvedValue({
    data: { user: { id: target, banned_until: null } },
    error: null,
  });
  const journal: StaffAccountJournal = { take, result };
  const provider = {
    updateUserById: update,
    getUserById: get,
  } as unknown as NonNullable<Parameters<typeof runStaffAccountProvider>[1]>;
  return { take, result, update, get, journal, provider };
}
beforeEach(() => vi.stubEnv("PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED", "true"));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
describe("default-off staff account provider integration", () => {
  it.each([undefined, "false", "TRUE", ""])(
    "does nothing unless explicitly enabled %s",
    async (value) => {
      vi.stubEnv("PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED", value);
      const f = fixture();
      expect(
        await runStaffAccountProvider(f.journal, f.provider, proof),
      ).toEqual({ kind: "disabled" });
      expect(f.take).not.toHaveBeenCalled();
      expect(f.update).not.toHaveBeenCalled();
    },
  );
  it("uses a durable exact claim, one provider update and one result append", async () => {
    const f = fixture();
    expect(await runStaffAccountProvider(f.journal, f.provider, proof)).toEqual(
      { kind: "recorded", request, outcome: "succeeded" },
    );
    expect(f.take).toHaveBeenCalledExactlyOnceWith(
      request,
      "dispatch",
      proof.token,
    );
    expect(f.update).toHaveBeenCalledExactlyOnceWith(target, {
      ban_duration: "none",
    });
    expect(f.result).toHaveBeenCalledExactlyOnceWith(
      request,
      dispatch,
      "succeeded",
    );
    expect(f.take.mock.invocationCallOrder[0]).toBeLessThan(
      f.update.mock.invocationCallOrder[0],
    );
    expect(f.update.mock.invocationCallOrder[0]).toBeLessThan(
      f.result.mock.invocationCallOrder[0],
    );
    expect(f.get).not.toHaveBeenCalled();
  });
  it("uses fixed reviewed expiry for suspension and minimizes provider output", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T12:00:00Z"));
    const f = fixture(),
      until = "2026-10-28T12:00:00Z";
    f.take.mockResolvedValue({
      request_id: request,
      status: "dispatch_authorized",
      dispatch_id: dispatch,
      target_id: target,
      operation: "auth_suspend",
      factor_id: null,
      suspend_until: until,
    });
    f.update.mockResolvedValue({
      data: {
        user: {
          id: target,
          banned_until: until,
          email: "never-return@example.invalid",
          user_metadata: { private: "never-return" },
        },
      },
      error: null,
    });
    expect(await runStaffAccountProvider(f.journal, f.provider, proof)).toEqual(
      { kind: "recorded", request, outcome: "succeeded" },
    );
    expect(f.update).toHaveBeenCalledExactlyOnceWith(target, {
      ban_duration: "86400s",
    });
  });
  it.each([
    null,
    {},
    [],
    { request_id: request, status: "not_dispatchable" },
    {
      request_id: request,
      status: "dispatch_authorized",
      dispatch_id: dispatch,
      target_id: target,
      operation: "factor_recovery",
      factor_id: target,
      suspend_until: null,
    },
  ])("refuses malformed, repeated or unsupported claim %j", async (value) => {
    const f = fixture();
    f.take.mockResolvedValue(value);
    expect(await runStaffAccountProvider(f.journal, f.provider, proof)).toEqual(
      { kind: "unknown" },
    );
    expect(f.update).not.toHaveBeenCalled();
    expect(f.result).not.toHaveBeenCalled();
  });
  it("does not mutate or retry after a lost dispatch-claim response", async () => {
    const f = fixture();
    f.take.mockRejectedValue(new Error("secret transport text"));
    expect(await runStaffAccountProvider(f.journal, f.provider, proof)).toEqual(
      { kind: "unknown" },
    );
    expect(f.take).toHaveBeenCalledTimes(1);
    expect(f.update).not.toHaveBeenCalled();
    expect(f.result).not.toHaveBeenCalled();
  });
  it.each([
    { data: { user: { id: target } }, error: { status: 500 } },
    { data: { user: { id: request } }, error: null },
    { data: { user: { id: target, banned_until: "invalid" } }, error: null },
    { data: { user: { id: target } }, error: undefined },
  ])(
    "records uncertainty for rejected or malformed provider replies %j",
    async (reply) => {
      const f = fixture();
      f.update.mockResolvedValue(reply);
      expect(
        await runStaffAccountProvider(f.journal, f.provider, proof),
      ).toEqual({ kind: "recorded", request, outcome: "unknown" });
      expect(f.update).toHaveBeenCalledTimes(1);
      expect(f.result).toHaveBeenCalledExactlyOnceWith(
        request,
        dispatch,
        "unknown",
      );
    },
  );
  it("records unknown after a lost remote response without resending", async () => {
    const f = fixture();
    f.update.mockRejectedValue(new Error("response lost"));
    expect(await runStaffAccountProvider(f.journal, f.provider, proof)).toEqual(
      { kind: "recorded", request, outcome: "unknown" },
    );
    expect(f.update).toHaveBeenCalledTimes(1);
  });
  it("returns uncertainty if final result acknowledgment is lost", async () => {
    const f = fixture();
    f.result.mockRejectedValue(new Error("recording response lost"));
    expect(await runStaffAccountProvider(f.journal, f.provider, proof)).toEqual(
      { kind: "unknown" },
    );
    expect(f.update).toHaveBeenCalledTimes(1);
    expect(f.result).toHaveBeenCalledTimes(1);
  });
  it("bounds a stalled provider and preserves remote uncertainty", async () => {
    vi.useFakeTimers();
    const f = fixture();
    f.update.mockImplementation(() => new Promise(() => {}));
    const task = runStaffAccountProvider(f.journal, f.provider, proof);
    await vi.advanceTimersByTimeAsync(8001);
    expect(await task).toEqual({
      kind: "recorded",
      request,
      outcome: "unknown",
    });
    expect(f.update).toHaveBeenCalledTimes(1);
  });
  it("bounds a lost claim without dispatch", async () => {
    vi.useFakeTimers();
    const f = fixture();
    f.take.mockImplementation(() => new Promise(() => {}));
    const task = runStaffAccountProvider(f.journal, f.provider, proof);
    await vi.advanceTimersByTimeAsync(8001);
    expect(await task).toEqual({ kind: "unknown" });
    expect(f.update).not.toHaveBeenCalled();
  });
  it("inspection never writes provider or resolves the journal automatically", async () => {
    const f = fixture();
    f.take.mockResolvedValue({
      request_id: request,
      status: "inspection_authorized",
      target_id: target,
      operation: "auth_resume",
      suspend_until: null,
      state: "unknown",
    });
    expect(
      await runStaffAccountProvider(f.journal, f.provider, {
        ...proof,
        mode: "inspect",
      }),
    ).toEqual({
      kind: "observed",
      request,
      journalState: "unknown",
      observation: "desired",
    });
    expect(f.get).toHaveBeenCalledExactlyOnceWith(target);
    expect(f.update).not.toHaveBeenCalled();
    expect(f.result).not.toHaveBeenCalled();
  });
  it("an unavailable inspection leaves uncertainty unresolved", async () => {
    const f = fixture();
    f.take.mockResolvedValue({
      request_id: request,
      status: "inspection_authorized",
      target_id: target,
      operation: "auth_resume",
      suspend_until: null,
      state: "dispatched",
    });
    f.get.mockRejectedValue(new Error("private error"));
    expect(
      await runStaffAccountProvider(f.journal, f.provider, {
        ...proof,
        mode: "inspect",
      }),
    ).toEqual({
      kind: "observed",
      request,
      journalState: "dispatched",
      observation: "unavailable",
    });
    expect(f.result).not.toHaveBeenCalled();
    expect(f.update).not.toHaveBeenCalled();
  });
  it("freezes mode before waiting for authorization", async () => {
    const f = fixture(),
      input = { ...proof, mode: "inspect" as const };
    f.take.mockImplementation(async () => {
      (input as { mode: string }).mode = "dispatch";
      return {
        request_id: request,
        status: "inspection_authorized",
        target_id: target,
        operation: "auth_resume",
        suspend_until: null,
        state: "prepared",
      };
    });
    expect(
      (await runStaffAccountProvider(f.journal, f.provider, input)).kind,
    ).toBe("observed");
    expect(f.update).not.toHaveBeenCalled();
  });
  it("refuses invalid proof before journal or provider calls", async () => {
    const f = fixture();
    expect(
      await runStaffAccountProvider(f.journal, f.provider, {
        ...proof,
        token: "bad",
      }),
    ).toEqual({ kind: "invalid" });
    expect(f.take).not.toHaveBeenCalled();
    expect(f.update).not.toHaveBeenCalled();
  });
});
