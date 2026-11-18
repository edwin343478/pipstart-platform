import { readFileSync } from "node:fs";
import { describe, expect, it, vi, afterEach } from "vitest";
import worker from "./index";
import {
  secureSkillcimaResponse,
  skillcimaApiHeaders,
} from "./security-response";

afterEach(() => vi.unstubAllGlobals());

describe("Skillcima response hardening", () => {
  it("preserves response status, body, no-store, CORS, Vary and retry metadata", async () => {
    const source = new Response('{"error":"limited"}', {
      status: 429,
      statusText: "Too Many Requests",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "https://skillcima.com",
        Vary: "Origin",
        "Retry-After": "60",
        "Referrer-Policy": "no-referrer",
      },
    });
    const result = secureSkillcimaResponse(source);
    expect(result.status).toBe(429);
    expect(result.statusText).toBe("Too Many Requests");
    expect(await result.text()).toBe('{"error":"limited"}');
    for (const name of [
      "content-type",
      "cache-control",
      "access-control-allow-origin",
      "vary",
      "retry-after",
    ]) {
      expect(result.headers.get(name)).toBe(source.headers.get(name));
    }
    for (const [name, value] of Object.entries(skillcimaApiHeaders)) {
      expect(result.headers.get(name)).toBe(value);
    }
  });

  it("keeps successful JSON and bodyless responses intact without inventing cache rules", async () => {
    const result = secureSkillcimaResponse(
      new Response('{"ok":true}', { status: 200 }),
    );
    expect(result.status).toBe(200);
    expect(await result.text()).toBe('{"ok":true}');
    expect(result.headers.get("cache-control")).toBeNull();
    const empty = secureSkillcimaResponse(new Response(null, { status: 204 }));
    expect(empty.status).toBe(204);
    expect(await empty.text()).toBe("");
  });

  it.each([
    ["/api/v1/unknown", "GET", 404],
    ["/api/v1/lead", "OPTIONS", 204],
    ["/api/v1/lead", "GET", 405],
    ["/api/v1/confirm", "GET", 405],
    ["/api/v1/unsubscribe", "GET", 405],
    ["/api/v1/webhooks/resend", "GET", 405],
    ["/api/v1/health", "GET", 503],
  ] as const)(
    "hardens real dispatch %s %s without dependency contact",
    async (pathname, method, status) => {
      const externalFetch = vi.fn(() =>
        Promise.reject(new Error("External contact forbidden")),
      );
      vi.stubGlobal("fetch", externalFetch);
      const result = await worker.fetch(
        new Request(`https://skillcima.com${pathname}`, {
          method,
          headers: { Origin: "https://skillcima.com" },
        }),
        {} as Parameters<typeof worker.fetch>[1],
      );
      expect(result.status).toBe(status);
      expect(result.headers.get("cache-control")).toBe("no-store");
      for (const [name, value] of Object.entries(skillcimaApiHeaders)) {
        expect(result.headers.get(name)).toBe(value);
      }
      if (method === "OPTIONS") {
        expect(result.headers.get("access-control-allow-origin")).toBe(
          "https://skillcima.com",
        );
      }
      expect(externalFetch).not.toHaveBeenCalled();
    },
  );

  it("keeps the static policy separate and protects both token-page URL variants", () => {
    const text = readFileSync(
      new URL("../public/_headers", import.meta.url),
      "utf8",
    );
    expect(text).toContain("frame-src https://challenges.cloudflare.com");
    expect(text).not.toContain("'unsafe-eval'");
    expect(text).toContain(
      "https://static.cloudflareinsights.com/beacon.min.js https://static.cloudflareinsights.com/beacon.min.js/",
    );
    expect(text).not.toContain("https://cloudflareinsights.com");
    expect(text).toContain("Referrer-Policy: no-referrer");
    for (const name of ["confirm", "unsubscribe", "email-preferences"]) {
      expect(text).toContain(`/${name}\n  Cache-Control: no-store`);
      expect(text).toContain(`/${name}/\n  Cache-Control: no-store`);
    }
  });
});
