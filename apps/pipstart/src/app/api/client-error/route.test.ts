import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.hoisted(() => vi.fn());
vi.mock("@/lib/ops/error-report", () => ({ sendErrorReport: send }));

import { POST } from "./route";

const post = (body: string, headers: Record<string, string> = {}) =>
  POST(
    new Request("https://pipstart.net/api/client-error", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://pipstart.net",
        ...headers,
      },
      body,
    }),
  );

describe("POST /api/client-error", () => {
  let now = 0;
  beforeEach(() => {
    now += 60_000;
    vi.spyOn(Date, "now").mockReturnValue(now);
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    expect(send).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it("keeps a fixed browser diagnostic and answers 204", async () => {
    const report = JSON.stringify({
      route: "/account/profile",
      digest: "local-diagnostic",
      kind: "boundary",
    });
    const res = await post(report);
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    expect(console.warn).toHaveBeenCalledExactlyOnceWith(
      "PIPSTART_BROWSER_BOUNDARY_ERROR",
    );
    await post(report);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it("ignores other origins, wrong types, oversized and malformed bodies", async () => {
    for (const res of [
      await post(JSON.stringify({ route: "/", kind: "boundary" }), {
        origin: "https://evil.test",
      }),
      await post("route=/", { "content-type": "text/plain" }),
      await post(
        JSON.stringify({ route: "/", kind: "boundary", pad: "x".repeat(3000) }),
      ),
      await post("{not json"),
      await post(JSON.stringify({ route: "/", kind: "something-else" })),
    ])
      expect(res.status).toBe(204);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("enforces the byte limit and accepts only JSON media types", async () => {
    const valid = JSON.stringify({ route: "/", kind: "boundary" });
    expect(
      (await post(valid, { "content-type": "application/json-example" }))
        .status,
    ).toBe(204);
    expect(
      (
        await post(
          JSON.stringify({
            route: "/",
            kind: "boundary",
            note: "\u00e9".repeat(1200),
          }),
        )
      ).status,
    ).toBe(204);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("keeps only the global diagnostic category", async () => {
    await post(
      JSON.stringify({ route: "/", digest: "<img src=x>", kind: "global" }),
    );
    expect(console.warn).toHaveBeenCalledExactlyOnceWith(
      "PIPSTART_BROWSER_GLOBAL_ERROR",
    );
  });
});
