import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ client: vi.fn(), draft: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.client,
}));
vi.mock("@/lib/content/lesson-editor", () => ({
  runLessonEditor: mocks.draft,
}));
import { runLessonEditorAction } from "./lesson-actions";
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
  mocks.client.mockResolvedValue({ userSession: true });
  mocks.draft.mockResolvedValue({ kind: "denied" });
});
afterEach(() => vi.unstubAllEnvs());
describe("draft user-session server action", () => {
  it("refuses disabled access before reading cookies", async () => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "false");
    expect(await runLessonEditorAction({ kind: "save" })).toEqual({
      kind: "denied",
    });
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("passes only the actual cookie/session client to the live write boundary", async () => {
    const input = { kind: "load", id: "course-1" };
    await runLessonEditorAction(input);
    expect(mocks.draft).toHaveBeenCalledWith({ userSession: true }, input);
  });
  it("returns no credential/configuration error details", async () => {
    mocks.client.mockRejectedValue(Error("PRIVATE_CONFIGURATION"));
    expect(await runLessonEditorAction({})).toEqual({ kind: "unavailable" });
    expect(mocks.draft).not.toHaveBeenCalled();
  });
});
