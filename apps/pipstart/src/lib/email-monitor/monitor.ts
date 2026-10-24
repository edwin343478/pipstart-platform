import { createHmac, timingSafeEqual } from "node:crypto";
import { fetchEmailResponse, providerResponseLimits } from "../email-response";
import {
  readBoundedRequestBody,
  RequestBodyReadError,
} from "../http/request-body";

export const eventTypes = [
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.failed",
  "email.bounced",
  "email.complained",
  "email.suppressed",
] as const;
export type EventType = (typeof eventTypes)[number];
const failures = new Set<EventType>([
  "email.failed",
  "email.bounced",
  "email.complained",
  "email.suppressed",
]);
export interface Evidence {
  eventId: string;
  messageId: string;
  type: EventType;
  occurredAt: string;
}
export interface Claim {
  state: "leased" | "accepted" | "busy" | "manual";
  token: string | null;
}
export interface MonitorStore {
  record(event: Evidence): Promise<void>;
  claim(event: Evidence): Promise<Claim>;
  accept(event: Evidence, token: string, providerId: string): Promise<void>;
}
export interface MonitorConfig {
  secret: string;
  apiKey: string;
  alertTo: string;
}
const sender = "no-reply@account.pipstart.net";
export const alertSender = "ops-alerts@account.pipstart.net";

export function verifySignature(
  body: string,
  headers: Headers,
  secret: string,
  now = Date.now(),
): boolean {
  const id = headers.get("svix-id") ?? "";
  const timestamp = headers.get("svix-timestamp") ?? "";
  const signatures = headers.get("svix-signature") ?? "";
  if (!/^[A-Za-z0-9_-]{1,200}$/.test(id) || !/^\d{1,12}$/.test(timestamp))
    return false;
  if (Math.abs(now / 1000 - Number(timestamp)) > 300) return false;
  if (!/^whsec_[A-Za-z0-9+/]+={0,2}$/.test(secret)) return false;
  const key = Buffer.from(secret.slice(6), "base64");
  if (key.length < 16) return false;
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${body}`)
    .digest();
  return signatures.split(" ").some((entry) => {
    if (!/^v1,[A-Za-z0-9+/]+={0,2}$/.test(entry)) return false;
    const actual = Buffer.from(entry.slice(3), "base64");
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  });
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function parseEvidence(body: string, eventId: string): Evidence | null {
  const event = object(JSON.parse(body));
  if (!event || typeof event.type !== "string") throw new Error("payload");
  if (!eventTypes.includes(event.type as EventType)) return null;
  const data = object(event.data);
  if (!data || typeof data.from !== "string") throw new Error("payload");
  // Exact sender boundary: other brands and ops-alerts must never enqueue alerts.
  const address = data.from
    .trim()
    .match(/^(?:[^<>]*<)?([^<>\s]+@[^<>\s]+)>?$/)?.[1]
    ?.toLowerCase();
  if (address !== sender) return null;
  if (
    typeof data.email_id !== "string" ||
    !/^[A-Za-z0-9_-]{1,200}$/.test(data.email_id)
  )
    throw new Error("payload");
  if (
    typeof event.created_at !== "string" ||
    event.created_at.length > 64 ||
    !Number.isFinite(Date.parse(event.created_at))
  )
    throw new Error("payload");
  return {
    eventId,
    messageId: data.email_id,
    type: event.type as EventType,
    occurredAt: new Date(event.created_at).toISOString(),
  };
}

async function readLimitedBody(request: Request): Promise<string> {
  return new TextDecoder("utf-8", { fatal: true }).decode(
    await readBoundedRequestBody(request, { maxBytes: 65536 }),
  );
}

function reply(status: number, state: string) {
  return Response.json(
    { status: state },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export async function handleMonitoringWebhook(
  request: Request,
  config: MonitorConfig,
  store: MonitorStore,
  send: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== "POST") return reply(405, "method_not_allowed");
  if (
    !config.secret ||
    !config.apiKey ||
    config.alertTo !== "pipstartalert2026@gmail.com"
  )
    return reply(503, "not_configured");
  if (
    !/^application\/json(?:;|$)/i.test(
      request.headers.get("content-type") ?? "",
    )
  )
    return reply(415, "json_required");
  let body: string;
  try {
    body = await readLimitedBody(request);
  } catch (error) {
    return reply(
      error instanceof RequestBodyReadError && error.kind === "too_large"
        ? 413
        : error instanceof RequestBodyReadError && error.kind === "timeout"
          ? 408
          : 400,
      "invalid_body",
    );
  }
  if (!verifySignature(body, request.headers, config.secret))
    return reply(401, "invalid_signature");
  let evidence: Evidence | null;
  try {
    evidence = parseEvidence(body, request.headers.get("svix-id")!);
  } catch {
    return reply(400, "invalid_payload");
  }
  if (!evidence) return reply(200, "ignored");
  try {
    await store.record(evidence);
    if (!failures.has(evidence.type)) return reply(200, "recorded");
    const claim = await store.claim(evidence);
    if (claim.state === "accepted") return reply(200, "already_alerted");
    if (claim.state !== "leased" || !claim.token)
      return reply(503, "alert_pending_operator_review");
    // Fixed content per message/type keeps retries identical under the idempotency key.
    // No recipient, subject, payload, recovery link, token, or provider error is copied.
    const response = await fetchEmailResponse(
      send,
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `pipstart-monitor:${evidence.messageId}:${evidence.type}`,
        },
        body: JSON.stringify({
          from: `PipStart Operations <${alertSender}>`,
          to: [config.alertTo],
          subject: `[PipStart] Account email ${evidence.type.slice(6)}`,
          text: `An account-email delivery event needs review.\n\nEvent: ${evidence.type}\nResend email ID: ${evidence.messageId}\n\nOpen Resend > Emails > Sending and inspect this ID. Check Supabase Auth logs if needed. Do not automatically resend security emails or remove suppression without investigation.\n\nThis alert is provider-accepted, not proof of inbox delivery.`,
        }),
      },
      providerResponseLimits,
    );
    if (!response.ok) throw new Error("send");
    const result = object(await response.json());
    if (
      !result ||
      typeof result.id !== "string" ||
      !/^[A-Za-z0-9_-]{1,200}$/.test(result.id)
    )
      throw new Error("send");
    await store.accept(evidence, claim.token, result.id);
    return reply(200, "alert_accepted");
  } catch {
    // Redacted structured error only. Resend retries non-2xx; DB lease handles crashes.
    console.error("PIPSTART_EMAIL_MONITOR_RETRY_REQUIRED");
    return reply(503, "retry_required");
  }
}
