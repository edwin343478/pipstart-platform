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
import Page, { dynamic, metadata } from "./page";
const actor = "2d734acd-a974-45f1-aabc-bc9b0a37fb40";
const run = (params: Record<string, string | string[]> = {}) =>
  Page({ searchParams: Promise.resolve(params) });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.enabled.mockReturnValue(true);
  mocks.gate.mockResolvedValue({
    kind: "authorized",
    access: {
      authorized: true,
      user_id: actor,
      roles: ["owner"],
      capabilities: ["staff.enter", "audit.read", "people.read"],
    },
  });
});
describe("read-only staff audit route", () => {
  it("is dynamic and excluded from indexing", () => {
    expect(dynamic).toBe("force-dynamic");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
  it("does no identity or audit read when default closed", async () => {
    mocks.enabled.mockReturnValue(false);
    await expect(run()).rejects.toThrow("NOT_FOUND");
    expect(mocks.gate).not.toHaveBeenCalled();
    expect(mocks.factory).not.toHaveBeenCalled();
  });
  it.each(["signed-out", "denied", "challenge", "unavailable"])(
    "redirects %s before audit access",
    async (kind) => {
      mocks.gate.mockResolvedValue({ kind });
      await expect(run()).rejects.toThrow("REDIRECT");
      expect(mocks.redirect).toHaveBeenCalledWith("/admin/access");
      expect(mocks.factory).not.toHaveBeenCalled();
    },
  );
  it.each(["administrator", "author", "reviewer"])(
    "requires audit.read even for a verified %s",
    async (role) => {
      mocks.gate.mockResolvedValue({
        kind: "authorized",
        access: { roles: [role], capabilities: ["staff.enter", "people.read"] },
      });
      await expect(run()).rejects.toThrow("NOT_FOUND");
      expect(mocks.factory).not.toHaveBeenCalled();
    },
  );
  it("reads one bounded page through the signed-user client with cancellation", async () => {
    const abort = vi.fn().mockResolvedValue({ data: [], error: null }),
      rpc = vi.fn(() => ({ abortSignal: abort }));
    mocks.factory.mockResolvedValue({ rpc });
    const view = await run();
    expect(rpc).toHaveBeenCalledExactlyOnceWith("pipstart_staff_audit_page", {
      p_before: null,
      p_before_id: null,
      p_limit: 26,
    });
    expect(abort.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
    expect(view.props.children.props.page).toEqual({
      kind: "ready",
      items: [],
      next: null,
    });
    expect(view.props.audit).toBe(true);
  });
  it("passes the cursor unchanged and permits an explicitly delegated Administrator", async () => {
    mocks.gate.mockResolvedValue({
      kind: "authorized",
      access: {
        roles: ["administrator"],
        capabilities: ["staff.enter", "audit.read"],
      },
    });
    const rpc = vi.fn(() => ({
      abortSignal: vi.fn().mockResolvedValue({ data: [], error: null }),
    }));
    mocks.factory.mockResolvedValue({ rpc });
    const view = await run({
      before: "2026-10-27T00:00:00.123456+00:00",
      beforeId: actor,
    });
    expect(rpc).toHaveBeenCalledWith("pipstart_staff_audit_page", {
      p_before: "2026-10-27T00:00:00.123456+00:00",
      p_before_id: actor,
      p_limit: 26,
    });
    expect(view.props.children.props.paginated).toBe(true);
    expect(view.props.people).toBe(false);
  });
  it("does not call the provider for invalid query input", async () => {
    const view = await run({ beforeId: actor });
    expect(mocks.factory).not.toHaveBeenCalled();
    expect(view.props.children.props.invalid).toBe(true);
    expect(view.props.children.props.page).toBeNull();
  });
  it.each([
    { data: [], error: { code: "42501", message: "private-sentinel" } },
    { data: [{ token: "private-sentinel" }], error: null },
    { data: null, error: null },
  ])("fails closed on denial or malformed response %#", async (reply) => {
    mocks.factory.mockResolvedValue({
      rpc: () => ({ abortSignal: vi.fn().mockResolvedValue(reply) }),
    });
    expect((await run()).props.children.props.page).toBeNull();
  });
  it("hides private exceptions and never substitutes sample events", async () => {
    mocks.factory.mockRejectedValue(Error("private-sentinel"));
    const view = await run();
    expect(view.props.children.props.page).toBeNull();
  });
  it("rechecks the gate on the next request after revocation", async () => {
    mocks.factory.mockResolvedValue({
      rpc: () => ({
        abortSignal: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
    await run();
    mocks.gate.mockResolvedValue({ kind: "denied" });
    await expect(run()).rejects.toThrow("REDIRECT");
    expect(mocks.gate).toHaveBeenCalledTimes(2);
    expect(mocks.factory).toHaveBeenCalledTimes(1);
  });
});
describe("MP10f filtered audit views", () => {
  const ok = () => {
    const rpc = vi.fn(() => ({
      abortSignal: vi.fn().mockResolvedValue({ data: [], error: null }),
    }));
    mocks.factory.mockResolvedValue({ rpc });
    return rpc;
  };
  it("sends a filtered staff query to the filtered staff view", async () => {
    const rpc = ok();
    await run({
      operation: "grant_role",
      actor,
      from: "2026-11-01",
      to: "2026-11-16",
    });
    expect(rpc).toHaveBeenCalledExactlyOnceWith(
      "pipstart_staff_audit_page_filtered",
      {
        p_before: null,
        p_before_id: null,
        p_limit: 26,
        p_operation: "grant_role",
        p_actor: actor,
        p_resource: null,
        p_from: "2026-11-01T00:00:00.000Z",
        p_to: "2026-11-17T00:00:00.000Z",
      },
    );
  });
  it("reads the content view and passes its page and query to the view", async () => {
    const rpc = ok();
    const view = await run({
      source: "content",
      operation: "maintenance",
      item: "crypto-start-here",
    });
    expect(rpc).toHaveBeenCalledExactlyOnceWith("pipstart_content_audit_page", {
      p_before: null,
      p_before_id: null,
      p_limit: 26,
      p_operation: "maintenance",
      p_actor: null,
      p_item: "crypto-start-here",
      p_from: null,
      p_to: null,
    });
    expect(view.props.children.props.contentPage).toEqual({
      kind: "ready",
      items: [],
      next: null,
    });
    expect(view.props.children.props.page).toBeNull();
    expect(view.props.children.props.query.source).toBe("content");
  });
  it("keeps the original staff page when the form is submitted empty", async () => {
    const rpc = ok();
    await run({
      source: "staff",
      operation: "",
      actor: "",
      item: "",
      from: "",
      to: "",
    });
    expect(rpc).toHaveBeenCalledExactlyOnceWith("pipstart_staff_audit_page", {
      p_before: null,
      p_before_id: null,
      p_limit: 26,
    });
  });
  it.each([
    { source: "content", operation: "grant_role" },
    { actor: "nobody" },
    { from: "2026-11-16", to: "2026-11-01" },
  ])("makes no call for an invalid filter %j", async (params) => {
    const view = await run(params as unknown as Record<string, string>);
    expect(mocks.factory).not.toHaveBeenCalled();
    expect(view.props.children.props.invalid).toBe(true);
  });
  it("fails closed on a malformed content reply", async () => {
    mocks.factory.mockResolvedValue({
      rpc: () => ({
        abortSignal: vi.fn().mockResolvedValue({
          data: [{ detail: "private-sentinel" }],
          error: null,
        }),
      }),
    });
    expect(
      (await run({ source: "content" })).props.children.props.contentPage,
    ).toBeNull();
  });
});
