import "server-only";
import { createSupabaseAdminClient } from "../supabase/admin";
import type { AddressSuppressionStore } from "./address-suppression";
export function createAddressSuppressionStore(): AddressSuppressionStore | null {
  const client = createSupabaseAdminClient();
  if (!client) return null;
  return {
    async record(event) {
      const { data, error } = await client.rpc(
        "pipstart_record_optional_address_block",
        {
          p_event_id: event.eventId,
          p_message_id: event.messageId,
          p_email: event.address,
          p_reason: event.reason,
          p_occurred_at: event.occurredAt,
        },
      );
      if (error || !["recorded", "duplicate"].includes(data))
        throw new Error("Address suppression persistence unavailable");
      return data as "recorded" | "duplicate";
    },
  };
}
