import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  enabled: vi.fn(),
  gate: vi.fn(),
  draft: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw Error("NOT_FOUND");
  },
  redirect: () => {
    throw Error("REDIRECT");
  },
}));
vi.mock("@/lib/auth/staff-gate", () => ({
  staffUiEnabled: mocks.enabled,
  readStaffGate: mocks.gate,
}));
vi.mock("../quiz-actions", () => ({ runQuizDraftAction: mocks.draft }));
vi.mock("@/components/staff/staff-quiz-editor", () => ({
  StaffQuizEditor: () => <div>CONNECTED_QUIZ_EDITOR</div>,
}));
import Page from "./page";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.enabled.mockReturnValue(true);
  mocks.gate.mockResolvedValue({
    kind: "authorized",
    access: { roles: ["owner"], capabilities: ["staff.enter"] },
  });
  mocks.draft.mockResolvedValue({ kind: "denied" });
});
const page = (params: Awaited<Parameters<typeof Page>[0]["searchParams"]>) =>
  Page({ searchParams: Promise.resolve(params) });
describe("M22 MP07b quiz editor route", () => {
  it("is absent with the staff flag off", async () => {
    mocks.enabled.mockReturnValue(false);
    await expect(page({ id: "quiz-1" })).rejects.toThrow("NOT_FOUND");
    expect(mocks.gate).not.toHaveBeenCalled();
  });
  it("redirects unverified sessions and refuses read-only roles", async () => {
    mocks.gate.mockResolvedValue({ kind: "challenge" });
    await expect(page({ id: "quiz-1" })).rejects.toThrow("REDIRECT");
    mocks.gate.mockResolvedValue({
      kind: "authorized",
      access: { roles: ["reviewer"], capabilities: ["staff.enter"] },
    });
    await expect(page({ id: "quiz-1" })).rejects.toThrow("NOT_FOUND");
    expect(mocks.draft).not.toHaveBeenCalled();
  });
  it.each([{}, { id: ["a", "b"] }, { id: "bad id" }, { id: "quiz-1", x: "y" }])(
    "opens existing quizzes only, by a valid identity %#",
    async (params) => {
      await expect(page(params)).rejects.toThrow("NOT_FOUND");
      expect(mocks.draft).not.toHaveBeenCalled();
    },
  );
  it("shows unavailable without leaking a refused quiz", async () => {
    const html = renderToStaticMarkup(await page({ id: "quiz-1" }));
    expect(mocks.draft).toHaveBeenCalledWith({ kind: "load", id: "quiz-1" });
    expect(html).toContain("Quiz editor unavailable");
    expect(html).not.toContain("CONNECTED_QUIZ_EDITOR");
  });
  it("opens the editor for a readable quiz", async () => {
    mocks.draft.mockResolvedValue({ kind: "ready", item: {} });
    expect(renderToStaticMarkup(await page({ id: "quiz-1" }))).toContain(
      "CONNECTED_QUIZ_EDITOR",
    );
  });
});
