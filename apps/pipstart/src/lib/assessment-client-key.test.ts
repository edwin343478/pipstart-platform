import { afterEach, describe, expect, it, vi } from "vitest";
import { getAnonymousAssessmentClientKey } from "./assessment-client-key";

const trusted = { VERCEL: "1" };
const key = (address: string, extra: Record<string, string> = {}) =>
  getAnonymousAssessmentClientKey(
    new Headers({ "x-vercel-forwarded-for": address, ...extra }),
    trusted,
  );

afterEach(() => vi.unstubAllEnvs());

describe("anonymous assessment identity", () => {
  it("ignores user-agent changes, cookie changes and spoofed forwarding headers", () => {
    expect(key("192.0.2.1", { "user-agent": "first", cookie: "a=1" })).toBe(
      key("192.0.2.1", {
        "user-agent": "second",
        cookie: "a=2",
        "x-forwarded-for": "198.51.100.1",
      }),
    );
  });
  it("isolates distinct trusted IPv4 clients", () =>
    expect(key("192.0.2.1")).not.toBe(key("192.0.2.2")));
  it("normalizes IPv6 spelling and case", () =>
    expect(key("2001:DB8:0:0::1")).toBe(key("2001:db8::1")));
  it("groups IPv6 privacy addresses by /64", () =>
    expect(key("2001:db8:1:2::1")).toBe(key("2001:db8:1:2::ffff")));
  it("separates different IPv6 networks", () =>
    expect(key("2001:db8:1:2::1")).not.toBe(key("2001:db8:1:3::1")));
  it("shares IPv4 and IPv4-mapped IPv6 budgets", () =>
    expect(key("::ffff:192.0.2.1")).toBe(key("192.0.2.1")));
  it("uses a shared bucket when no ingress is trusted", () => {
    expect(
      getAnonymousAssessmentClientKey(
        new Headers({ "x-forwarded-for": "192.0.2.1" }),
        {},
      ),
    ).toBe(
      getAnonymousAssessmentClientKey(
        new Headers({
          "x-forwarded-for": "192.0.2.2",
          "x-real-ip": "198.51.100.2",
        }),
        {},
      ),
    );
  });
  it("uses only the explicitly configured self-hosted header", () => {
    const env = { PIPSTART_TRUST_PROXY_IP_HEADER: "x-real-ip" };
    expect(
      getAnonymousAssessmentClientKey(
        new Headers({
          "x-real-ip": "192.0.2.1",
          "x-forwarded-for": "198.51.100.1",
        }),
        env,
      ),
    ).toBe(key("192.0.2.1"));
  });
  it("supports ingress-overwritten single x-forwarded-for values", () => {
    expect(
      getAnonymousAssessmentClientKey(
        new Headers({ "x-forwarded-for": "192.0.2.1" }),
        { PIPSTART_TRUST_PROXY_IP_HEADER: "x-forwarded-for" },
      ),
    ).toBe(key("192.0.2.1"));
  });
  it.each([
    "",
    "unknown",
    "192.0.2.1, 198.51.100.1",
    "example.com",
    "192.0.2.1:443",
    "[2001:db8::1]",
    "fe80::1%eth0",
    "x".repeat(1024),
  ])("fails closed for invalid header %s", (value) => {
    expect(key(value)).toBe(getAnonymousAssessmentClientKey(new Headers(), {}));
  });
  it("does not fall back to an attacker-controlled header", () => {
    expect(
      getAnonymousAssessmentClientKey(
        new Headers({ "x-forwarded-for": "192.0.2.1" }),
        trusted,
      ),
    ).toBe(getAnonymousAssessmentClientKey(new Headers(), {}));
  });
  it("does not expose an IP or user agent in the database key", () => {
    const result = key("192.0.2.1", { "user-agent": "private-agent" });
    expect(result).toMatch(/^pipstart:anonymous-assessment:v2:[a-f0-9]{64}$/);
    expect(result).not.toContain("192.0.2.1");
    expect(result).not.toContain("private-agent");
  });
});
