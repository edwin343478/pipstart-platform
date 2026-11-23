import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildReport,
  errorCode,
  resetErrorReportThrottleForTests,
  routeTemplate,
  sendErrorReport,
} from "./error-report";

const url = "https://hc-ping.com/00000000-0000-4000-8000-000000000001";
const ok = () => new Response("OK", { status: 200 });

describe("routeTemplate", () => {
  it("preserves fixed categories and drops path details", () => {
    expect(routeTemplate("/learn/forex/level-1/what-is-forex")).toBe("/learn");
    expect(routeTemplate("/learn/[track]/[...slug]")).toBe("/learn");
    expect(routeTemplate("/admin/staff/content?view=quiz")).toBe("/admin");
    expect(routeTemplate("/unknown-category/detail")).toBe("/unknown");
    expect(routeTemplate("https://example.invalid/account")).toBe("/unknown");
    expect(routeTemplate("/")).toBe("/");
  });
  it("rejects non-strings and oversized input", () => {
    expect(routeTemplate(undefined)).toBe("/unknown");
    expect(routeTemplate({})).toBe("/unknown");
    expect(routeTemplate("/" + "a".repeat(3000))).toBe("/unknown");
  });
});

describe("errorCode and buildReport", () => {
  it("uses only a fixed error class name", () => {
    expect(
      errorCode(
        Object.assign(new Error("secret message"), { digest: "2847361" }),
      ),
    ).toBe("Error");
    expect(errorCode(new TypeError("user@example.com"))).toBe("TypeError");
    expect(errorCode({ name: "<script>" })).toBe("Error");
    expect(errorCode("boom")).toBe("Error");
  });
  it("produces a constant shape with no message or stack", () => {
    const r = buildReport(
      "server",
      "/login?next=/account",
      500,
      "TypeError",
      () => 0,
    );
    expect(r).toEqual({
      app: "pipstart",
      surface: "server",
      route: "/login",
      status: 500,
      code: "TypeError",
      at: "1970-01-01T00:00:00.000Z",
    });
    expect(
      buildReport("server", "/", 9999, "custom-code", () => 0),
    ).toMatchObject({ status: null, code: "Error" });
  });
});

describe("sendErrorReport", () => {
  beforeEach(() => resetErrorReportThrottleForTests());
  afterEach(() => vi.restoreAllMocks());
  const report = buildReport("server", "/", 500, "Error", () => 0);

  it("is disabled without configuration and refuses non-canonical URLs", async () => {
    const ping = vi.fn();
    expect(await sendErrorReport(report, "", ping)).toBe("disabled");
    vi.spyOn(console, "error").mockImplementation(() => {});
    for (const bad of [
      "http://hc-ping.com/00000000-0000-4000-8000-000000000001",
      url + "/fail",
      url.replace("hc-ping.com", "evil.test"),
    ])
      expect(await sendErrorReport(report, bad, ping)).toBe("invalid-config");
    expect(ping).not.toHaveBeenCalled();
  });

  it("posts the report to /fail without credentials or redirects", async () => {
    const ping = vi.fn(async () => ok());
    expect(await sendErrorReport(report, url, ping, () => 1_000)).toBe("sent");
    const [target, init] = ping.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(target).toBe(url + "/fail");
    expect(init).toMatchObject({
      method: "POST",
      redirect: "error",
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    expect(JSON.parse(String(init.body))).toEqual(report);
  });

  it("sends at most one report per minute per instance", async () => {
    const ping = vi.fn(async () => ok());
    expect(await sendErrorReport(report, url, ping, () => 1_000)).toBe("sent");
    expect(await sendErrorReport(report, url, ping, () => 30_000)).toBe(
      "throttled",
    );
    expect(await sendErrorReport(report, url, ping, () => 61_001)).toBe("sent");
    expect(ping).toHaveBeenCalledTimes(2);
  });

  it("never throws when the monitoring service fails or answers oddly", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(
      await sendErrorReport(
        report,
        url,
        vi.fn(async () => {
          throw new Error("down");
        }),
      ),
    ).toBe("failed");
    resetErrorReportThrottleForTests();
    expect(
      await sendErrorReport(
        report,
        url,
        vi.fn(async () => new Response("OK (rate limited)", { status: 200 })),
      ),
    ).toBe("failed");
    resetErrorReportThrottleForTests();
    expect(
      await sendErrorReport(
        report,
        url,
        vi.fn(async () => new Response("", { status: 500 })),
      ),
    ).toBe("failed");
    expect(log.mock.calls.flat().join(" ")).not.toContain("hc-ping.com");
  });
});
