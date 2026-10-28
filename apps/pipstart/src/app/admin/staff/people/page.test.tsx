import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  enabled: vi.fn(),
  gate: vi.fn(),
  factory: vi.fn(),
  notFound: vi.fn(() => {
    throw Error("NOT_FOUND");
  }),
  redirect: vi.fn(() => {
    throw Error("REDIRECT");
  }),
}));
vi.mock("@/lib/auth/staff-gate", () => ({
  staffUiEnabled: mocks.enabled,
  readStaffGate: mocks.gate,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.factory,
}));
vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  redirect: mocks.redirect,
}));
import Page from "./page";
const actor = "2d734acd-a974-45f1-aabc-bc9b0a37fb40";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.enabled.mockReturnValue(true);
  mocks.gate.mockResolvedValue({
    kind: "authorized",
    access: {
      authorized: true,
      user_id: actor,
      roles: ["owner"],
      capabilities: ["staff.enter", "people.read", "roles.manage"],
    },
  });
});
describe("staff people server route", () => {
  it("remains default closed without touching Auth or profiles", async () => {
    mocks.enabled.mockReturnValue(false);
    await expect(Page()).rejects.toThrow("NOT_FOUND");
    expect(mocks.gate).not.toHaveBeenCalled();
    expect(mocks.factory).not.toHaveBeenCalled();
  });
  it.each(["signed-out", "denied", "challenge", "unavailable"])(
    "redirects %s before reading people",
    async (kind) => {
      mocks.gate.mockResolvedValue({ kind, userId: actor });
      await expect(Page()).rejects.toThrow("REDIRECT");
      expect(mocks.redirect).toHaveBeenCalledWith("/admin/access");
      expect(mocks.factory).not.toHaveBeenCalled();
    },
  );
  it("does not expose people to a verified Author without people.read", async () => {
    mocks.gate.mockResolvedValue({
      kind: "authorized",
      access: {
        user_id: actor,
        roles: ["author"],
        capabilities: ["staff.enter"],
      },
    });
    await expect(Page()).rejects.toThrow("NOT_FOUND");
    expect(mocks.factory).not.toHaveBeenCalled();
  });
  it("uses a bounded minimized user-context RPC with no Auth export", async () => {
    const abort = vi.fn().mockResolvedValue({
        data: { items: [], next_after: null },
        error: null,
      }),
      rpc = vi.fn(() => ({ abortSignal: abort }));
    mocks.factory.mockResolvedValue({ rpc });
    const result = await Page();
    expect(rpc).toHaveBeenCalledExactlyOnceWith("pipstart_staff_people", {
      p_after: null,
      p_limit: 25,
      p_query: "",
      p_user: null,
    });
    expect(abort.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
    expect(result.props.children.props.initialPage).toEqual({
      kind: "ready",
      items: [],
      nextAfter: null,
    });
  });
  it("does not substitute sample data on a provider failure", async () => {
    mocks.factory.mockRejectedValue(Error("private-sentinel"));
    const result = await Page();
    expect(result.props.children.props.initialPage).toBeNull();
  });
});
