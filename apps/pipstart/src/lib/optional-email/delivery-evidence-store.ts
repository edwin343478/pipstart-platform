import "server-only";
import { createSupabaseAdminClient } from "../supabase/admin";
import type { OptionalProviderReceipts } from "./resend-transport";
import type { OptionalDeliveryStore } from "./delivery-evidence";
export function createOptionalProviderEvidenceStore():
  (OptionalDeliveryStore & OptionalProviderReceipts) | null {
  const client = createSupabaseAdminClient();
  if (!client) return null;
  return {
    async acknowledge(jobId, providerId, preparedHash) {
      const { data, error } = await client.rpc(
        "pipstart_record_optional_provider_ack",
        { p_job_id: jobId, p_provider_id: providerId, p_digest: preparedHash },
      );
      if (error || !["bound", "duplicate"].includes(data))
        throw new Error("Optional provider evidence unavailable");
    },
    async record(event) {
      const { data, error } = await client.rpc(
        "pipstart_record_optional_delivery_event",
        {
          p_event_id: event.eventId,
          p_job_id: event.jobId,
          p_provider_id: event.providerId,
          p_digest: event.preparedHash,
          p_recipient: event.recipient,
          p_type: event.type,
          p_occurred_at: event.occurredAt,
        },
      );
      if (error || !["recorded", "duplicate", "ignored"].includes(data))
        throw new Error("Optional provider evidence unavailable");
      return data as "recorded" | "duplicate" | "ignored";
    },
  };
}
