import { describe, expect, it } from "vitest";

import nextConfig, {
  economicCalendarSecurityHeaders,
  securityHeaders,
  unsubscribeSecurityHeaders,
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
      {
        source: "/unsubscribe",
        headers: unsubscribeSecurityHeaders,
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

  it("places the exact unsubscribe privacy rule after the site-wide rule", async () => {
    const configured = await nextConfig.headers?.();
    expect(configured?.at(-1)?.source).toBe("/unsubscribe");
    expect(configured?.at(-1)?.headers).toEqual(unsubscribeSecurityHeaders);
    expect(configured?.filter(rule => rule.source === "/unsubscribe")).toHaveLength(1);
  });

  it("keeps token-page restrictions strict without changing normal-page policy", () => {
    const tokenHeaders = Object.fromEntries(unsubscribeSecurityHeaders.map(({ key, value }) => [key, value]));
    const normalHeaders = Object.fromEntries(securityHeaders.map(({ key, value }) => [key, value]));
    expect(tokenHeaders["Referrer-Policy"]).toBe("no-referrer");
    expect(tokenHeaders["Content-Security-Policy"]).toContain("default-src 'none'");
    expect(tokenHeaders["Content-Security-Policy"]).not.toContain("script-src 'self'");
    expect(tokenHeaders["X-Robots-Tag"]).toContain("noindex");
    expect(normalHeaders["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(normalHeaders["Content-Security-Policy"]).toContain("script-src 'self'");
  });
});
