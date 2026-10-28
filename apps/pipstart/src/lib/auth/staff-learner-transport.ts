import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseStaffAccess } from "./staff-access";
import { staffDeadline, isFactorId } from "./staff-entry";
import {
  mayPrepareLearnerIntent,
  validLearnerCommand,
} from "./staff-learner-intent";
import {
  runStaffAccountProvider,
  type AccountProviderResult,
  type StaffAccountJournal,
} from "./staff-account-provider";
export type LearnerProviderResult = AccountProviderResult | { kind: "denied" };
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const proofToken = (v: unknown): v is string =>
  typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
export function validLearnerProviderInput(v: unknown) {
  return (
    record(v) &&
    proofToken(v.token) &&
    ((v.mode === "dispatch" &&
      Object.keys(v).sort().join(",") === "command,mode,token" &&
      validLearnerCommand(v.command)) ||
      (v.mode === "inspect" &&
        Object.keys(v).sort().join(",") === "mode,request,token" &&
        isFactorId(v.request) &&
        v.request === String(v.request).toLowerCase()))
  );
}
export async function runLearnerProviderTransport(
  user: SupabaseClient,
  service: SupabaseClient,
  provider: Parameters<typeof runStaffAccountProvider>[1],
  input: unknown,
): Promise<LearnerProviderResult> {
  if (
    process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true" ||
    process.env.PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED !== "true"
  )
    return { kind: "disabled" };
  if (
    !validLearnerProviderInput(input) ||
    !record(input) ||
    !proofToken(input.token)
  )
    return { kind: "invalid" };
  try {
    const identity = await staffDeadline(user.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "denied" };
    const accessReply = await user
      .rpc("pipstart_staff_access", { p_kind: "", p_id: "" })
      .abortSignal(AbortSignal.timeout(8_000));
    if (accessReply.error) return { kind: "denied" };
    const gate = parseStaffAccess(accessReply.data, identity.data.user.id);
    if (
      gate.kind !== "authorized" ||
      !gate.access.capabilities.includes("people.manage_learners") ||
      !gate.access.roles.some((r) => r === "owner" || r === "administrator")
    )
      return { kind: "denied" };
    const command = validLearnerCommand(input.command) ? input.command : null,
      mode = input.mode as "dispatch" | "inspect",
      request = command?.request ?? String(input.request),
      token = input.token;
    if (mode === "dispatch") {
      if (!command || !mayPrepareLearnerIntent(gate.access, command))
        return { kind: "denied" };
      const prepared = await user
        .rpc("pipstart_staff_learner_prepare", {
          p_request: request,
          p_target: command.target,
          p_operation: command.operation,
          p_until: command.until,
          p_reason: command.reason,
          p_token: token,
        })
        .abortSignal(AbortSignal.timeout(8_000));
      if (prepared.error)
        return {
          kind: ["42501", "22023", "40001", "23505"].includes(
            prepared.error.code,
          )
            ? "denied"
            : "unknown",
        };
      if (
        !record(prepared.data) ||
        Object.keys(prepared.data).sort().join(",") !== "request_id,status" ||
        prepared.data.request_id !== request ||
        prepared.data.status !== "intent_recorded"
      )
        return { kind: "unknown" };
    }
    const claim = await user
      .rpc("pipstart_staff_learner_claim", {
        p_request: request,
        p_mode: mode,
        p_token: token,
      })
      .abortSignal(AbortSignal.timeout(8_000));
    if (claim.error)
      return { kind: claim.error.code === "42501" ? "denied" : "unknown" };
    const grant = claim.data;
    if (
      !record(grant) ||
      Object.keys(grant).sort().join(",") !==
        "dispatch_id,expires_at,permit,request_id,status" ||
      grant.request_id !== request ||
      grant.status !== "execution_permitted" ||
      !isFactorId(grant.dispatch_id) ||
      !proofToken(grant.permit) ||
      typeof grant.expires_at !== "string" ||
      !Number.isFinite(Date.parse(grant.expires_at))
    )
      return { kind: "unknown" };
    const permit = grant.permit,
      dispatch = grant.dispatch_id;
    const journal: StaffAccountJournal = {
      take: async (r, m, t) => {
        if (r !== request || m !== mode || t !== token)
          throw Error("Bound learner transport mismatch");
        const x = await service
          .rpc("pipstart_staff_learner_provider_take", {
            p_request: request,
            p_dispatch: dispatch,
            p_permit: permit,
          })
          .abortSignal(AbortSignal.timeout(8_000));
        if (x.error) throw Error("Learner permit unavailable");
        return x.data;
      },
      result: async (r, d, outcome) => {
        if (r !== request || d !== dispatch)
          throw Error("Bound learner outcome mismatch");
        const x = await service
          .rpc("pipstart_staff_learner_provider_result", {
            p_request: request,
            p_dispatch: dispatch,
            p_permit: permit,
            p_outcome: outcome,
          })
          .abortSignal(AbortSignal.timeout(8_000));
        if (x.error) throw Error("Learner outcome unavailable");
        return x.data;
      },
    };
    return await runStaffAccountProvider(journal, provider, {
      request,
      mode,
      token,
      expiresAt: grant.expires_at,
    });
  } catch {
    return { kind: "unknown" };
  }
}
