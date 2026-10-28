import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline, isFactorId } from "./staff-entry";
import { validMaintenanceProof } from "./staff-maintenance-contract";
import {
  runStaffAccountProvider,
  type AccountProviderResult,
  type StaffAccountJournal,
} from "./staff-account-provider";
export type MaintenanceResult = AccountProviderResult | { kind: "denied" };
export async function runMaintenanceTransport(
  user: SupabaseClient,
  service: SupabaseClient,
  input: unknown,
): Promise<MaintenanceResult> {
  if (
    process.env.PIPSTART_M22_STAFF_MAINTENANCE_ENABLED !== "true" ||
    process.env.PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED !== "true"
  )
    return { kind: "disabled" };
  if (!validMaintenanceProof(input)) return { kind: "invalid" };
  if (Date.parse(input.expiresAt) <= Date.now()) return { kind: "denied" };
  try {
    const identity = await staffDeadline(user.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "denied" };
    const { request, mode, token } = input;
    const claim = await user
      .rpc("pipstart_staff_maintenance_claim", {
        p_request: request,
        p_mode: mode,
        p_token: token,
      })
      .abortSignal(AbortSignal.timeout(8_000));
    if (claim.error)
      return { kind: claim.error.code === "42501" ? "denied" : "unknown" };
    const g = claim.data;
    if (
      !g ||
      typeof g !== "object" ||
      Array.isArray(g) ||
      Object.keys(g).sort().join(",") !==
        "expires_at,permit,permit_id,request_id,status" ||
      g.status !== "execution_permitted" ||
      g.request_id !== request ||
      !isFactorId(g.permit_id) ||
      typeof g.permit !== "string" ||
      !/^[a-f0-9]{64}$/.test(g.permit) ||
      typeof g.expires_at !== "string" ||
      !Number.isFinite(Date.parse(g.expires_at)) ||
      Date.parse(g.expires_at) <= Date.now()
    )
      return { kind: "unknown" };
    const permit = g.permit,
      permitId = g.permit_id;
    let dispatch: string | null = null;
    const journal: StaffAccountJournal = {
      take: async (r, m, t) => {
        if (r !== request || m !== mode || t !== token)
          throw Error("Maintenance binding mismatch");
        const reply = await service
          .rpc("pipstart_staff_maintenance_take", {
            p_request: request,
            p_permit_id: permitId,
            p_permit: permit,
            p_token: token,
          })
          .abortSignal(AbortSignal.timeout(8_000));
        if (reply.error) throw Error("Maintenance permit unavailable");
        if (isFactorId(reply.data?.dispatch_id))
          dispatch = reply.data.dispatch_id;
        return reply.data;
      },
      result: async (r, d, outcome) => {
        if (r !== request || d !== dispatch || mode !== "dispatch")
          throw Error("Maintenance result mismatch");
        const reply = await service
          .rpc("pipstart_staff_maintenance_result", {
            p_request: request,
            p_permit_id: permitId,
            p_permit: permit,
            p_dispatch: d,
            p_outcome: outcome,
          })
          .abortSignal(AbortSignal.timeout(8_000));
        if (reply.error) throw Error("Maintenance outcome unavailable");
        return reply.data;
      },
    };
    return await runStaffAccountProvider(journal, service.auth.admin, {
      ...input,
      expiresAt: g.expires_at,
    });
  } catch {
    return { kind: "unknown" };
  }
}
