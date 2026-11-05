import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ user: vi.fn(), read: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.user,
}));
vi.mock("@/lib/content/editorial-lifecycle", () => ({
  runEditorialLifecycle: mocks.read,
}));
import { runEditorialLifecycleAction } from "./lifecycle-actions";
beforeEach(() => {
  vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({ verifiedUserClient: true });
  mocks.read.mockResolvedValue({ kind: "denied" });
});
afterEach(() => vi.unstubAllEnvs());
describe("archive and hold server action", () => {
  it("refuses disabled access before reading cookies", async () => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "");
    expect(await runEditorialLifecycleAction({})).toEqual({ kind: "denied" });
    expect(mocks.user).not.toHaveBeenCalled();
  });
  it("always passes the actual user session to the read boundary", async () => {
    await runEditorialLifecycleAction({
      action: "archive",
      id: "lesson-1",
      revision: 1,
      sha: "a".repeat(64),
      reason: "Retired",
    });
    expect(mocks.read).toHaveBeenCalledWith(
      { verifiedUserClient: true },
      {
        action: "archive",
        id: "lesson-1",
        revision: 1,
        sha: "a".repeat(64),
        reason: "Retired",
      },
    );
  });
  it("returns no setup error details", async () => {
    mocks.user.mockRejectedValue(Error("private token"));
    expect(await runEditorialLifecycleAction({})).toEqual({
      kind: "unavailable",
    });
  });
});
