export const providerResponseLimits = {
  timeoutMs: 8000,
  maxBytes: 16384,
  maxChunks: 1024,
} as const;
export const watchdogResponseLimits = {
  timeoutMs: 3000,
  maxBytes: 64,
  maxChunks: 32,
} as const;

// Absolute header/body budget, including transports that ignore abort. Tiny
// acknowledgements only. No retry: a timed-out handoff may have been accepted.
export async function fetchEmailResponse(
  send: typeof fetch,
  url: string,
  init: RequestInit,
  limits: Readonly<{ timeoutMs: number; maxBytes: number; maxChunks: number }>,
): Promise<Response> {
  if (
    Object.values(limits).some(
      (value) => !Number.isSafeInteger(value) || value <= 0,
    )
  )
    throw new Error("Email response unavailable");
  const controller = new AbortController(),
    caller = init.signal;
  let reply: Response | undefined;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let rejectStop!: (error: Error) => void;
  const unavailable = () => new Error("Email response unavailable");
  const stopped = new Promise<never>((_, reject) => {
    rejectStop = reject;
  });
  const cancel = () => {
    try {
      void (reader ? reader.cancel() : reply?.body?.cancel())?.catch(() => {});
    } catch {
      /* Best effort; cancellation is never proof of no handoff. */
    }
  };
  const stop = () => {
    rejectStop(unavailable());
    controller.abort();
    cancel();
  };
  const timer = setTimeout(stop, limits.timeoutMs);
  caller?.addEventListener("abort", stop, { once: true });
  try {
    if (caller?.aborted) throw unavailable();
    const operation = async () => {
      reply = await send(url, { ...init, signal: controller.signal });
      if (controller.signal.aborted) {
        cancel();
        throw unavailable();
      }
      if (!reply.ok) {
        cancel(); // Do not read or wait for a rejected provider body.
        return new Response(null, {
          status: reply.status,
          statusText: reply.statusText,
          headers: reply.headers,
        });
      }
      if (!reply.body) return reply;
      reader = reply.body.getReader();
      const chunks: Uint8Array[] = [];
      let bytes = 0,
        count = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (controller.signal.aborted) throw unavailable();
        if (done) break;
        if (
          ++count > limits.maxChunks ||
          !(value instanceof Uint8Array) ||
          (bytes += value.byteLength) > limits.maxBytes
        )
          throw unavailable();
        chunks.push(new Uint8Array(value));
      }
      const body = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) {
        body.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return new Response(body, {
        status: reply.status,
        statusText: reply.statusText,
        headers: reply.headers,
      });
    };
    return await Promise.race([operation(), stopped]);
  } catch {
    controller.abort();
    cancel();
    throw unavailable();
  } finally {
    clearTimeout(timer);
    caller?.removeEventListener("abort", stop);
    try {
      reader?.releaseLock();
    } catch {}
  }
}
