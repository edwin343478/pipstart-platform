import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ handle: vi.fn(), store: vi.fn() }));
vi.mock("@/lib/optional-email/address-suppression", () => ({
  handleAddressSuppressionWebhook: mocks.handle,
}));
vi.mock("@/lib/optional-email/address-suppression-store", () => ({
  createAddressSuppressionStore: mocks.store,
}));
import { POST } from "./route";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});
describe("separate optional-suppression endpoint", () => {
  it("uses only its dedicated signing secret and private store", async () => {
    vi.stubEnv("PIPSTART_OPTIONAL_SUPPRESSION_WEBHOOK_SECRET", " dedicated ");
    vi.stubEnv("PIPSTART_RESEND_WEBHOOK_SECRET", "existing-monitor-secret");
    const store = { record: vi.fn() },
      response = Response.json({ status: "recorded" });
    mocks.store.mockReturnValue(store);
    mocks.handle.mockResolvedValue(response);
    const request = new Request("https://pipstart.net", { method: "POST" });
    expect(await POST(request)).toBe(response);
    expect(mocks.handle).toHaveBeenCalledWith(request, "dedicated", store);
  });
  it("does not fall back to the monitor signing secret", async () => {
    vi.stubEnv("PIPSTART_OPTIONAL_SUPPRESSION_WEBHOOK_SECRET", "");
    vi.stubEnv("PIPSTART_RESEND_WEBHOOK_SECRET", "monitor");
    mocks.store.mockReturnValue(null);
    await POST(new Request("https://pipstart.net", { method: "POST" }));
    expect(mocks.handle.mock.calls[0][1]).toBe("");
  });
});
