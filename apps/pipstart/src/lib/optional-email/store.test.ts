import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), rpc: vi.fn() }));
vi.mock("../supabase/admin", () => ({ createSupabaseAdminClient: mocks.admin }));
import { createOptionalEmailDispatchStore } from "./store";
const active = { status: "active", email: "generated@example.test", learning: true, partner: false, frequency: "weekly" };
beforeEach(() => { vi.resetAllMocks();mocks.admin.mockReturnValue({ rpc: mocks.rpc }); });
describe("fresh service-only optional eligibility adapter", () => {
  it("is unavailable without configured admin client", () => { mocks.admin.mockReturnValue(null);expect(createOptionalEmailDispatchStore()).toBeNull(); });
  it.each([active, { status: "inactive" }])("parses only current valid state", async data => {
    mocks.rpc.mockResolvedValue({ data, error: null });expect(await createOptionalEmailDispatchStore()!.load("generated-id")).toEqual(data);
    expect(mocks.rpc).toHaveBeenCalledWith("pipstart_optional_email_dispatch_state", { p_user_id: "generated-id" });
  });
  it("does not cache between calls", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: active }).mockResolvedValueOnce({ data: { ...active, learning: false } });
    const store = createOptionalEmailDispatchStore()!;
    expect(await store.load("generated-id")).toEqual(active);expect(await store.load("generated-id")).toEqual({ ...active, learning: false });expect(mocks.rpc).toHaveBeenCalledTimes(2);
  });
  it.each([null, {}, { ...active, email: "bad" }, { ...active, partner: 1 }, { ...active, frequency: "daily" }])("fails closed on malformed RPC response", async data => {
    mocks.rpc.mockResolvedValue({ data, error: null });await expect(createOptionalEmailDispatchStore()!.load("id")).rejects.toThrow("Optional email eligibility unavailable");
  });
  it("does not expose database error details", async () => {
    mocks.rpc.mockResolvedValue({ data: active, error: { message: "private database detail" } });
    await expect(createOptionalEmailDispatchStore()!.load("id")).rejects.toThrow(/^Optional email eligibility unavailable$/);
  });
});
