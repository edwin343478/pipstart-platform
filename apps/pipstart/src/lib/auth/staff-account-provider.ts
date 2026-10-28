import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isFactorId, staffDeadline } from "./staff-entry";
import type { AccountProof } from "./staff-account-proof";

// Private trusted-operator transport, not a browser or service-role RPC. The SQL
// take primitive rechecks the Owner/session/factor, consumes proof and claims
// atomically. No public route or production transport is connected here.
export interface StaffAccountJournal {
  take(
    request: string,
    mode: "dispatch" | "inspect",
    token: string,
  ): PromiseLike<unknown>;
  result(
    request: string,
    dispatch: string,
    outcome: "succeeded" | "unknown",
  ): PromiseLike<unknown>;
}
type Provider = Pick<
  SupabaseClient["auth"]["admin"],
  "getUserById" | "updateUserById"
>;
export type AccountProviderResult =
  | { kind: "disabled" | "invalid" | "unknown" }
  | { kind: "recorded"; request: string; outcome: "succeeded" | "unknown" }
  | {
      kind: "observed";
      request: string;
      journalState: string;
      observation: "desired" | "other" | "unavailable";
    };
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const exact = (v: Record<string, unknown>, keys: string) =>
  Object.keys(v).sort().join(",") === keys;
const states = [
  "prepared",
  "dispatched",
  "unknown",
  "succeeded",
  "failed",
  "cancelled",
  "observed_desired",
  "observed_other",
];
function validProof(v: AccountProof) {
  return (
    !!v &&
    isFactorId(v.request) &&
    v.request === v.request.toLowerCase() &&
    ["dispatch", "inspect"].includes(v.mode) &&
    typeof v.token === "string" &&
    /^[a-f0-9]{64}$/.test(v.token)
  );
}
function desired(
  user: unknown,
  target: string,
  operation: string,
  until: unknown,
): "desired" | "other" | "unavailable" {
  if (!record(user) || user.id !== target) return "unavailable";
  const ban = user.banned_until;
  if (
    ban !== undefined &&
    ban !== null &&
    (typeof ban !== "string" || !Number.isFinite(Date.parse(ban)))
  )
    return "unavailable";
  const banned = typeof ban === "string" ? Date.parse(ban) : 0;
  if (operation === "auth_resume")
    return banned <= Date.now() ? "desired" : "other";
  const expiry = typeof until === "string" ? Date.parse(until) : NaN;
  if (!Number.isFinite(expiry)) return "unavailable";
  // GoTrue accepts a relative duration, so the acknowledgment's expiry may
  // differ slightly from the fixed reviewed expiry. Observation is not causality.
  return banned > Date.now() && Math.abs(banned - expiry) <= 15_000
    ? "desired"
    : "other";
}
export async function runStaffAccountProvider(
  journal: StaffAccountJournal,
  provider: Provider | null,
  proof: AccountProof,
): Promise<AccountProviderResult> {
  if (process.env.PIPSTART_M22_ACCOUNT_PROVIDER_ENABLED !== "true")
    return { kind: "disabled" };
  if (!validProof(proof) || !provider) return { kind: "invalid" };
  const request = proof.request,
    mode = proof.mode,
    token = proof.token;
  let value: unknown;
  try {
    value = await staffDeadline(journal.take(request, mode, token));
  } catch {
    return { kind: "unknown" };
  }
  if (
    !record(value) ||
    value.request_id !== request ||
    !isFactorId(value.target_id) ||
    typeof value.operation !== "string" ||
    !["auth_suspend", "auth_resume"].includes(value.operation)
  )
    return { kind: "unknown" };
  const target = value.target_id,
    operation = value.operation as string,
    until = value.suspend_until;
  if (operation === "auth_resume" && until !== null) return { kind: "unknown" };
  if (
    operation === "auth_suspend" &&
    (typeof until !== "string" || !Number.isFinite(Date.parse(until)))
  )
    return { kind: "unknown" };
  if (mode === "inspect") {
    if (
      !exact(
        value,
        "operation,request_id,state,status,suspend_until,target_id",
      ) ||
      value.status !== "inspection_authorized" ||
      typeof value.state !== "string" ||
      !states.includes(value.state)
    )
      return { kind: "unknown" };
    try {
      const reply = await staffDeadline(provider.getUserById(target));
      return {
        kind: "observed",
        request,
        journalState: value.state as string,
        observation:
          reply.error !== null
            ? "unavailable"
            : desired(reply.data.user, target, operation, until),
      };
    } catch {
      return {
        kind: "observed",
        request,
        journalState: String(value.state),
        observation: "unavailable",
      };
    }
  }
  if (
    !exact(
      value,
      "dispatch_id,factor_id,operation,request_id,status,suspend_until,target_id",
    ) ||
    value.status !== "dispatch_authorized" ||
    value.factor_id !== null ||
    !isFactorId(value.dispatch_id)
  )
    return { kind: "unknown" };
  const dispatch = value.dispatch_id;
  let outcome: "succeeded" | "unknown" = "unknown";
  const seconds =
    typeof until === "string"
      ? Math.ceil((Date.parse(until) - Date.now()) / 1_000)
      : 0;
  // A transport ceiling, not an automatic suspension policy. The future operator
  // UI must separately approve the exact target/expiry before enabling any send.
  if (operation === "auth_resume" || (seconds >= 1 && seconds <= 31_536_000)) {
    try {
      const reply = await staffDeadline(
        provider.updateUserById(target, {
          ban_duration: operation === "auth_resume" ? "none" : seconds + "s",
        }),
      );
      if (
        reply.error === null &&
        desired(reply.data.user, target, operation, until) === "desired"
      )
        outcome = "succeeded";
    } catch {
      /* Remote work may have completed. Never repeat the provider call. */
    }
  }
  try {
    const reply = await staffDeadline(
      journal.result(request, dispatch, outcome),
    );
    if (
      record(reply) &&
      exact(reply, "request_id,state,status") &&
      reply.request_id === request &&
      reply.state === outcome &&
      typeof reply.status === "string" &&
      ["recorded", "already_recorded"].includes(reply.status)
    )
      return { kind: "recorded", request, outcome };
  } catch {
    /* Keep uncertainty if recording was not acknowledged. */
  }
  return { kind: "unknown" };
}
