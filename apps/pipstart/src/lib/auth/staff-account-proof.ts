import type { SupabaseClient } from "@supabase/supabase-js";
import { isFactorId, staffDeadline } from "./staff-entry";
import { verifyStaffFactor } from "./staff-mfa-flow";
export type AccountProofMode = "dispatch" | "inspect";
export type AccountProof = Readonly<{
  request: string;
  mode: AccountProofMode;
  token: string;
  expiresAt: string;
}>;
export async function authorizeStaffAccountRequest(
  client: SupabaseClient,
  actor: string,
  request: string,
  mode: AccountProofMode,
  factor: string,
  code: string,
): Promise<
  | { kind: "ready"; proof: AccountProof }
  | { kind: "invalid" | "denied" | "unknown" | "rejected" }
> {
  if (
    !isFactorId(actor) ||
    !isFactorId(request) ||
    request !== request.toLowerCase() ||
    !["dispatch", "inspect"].includes(mode)
  )
    return { kind: "invalid" };
  try {
    const before = await staffDeadline(client.auth.getUser());
    if (before.error || before.data.user?.id !== actor)
      return { kind: "denied" };
    const verified = await verifyStaffFactor(client, actor, factor, code);
    if (verified.kind !== "verified")
      return {
        kind:
          verified.kind === "invalid" || verified.kind === "rejected"
            ? verified.kind
            : "unknown",
      };
    const after = await staffDeadline(client.auth.getUser());
    if (after.error || after.data.user?.id !== actor) return { kind: "denied" };
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    const reply = await client
      .rpc("pipstart_staff_account_receipt", {
        p_request: request,
        p_mode: mode,
        p_token: token,
      })
      .abortSignal(AbortSignal.timeout(8_000));
    if (reply.error)
      return { kind: reply.error.code === "42501" ? "denied" : "unknown" };
    const data = reply.data;
    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data) ||
      Object.keys(data).sort().join(",") !== "expires_at,status" ||
      !["issued", "already_issued"].includes(data.status) ||
      typeof data.expires_at !== "string" ||
      !Number.isFinite(Date.parse(data.expires_at))
    )
      return { kind: "unknown" };
    return {
      kind: "ready",
      proof: Object.freeze({
        request,
        mode,
        token,
        expiresAt: data.expires_at,
      }),
    };
  } catch {
    return { kind: "unknown" };
  }
}
