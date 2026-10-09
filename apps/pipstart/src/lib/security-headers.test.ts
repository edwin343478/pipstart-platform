import { describe, expect, it } from "vitest";

import nextConfig, {
  economicCalendarSecurityHeaders,
  securityHeaders,
} from "../../next.config";

describe("PipStart security headers", () => {
  it("disables framework disclosure", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("allows the isolated local browser-test origin in development", () => {
    expect(nextConfig.allowedDevOrigins).toEqual(["127.0.0.1"]);
  });

  it("applies the hardened header set to every route", async () => {
    const configuredHeaders = await nextConfig.headers?.();

    expect(configuredHeaders).toEqual([
      {
        source: "/(.*)",
        headers: [...securityHeaders],
      },
      {
        source: "/economic-calendar/:path*",
        headers: economicCalendarSecurityHeaders,
      },
    ]);
  });

  it("enforces CSP and blocks risky browser capabilities", () => {
    const headers = Object.fromEntries(
      securityHeaders.map(({ key, value }) => [key, value]),
    );

    expect(headers["Content-Security-Policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers["Content-Security-Policy"]).toContain("object-src 'none'");
    expect(headers["Content-Security-Policy-Report-Only"]).toBeUndefined();
    expect(headers["Permissions-Policy"]).toBe(
      "camera=(), microphone=(), geolocation=()",
    );
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
  });
});
