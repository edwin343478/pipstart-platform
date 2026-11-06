import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ client: vi.fn(), draft: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.client,
}));
vi.mock("@/lib/content/quiz-draft", () => ({ runQuizDraft: mocks.draft }));
import { runQuizDraftAction } from "./quiz-actions";
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "true");
  mocks.client.mockResolvedValue({ userSession: true });
  mocks.draft.mockResolvedValue({ kind: "denied" });
});
afterEach(() => vi.unstubAllEnvs());
describe("M22 MP07b quiz draft server action", () => {
  it("refuses disabled access before reading cookies", async () => {
    vi.stubEnv("PIPSTART_M22_STAFF_UI_ENABLED", "false");
    expect(await runQuizDraftAction({ kind: "save" })).toEqual({
      kind: "denied",
    });
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("passes only the cookie/session client to the live boundary", async () => {
    const input = { kind: "load", id: "quiz-1" };
    await runQuizDraftAction(input);
    expect(mocks.draft).toHaveBeenCalledWith({ userSession: true }, input);
  });
  it("returns no configuration error details", async () => {
    mocks.client.mockRejectedValue(Error("PRIVATE_CONFIGURATION"));
    expect(await runQuizDraftAction({})).toEqual({ kind: "unavailable" });
    expect(mocks.draft).not.toHaveBeenCalled();
  });
});
