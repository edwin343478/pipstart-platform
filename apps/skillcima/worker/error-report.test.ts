import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  isPingUrl,
  reportWorkerError,
  resetWorkerReportThrottleForTests,
  workerErrorCode,
  workerRouteTemplate,
} from "./error-report";
import worker from "./index";

const url = "https://hc-ping.com/00000000-0000-4000-8000-000000000002";

describe("Skillcima worker error report", () => {
  beforeEach(() => resetWorkerReportThrottleForTests());
  afterEach(() => vi.restoreAllMocks());

  it("accepts only the canonical ping URL", () => {
    expect(isPingUrl(url)).toBe(true);
    for (const bad of [
      undefined,
      "",
      url + "/fail",
      url.replace("https", "http"),
      url.replace("hc-ping.com", "evil.test"),
      " " + url,
    ])
      expect(isPingUrl(bad)).toBe(false);
  });

  it("reduces the request URL to a template and the error to a class name", () => {
    expect(
      workerRouteTemplate(
        "https://skillcima.com/api/v1/confirm?token=abc&email=a@b.c",
      ),
    ).toBe("/api/v1/confirm");
    expect(
      workerRouteTemplate(
        "https://skillcima.com/x/123e4567-e89b-42d3-a456-426614174000/7/a.b",
      ),
    ).toBe("/x/:id/:n/:x");
    expect(workerErrorCode(new RangeError("secret"))).toBe("RangeError");
    expect(workerErrorCode("oops")).toBe("Error");
  });

  it("sends one constant-shape /fail ping per minute and never throws", async () => {
    const send = vi.fn(async () => new Response("OK", { status: 200 }));
    expect(
      await reportWorkerError(
        url,
        "https://skillcima.com/api/v1/leads?x=1",
        503,
        "Status503",
        send,
        () => 5_000,
      ),
    ).toBe("sent");
    expect(
      await reportWorkerError(
        url,
        "https://skillcima.com/",
        500,
        "Error",
        send,
        () => 10_000,
      ),
    ).toBe("throttled");
    const [target, init] = send.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(target).toBe(url + "/fail");
    expect(JSON.parse(String(init.body))).toEqual({
      app: "skillcima",
      surface: "worker",
      route: "/api/v1/leads",
      status: 503,
      code: "Status503",
      at: "1970-01-01T00:00:05.000Z",
    });
    resetWorkerReportThrottleForTests();
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(
      await reportWorkerError(
        url,
        "https://skillcima.com/",
        500,
        "Error",
        vi.fn(async () => {
          throw new Error("down");
        }),
      ),
    ).toBe("failed");
    expect(
      await reportWorkerError(
        undefined,
        "https://skillcima.com/",
        500,
        "Error",
        send,
      ),
    ).toBe("disabled");
  });

  it("reports a 5xx from the worker without changing the response", async () => {
    const send = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => new Response("OK", { status: 200 }));
    const env = {
      SKILLCIMA_ERROR_PING_URL: url,
      SUPABASE_URL: "",
      SUPABASE_SECRET_KEY: "",
    } as never;
    const res = await worker.fetch(
      new Request("https://skillcima.com/api/v1/health"),
      env,
    );
    expect(res.status).toBe(503);
    expect(send).toHaveBeenCalledTimes(1);
    expect(String(send.mock.calls[0][0])).toBe(url + "/fail");
  });

  it("does not ping for a normal response", async () => {
    const send = vi.spyOn(globalThis, "fetch");
    const env = { SKILLCIMA_ERROR_PING_URL: url } as never;
    const res = await worker.fetch(
      new Request("https://skillcima.com/api/v1/health", { method: "POST" }),
      env,
    );
    expect(res.status).toBe(405);
    expect(send).not.toHaveBeenCalled();
  });
});
