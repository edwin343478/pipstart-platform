import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { monitorDatabaseFetch } from "@/lib/email-monitor/database-fetch";
import { reportMonitorFailure } from "@/lib/email-monitor/diagnostics";
import {
  handleMonitoringWebhook,
  type Evidence,
  type MonitorStore,
  type Claim,
} from "@/lib/email-monitor/monitor";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const client = createSupabaseAdminClient({ fetch: monitorDatabaseFetch });
  if (!client) {
    reportMonitorFailure("webhook", "configuration");
    return Response.json(
      { status: "not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  const args = (event: Evidence) => ({
    p_event_id: event.eventId,
    p_message_id: event.messageId,
    p_event_type: event.type,
    p_occurred_at: event.occurredAt,
  });
  const store: MonitorStore = {
    async record(event) {
      const { error } = await client.rpc(
        "pipstart_record_email_event",
        args(event),
      );
      if (error) throw new Error("record");
    },
    async claim(event) {
      const { data, error } = await client.rpc("pipstart_claim_email_alert", {
        p_message_id: event.messageId,
        p_event_type: event.type,
      });
      if (
        error ||
        !data ||
        !["leased", "accepted", "busy", "manual"].includes(data.state)
      )
        throw new Error("claim");
      return data as Claim;
    },
    async accept(event, token, providerId) {
      const { data, error } = await client.rpc("pipstart_accept_email_alert", {
        p_message_id: event.messageId,
        p_event_type: event.type,
        p_token: token,
        p_provider_id: providerId,
      });
      if (error || data !== true) throw new Error("accept");
    },
  };
  return handleMonitoringWebhook(
    request,
    {
      secret: process.env.PIPSTART_RESEND_WEBHOOK_SECRET?.trim() ?? "",
      apiKey: process.env.PIPSTART_ALERT_RESEND_API_KEY?.trim() ?? "",
      alertTo: process.env.PIPSTART_OPERATIONAL_ALERT_TO?.trim() ?? "",
    },
    store,
  );
}
