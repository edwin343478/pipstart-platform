import type { SupabaseClient } from "@supabase/supabase-js";
import { isFactorId } from "./staff-entry";
import { verifyStaffFactor } from "./staff-mfa-flow";
import { readLiveStaffAccess, type LiveStaffAccess } from "./staff-role-flow";
import {
  mayPrepareLearnerIntent,
  validLearnerCommand,
  type LearnerCommand,
} from "./staff-learner-intent";
export type LearnerProof = Readonly<{
  actor: string;
  command: LearnerCommand;
  token: string;
  expiresAt: string;
}>;
export const LEARNER_DELIVERY_STATES = [
  "intent_only",
  "prepared",
  "dispatched",
  "succeeded",
  "unknown",
  "cancelled",
  "observed_desired",
  "observed_other",
] as const;
export type LearnerDeliveryState = {
  kind: "ready";
  request: string;
  target: string;
  operation: LearnerCommand["operation"];
  until: string | null;
  state: (typeof LEARNER_DELIVERY_STATES)[number];
};
type Failure = {
  kind: "invalid" | "denied" | "unknown" | "rejected" | "unavailable";
};
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const token = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
function receipt(
  value: unknown,
): value is { status: string; expires_at: string } {
  return (
    record(value) &&
    Object.keys(value).sort().join(",") === "expires_at,status" &&
    (value.status === "issued" || value.status === "already_issued") &&
    typeof value.expires_at === "string" &&
    Number.isFinite(Date.parse(value.expires_at))
  );
}
function capable(access: LiveStaffAccess) {
  return (
    access.capabilities.includes("people.manage_learners") &&
    (access.roles.includes("owner") || access.roles.includes("administrator"))
  );
}
export async function prepareLearnerProvider(
  client: SupabaseClient,
  actor: string,
  command: unknown,
  factor: string,
  code: string,
): Promise<{ kind: "ready"; proof: LearnerProof } | Failure> {
  if (!validLearnerCommand(command)) return { kind: "invalid" };
  const frozen = Object.freeze({ ...command });
  const before = await readLiveStaffAccess(client, actor);
  if (before.kind !== "authorized") return before;
  if (!mayPrepareLearnerIntent(before.access, frozen))
    return { kind: "denied" };
  const verified = await verifyStaffFactor(client, actor, factor, code);
  if (verified.kind !== "verified")
    return {
      kind:
        verified.kind === "invalid" || verified.kind === "rejected"
          ? verified.kind
          : "unknown",
    };
  const live = await readLiveStaffAccess(client, actor);
  if (live.kind !== "authorized") return live;
  if (!mayPrepareLearnerIntent(live.access, frozen)) return { kind: "denied" };
  const proofToken = token();
  try {
    const r = await client
      .rpc("pipstart_staff_learner_receipt", {
        p_request: frozen.request,
        p_target: frozen.target,
        p_operation: frozen.operation,
        p_until: frozen.until,
        p_reason: frozen.reason,
        p_token: proofToken,
      })
      .abortSignal(AbortSignal.timeout(8_000));
    if (r.error)
      return {
        kind: ["42501", "22023", "40001"].includes(r.error.code)
          ? "denied"
          : "unknown",
      };
    if (!receipt(r.data)) return { kind: "unknown" };
    return {
      kind: "ready",
      proof: Object.freeze({
        actor,
        command: frozen,
        token: proofToken,
        expiresAt: r.data.expires_at,
      }),
    };
  } catch {
    return { kind: "unknown" };
  }
}
export function parseLearnerDelivery(
  value: unknown,
  request: string,
  target: string,
): LearnerDeliveryState | { kind: "unavailable" } {
  if (
    !isFactorId(request) ||
    !isFactorId(target) ||
    !record(value) ||
    Object.keys(value).sort().join(",") !==
      "operation,request_id,state,status,suspend_until,target_id" ||
    value.status !== "delivery_state" ||
    value.request_id !== request ||
    value.target_id !== target ||
    typeof value.state !== "string" ||
    !(LEARNER_DELIVERY_STATES as readonly string[]).includes(value.state) ||
    !validLearnerCommand({
      request,
      target,
      operation: value.operation,
      until: value.suspend_until,
      reason: "access_change",
    })
  )
    return { kind: "unavailable" };
  return {
    kind: "ready",
    request,
    target,
    operation: value.operation as LearnerCommand["operation"],
    until: value.suspend_until as string | null,
    state: value.state as LearnerDeliveryState["state"],
  };
}
export async function readLearnerDelivery(
  client: SupabaseClient,
  actor: string,
  request: string,
  target: string,
): Promise<LearnerDeliveryState | Failure> {
  const live = await readLiveStaffAccess(client, actor);
  if (live.kind !== "authorized") return live;
  if (!capable(live.access)) return { kind: "denied" };
  try {
    const r = await client
      .rpc("pipstart_staff_learner_delivery_state", { p_request: request })
      .abortSignal(AbortSignal.timeout(8_000));
    if (r.error)
      return { kind: r.error.code === "42501" ? "denied" : "unavailable" };
    return parseLearnerDelivery(r.data, request, target);
  } catch {
    return { kind: "unavailable" };
  }
}
export async function prepareLearnerInspection(
  client: SupabaseClient,
  actor: string,
  request: string,
  factor: string,
  code: string,
): Promise<{ kind: "ready"; token: string } | Failure> {
  if (!isFactorId(request)) return { kind: "invalid" };
  const before = await readLiveStaffAccess(client, actor);
  if (before.kind !== "authorized") return before;
  if (!capable(before.access)) return { kind: "denied" };
  const verified = await verifyStaffFactor(client, actor, factor, code);
  if (verified.kind !== "verified")
    return {
      kind:
        verified.kind === "invalid" || verified.kind === "rejected"
          ? verified.kind
          : "unknown",
    };
  const live = await readLiveStaffAccess(client, actor);
  if (live.kind !== "authorized") return live;
  if (!capable(live.access)) return { kind: "denied" };
  const proofToken = token();
  try {
    const r = await client
      .rpc("pipstart_staff_learner_inspection_receipt", {
        p_request: request,
        p_token: proofToken,
      })
      .abortSignal(AbortSignal.timeout(8_000));
    if (r.error)
      return { kind: r.error.code === "42501" ? "denied" : "unknown" };
    return receipt(r.data)
      ? { kind: "ready", token: proofToken }
      : { kind: "unknown" };
  } catch {
    return { kind: "unknown" };
  }
}
