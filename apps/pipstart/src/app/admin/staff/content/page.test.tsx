import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  enabled: vi.fn(),
  gate: vi.fn(),
  read: vi.fn(),
  notFound: vi.fn(() => {
    throw Error("NOT_FOUND");
  }),
  redirect: vi.fn(() => {
    throw Error("REDIRECT");
  }),
}));
vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  redirect: mocks.redirect,
}));
vi.mock("@/lib/auth/staff-gate", () => ({
  staffUiEnabled: mocks.enabled,
  readStaffGate: mocks.gate,
}));
vi.mock("./actions", () => ({ readEditorialWorkspaceAction: mocks.read }));
vi.mock("@/components/staff/staff-content-workspace", () => ({
  StaffContentWorkspace: () => <div>CONNECTED_LIBRARY</div>,
}));
import Page from "./page";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.enabled.mockReturnValue(true);
  mocks.gate.mockResolvedValue({
    kind: "authorized",
    access: {
      authorized: true,
      user_id: "d1000000-0000-4000-8000-000000000001",
      roles: ["owner"],
      capabilities: ["staff.enter", "content.read"],
    },
  });
  mocks.read.mockResolvedValue({
    kind: "list",
    page: { rows: [], next: null },
  });
});
describe("content route guard", () => {
  it("is absent when staff UI is disabled", async () => {
    mocks.enabled.mockReturnValue(false);
    await expect(Page()).rejects.toThrow("NOT_FOUND");
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it("redirects unverified staff before reading content", async () => {
    mocks.gate.mockResolvedValue({ kind: "challenge" });
    await expect(Page()).rejects.toThrow("REDIRECT");
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it("does not expose content navigation to maintenance-only staff", async () => {
    mocks.gate.mockResolvedValue({
      kind: "authorized",
      access: {
        roles: ["moderator"],
        capabilities: ["staff.enter", "maintenance.assigned"],
      },
    });
    await expect(Page()).rejects.toThrow("NOT_FOUND");
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it("renders only after calling the live read boundary", async () => {
    const html = renderToStaticMarkup(await Page());
    expect(mocks.read).toHaveBeenCalledWith({ kind: "list", after: "" });
    expect(html).toContain("CONNECTED_LIBRARY");
    expect(html).toContain('href="/admin/staff/content"');
  });
});
