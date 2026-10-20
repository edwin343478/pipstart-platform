import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ admin: vi.fn(), rpc: vi.fn() }));
vi.mock("../supabase/admin", () => ({ createSupabaseAdminClient: mocks.admin }));
import { createUnsubscribeStore } from "./store";
import { createUnsubscribeTokenIssuer } from "./delivery";
beforeEach(() => { vi.resetAllMocks(); mocks.admin.mockReturnValue({ rpc: mocks.rpc }); });
describe("service-only unsubscribe adapter", () => {
  it("returns unavailable without configured server client", () => {
    mocks.admin.mockReturnValue(null); expect(createUnsubscribeStore()).toBeNull(); expect(createUnsubscribeTokenIssuer()).toBeNull();
  });
  it.each(["learning", "partner", "all"])("looks up %s without returning identity", async scope => {
    mocks.rpc.mockResolvedValue({ data: { status: "valid", scope }, error: null });
    expect(await createUnsubscribeStore()!.lookup("hash")).toBe(scope);
    expect(mocks.rpc).toHaveBeenCalledWith("pipstart_lookup_email_unsubscribe_token", { p_token_hash: "hash" });
  });
  it("maps missing tokens to null", async () => {
    mocks.rpc.mockResolvedValue({ data: { status: "invalid" }, error: null }); expect(await createUnsubscribeStore()!.lookup("hash")).toBeNull();
  });
  it.each([null, {}, { status: "valid", scope: "security" }, { status: "surprise" }])("rejects unexpected lookup shape", async data => {
    mocks.rpc.mockResolvedValue({ data, error: null }); await expect(createUnsubscribeStore()!.lookup("hash")).rejects.toThrow();
  });
  it.each(["unsubscribed", "already_unsubscribed", "invalid"])("maps apply result %s", async data => {
    mocks.rpc.mockResolvedValue({ data, error: null }); expect(await createUnsubscribeStore()!.apply("hash")).toBe(data);
    expect(mocks.rpc).toHaveBeenCalledWith("pipstart_apply_email_unsubscribe", { p_token_hash: "hash" });
  });
  it.each([null, {}, "unexpected"])("rejects unexpected apply shape", async data => {
    mocks.rpc.mockResolvedValue({ data, error: null }); await expect(createUnsubscribeStore()!.apply("hash")).rejects.toThrow();
  });
  it("does not log/echo database details on failure", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "private database error" } });
    await expect(createUnsubscribeStore()!.lookup("hash")).rejects.toThrow("unsubscribe lookup unavailable");
    await expect(createUnsubscribeStore()!.apply("hash")).rejects.toThrow("unsubscribe update unavailable");
  });
  it.each([true, false])("accepts only boolean token issuance result %s", async data => {
    mocks.rpc.mockResolvedValue({ data, error: null }); expect(await createUnsubscribeTokenIssuer()!.issue("user", "learning", "hash")).toBe(data);
    expect(mocks.rpc).toHaveBeenCalledWith("pipstart_issue_email_unsubscribe_token", { p_user_id: "user", p_scope: "learning", p_token_hash: "hash" });
  });
  it.each([null, "true", {}])("fails closed on bad issuance result", async data => {
    mocks.rpc.mockResolvedValue({ data, error: null }); await expect(createUnsubscribeTokenIssuer()!.issue("user", "learning", "hash")).rejects.toThrow();
  });
});
