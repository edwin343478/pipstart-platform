import { afterEach, describe, expect, it, vi } from "vitest";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
describe("staff browser CSP configuration wiring", () => {
  it("adds the configured origin to both normal/calendar connections while leaving unsubscribe isolated", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://pipstart.example");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://approved.supabase.co");
    const c = await import("../../next.config");
    for (const headers of [
      c.securityHeaders,
      c.economicCalendarSecurityHeaders,
    ]) {
      const policy = headers.find(
        (h) => h.key === "Content-Security-Policy",
      )?.value;
      expect(
        policy?.split("; ").find((d) => d.startsWith("connect-src ")),
      ).toBe("connect-src 'self' https://approved.supabase.co");
      expect(policy).not.toContain("unsafe-eval");
    }
    const privatePolicy = c.unsubscribeSecurityHeaders.find(
      (h) => h.key === "Content-Security-Policy",
    )?.value;
    expect(privatePolicy).toContain("default-src 'none'");
    expect(privatePolicy).not.toContain("approved.supabase.co");
    expect((await c.default.headers?.())?.at(-1)?.source).toBe("/unsubscribe");
  });
  it("does not turn missing API configuration into an unrestricted network policy", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const c = await import("../../next.config");
    expect(
      c.securityHeaders
        .find((h) => h.key === "Content-Security-Policy")
        ?.value.split("; ")
        .find((d) => d.startsWith("connect-src ")),
    ).toBe("connect-src 'self'");
  });
});
