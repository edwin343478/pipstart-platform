import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readBoundedRequestBody, requestBodyTimeoutMs } from "./request-body";

function request(body?: ReadableStream<Uint8Array>, signal?: AbortSignal) {
  return new Request("https://pipstart.net/generated", {
    method: "POST",
    body,
    signal,
    duplex: "half",
  } as RequestInit);
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
describe("bounded raw request bytes", () => {
  it("accepts a null body and an EOF-only stream", async () => {
    for (const req of [
      request(),
      request(
        new ReadableStream({
          start(c) {
            c.close();
          },
        }),
      ),
    ])
      expect(await readBoundedRequestBody(req, { maxBytes: 8 })).toEqual(
        new Uint8Array(0),
      );
    expect(vi.getTimerCount()).toBe(0);
  });
  it("preserves exact bytes across split UTF-8 sequences and returns an independent copy", async () => {
    const bytes = new TextEncoder().encode(" é🙂 \n");
    const req = request(
      new ReadableStream({
        start(c) {
          for (const byte of bytes) c.enqueue(new Uint8Array([byte]));
          c.close();
        },
      }),
    );
    const actual = await readBoundedRequestBody(req, {
      maxBytes: bytes.length,
    });
    expect(actual).toEqual(bytes);
    expect(new TextDecoder("utf-8", { fatal: true }).decode(actual)).toBe(
      " é🙂 \n",
    );
    bytes.fill(0);
    expect(actual[0]).toBe(32);
    expect(req.body!.locked).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not trust a small declared length over actual bytes", async () => {
    const cancel = vi.fn();
    const req = request(
      new ReadableStream({
        start(c) {
          c.enqueue(new Uint8Array(9));
        },
        cancel,
      }),
    );
    req.headers.set("content-length", "1");
    await expect(
      readBoundedRequestBody(req, { maxBytes: 8 }),
    ).rejects.toMatchObject({ kind: "too_large" });
    expect(cancel).toHaveBeenCalledOnce();
    expect(req.body!.locked).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each(["pending", "rejecting"])(
    "does not await %s cancellation after overflow",
    async (kind) => {
      const req = request(
        new ReadableStream({
          start(c) {
            c.enqueue(new Uint8Array(9));
          },
          cancel() {
            return kind === "pending"
              ? new Promise<void>(() => {})
              : Promise.reject(new Error("private cancel detail"));
          },
        }),
      );
      await expect(
        readBoundedRequestBody(req, { maxBytes: 8 }),
      ).rejects.toMatchObject({ kind: "too_large" });
      expect(vi.getTimerCount()).toBe(0);
    },
  );
  it("bounds a never-ending read even when cancellation never settles", async () => {
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    const req = request(new ReadableStream({ cancel }));
    const result = expect(
      readBoundedRequestBody(req, { maxBytes: 8 }),
    ).rejects.toMatchObject({ kind: "timeout" });
    await vi.advanceTimersByTimeAsync(requestBodyTimeoutMs + 1);
    await result;
    expect(cancel).toHaveBeenCalledOnce();
    expect(req.body!.locked).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("uses one absolute deadline instead of restarting it for slow chunks", async () => {
    let interval: ReturnType<typeof setInterval>;
    const req = request(
      new ReadableStream({
        start(c) {
          interval = setInterval(() => c.enqueue(new Uint8Array([65])), 700);
        },
        cancel() {
          clearInterval(interval);
        },
      }),
    );
    const result = expect(
      readBoundedRequestBody(req, { maxBytes: 8 }),
    ).rejects.toMatchObject({ kind: "timeout" });
    await vi.advanceTimersByTimeAsync(requestBodyTimeoutMs + 1);
    await result;
    expect(vi.getTimerCount()).toBe(0);
  });
  it("bounds an infinite sequence of empty chunks", async () => {
    const cancel = vi.fn();
    const req = request(
      new ReadableStream({
        pull(c) {
          c.enqueue(new Uint8Array(0));
        },
        cancel,
      }),
    );
    await expect(
      readBoundedRequestBody(req, { maxBytes: 8, maxChunks: 3 }),
    ).rejects.toMatchObject({ kind: "chunks" });
    expect(cancel).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("accepts the exact chunk budget followed by EOF", async () => {
    const req = request(
      new ReadableStream({
        start(c) {
          for (let i = 0; i < 3; i++) c.enqueue(new Uint8Array(0));
          c.close();
        },
      }),
    );
    expect(
      await readBoundedRequestBody(req, { maxBytes: 8, maxChunks: 3 }),
    ).toEqual(new Uint8Array(0));
  });
  it("cleans up on an abort during a pending read", async () => {
    const controller = new AbortController(),
      cancel = vi.fn();
    const req = request(new ReadableStream({ cancel }), controller.signal);
    const remove = vi.spyOn(req.signal, "removeEventListener");
    const result = expect(
      readBoundedRequestBody(req, { maxBytes: 8 }),
    ).rejects.toMatchObject({ kind: "aborted" });
    controller.abort();
    await result;
    expect(cancel).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("rejects an already aborted request before locking the reader", async () => {
    const controller = new AbortController();
    controller.abort();
    const req = request(new ReadableStream(), controller.signal),
      get = vi.spyOn(req.body!, "getReader");
    await expect(
      readBoundedRequestBody(req, { maxBytes: 8 }),
    ).rejects.toMatchObject({ kind: "aborted" });
    expect(get).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("rejects a locked stream without leaking a timer", async () => {
    const req = request(new ReadableStream()),
      reader = req.body!.getReader();
    await expect(
      readBoundedRequestBody(req, { maxBytes: 8 }),
    ).rejects.toThrow();
    reader.releaseLock();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("propagates stream failure with reader and timer cleanup", async () => {
    const req = request(
      new ReadableStream({
        start(c) {
          c.error(new Error("generated read failure"));
        },
      }),
    );
    await expect(readBoundedRequestBody(req, { maxBytes: 8 })).rejects.toThrow(
      "generated read failure",
    );
    expect(req.body!.locked).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each([0, -1, Infinity, NaN, 1.5])(
    "rejects unbounded/invalid limits %s before reading",
    async (maxBytes) => {
      const req = request(new ReadableStream()),
        get = vi.spyOn(req.body!, "getReader");
      await expect(readBoundedRequestBody(req, { maxBytes })).rejects.toThrow(
        RangeError,
      );
      expect(get).not.toHaveBeenCalled();
    },
  );
});
