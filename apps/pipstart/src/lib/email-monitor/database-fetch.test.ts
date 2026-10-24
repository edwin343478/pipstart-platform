import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMonitorDatabaseFetch,
  monitorDatabaseTimeoutMs,
  monitorDatabaseMaxBytes,
  monitorDatabaseMaxChunks,
} from "./database-fetch";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
const target = "https://generated.supabase.test/rest/v1/rpc/generated";
describe("monitoring-only database deadlines", () => {
  it("preserves request metadata and response bytes/status/headers", async () => {
    const send = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('{"message":"generated"}', {
        status: 409,
        headers: { "content-type": "application/json", "x-generated": "yes" },
      }),
    );
    const result = await createMonitorDatabaseFetch(send)(target, {
      method: "POST",
      headers: { apikey: "generated" },
      body: "{}",
    });
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][1]).toMatchObject({
      method: "POST",
      headers: { apikey: "generated" },
      body: "{}",
    });
    expect(send.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
    expect(result.status).toBe(409);
    expect(result.headers.get("x-generated")).toBe("yes");
    expect(await result.text()).toBe('{"message":"generated"}');
  });
  it("bounds a transport that never resolves and ignores abort, without retry", async () => {
    vi.useFakeTimers();
    const send = vi
      .fn<typeof fetch>()
      .mockImplementation(() => new Promise(() => {}));
    const result = createMonitorDatabaseFetch(send)(target);
    const rejected = expect(result).rejects.toThrow(
      "Monitoring database response unavailable",
    );
    await vi.advanceTimersByTimeAsync(monitorDatabaseTimeoutMs);
    await rejected;
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("bounds a stalled response body and never awaits cancellation", async () => {
    vi.useFakeTimers();
    const cancel = vi.fn(() => new Promise<void>(() => {}));
    const send = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(new Uint8Array([1]));
          },
          cancel,
        }),
      ),
    );
    const result = createMonitorDatabaseFetch(send)(target);
    const rejected = expect(result).rejects.toThrow(
      "Monitoring database response unavailable",
    );
    await vi.advanceTimersByTimeAsync(monitorDatabaseTimeoutMs);
    await rejected;
    expect(cancel).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not restart the deadline after headers or chunks", async () => {
    vi.useFakeTimers();
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    const send = vi.fn<typeof fetch>().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return new Response(
        new ReadableStream({
          start(c) {
            stream = c;
          },
        }),
      );
    });
    const result = createMonitorDatabaseFetch(send)(target);
    const rejected = expect(result).rejects.toThrow(
      "Monitoring database response unavailable",
    );
    await vi.advanceTimersByTimeAsync(2500);
    stream.enqueue(new Uint8Array([1]));
    await vi.advanceTimersByTimeAsync(500);
    await rejected;
  });
  it.each(["init", "request"] as const)(
    "preserves %s cancellation",
    async (kind) => {
      vi.useFakeTimers();
      const abort = new AbortController();
      const send = vi
        .fn<typeof fetch>()
        .mockImplementation(() => new Promise(() => {}));
      const result = createMonitorDatabaseFetch(send)(
        kind === "request"
          ? new Request(target, { signal: abort.signal })
          : target,
        kind === "init" ? { signal: abort.signal } : undefined,
      );
      const rejected = expect(result).rejects.toThrow();
      abort.abort();
      await rejected;
      expect(send.mock.calls[0][1]?.signal?.aborted).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
    },
  );
  it("never contacts the transport for an already-aborted request", async () => {
    const abort = new AbortController();
    abort.abort();
    const send = vi.fn<typeof fetch>();
    await expect(
      createMonitorDatabaseFetch(send)(target, { signal: abort.signal }),
    ).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
  });
  it("cancels a late response after timeout without exposing its body", async () => {
    vi.useFakeTimers();
    let resolve!: (value: Response) => void;
    const cancel = vi.fn();
    const result = createMonitorDatabaseFetch(
      vi.fn<typeof fetch>().mockImplementation(
        () =>
          new Promise((r) => {
            resolve = r;
          }),
      ),
    )(target);
    const rejected = expect(result).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(monitorDatabaseTimeoutMs);
    await rejected;
    resolve(new Response(new ReadableStream({ cancel })));
    await vi.advanceTimersByTimeAsync(0);
    expect(cancel).toHaveBeenCalled();
  });
  it("allows the exact byte limit but rejects overflow regardless of content-length", async () => {
    const exact = createMonitorDatabaseFetch(
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(new Uint8Array(monitorDatabaseMaxBytes)),
        ),
    );
    expect((await (await exact(target)).arrayBuffer()).byteLength).toBe(
      monitorDatabaseMaxBytes,
    );
    const overflow = createMonitorDatabaseFetch(
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(new Uint8Array(monitorDatabaseMaxBytes + 1), {
          headers: { "content-length": "1" },
        }),
      ),
    );
    await expect(overflow(target)).rejects.toThrow();
  });
  it("bounds empty-chunk floods independently of bytes", async () => {
    const cancel = vi.fn();
    let count = 0;
    const send = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        new ReadableStream({
          pull(c) {
            count++;
            c.enqueue(new Uint8Array());
          },
          cancel,
        }),
      ),
    );
    await expect(createMonitorDatabaseFetch(send)(target)).rejects.toThrow();
    expect(count).toBeLessThanOrEqual(monitorDatabaseMaxChunks + 2);
    expect(cancel).toHaveBeenCalled();
  });
  it("preserves an empty 204 reply", async () => {
    const reply = new Response(null, { status: 204 });
    expect(
      await createMonitorDatabaseFetch(
        vi.fn<typeof fetch>().mockResolvedValue(reply),
      )(target),
    ).toBe(reply);
  });
  it("redacts transport error details and clears its timer", async () => {
    vi.useFakeTimers();
    await expect(
      createMonitorDatabaseFetch(
        vi.fn<typeof fetch>().mockRejectedValue(Error("private URL/token")),
      )(target),
    ).rejects.toThrow("Monitoring database response unavailable");
    expect(vi.getTimerCount()).toBe(0);
  });
});
