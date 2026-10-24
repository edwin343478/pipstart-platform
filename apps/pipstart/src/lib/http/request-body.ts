export const requestBodyTimeoutMs = 2000;
export class RequestBodyReadError extends Error {
  constructor(
    readonly kind: "too_large" | "timeout" | "aborted" | "chunks" | "invalid",
  ) {
    super("Request body unavailable");
  }
}

// The deadline covers the whole read, not each individual chunk. No decoding,
// parsing or signature normalization takes place here.
export async function readBoundedRequestBody(
  request: Request,
  {
    maxBytes,
    maxChunks = 1024,
    timeoutMs = requestBodyTimeoutMs,
  }: {
    maxBytes: number;
    maxChunks?: number;
    timeoutMs?: number;
  },
): Promise<Uint8Array> {
  if (
    ![maxBytes, maxChunks, timeoutMs].every(
      (value) => Number.isSafeInteger(value) && value > 0,
    )
  )
    throw new RangeError("Invalid body limits");
  if (request.signal.aborted) throw new RequestBodyReadError("aborted");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array(0);
  let rejectStop!: (error: RequestBodyReadError) => void;
  const stopped = new Promise<never>((_, reject) => {
    rejectStop = reject;
  });
  const abort = () => rejectStop(new RequestBodyReadError("aborted"));
  const timer = setTimeout(
    () => rejectStop(new RequestBodyReadError("timeout")),
    timeoutMs,
  );
  request.signal.addEventListener("abort", abort, { once: true });
  const parts: Uint8Array[] = [];
  let size = 0,
    count = 0;
  try {
    if (request.signal.aborted) throw new RequestBodyReadError("aborted");
    while (true) {
      const { value, done } = await Promise.race([reader.read(), stopped]);
      if (done) break;
      if (++count > maxChunks) throw new RequestBodyReadError("chunks");
      if (!(value instanceof Uint8Array))
        throw new RequestBodyReadError("invalid");
      size += value.byteLength;
      if (size > maxBytes) throw new RequestBodyReadError("too_large");
      // Copy even Buffer subclasses, whose slice() would retain a mutable view.
      parts.push(new Uint8Array(value));
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const part of parts) {
      bytes.set(part, offset);
      offset += part.byteLength;
    }
    return bytes;
  } catch (error) {
    // Cancellation itself can hang or reject. It must never extend the deadline.
    try {
      void reader.cancel().catch(() => {});
    } catch {}
    throw error;
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", abort);
    try {
      reader.releaseLock();
    } catch {}
  }
}
