// M24 X01 for the Skillcima Worker: a 5xx response or a thrown error sends one
// /fail ping to the owner's Healthchecks check. The body carries only a route
// template, the status, a short code and the time. Never messages, stacks,
// query strings, headers, emails, tokens or request bodies.

const pingPattern =
  /^https:\/\/hc-ping\.com\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const publicRoutes = new Set([
  "/",
  "/about",
  "/contact",
  "/api/v1/health",
  "/api/v1/lead",
  "/api/v1/confirm",
  "/api/v1/unsubscribe",
  "/api/v1/webhooks/resend",
]);
const errorNames = new Set([
  "Error",
  "TypeError",
  "RangeError",
  "SyntaxError",
  "ReferenceError",
  "URIError",
  "AbortError",
]);

export function isPingUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim() === value &&
    pingPattern.test(value)
  );
}

export function workerRouteTemplate(requestUrl: string): string {
  let path: string;
  try {
    path = new URL(requestUrl).pathname;
  } catch {
    return "/unknown";
  }
  return publicRoutes.has(path) ? path : "/unknown";
}

export function workerErrorCode(error: unknown): string {
  const name = error instanceof Error ? error.name : undefined;
  return name && errorNames.has(name) ? name : "Error";
}

// One ping per isolate per minute; Healthchecks alerts once per state change.
let lastSentAt = Number.NEGATIVE_INFINITY;
export function resetWorkerReportThrottleForTests() {
  lastSentAt = Number.NEGATIVE_INFINITY;
}

export async function reportWorkerError(
  pingUrl: string | undefined,
  requestUrl: string,
  status: number,
  code: string,
  send: typeof fetch = fetch,
  now: () => number = Date.now,
): Promise<"sent" | "disabled" | "invalid-config" | "throttled" | "failed"> {
  if (!pingUrl) return "disabled";
  if (!isPingUrl(pingUrl)) {
    console.error("SKILLCIMA_ERROR_PING_INVALID_CONFIG");
    return "invalid-config";
  }
  const t = now();
  if (t - lastSentAt < 60_000) return "throttled";
  lastSentAt = t;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const reply = await send(pingUrl + "/fail", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        app: "skillcima",
        surface: "worker",
        route: workerRouteTemplate(requestUrl),
        status,
        code:
          errorNames.has(code) || code === "Status" + status ? code : "Error",
        at: new Date(t).toISOString(),
      }),
      redirect: "error",
      signal: controller.signal,
    });
    const text = (await reply.text()).slice(0, 64).trim();
    if (reply.status !== 200 || text !== "OK") throw new Error("ping");
    return "sent";
  } catch {
    console.error("SKILLCIMA_ERROR_PING_FAILED");
    return "failed";
  } finally {
    clearTimeout(timer);
  }
}
