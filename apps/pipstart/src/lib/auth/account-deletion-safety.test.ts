import { afterEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteEligibleAccount } from "./account-deletion-safety";
const userId = "40000000-0000-4000-8000-00000000000a";
function fixture(data: unknown = { status: "eligible", user_id: userId }) {
  const getUser = vi
    .fn()
    .mockResolvedValue({ data: { user: { id: userId } }, error: null });
  const abortSignal = vi.fn().mockResolvedValue({ data, error: null });
  const rpc = vi.fn(() => ({ abortSignal }));
  const remove = vi.fn().mockResolvedValue({ error: null });
  return {
    client: { auth: { getUser }, rpc } as unknown as SupabaseClient,
    getUser,
    abortSignal,
    rpc,
    remove,
  };
}
afterEach(() => vi.useRealTimers());
describe("own-account deletion safety", () => {
  it("checks identity and own eligibility before exactly one dispatch", async () => {
    const f = fixture();
    expect(await deleteEligibleAccount(f.client, userId, f.remove)).toEqual({
      kind: "deleted",
    });
    expect(f.rpc).toHaveBeenCalledExactlyOnceWith(
      "pipstart_account_deletion_eligibility",
    );
    expect(f.abortSignal.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
    expect(f.getUser.mock.invocationCallOrder[0]).toBeLessThan(
      f.rpc.mock.invocationCallOrder[0],
    );
    expect(f.rpc.mock.invocationCallOrder[0]).toBeLessThan(
      f.remove.mock.invocationCallOrder[0],
    );
    expect(f.remove).toHaveBeenCalledTimes(1);
  });
  it("refuses current/former staff before dispatch", async () => {
    const f = fixture({ status: "staff_retirement_required", user_id: userId });
    expect(await deleteEligibleAccount(f.client, userId, f.remove)).toEqual({
      kind: "staff_retirement_required",
    });
    expect(f.remove).not.toHaveBeenCalled();
  });
  it.each([
    null,
    [],
    {},
    true,
    { status: "eligible" },
    { status: "eligible", user_id: "foreign" },
    { status: "eligible", user_id: userId, role: "owner" },
    { status: "unknown", user_id: userId },
    { status: "staff_retirement_required", user_id: "foreign" },
  ])("fails closed for malformed reply %j", async (data) => {
    const f = fixture(data);
    expect(await deleteEligibleAccount(f.client, userId, f.remove)).toEqual({
      kind: "unavailable",
    });
    expect(f.remove).not.toHaveBeenCalled();
  });
  it.each(["", "foreign", userId.toUpperCase()])(
    "rejects invalid identity %s",
    async (id) => {
      const f = fixture();
      expect(await deleteEligibleAccount(f.client, id, f.remove)).toEqual({
        kind: "unavailable",
      });
      expect(f.getUser).not.toHaveBeenCalled();
      expect(f.remove).not.toHaveBeenCalled();
    },
  );
  it.each([
    { data: { user: null }, error: null },
    { data: { user: { id: "foreign" } }, error: null },
    { data: { user: { id: userId } }, error: { message: "private" } },
  ])("refuses stale/foreign identity", async (reply) => {
    const f = fixture();
    f.getUser.mockResolvedValue(reply);
    expect(await deleteEligibleAccount(f.client, userId, f.remove)).toEqual({
      kind: "unavailable",
    });
    expect(f.rpc).not.toHaveBeenCalled();
    expect(f.remove).not.toHaveBeenCalled();
  });
  it.each(["identity", "eligibility"])(
    "redacts thrown %s errors",
    async (stage) => {
      const f = fixture();
      (stage === "identity" ? f.getUser : f.abortSignal).mockRejectedValue(
        new Error("private data"),
      );
      expect(await deleteEligibleAccount(f.client, userId, f.remove)).toEqual({
        kind: "unavailable",
      });
      expect(f.remove).not.toHaveBeenCalled();
    },
  );
  it("fails closed if migration/privilege is unavailable", async () => {
    const f = fixture();
    f.abortSignal.mockResolvedValue({ data: null, error: { code: "42883" } });
    expect(await deleteEligibleAccount(f.client, userId, f.remove)).toEqual({
      kind: "unavailable",
    });
    expect(f.remove).not.toHaveBeenCalled();
  });
  it.each([
    { error: { code: "23503" } },
    { error: { status: 500 } },
    {},
    { error: undefined },
    null,
  ])(
    "does not claim success or retry rejected/malformed deletion %j",
    async (reply) => {
      const f = fixture();
      f.remove.mockResolvedValue(reply);
      expect(await deleteEligibleAccount(f.client, userId, f.remove)).toEqual({
        kind: "unknown",
      });
      expect(f.remove).toHaveBeenCalledTimes(1);
    },
  );
  it("preserves unknown after lost remote response", async () => {
    const f = fixture();
    f.remove.mockRejectedValue(new Error("response lost"));
    expect(await deleteEligibleAccount(f.client, userId, f.remove)).toEqual({
      kind: "unknown",
    });
    expect(f.remove).toHaveBeenCalledTimes(1);
  });
  it("bounds stalled identity without dispatch", async () => {
    vi.useFakeTimers();
    const f = fixture();
    f.getUser.mockImplementation(() => new Promise(() => {}));
    const task = deleteEligibleAccount(f.client, userId, f.remove);
    await vi.advanceTimersByTimeAsync(8001);
    expect(await task).toEqual({ kind: "unavailable" });
    expect(f.remove).not.toHaveBeenCalled();
  });
  it("bounds remote deletion without resending or falsely cancelling", async () => {
    vi.useFakeTimers();
    const f = fixture();
    f.remove.mockImplementation(() => new Promise(() => {}));
    const task = deleteEligibleAccount(f.client, userId, f.remove);
    await vi.advanceTimersByTimeAsync(8001);
    expect(await task).toEqual({ kind: "unknown" });
    expect(f.remove).toHaveBeenCalledTimes(1);
  });
});
