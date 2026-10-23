import "server-only";
import { createSupabaseAdminClient } from "../supabase/admin";
import { isUnsubscribeScope, type UnsubscribeStore } from "./core";

export function createUnsubscribeStore(): UnsubscribeStore | null {
  const client = createSupabaseAdminClient();
  if (!client) return null;
  return {
    async lookup(hash) {
      const { data, error } = await client.rpc(
        "pipstart_lookup_email_unsubscribe_token",
        { p_token_hash: hash },
      );
      if (error) throw new Error("unsubscribe lookup unavailable");
      if (data?.status === "invalid") return null;
      if (data?.status !== "valid" || !isUnsubscribeScope(data.scope))
        throw new Error("unsubscribe lookup unavailable");
      return data.scope;
    },
    async apply(hash) {
      const { data, error } = await client.rpc(
        "pipstart_apply_email_unsubscribe",
        { p_token_hash: hash },
      );
      if (
        error ||
        !["unsubscribed", "already_unsubscribed", "invalid"].includes(data)
      )
        throw new Error("unsubscribe update unavailable");
      return data;
    },
  };
}
