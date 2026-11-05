import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ user: vi.fn(), read: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.user,
}));
vi.mock("@/lib/content/revision-history", () => ({
  readRevisionHistory: mocks.read,
}));
import { readRevisionHistoryAction } from "./history-actions";
beforeEach(() => {
  vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({ verifiedUserClient: true });
  mocks.read.mockResolvedValue({ kind: "denied" });
});
afterEach(() => vi.unstubAllEnvs());
describe("revision history server action", () => {
  it("refuses disabled access before reading cookies", async () => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "");
    expect(await readRevisionHistoryAction({})).toEqual({ kind: "denied" });
    expect(mocks.user).not.toHaveBeenCalled();
  });
  it("always passes the actual user session to the read boundary", async () => {
    await readRevisionHistoryAction({
      kind: "history",
      id: "lesson-1",
      before: null,
    });
    expect(mocks.read).toHaveBeenCalledWith(
      { verifiedUserClient: true },
      { kind: "history", id: "lesson-1", before: null },
    );
  });
  it("returns no setup error details", async () => {
    mocks.user.mockRejectedValue(Error("private token"));
    expect(await readRevisionHistoryAction({})).toEqual({
      kind: "unavailable",
    });
  });
});
