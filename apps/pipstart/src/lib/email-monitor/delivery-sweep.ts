import { timingSafeEqual } from "node:crypto";
import { alertSender } from "./monitor";

export const sweepAlertTypes = [
  "email.failed",
  "email.bounced",
  "email.complained",
  "email.suppressed",
  "email.delivery_missing",
] as const;
export interface SweepAlert {
  messageId: string;
  type: (typeof sweepAlertTypes)[number];
}
export interface SweepClaim {
  state: "leased" | "accepted" | "busy" | "manual" | "resolved";
  token: string | null;
}
export interface SweepSummary {
  queued: number;
  accepted: number;
  skipped: number;
  failed: number;
  deferred: number;
  manual_alerts: number | null;
  overdue_alerts: number | null;
  stale_runs: number | null;
}
export interface SweepHealth {
  manual_alerts: number;
  overdue_alerts: number;
  stale_runs: number;
}
export interface SweepStore {
  start(): Promise<string>;
  queue(): Promise<number>;
  due(): Promise<SweepAlert[]>;
  claim(alert: SweepAlert): Promise<SweepClaim>;
  accept(alert: SweepAlert, token: string, providerId: string): Promise<void>;
  health(): Promise<SweepHealth>;
  finish(
    id: string,
    summary: SweepSummary,
    status: "completed" | "partial",
  ): Promise<void>;
}
export interface SweepConfig {
  secret: string;
  apiKey: string;
  alertTo: string;
}

// The four existing failure-alert payloads MUST remain byte-for-byte compatible
// with monitor.ts: webhook retries and scheduled retries share one provider key.
export function operationalAlertPayload(alert: SweepAlert, to: string) {
  const missing = alert.type === "email.delivery_missing";
  return {
    from: `PipStart Operations <${alertSender}>`,
    to: [to],
    subject: missing
      ? "[PipStart] Account email delivery not confirmed"
      : `[PipStart] Account email ${alert.type.slice(6)}`,
    text: missing
      ? `Delivery evidence for an account email is missing.\n\nEvent: email.delivery_missing\nResend email ID: ${alert.messageId}\n\nA sent or delayed callback has been recorded for at least 15 minutes, but no terminal callback has been recorded. This may be an email delay OR a missing webhook; it is not proof that the email failed.\n\nInspect this ID in Resend > Emails > Sending and review webhook delivery logs. Do not automatically resend security emails.\n\nThis alert is provider-accepted, not proof of inbox delivery.`
      : `An account-email delivery event needs review.\n\nEvent: ${alert.type}\nResend email ID: ${alert.messageId}\n\nOpen Resend > Emails > Sending and inspect this ID. Check Supabase Auth logs if needed. Do not automatically resend security emails or remove suppression without investigation.\n\nThis alert is provider-accepted, not proof of inbox delivery.`,
  };
}

function response(status: number, state: string, summary?: SweepSummary) {
  return Response.json(
    { status: state, ...(summary ? { summary } : {}) },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export async function handleDeliverySweep(
  request: Request,
  config: SweepConfig,
  store: SweepStore,
  send: typeof fetch = fetch,
  now: () => number = Date.now,
): Promise<Response> {
  if (request.method !== "POST") return response(405, "method_not_allowed");
  if (
    !/^[a-f0-9]{64}$/.test(config.secret) ||
    !config.apiKey ||
    config.alertTo !== "pipstartalert2026@gmail.com"
  )
    return response(503, "not_configured");
  const expected = Buffer.from(`Bearer ${config.secret}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    return response(401, "unauthorized");
  const summary: SweepSummary = {
    queued: 0,
    accepted: 0,
    skipped: 0,
    failed: 0,
    deferred: 0,
    manual_alerts: null,
    overdue_alerts: null,
    stale_runs: null,
  };
  const started = now();
  let runId: string | null = null;
  try {
    runId = await store.start();
    summary.queued = await store.queue();
    const due = await store.due();
    if (due.length > 5) throw new Error("batch");
    for (const alert of due) {
      // Leave ample time for one 8s send and DB acknowledgement before the
      // route's 60s ceiling. Remaining durable rows wait for the next sweep.
      if (now() - started > 35000) {
        summary.deferred++;
        continue;
      }
      if (
        !/^[A-Za-z0-9_-]{1,200}$/.test(alert.messageId) ||
        !sweepAlertTypes.includes(alert.type)
      )
        throw new Error("alert");
      try {
        const claim = await store.claim(alert);
        if (claim.state !== "leased") {
          summary.skipped++;
          if (claim.state === "manual")
            summary.manual_alerts = (summary.manual_alerts ?? 0) + 1;
          continue;
        }
        if (!claim.token) throw new Error("lease");
        const result = await send("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": `pipstart-monitor:${alert.messageId}:${alert.type}`,
          },
          body: JSON.stringify(operationalAlertPayload(alert, config.alertTo)),
          signal: AbortSignal.timeout(8000),
        });
        if (!result.ok) throw new Error("send");
        const data: unknown = await result.json();
        if (
          !data ||
          typeof data !== "object" ||
          !("id" in data) ||
          typeof data.id !== "string" ||
          !/^[A-Za-z0-9_-]{1,200}$/.test(data.id)
        )
          throw new Error("send");
        await store.accept(alert, claim.token, data.id);
        summary.accepted++;
      } catch {
        summary.failed++;
        console.error("PIPSTART_EMAIL_SWEEP_ALERT_RETRY_REQUIRED");
      }
    }
    // Assess after draining: manual rows are deliberately absent from due(), so
    // an empty due batch alone must never imply operational health.
    const health = await store.health();
    if (
      !health ||
      Object.keys(health).sort().join(",") !==
        "manual_alerts,overdue_alerts,stale_runs" ||
      Object.values(health).some(
        (value) => !Number.isSafeInteger(value) || value < 0,
      )
    )
      throw new Error("health");
    summary.manual_alerts = Math.max(
      summary.manual_alerts ?? 0,
      health.manual_alerts,
    );
    summary.overdue_alerts = health.overdue_alerts;
    summary.stale_runs = health.stale_runs;
    const attention =
      summary.manual_alerts > 0 ||
      summary.overdue_alerts > 0 ||
      summary.stale_runs > 0;
    if (attention) console.error("PIPSTART_EMAIL_SWEEP_HEALTH_REVIEW_REQUIRED");
    const partial = summary.failed > 0 || summary.deferred > 0 || attention;
    await store.finish(runId, summary, partial ? "partial" : "completed");
    return response(
      partial ? 503 : 200,
      partial ? "sweep_partial" : "sweep_completed",
      summary,
    );
  } catch {
    console.error("PIPSTART_EMAIL_SWEEP_UNAVAILABLE");
    if (runId) {
      try {
        await store.finish(
          runId,
          { ...summary, failed: summary.failed + 1 },
          "partial",
        );
      } catch {
        /* DB outage: no sensitive error logging. */
      }
    }
    return response(503, "sweep_unavailable");
  }
}
