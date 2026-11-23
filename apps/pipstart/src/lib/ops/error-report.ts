import "server-only";

import { isWatchdogUrl } from "../email-monitor/watchdog";
import { fetchEmailResponse, watchdogResponseLimits } from "../email-response";

// M24 X01: minimal error alerting through the existing Healthchecks account.
// A report carries only a route template, a status, a short code and a time.
// Never messages, stacks, full URLs, query strings, headers, cookies, user IDs,
// emails or bodies. Details stay in the hosting platform's own logs.

export type ErrorSurface = "server";

export interface ErrorReport {
  app: "pipstart";
  surface: ErrorSurface;
  route: string;
  status: number | null;
  code: string;
  at: string;
}

const routeGroups = [
  "/account",
  "/admin",
  "/analysis",
  "/api",
  "/auth",
  "/brokers",
  "/dashboard",
  "/glossary",
  "/learn",
  "/login",
  "/signup",
  "/tools",
];
const errorNames = new Set([
  "Error",
  "TypeError",
  "RangeError",
  "SyntaxError",
  "ReferenceError",
  "URIError",
  "AbortError",
]);

export function routeTemplate(input: unknown): string {
  if (
    typeof input !== "string" ||
    input.length > 2048 ||
    !input.startsWith("/") ||
    input.startsWith("//")
  )
    return "/unknown";
  const route = input.split(/[?#]/, 1)[0];
  if (route === "/") return "/";
  return (
    routeGroups.find(
      (group) => route === group || route.startsWith(group + "/"),
    ) ?? "/unknown"
  );
}

export function errorCode(error: unknown): string {
  const name = error instanceof Error ? error.name : undefined;
  return name && errorNames.has(name) ? name : "Error";
}

export function buildReport(
  surface: ErrorSurface,
  route: unknown,
  status: number | null,
  code: string,
  now: () => number = Date.now,
): ErrorReport {
  return {
    app: "pipstart",
    surface,
    route: routeTemplate(route),
    status:
      Number.isInteger(status) &&
      status !== null &&
      status >= 100 &&
      status <= 599
        ? status
        : null,
    code: errorNames.has(code) ? code : "Error",
    at: new Date(now()).toISOString(),
  };
}

// One forward per server instance per minute. Healthchecks itself alerts only
// on a state change, so repeated failures still produce a single email.
const minimumGapMs = 60_000;
let lastSentAt = Number.NEGATIVE_INFINITY;

export function resetErrorReportThrottleForTests() {
  lastSentAt = Number.NEGATIVE_INFINITY;
}

export type SendOutcome =
  "sent" | "disabled" | "invalid-config" | "throttled" | "failed";

export async function sendErrorReport(
  report: ErrorReport,
  pingUrl: string = process.env.PIPSTART_ERROR_PING_URL?.trim() ?? "",
  ping: typeof fetch = fetch,
  now: () => number = Date.now,
): Promise<SendOutcome> {
  if (!pingUrl) return "disabled";
  if (!isWatchdogUrl(pingUrl)) {
    console.error("PIPSTART_ERROR_PING_INVALID_CONFIG");
    return "invalid-config";
  }
  const t = now();
  if (t - lastSentAt < minimumGapMs) return "throttled";
  lastSentAt = t;
  try {
    const reply = await fetchEmailResponse(
      ping,
      pingUrl + "/fail",
      {
        method: "POST",
        body: JSON.stringify(report),
        headers: { "content-type": "application/json" },
        redirect: "error",
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
      },
      watchdogResponseLimits,
    );
    if (reply.status !== 200) throw new Error("ping");
    const text = new TextDecoder("utf8", { fatal: true })
      .decode(await reply.arrayBuffer())
      .trim();
    if (text !== "OK") throw new Error("ping");
    return "sent";
  } catch {
    // Monitoring must never turn into a second failure for the visitor.
    console.error("PIPSTART_ERROR_PING_FAILED");
    return "failed";
  }
}
