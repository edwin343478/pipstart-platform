export const monitorDatabaseTimeoutMs = 3000;
export const monitorDatabaseMaxBytes = 256 * 1024;
export const monitorDatabaseMaxChunks = 1024;

// One absolute deadline covers BOTH headers and the complete PostgREST body.
// Only the two account-monitoring adapters opt in. No retry is introduced: a
// timed-out write may already have committed and must retain existing fencing.
export function createMonitorDatabaseFetch(send: typeof fetch): typeof fetch {
  return async (input, init) => {
    const caller =
      init?.signal !== undefined
        ? init.signal
        : input instanceof Request
          ? input.signal
          : undefined;
    const controller = new AbortController();
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    let reply: Response | undefined;
    let rejectStop!: (error: Error) => void;
    const stopped = new Promise<never>((_, reject) => {
      rejectStop = reject;
    });
    const unavailable = () =>
      new Error("Monitoring database response unavailable");
    const cancel = () => {
      try {
        void (reader ? reader.cancel() : reply?.body?.cancel())?.catch(
          () => {},
        );
      } catch {}
    };
    const stop = () => {
      controller.abort();
      rejectStop(unavailable());
      cancel();
    };
    const timer = setTimeout(stop, monitorDatabaseTimeoutMs);
    caller?.addEventListener("abort", stop, { once: true });
    try {
      if (caller?.aborted) throw unavailable();
      const operation = async () => {
        reply = await send(input, { ...init, signal: controller.signal });
        if (controller.signal.aborted) {
          cancel();
          throw unavailable();
        }
        if (!reply.body) return reply;
        reader = reply.body.getReader();
        const chunks: Uint8Array[] = [];
        let size = 0,
          count = 0;
        while (true) {
          const { value, done } = await reader.read();
          if (controller.signal.aborted) throw unavailable();
          if (done) break;
          if (
            ++count > monitorDatabaseMaxChunks ||
            !(value instanceof Uint8Array) ||
            (size += value.byteLength) > monitorDatabaseMaxBytes
          )
            throw unavailable();
          chunks.push(new Uint8Array(value));
        }
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
          bytes.set(chunk, offset);
          offset += chunk.byteLength;
        }
        return new Response(bytes, {
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
  };
}

// Resolve the process fetch at invocation time (also supports direct adapter tests).
export const monitorDatabaseFetch: typeof fetch = (input, init) =>
  createMonitorDatabaseFetch((target, options) => fetch(target, options))(
    input,
    init,
  );
