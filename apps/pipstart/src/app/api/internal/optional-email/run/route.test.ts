import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ handle: vi.fn(), run: vi.fn() }));
vi.mock("@/lib/optional-email/batch-endpoint", () => ({
  handleOptionalEmailBatch: mocks.handle,
}));
vi.mock("@/lib/optional-email/batch-runtime", () => ({
  runConfiguredOptionalEmailBatch: mocks.run,
}));
import { POST, runtime, maxDuration } from "./route";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});
it("passes only dedicated exact configuration, with lazy composition and no fallback credentials", async () => {
  vi.stubEnv("PIPSTART_OPTIONAL_WORKER_ENABLED", "false");
  vi.stubEnv("PIPSTART_OPTIONAL_WORKER_SECRET", " exact-secret ");
  vi.stubEnv("PIPSTART_OPTIONAL_RESEND_API_KEY", " exact-key ");
  vi.stubEnv("PIPSTART_ALERT_RESEND_API_KEY", "must-not-fallback");
  const result = new Response("generated");
  mocks.handle.mockResolvedValue(result);
  const request = new Request(
    "https://pipstart.net/api/internal/optional-email/run",
    { method: "POST" },
  );
  expect(await POST(request)).toBe(result);
  expect(mocks.handle).toHaveBeenCalledExactlyOnceWith(
    request,
    {
      enabled: "false",
      secret: " exact-secret ",
      apiKey: " exact-key ",
    },
    expect.any(Function),
  );
  expect(mocks.run).not.toHaveBeenCalled();
  await mocks.handle.mock.calls[0][2]("validated-fixture-key");
  expect(mocks.run).toHaveBeenCalledExactlyOnceWith(
    "validated-fixture-key",
    true,
  );
  expect(runtime).toBe("nodejs");
  expect(maxDuration).toBe(60);
});
