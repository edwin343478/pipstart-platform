import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  configured: vi.fn(),
  user: vi.fn(),
  service: vi.fn(),
  run: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.user,
}));
vi.mock("@/lib/supabase/staff-maintenance", () => ({
  maintenanceConfigured: mocks.configured,
  createMaintenanceClient: mocks.service,
}));
vi.mock("@/lib/auth/staff-maintenance-transport", () => ({
  runMaintenanceTransport: mocks.run,
}));
import { executeMaintenanceAction } from "./actions";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.configured.mockReturnValue(true);
  mocks.user.mockResolvedValue({ ownedUserClient: true });
  mocks.service.mockReturnValue({ auth: { admin: { ownedProvider: true } } });
  mocks.run.mockResolvedValue({ kind: "denied" });
});
describe("Owner maintenance server action boundary", () => {
  it("is disabled before accessing cookies or creating an administration client", async () => {
    mocks.configured.mockReturnValue(false);
    expect(await executeMaintenanceAction({})).toEqual({
      kind: "disabled",
    });
    expect(mocks.user).not.toHaveBeenCalled();
    expect(mocks.service).not.toHaveBeenCalled();
  });
  it("always delegates to the live-user transport, without accepting a posted actor", async () => {
    const input = { actor: "untrusted" };
    expect(await executeMaintenanceAction(input)).toEqual({
      kind: "denied",
    });
    expect(mocks.run).toHaveBeenCalledWith(
      { ownedUserClient: true },
      { auth: { admin: { ownedProvider: true } } },
      input,
    );
  });
  it("fails closed when a required client is absent", async () => {
    mocks.user.mockResolvedValue(null);
    expect(await executeMaintenanceAction({})).toEqual({
      kind: "disabled",
    });
    expect(mocks.run).not.toHaveBeenCalled();
  });
  it("never returns raw setup errors or credentials", async () => {
    mocks.service.mockImplementation(() => {
      throw Error("private-dedicated-secret");
    });
    expect(await executeMaintenanceAction({})).toEqual({ kind: "unknown" });
  });
});
