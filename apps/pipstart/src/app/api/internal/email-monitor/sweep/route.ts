import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { monitorDatabaseFetch } from "@/lib/email-monitor/database-fetch";
import {
  sweepAlertTypes,
  type SweepStore,
  type SweepAlert,
  type SweepClaim,
} from "@/lib/email-monitor/delivery-sweep";

import { handleWatchedDeliverySweep } from "@/lib/email-monitor/watchdog";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const client = createSupabaseAdminClient({ fetch: monitorDatabaseFetch });
  if (!client)
    return Response.json(
      { status: "not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  const args = (alert: SweepAlert) => ({
    p_message_id: alert.messageId,
    p_event_type: alert.type,
  });
  const store: SweepStore = {
    async start() {
      const { data, error } = await client
        .from("pipstart_email_monitor_sweeps")
        .insert({ status: "running" })
        .select("id")
        .single();
      if (error || !data || typeof data.id !== "string")
        throw new Error("start");
      return data.id;
    },
    async queue() {
      const { data, error } = await client.rpc(
        "pipstart_queue_missing_email_deliveries",
      );
      if (error || !Number.isInteger(data) || data < 0 || data > 100)
        throw new Error("queue");
      return data as number;
    },
    async due() {
      const { data, error } = await client.rpc(
        "pipstart_list_due_email_alerts",
      );
      if (error || !Array.isArray(data) || data.length > 5)
        throw new Error("due");
      return data.map((row: { message_id: unknown; event_type: unknown }) => {
        if (
          !row ||
          typeof row.message_id !== "string" ||
          typeof row.event_type !== "string" ||
          !sweepAlertTypes.includes(row.event_type as SweepAlert["type"])
        )
          throw new Error("due");
        return {
          messageId: row.message_id,
          type: row.event_type as SweepAlert["type"],
        };
      });
    },
    async claim(alert) {
      const { data, error } = await client.rpc(
        "pipstart_claim_email_alert",
        args(alert),
      );
      if (
        error ||
        !data ||
        !["leased", "accepted", "busy", "manual", "resolved"].includes(
          data.state,
        )
      )
        throw new Error("claim");
      if (
        data.state === "leased" &&
        (typeof data.token !== "string" || !/^[a-f0-9-]{36}$/i.test(data.token))
      )
        throw new Error("lease");
      return data as SweepClaim;
    },
    async accept(alert, token, providerId) {
      const { data, error } = await client.rpc("pipstart_accept_email_alert", {
        ...args(alert),
        p_token: token,
        p_provider_id: providerId,
      });
      if (error || data !== true) throw new Error("accept");
    },
    async finish(id, summary, status) {
      const { data, error } = await client
        .from("pipstart_email_monitor_sweeps")
        .update({ ...summary, status, finished_at: new Date().toISOString() })
        .eq("id", id)
        .select("id")
        .single();
      if (error || !data || data.id !== id) throw new Error("finish");
    },
  };
  return handleWatchedDeliverySweep(
    request,
    {
      secret: process.env.PIPSTART_EMAIL_MONITOR_SWEEP_SECRET?.trim() ?? "",
      apiKey: process.env.PIPSTART_ALERT_RESEND_API_KEY?.trim() ?? "",
      alertTo: process.env.PIPSTART_OPERATIONAL_ALERT_TO?.trim() ?? "",
    },
    store,
    process.env.PIPSTART_EMAIL_MONITOR_HEARTBEAT_URL?.trim() ?? "",
  );
}
