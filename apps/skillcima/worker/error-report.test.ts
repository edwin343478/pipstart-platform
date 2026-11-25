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
    ).toBe("/unknown");
    expect(workerErrorCode(new RangeError("secret"))).toBe("RangeError");
    expect(workerErrorCode("oops")).toBe("Error");
  });

  it("sends one constant-shape /fail ping per minute and never throws", async () => {
    const send = vi.fn(async () => new Response("OK", { status: 200 }));
    expect(
      await reportWorkerError(
        url,
        "https://skillcima.com/api/v1/lead?x=1",
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
      route: "/api/v1/lead",
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

  it.each([
    "OK" + " ".repeat(62) + "unexpected",
    "OK " + "é".repeat(31),
    "OK extra",
    new Uint8Array([79, 75, 255]),
  ])("rejects a malformed or oversized acknowledgement", async (body) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const send = vi.fn(async () => new Response(body));
    await expect(
      reportWorkerError(url, "https://skillcima.com/", 500, "Error", send),
    ).resolves.toBe("failed");
  });

  it("checks the entire chunked acknowledgment and bounds a stalled body", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const encoder = new TextEncoder();
    const chunked = new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode("O"));
          controller.enqueue(encoder.encode("K\n"));
          controller.close();
        },
      }),
    );
    await expect(
      reportWorkerError(
        url,
        "https://skillcima.com/",
        500,
        "Error",
        async () => chunked,
      ),
    ).resolves.toBe("sent");

    resetWorkerReportThrottleForTests();
    vi.useFakeTimers();
    try {
      const cancel = vi.fn(() => Promise.reject(new Error("cancel failed")));
      const stalled = new Response(new ReadableStream({ cancel }));
      const sending = reportWorkerError(
        url,
        "https://skillcima.com/",
        500,
        "Error",
        async () => stalled,
      );
      await vi.advanceTimersByTimeAsync(3000);
      await expect(sending).resolves.toBe("failed");
      expect(cancel).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("returns the business response while the alert runs in the Worker context", async () => {
    let resolvePing!: (reply: Response) => void;
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePing = resolve;
        }),
    );
    const waitUntil = vi.fn<(promise: Promise<unknown>) => void>();
    const response = await worker.fetch(
      new Request("https://skillcima.com/api/v1/health"),
      { SKILLCIMA_ERROR_PING_URL: url } as never,
      { waitUntil },
    );

    expect(response.status).toBe(503);
    expect(waitUntil).toHaveBeenCalledOnce();
    resolvePing(new Response("OK"));
    await expect(waitUntil.mock.calls[0][0]).resolves.toBe("sent");
  });

  it("rejects a redirect from the alert provider without following it", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const send = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.redirect("https://redirect.example.test/"),
      );
    await expect(
      reportWorkerError(url, "https://skillcima.com/", 500, "Error", send),
    ).resolves.toBe("failed");
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][1]?.redirect).toBe("manual");
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
