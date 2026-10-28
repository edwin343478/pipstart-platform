import { beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({
  requireUser: vi.fn(),
  verify: vi.fn(),
  server: vi.fn(),
  admin: vi.fn(),
  remove: vi.fn(),
  safe: vi.fn(),
  signOut: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("@/lib/auth/session", () => ({ requireUser: m.requireUser }));
vi.mock("@/lib/auth/verify-password", () => ({ verifyUserPassword: m.verify }));
vi.mock("@/lib/auth/account-deletion-safety", () => ({
  deleteEligibleAccount: m.safe,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: m.server,
}));
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminClient: m.admin }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: m.redirect }));
import { deleteAccountAction } from "./actions";
const user = {
  id: "40000000-0000-4000-8000-000000000001",
  email: "fixture@example.invalid",
};
function form() {
  const f = new FormData();
  f.set("confirmation", "DELETE");
  f.set("password", "test-only-password");
  return f;
}
beforeEach(() => {
  vi.resetAllMocks();
  m.requireUser.mockResolvedValue(user);
  m.verify.mockResolvedValue(true);
  m.server.mockResolvedValue({ auth: { signOut: m.signOut } });
  m.admin.mockReturnValue({ auth: { admin: { deleteUser: m.remove } } });
  m.safe.mockResolvedValue({ kind: "deleted" });
  m.redirect.mockImplementation(() => {
    throw Error("redirected");
  });
});
describe("deletion server action ordering/results", () => {
  it("requires typed confirmation first", async () => {
    const f = form();
    f.set("confirmation", "delete");
    expect((await deleteAccountAction({ status: "idle" }, f)).status).toBe(
      "error",
    );
    expect(m.verify).not.toHaveBeenCalled();
    expect(m.safe).not.toHaveBeenCalled();
  });
  it("requires password", async () => {
    const f = form();
    f.delete("password");
    expect((await deleteAccountAction({ status: "idle" }, f)).status).toBe(
      "error",
    );
    expect(m.safe).not.toHaveBeenCalled();
  });
  it.each([false, null])("requires verified password %j", async (result) => {
    m.verify.mockResolvedValue(result);
    expect((await deleteAccountAction({ status: "idle" }, form())).status).toBe(
      "error",
    );
    expect(m.safe).not.toHaveBeenCalled();
    expect(m.remove).not.toHaveBeenCalled();
  });
  it("explains reviewed retirement without encouraging retries", async () => {
    m.safe.mockResolvedValue({ kind: "staff_retirement_required" });
    const result = await deleteAccountAction({ status: "idle" }, form());
    expect(result.message).toContain("staff history");
    expect(result.message).toContain("support@pipstart.net");
    expect(m.signOut).not.toHaveBeenCalled();
    expect(m.redirect).not.toHaveBeenCalled();
  });
  it("does not expose unavailable details", async () => {
    m.safe.mockResolvedValue({ kind: "unavailable" });
    expect(
      (await deleteAccountAction({ status: "idle" }, form())).message,
    ).toContain("temporarily unavailable");
    expect(m.signOut).not.toHaveBeenCalled();
  });
  it("does not claim deletion for uncertainty", async () => {
    m.safe.mockResolvedValue({ kind: "unknown" });
    expect(
      (await deleteAccountAction({ status: "idle" }, form())).message,
    ).toContain("Do not repeat");
    expect(m.signOut).not.toHaveBeenCalled();
    expect(m.redirect).not.toHaveBeenCalled();
  });
  it("binds callback to verified current user after password check", async () => {
    m.remove.mockResolvedValue({ error: null });
    m.safe.mockImplementation(async (_c, _id, remove) => {
      await remove();
      return { kind: "deleted" };
    });
    await expect(
      deleteAccountAction({ status: "idle" }, form()),
    ).rejects.toThrow("redirected");
    expect(m.verify).toHaveBeenCalledExactlyOnceWith(
      user.email,
      "test-only-password",
    );
    expect(m.remove).toHaveBeenCalledExactlyOnceWith(user.id);
    expect(m.verify.mock.invocationCallOrder[0]).toBeLessThan(
      m.safe.mock.invocationCallOrder[0],
    );
    expect(m.signOut).toHaveBeenCalledExactlyOnceWith({ scope: "global" });
    expect(m.redirect).toHaveBeenCalledExactlyOnceWith("/account-deleted");
  });
});
