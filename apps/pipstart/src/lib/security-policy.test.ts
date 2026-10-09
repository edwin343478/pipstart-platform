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
