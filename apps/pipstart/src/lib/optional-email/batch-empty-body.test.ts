import { afterEach, describe, expect, it, vi } from "vitest";
import { NodeNextRequest } from "next/dist/server/base-http/node";
import { NextRequestAdapter } from "next/dist/server/web/spec-extension/adapters/next-request";
import { Readable } from "node:stream";
import type { IncomingMessage } from "node:http";
import { handleOptionalEmailBatch } from "./batch-endpoint";

const configuration = { secret: "a".repeat(64), apiKey: "re_generated_fixture_key", enabled: "true" };
function request(body: ReadableStream<Uint8Array>, headers: Record<string, string> = {}, signal?: AbortSignal) {
  return new Request("https://pipstart.net/api/internal/optional-email/run", {
    method: "POST", headers: { authorization: "Bearer " + configuration.secret, "content-length": "0", ...headers },
    body, duplex: "half", signal,
  } as RequestInit);
}
function empty() { return new ReadableStream<Uint8Array>({ start(c) { c.close(); } }); }
function runtime() { return vi.fn().mockResolvedValue({ status: "completed", processed: 1 }); }
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
describe("zero-byte POST compatibility", () => {
  it("accepts the installed Next Node adapter's non-null empty body", async () => {
    const raw = Object.assign(Readable.from([]), {
      method: "POST", url: "https://pipstart.net/api/internal/optional-email/run",
      headers: { authorization: "Bearer " + configuration.secret, "content-length": "0" },
    }) as unknown as IncomingMessage;
    const adapted = NextRequestAdapter.fromNodeNextRequest(new NodeNextRequest(raw), new AbortController().signal);
    expect(adapted.body).not.toBeNull(); // The previous body !== null guard rejected this.
    const run = runtime();
    expect((await handleOptionalEmailBatch(adapted, configuration, run)).status).toBe(200);
    expect(run).toHaveBeenCalledExactlyOnceWith(configuration.apiKey);
  });
  it("accepts an EOF-only stream", async () => {
    const run = runtime();
    expect((await handleOptionalEmailBatch(request(empty()), configuration, run)).status).toBe(200);
    expect(run).toHaveBeenCalledTimes(1);
  });
  it("accepts an empty chunk followed by EOF without requiring Content-Length", async () => {
    const req = request(new ReadableStream({ start(c) { c.enqueue(new Uint8Array(0)); c.close(); } }));
    req.headers.delete("content-length");
    const run = runtime();
    expect((await handleOptionalEmailBatch(req, configuration, run)).status).toBe(200);
    expect(run).toHaveBeenCalledTimes(1);
  });
  it("rejects bytes even if the supplied length claims zero", async () => {
    const run = runtime();
    const res = await handleOptionalEmailBatch(request(new ReadableStream({ start(c) { c.enqueue(new Uint8Array([1])); c.close(); } })), configuration, run);
    expect(await res.json()).toEqual({ status: "invalid_request", processed: 0 });
    expect(run).not.toHaveBeenCalled();
  });
  it.each(["origin", "content-type", "transfer-encoding", "content-length"])("rejects forbidden headers before reading: %s", async header => {
    const req = request(empty(), { [header]: header === "content-length" ? "00" : "fixture" }), run = runtime();
    const read = vi.spyOn(req.body!, "getReader");
    expect((await handleOptionalEmailBatch(req, configuration, run)).status).toBe(400);
    expect(read).not.toHaveBeenCalled(); expect(run).not.toHaveBeenCalled();
  });
  it("rejects unauthorized streams before reading", async () => {
    const req = request(empty(), { authorization: "Bearer " + "b".repeat(64) }), run = runtime();
    const read = vi.spyOn(req.body!, "getReader");
    expect((await handleOptionalEmailBatch(req, configuration, run)).status).toBe(401);
    expect(read).not.toHaveBeenCalled(); expect(run).not.toHaveBeenCalled();
  });
  it("rejects consumed bodies", async () => {
    const req = request(empty()), run = runtime(); await req.text();
    expect((await handleOptionalEmailBatch(req, configuration, run)).status).toBe(400);
    expect(run).not.toHaveBeenCalled();
  });
  it("rejects locked bodies", async () => {
    const req = request(empty()), run = runtime(), reader = req.body!.getReader();
    try { expect((await handleOptionalEmailBatch(req, configuration, run)).status).toBe(400); }
    finally { reader.releaseLock(); }
    expect(run).not.toHaveBeenCalled();
  });
  it("rejects aborted requests", async () => {
    const controller = new AbortController(); controller.abort();
    const run = runtime();
    expect((await handleOptionalEmailBatch(request(empty(), {}, controller.signal), configuration, run)).status).toBe(400);
    expect(run).not.toHaveBeenCalled();
  });
  it("sanitizes stream read errors", async () => {
    const run = runtime(), res = await handleOptionalEmailBatch(request(new ReadableStream({ start(c) { c.error(new Error("private fixture")); } })), configuration, run);
    expect(await res.json()).toEqual({ status: "invalid_request", processed: 0 });
    expect(run).not.toHaveBeenCalled();
  });
  it("bounds a stream that never ends and does not await cancellation", async () => {
    vi.useFakeTimers();
    const run = runtime(), cancel = vi.fn(() => new Promise<void>(() => {}));
    const pending = handleOptionalEmailBatch(request(new ReadableStream({ cancel })), configuration, run);
    await vi.advanceTimersByTimeAsync(1000);
    const res = await pending;
    expect(res.status).toBe(400); expect(cancel).toHaveBeenCalledTimes(1); expect(run).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("bounds excessive zero-byte chunks", async () => {
    const run = runtime(), req = request(new ReadableStream({ pull(c) { c.enqueue(new Uint8Array(0)); } }));
    expect((await handleOptionalEmailBatch(req, configuration, run)).status).toBe(400);
    expect(run).not.toHaveBeenCalled();
  });
  it("does not enable a disabled worker when the stream is empty", async () => {
    const run = runtime();
    expect((await handleOptionalEmailBatch(request(empty()), { ...configuration, enabled: "false" }, run)).status).toBe(503);
    expect(run).not.toHaveBeenCalled();
  });
});
