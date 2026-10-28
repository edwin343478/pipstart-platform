import { describe, expect, it } from "vitest";
import { createContentSecurityPolicy } from "./security-policy";

describe("enforced static-delivery CSP", () => {
  it("limits calendar exceptions to the approved script and frame host", () => {
    const csp = createContentSecurityPolicy(
      false,
      "https://pipstart.example",
      true,
    );
    expect(csp).toContain("frame-src https://www.tradingview-widget.com");
    expect(csp).toContain(
      "https://s3.tradingview.com/external-embedding/embed-widget-events.js",
    );
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("*.tradingview");
    expect(createContentSecurityPolicy(false)).not.toContain("tradingview");
  });
  it("blocks production eval, frames, objects and foreign connections", () => {
    const csp = createContentSecurityPolicy(false, "https://pipstart.example");
    expect(csp).not.toContain("unsafe-eval");
    for (const directive of [
      "connect-src 'self'",
      "frame-src 'none'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ])
      expect(csp).toContain(directive);
    expect(csp).toContain("upgrade-insecure-requests");
  });
  it("preserves inline hydration and self-hosted fonts", () => {
    expect(createContentSecurityPolicy(false)).toContain(
      "script-src 'self' 'unsafe-inline'",
    );
    expect(createContentSecurityPolicy(false)).toContain(
      "font-src 'self' data:",
    );
  });
  it("allows only development debugging and hot-reload exceptions", () => {
    const csp = createContentSecurityPolicy(true, "https://pipstart.example");
    expect(csp).toContain("unsafe-eval");
    expect(csp).toContain("connect-src 'self' ws: wss:");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });
  it.each([
    undefined,
    "http://localhost:3101",
    "http://127.0.0.1:3101",
    "invalid",
    "javascript:alert(1)",
  ])("does not upgrade local/invalid site URL %s", (url) => {
    expect(createContentSecurityPolicy(false, url)).not.toContain(
      "upgrade-insecure-requests",
    );
  });
});

describe("configured Auth/RPC connection origin", () => {
  const connect = (development: boolean, url?: string) =>
    createContentSecurityPolicy(
      development,
      "https://pipstart.example",
      false,
      url,
    )
      .split("; ")
      .find((d) => d.startsWith("connect-src "));
  it.each([
    "https://project.supabase.co",
    "https://auth.pipstart.example",
    "https://auth.pipstart.example:8443",
  ])("permits only the exact configured HTTPS API origin %s", (url) => {
    expect(connect(false, url)).toBe(
      "connect-src 'self' " + new URL(url).origin,
    );
    const csp = createContentSecurityPolicy(
      false,
      "https://pipstart.example",
      false,
      url,
    );
    expect(csp).not.toContain("*.supabase.co");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-src 'none'");
    expect(csp).toContain("form-action 'self'");
  });
  it.each([
    undefined,
    "",
    "invalid",
    "javascript:alert(1)",
    "data:text/html,test",
    "http://remote.example",
    "https://*.supabase.co",
    "https://user:password@project.supabase.co",
    "https://project.supabase.co/path",
    "https://project.supabase.co?token=sentinel",
    "https://project.supabase.co#fragment",
    "https://project.supabase.co;connect-src *",
    "https://project.\nsupabase.co",
  ])("fails closed for invalid or widened API configuration %#", (url) =>
    expect(connect(false, url)).toBe("connect-src 'self'"),
  );
  it.each(["http://127.0.0.1:54321", "http://localhost:54321"])(
    "permits exact loopback HTTP only in development %s",
    (url) => {
      expect(connect(true, url)).toBe(
        "connect-src 'self' " + new URL(url).origin + " ws: wss:",
      );
      expect(connect(false, url)).toBe("connect-src 'self'");
    },
  );
  it("keeps ordinary development HTTP hosts denied", () =>
    expect(connect(true, "http://remote.example:54321")).toBe(
      "connect-src 'self' ws: wss:",
    ));
  it("normalizes surrounding configuration whitespace without accepting embedded directives", () =>
    expect(connect(false, " https://project.supabase.co/ ")).toBe(
      "connect-src 'self' https://project.supabase.co",
    ));
});
