import { afterEach, describe, expect, it, vi } from "vitest";

import { checkSupabaseConnection } from "./supabase";

const env = {
  SUPABASE_URL: "https://database.example.test/",
  SUPABASE_SECRET_KEY: "synthetic-key",
};

describe("Skillcima database health", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("aborts stalled headers and refuses redirects", async () => {
    vi.useFakeTimers();
    const request = vi.spyOn(globalThis, "fetch").mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(init.signal?.reason),
            { once: true },
          );
        }),
    );

    const health = checkSupabaseConnection(env);
    await vi.advanceTimersByTimeAsync(3000);

    expect(request.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(request.mock.calls[0][1]?.redirect).toBe("manual");
    await expect(health).resolves.toEqual({ status: "unavailable" });
  });

  it("treats a redirect as unavailable without following it", async () => {
    const request = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        Response.redirect("https://redirect.example.test/"),
      );

    await expect(checkSupabaseConnection(env)).resolves.toEqual({
      status: "unavailable",
      httpStatus: 302,
    });
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][1]?.redirect).toBe("manual");
  });

  it("uses HTTP status even when body cancellation rejects", async () => {
    const cancel = vi.fn(() => Promise.reject(new Error("cancel failed")));
    const request = vi.spyOn(globalThis, "fetch");
    for (const status of [200, 503]) {
      request.mockResolvedValueOnce(
        new Response(new ReadableStream({ cancel }), { status }),
      );
    }

    await expect(checkSupabaseConnection(env)).resolves.toEqual({
      status: "ok",
    });
    await expect(checkSupabaseConnection(env)).resolves.toEqual({
      status: "unavailable",
      httpStatus: 503,
    });
    expect(cancel).toHaveBeenCalledTimes(2);
  });
});
