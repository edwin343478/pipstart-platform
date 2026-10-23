import {
  handleDeliverySweep,
  type SweepConfig,
  type SweepStore,
} from "./delivery-sweep";

// Only the canonical HTTPS UUID success endpoint is accepted. The UUID is a
// credential: never log this URL, a response body, headers or caught errors.
export function isWatchdogUrl(value: string): boolean {
  return (
    value.trim() === value &&
    /^https:\/\/hc-ping\.com\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
      value,
    )
  );
}

async function pingAccepted(reply: Response): Promise<boolean> {
  if (reply.status !== 200) {
    await reply.body?.cancel();
    return false;
  }
  // HTTP 200 alone is insufficient: Healthchecks can return "OK (not found)"
  // or "OK (rate limited)" for a ping that was not recorded.
  const reader = reply.body?.getReader();
  if (!reader) return false;
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.byteLength;
      if (size > 64) {
        await reader.cancel();
        return false;
      }
      chunks.push(part.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes).trim() === "OK";
}

export async function handleWatchedDeliverySweep(
  request: Request,
  config: SweepConfig,
  store: SweepStore,
  watchdogUrl: string,
  send: typeof fetch = fetch,
  ping: typeof fetch = fetch,
  now: () => number = Date.now,
): Promise<Response> {
  const result = await handleDeliverySweep(request, config, store, send, now);
  // handleDeliverySweep returns 200 only after persisting a completed run.
  // Missing configuration leaves this optional integration disabled for rollout.
  if (result.status !== 200 || !watchdogUrl) return result;
  if (!isWatchdogUrl(watchdogUrl)) {
    console.error("PIPSTART_SWEEP_WATCHDOG_INVALID_CONFIG");
    return result;
  }
  try {
    const reply = await ping(watchdogUrl, {
      method: "POST",
      body: "",
      redirect: "error",
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(3000),
    });
    if (!(await pingAccepted(reply))) throw new Error("watchdog");
  } catch {
    console.error("PIPSTART_SWEEP_WATCHDOG_PING_FAILED");
  }
  // A monitoring-service outage must not change the durable delivery result,
  // repeat provider sends or return an error that invites unnecessary retries.
  return result;
}
