import "server-only";

import { isWatchdogUrl } from "../email-monitor/watchdog";
import { fetchEmailResponse, watchdogResponseLimits } from "../email-response";

// M24 X01: minimal error alerting through the existing Healthchecks account.
// A report carries only a route template, a status, a short code and a time.
// Never messages, stacks, full URLs, query strings, headers, cookies, user IDs,
// emails or bodies. Details stay in the hosting platform's own logs.

export type ErrorSurface = "server" | "client";

export interface ErrorReport {
  app: "pipstart";
  surface: ErrorSurface;
  route: string;
  status: number | null;
  code: string;
  at: string;
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const safeSegment = /^[a-z0-9][a-z0-9-]{0,63}$/i;
const nextSegment = /^\[{1,2}(\.\.\.)?[a-z][a-z0-9_]{0,31}\]{1,2}$/i;

// Reduce any path or URL to a template: no query, fragment, IDs or odd text.
export function routeTemplate(input: unknown): string {
  if (typeof input !== "string" || input.length === 0 || input.length > 2048)
    return "/unknown";
  let path: string;
  try {
    path = new URL(input, "https://route.invalid").pathname;
  } catch {
    return "/unknown";
  }
  const parts = path
    .split("/")
    .filter(Boolean)
    .slice(0, 8)
    .map((raw) => {
      let segment = raw;
      try {
        segment = decodeURIComponent(raw);
      } catch {
        return ":x";
      }
      if (nextSegment.test(segment)) return segment;
      if (uuid.test(segment)) return ":id";
      if (/^\d+$/.test(segment)) return ":n";
      if (!safeSegment.test(segment)) return ":x";
      return segment.toLowerCase();
    });
  return "/" + parts.join("/");
}

// Next's digest, or a plain error class name; anything else becomes "Error".
export function errorCode(error: unknown): string {
  if (error && typeof error === "object") {
    const digest = (error as { digest?: unknown }).digest;
    if (typeof digest === "string" && /^[0-9A-Za-z@:_-]{1,64}$/.test(digest))
      return digest;
    const name = (error as { name?: unknown }).name;
    if (typeof name === "string" && /^[A-Za-z]{1,40}$/.test(name)) return name;
  }
  return "Error";
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
    code: /^[0-9A-Za-z@:_-]{1,64}$/.test(code) ? code : "Error",
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
