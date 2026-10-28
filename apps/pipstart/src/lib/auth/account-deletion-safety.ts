import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "./staff-entry";
export type AccountDeletionResult =
  | { kind: "deleted" }
  | { kind: "staff_retirement_required" }
  | { kind: "unavailable" }
  | { kind: "unknown" };
// Server-only, after password reauthentication. No passwords/service keys here.
// Eligibility is advisory: the staff FK protects a concurrent membership grant.
export async function deleteEligibleAccount(
  client: SupabaseClient,
  userId: string,
  deleteUser: () => PromiseLike<{ error: unknown }>,
): Promise<AccountDeletionResult> {
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
      userId,
    )
  )
    return { kind: "unavailable" };
  try {
    const identity = await staffDeadline(client.auth.getUser());
    if (identity.error || identity.data.user?.id !== userId)
      return { kind: "unavailable" };
    const reply = await client
      .rpc("pipstart_account_deletion_eligibility")
      .abortSignal(AbortSignal.timeout(8_000));
    if (
      reply.error ||
      !reply.data ||
      typeof reply.data !== "object" ||
      Array.isArray(reply.data) ||
      Object.keys(reply.data).sort().join(",") !== "status,user_id" ||
      reply.data.user_id !== userId
    )
      return { kind: "unavailable" };
    if (reply.data.status === "staff_retirement_required")
      return { kind: "staff_retirement_required" };
    if (reply.data.status !== "eligible") return { kind: "unavailable" };
  } catch {
    return { kind: "unavailable" };
  }
  try {
    // One dispatch only. A timeout does not cancel the remote Auth operation.
    // No automatic retry or successful-deletion claim on a lost response.
    const reply = await staffDeadline(Promise.resolve(deleteUser()));
    return reply && reply.error === null
      ? { kind: "deleted" }
      : { kind: "unknown" };
  } catch {
    return { kind: "unknown" };
  }
}
