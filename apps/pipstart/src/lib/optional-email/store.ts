import "server-only";
import { createSupabaseAdminClient } from "../supabase/admin";
import { isDispatchState, type DispatchStateStore } from "./dispatch";

export function createOptionalEmailDispatchStore(): DispatchStateStore | null {
  const client = createSupabaseAdminClient();
  if (!client) return null;
  return {
    async load(userId) {
      // Never cache or trust a queued preference/email snapshot. This RPC reads
      // the current Auth email and optional preferences on each invocation.
      const { data, error } = await client.rpc("pipstart_optional_email_dispatch_state", { p_user_id: userId });
      if (error || !isDispatchState(data)) throw new Error("Optional email eligibility unavailable");
      return data;
    },
  };
}
