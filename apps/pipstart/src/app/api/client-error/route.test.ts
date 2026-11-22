import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sent: unknown[] = [];
vi.mock("@/lib/ops/error-report", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/ops/error-report")>();
  return {
    ...real,
    sendErrorReport: vi.fn(async (report: unknown) => {
      sent.push(report);
      return "sent";
    }),
  };
});

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
  beforeEach(() => {
    sent.length = 0;
  });
  afterEach(() => vi.clearAllMocks());

  it("forwards a scrubbed client report and always answers 204", async () => {
    const res = await post(
      JSON.stringify({
        route: "/account/profile?email=a@b.c",
        digest: "123456",
        kind: "boundary",
      }),
    );
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    expect(sent).toEqual([
      expect.objectContaining({
        surface: "client",
        route: "/account/profile",
        code: "123456",
        status: null,
      }),
    ]);
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
    expect(sent).toEqual([]);
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
    expect(sent).toEqual([]);
  });

  it("replaces an unsafe digest with a constant code", async () => {
    await post(
      JSON.stringify({ route: "/", digest: "<img src=x>", kind: "global" }),
    );
    expect(sent).toEqual([expect.objectContaining({ code: "GlobalError" })]);
  });
});
