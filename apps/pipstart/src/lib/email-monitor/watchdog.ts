import { fetchEmailResponse, watchdogResponseLimits } from "../email-response";
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
  if (reply.status !== 200) return false;
  // HTTP 200 alone is insufficient: Healthchecks can return "OK (not found)"
  // or "OK (rate limited)" for a ping that was not recorded.
  // This reply is already fully buffered within the 64-byte/3-second budget.
  return (
    new TextDecoder("utf8", { fatal: true })
      .decode(await reply.arrayBuffer())
      .trim() === "OK"
  );
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
    const reply = await fetchEmailResponse(
      ping,
      watchdogUrl,
      {
        method: "POST",
        body: "",
        redirect: "error",
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
      },
      watchdogResponseLimits,
    );
    if (!(await pingAccepted(reply))) throw new Error("watchdog");
  } catch {
    console.error("PIPSTART_SWEEP_WATCHDOG_PING_FAILED");
  }
  // A monitoring-service outage must not change the durable delivery result,
  // repeat provider sends or return an error that invites unnecessary retries.
  return result;
}
