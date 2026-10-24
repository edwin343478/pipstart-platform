import { createServer } from "node:http";
import { afterEach, expect, it, vi } from "vitest";
import {
  fetchEmailResponse,
  providerResponseLimits,
  watchdogResponseLimits,
} from "./email-response";
const limits = { timeoutMs: 50, maxBytes: 4, maxChunks: 2 };
const url = "https://generated.invalid/ack";
const pending = () => new Promise<void>(() => {});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
function stream(chunks: Uint8Array[], close = true, cancel = vi.fn()) {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(c) {
        for (const chunk of chunks) c.enqueue(chunk);
        if (close) c.close();
      },
      cancel,
    }),
  );
}
it("retains existing timeout/byte budgets and adds bounded chunk work", () => {
  expect(providerResponseLimits).toEqual({
    timeoutMs: 8000,
    maxBytes: 16384,
    maxChunks: 1024,
  });
  expect(watchdogResponseLimits).toEqual({
    timeoutMs: 3000,
    maxBytes: 64,
    maxChunks: 32,
  });
});
it("preserves URL, method, headers, body, redirect and response status/bytes", async () => {
  const init = {
    method: "POST",
    headers: { "Idempotency-Key": "generated" },
    body: "generated",
    redirect: "error" as const,
    cache: "no-store" as const,
  };
  const send = vi.fn<typeof fetch>().mockResolvedValue(
    new Response("four", {
      status: 201,
      headers: { "content-type": "text/plain" },
    }),
  );
  const reply = await fetchEmailResponse(send, url, init, limits);
  expect(send).toHaveBeenCalledOnce();
  expect(send.mock.calls[0][0]).toBe(url);
  expect(send.mock.calls[0][1]).toMatchObject(init);
  expect(send.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  expect(reply.status).toBe(201);
  expect(reply.headers.get("content-type")).toBe("text/plain");
  expect(await reply.text()).toBe("four");
});
it("accepts exact byte and chunk boundaries, including split UTF-8", async () => {
  const send = vi
    .fn<typeof fetch>()
    .mockResolvedValue(
      stream([new Uint8Array([0xf0, 0x9f]), new Uint8Array([0x98, 0x80])]),
    );
  const reply = await fetchEmailResponse(send, url, {}, limits);
  expect(await reply.text()).toBe("😀");
});
it.each(["bytes", "chunks", "empty chunks"])(
  "rejects excessive %s without waiting for cancellation",
  async (kind) => {
    const cancel = vi.fn(pending);
    const chunks =
      kind === "bytes"
        ? [new Uint8Array(5)]
        : kind === "chunks"
          ? [new Uint8Array([1]), new Uint8Array([2]), new Uint8Array([3])]
          : [new Uint8Array(), new Uint8Array(), new Uint8Array()];
    const send = vi
      .fn<typeof fetch>()
      .mockResolvedValue(stream(chunks, false, cancel));
    await expect(fetchEmailResponse(send, url, {}, limits)).rejects.toThrow(
      "Email response unavailable",
    );
    expect(cancel).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledOnce();
  },
);
it.each(["headers", "body"])(
  "enforces the absolute deadline for stalled %s even if transport ignores abort",
  async (stage) => {
    vi.useFakeTimers();
    const cancel = vi.fn(pending);
    const send = vi
      .fn<typeof fetch>()
      .mockImplementation(() =>
        stage === "headers"
          ? new Promise<Response>(() => {})
          : Promise.resolve(stream([], false, cancel)),
      );
    const result = fetchEmailResponse(send, url, {}, limits);
    const assertion = expect(result).rejects.toThrow(
      "Email response unavailable",
    );
    await vi.advanceTimersByTimeAsync(50);
    await assertion;
    expect(send.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(send).toHaveBeenCalledOnce();
    if (stage === "body") expect(cancel).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  },
);
it("does not restart the budget after headers or each chunk", async () => {
  vi.useFakeTimers();
  let bodyController!: ReadableStreamDefaultController<Uint8Array>;
  const send = vi.fn<typeof fetch>().mockImplementation(async () => {
    await new Promise((r) => setTimeout(r, 30));
    return new Response(
      new ReadableStream({
        start(c) {
          bodyController = c;
        },
      }),
    );
  });
  const result = fetchEmailResponse(send, url, {}, limits),
    assertion = expect(result).rejects.toThrow("Email response unavailable");
  await vi.advanceTimersByTimeAsync(40);
  bodyController.enqueue(new Uint8Array([1]));
  await vi.advanceTimersByTimeAsync(10);
  await assertion;
  expect(vi.getTimerCount()).toBe(0);
});
it.each(["reject", "throw", "hang"])(
  "settles on a rejected HTTP status when cancellation can %s",
  async (kind) => {
    const cancel = vi.fn(() => {
      if (kind === "throw") throw Error("private");
      return kind === "hang" ? pending() : Promise.reject(Error("private"));
    });
    const send = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(new ReadableStream({ cancel }), { status: 503 }),
      );
    const reply = await fetchEmailResponse(send, url, {}, limits);
    expect(reply.status).toBe(503);
    expect(reply.body).toBeNull();
    expect(cancel).toHaveBeenCalledOnce();
  },
);
it("cleans a late response after the header deadline without consuming its body", async () => {
  vi.useFakeTimers();
  let resolve!: (r: Response) => void;
  const cancel = vi.fn(pending);
  const send = vi.fn<typeof fetch>().mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  const result = fetchEmailResponse(send, url, {}, limits),
    assertion = expect(result).rejects.toThrow();
  await vi.advanceTimersByTimeAsync(50);
  await assertion;
  resolve(new Response(new ReadableStream({ cancel })));
  await vi.advanceTimersByTimeAsync(0);
  expect(cancel).toHaveBeenCalledOnce();
  expect(send).toHaveBeenCalledOnce();
});
it("forwards caller abort and removes listener/timer", async () => {
  vi.useFakeTimers();
  const caller = new AbortController(),
    remove = vi.spyOn(caller.signal, "removeEventListener");
  const send = vi.fn<typeof fetch>().mockResolvedValue(stream([], false));
  const result = fetchEmailResponse(
      send,
      url,
      { signal: caller.signal },
      limits,
    ),
    assertion = expect(result).rejects.toThrow();
  await vi.advanceTimersByTimeAsync(0);
  caller.abort();
  await assertion;
  expect(send.mock.calls[0][1]?.signal?.aborted).toBe(true);
  expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
  expect(vi.getTimerCount()).toBe(0);
});
it("refuses an already aborted caller without sending", async () => {
  const caller = new AbortController();
  caller.abort();
  const send = vi.fn<typeof fetch>();
  await expect(
    fetchEmailResponse(send, url, { signal: caller.signal }, limits),
  ).rejects.toThrow();
  expect(send).not.toHaveBeenCalled();
});
it.each([0, -1, Infinity, NaN, 1.5])(
  "rejects invalid limits %s before sending",
  async (value) => {
    const send = vi.fn<typeof fetch>();
    await expect(
      fetchEmailResponse(send, url, {}, { ...limits, maxBytes: value }),
    ).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
  },
);
it("handles null bodies and transport rejection without leaking errors", async () => {
  const send = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
    .mockRejectedValueOnce(Error("private-secret"));
  expect((await fetchEmailResponse(send, url, {}, limits)).status).toBe(204);
  await expect(fetchEmailResponse(send, url, {}, limits)).rejects.toThrow(
    /^Email response unavailable$/,
  );
});
it("bounds a real native fetch body on a generated loopback server", async () => {
  const server = createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.write('{"id":"');
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const address = server.address();
    if (!address || typeof address === "string") throw Error("loopback");
    await expect(
      fetchEmailResponse(
        fetch,
        `http://127.0.0.1:${address.port}`,
        {},
        { ...limits, timeoutMs: 200 },
      ),
    ).rejects.toThrow("Email response unavailable");
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
