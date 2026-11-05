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
vi.mock("../lesson-actions", () => ({ runLessonEditorAction: mocks.draft }));
vi.mock("@/components/staff/staff-lesson-editor", () => ({
  StaffLessonEditor: () => <div>CONNECTED_EDITOR</div>,
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
describe("editor route live gate and identity", () => {
  it("is absent with the staff flag off", async () => {
    mocks.enabled.mockReturnValue(false);
    await expect(page({})).rejects.toThrow("NOT_FOUND");
    expect(mocks.gate).not.toHaveBeenCalled();
  });
  it("redirects unverified sessions and refuses read-only roles", async () => {
    mocks.gate.mockResolvedValue({ kind: "challenge" });
    await expect(page({})).rejects.toThrow("REDIRECT");
    mocks.gate.mockResolvedValue({
      kind: "authorized",
      access: { roles: ["reviewer"], capabilities: ["staff.enter"] },
    });
    await expect(page({ id: "course-1" })).rejects.toThrow("NOT_FOUND");
    expect(mocks.draft).not.toHaveBeenCalled();
  });
  it("shows creation to verified writers without granting parent access", async () => {
    mocks.gate.mockResolvedValue({
      kind: "authorized",
      access: { roles: ["author"], capabilities: ["staff.enter"] },
    });
    expect(
      renderToStaticMarkup(await page({ parent: "module-1", path: "forex" })),
    ).toContain("CONNECTED_EDITOR");
  });
  it.each([
    { id: ["a", "b"] },
    { id: "bad/id" },
    { extra: "bad" },
    { path: "other" },
  ])("refuses malformed identities %#", async (params) => {
    await expect(page(params)).rejects.toThrow("NOT_FOUND");
  });
  it("shows unavailable without leaking a denied item's content", async () => {
    const html = renderToStaticMarkup(await page({ id: "course-1" }));
    expect(mocks.draft).toHaveBeenCalledWith({ kind: "load", id: "course-1" });
    expect(html).toContain("Lesson editor unavailable");
    expect(html).not.toContain("CONNECTED_EDITOR");
  });
});
