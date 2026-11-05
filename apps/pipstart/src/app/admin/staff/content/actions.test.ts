import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ user: vi.fn(), read: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.user,
}));
vi.mock("@/lib/content/editorial-workspace", () => ({
  readEditorialWorkspace: mocks.read,
}));
import { readEditorialWorkspaceAction } from "./actions";
beforeEach(() => {
  vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({ verifiedUserClient: true });
  mocks.read.mockResolvedValue({ kind: "denied" });
});
afterEach(() => vi.unstubAllEnvs());
describe("content read server action", () => {
  it("refuses disabled access before reading cookies", async () => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "");
    expect(await readEditorialWorkspaceAction({})).toEqual({ kind: "denied" });
    expect(mocks.user).not.toHaveBeenCalled();
  });
  it("always passes the actual user session to the read boundary", async () => {
    await readEditorialWorkspaceAction({ kind: "list", after: "" });
    expect(mocks.read).toHaveBeenCalledWith(
      { verifiedUserClient: true },
      { kind: "list", after: "" },
    );
  });
  it("returns no setup error details", async () => {
    mocks.user.mockRejectedValue(Error("private token"));
    expect(await readEditorialWorkspaceAction({})).toEqual({
      kind: "unavailable",
    });
  });
});
