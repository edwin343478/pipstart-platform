import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  enabled: vi.fn(),
  gate: vi.fn(),
  view: vi.fn(),
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
vi.mock("../../quiz-actions", () => ({ runQuizViewAction: mocks.view }));
vi.mock("@/components/staff/staff-quiz-view", () => ({
  StaffQuizView: ({ canEdit }: { canEdit: boolean }) => (
    <div>CONNECTED_QUIZ_VIEW {canEdit ? "EDIT" : "READ"}</div>
  ),
}));
import Page from "./page";
const as = (role: string) =>
  mocks.gate.mockResolvedValue({
    kind: "authorized",
    access: { roles: [role], capabilities: ["staff.enter"] },
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.enabled.mockReturnValue(true);
  as("reviewer");
  mocks.view.mockResolvedValue({ kind: "ready", view: {} });
});
const page = (params: Awaited<Parameters<typeof Page>[0]["searchParams"]>) =>
  Page({ searchParams: Promise.resolve(params) });

// M22 audit Package 5 (D4): the read-only quiz view route.
describe("Package 5 quiz view route", () => {
  it("is absent with the staff flag off, and redirects unverified sessions", async () => {
    mocks.enabled.mockReturnValue(false);
    await expect(page({ id: "quiz-1" })).rejects.toThrow("NOT_FOUND");
    mocks.enabled.mockReturnValue(true);
    mocks.gate.mockResolvedValue({ kind: "challenge" });
    await expect(page({ id: "quiz-1" })).rejects.toThrow("REDIRECT");
    expect(mocks.view).not.toHaveBeenCalled();
  });
  it("is open to Reviewers read-only, and to editors with an edit link", async () => {
    expect(renderToStaticMarkup(await page({ id: "quiz-1" }))).toContain(
      "CONNECTED_QUIZ_VIEW READ",
    );
    expect(mocks.view).toHaveBeenCalledWith({ id: "quiz-1", revision: null });
    as("author");
    expect(
      renderToStaticMarkup(await page({ id: "quiz-1", revision: "2" })),
    ).toContain("CONNECTED_QUIZ_VIEW EDIT");
    expect(mocks.view).toHaveBeenLastCalledWith({ id: "quiz-1", revision: 2 });
  });
  it("refuses roles that do not review or edit content", async () => {
    for (const role of ["moderator", "administrator", "affiliate_manager"]) {
      as(role);
      await expect(page({ id: "quiz-1" })).rejects.toThrow("NOT_FOUND");
    }
    expect(mocks.view).not.toHaveBeenCalled();
  });
  it.each([
    {},
    { id: "Bad Id" },
    { id: ["a", "b"] },
    { id: "quiz-1", revision: "0" },
    { id: "quiz-1", revision: "1.5" },
    { id: "quiz-1", revision: "-1" },
    { id: "quiz-1", x: "y" },
  ])("accepts only an identity and an optional revision %#", async (params) => {
    await expect(page(params)).rejects.toThrow("NOT_FOUND");
    expect(mocks.view).not.toHaveBeenCalled();
  });
  it("shows unavailable without leaking a refused quiz", async () => {
    mocks.view.mockResolvedValue({ kind: "denied" });
    const html = renderToStaticMarkup(await page({ id: "quiz-1" }));
    expect(html).toContain("Quiz unavailable");
    expect(html).not.toContain("CONNECTED_QUIZ_VIEW");
  });
});
