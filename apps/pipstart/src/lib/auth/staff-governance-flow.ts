import type { SupabaseClient } from "@supabase/supabase-js";
import {
  readLiveStaffAccess,
  STAFF_REASONS,
  type LiveStaffAccess,
} from "./staff-role-flow";
import { verifyStaffFactor } from "./staff-mfa-flow";
import { isFactorId } from "./staff-entry";
import {
  parseStaffGovernance,
  type StaffGovernance,
  type StaffAssignment,
} from "./staff-governance";
export const STAFF_DELEGATIONS = [
  "audit.read",
  "people.manage_learners",
  "roles.delegate",
] as const;
export const STAFF_RESOURCE_KINDS = [
  "course",
  "module",
  "lesson",
  "quiz",
  "partner",
  "link",
  "maintenance",
] as const;
export type GovernanceCommand = Readonly<{
  target: string;
  operation: "grant_delegation" | "revoke_delegation" | "assign" | "unassign";
  value: string;
  resourceKind: string;
  resourceId: string;
  reason: (typeof STAFF_REASONS)[number];
}>;
export type GovernanceIntent = Readonly<{
  actor: string;
  command: GovernanceCommand;
  request: string;
  token: string;
  expiresAt: string;
}>;
type Failure = {
  kind: "invalid" | "denied" | "unavailable" | "unknown" | "rejected";
};
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
export function validGovernanceCommand(command: GovernanceCommand): boolean {
  if (
    !command ||
    Object.keys(command).sort().join(",") !==
      "operation,reason,resourceId,resourceKind,target,value" ||
    !isFactorId(command.target) ||
    !STAFF_REASONS.includes(command.reason)
  )
    return false;
  if (
    command.operation === "grant_delegation" ||
    command.operation === "revoke_delegation"
  )
    return (
      (STAFF_DELEGATIONS as readonly string[]).includes(command.value) &&
      command.resourceKind === "" &&
      command.resourceId === ""
    );
  return (
    ["assign", "unassign"].includes(command.operation) &&
    command.value === "" &&
    (STAFF_RESOURCE_KINDS as readonly string[]).includes(
      command.resourceKind,
    ) &&
    typeof command.resourceId === "string" &&
    /^[a-z0-9][a-z0-9_:/.-]{0,199}$/.test(command.resourceId)
  );
}
export function mayChangeGovernance(
  access: LiveStaffAccess,
  command: GovernanceCommand,
): boolean {
  return (
    validGovernanceCommand(command) &&
    access.capabilities.includes("roles.manage") &&
    !(
      command.operation === "grant_delegation" &&
      command.target === access.user_id
    )
  );
}
function targetAllows(
  page: StaffGovernance,
  command: GovernanceCommand,
): boolean {
  return (
    page.staffActive !== null &&
    (!command.operation.endsWith("delegation") ||
      page.roles.includes("administrator"))
  );
}
export async function readLiveStaffGovernance(
  client: SupabaseClient,
  actor: string,
  target: string,
  after: StaffAssignment | null = null,
): Promise<StaffGovernance | Failure> {
  if (
    !isFactorId(target) ||
    (after !== null &&
      (!record(after) ||
        Object.keys(after).sort().join(",") !== "resource_id,resource_kind" ||
        !(STAFF_RESOURCE_KINDS as readonly string[]).includes(
          after.resource_kind,
        ) ||
        typeof after.resource_id !== "string" ||
        !/^[a-z0-9][a-z0-9_:/.-]{0,199}$/.test(after.resource_id)))
  )
    return { kind: "invalid" };
  const access = await readLiveStaffAccess(client, actor);
  if (access.kind !== "authorized") return access;
  if (!access.access.capabilities.includes("roles.manage"))
    return { kind: "denied" };
  try {
    const response = await client
      .rpc("pipstart_staff_governance", {
        p_target: target,
        p_after_kind: after?.resource_kind ?? null,
        p_after_id: after?.resource_id ?? null,
        p_limit: 25,
      })
      .abortSignal(AbortSignal.timeout(8000));
    if (response.error)
      return {
        kind: response.error.code === "42501" ? "denied" : "unavailable",
      };
    return parseStaffGovernance(response.data, target, after);
  } catch {
    return { kind: "unavailable" };
  }
}
function binding(command: GovernanceCommand) {
  return {
    p_target: command.target,
    p_operation: command.operation,
    p_value: command.value,
    p_kind: command.resourceKind,
    p_id: command.resourceId,
  };
}
export async function prepareGovernanceIntent(
  client: SupabaseClient,
  actor: string,
  command: GovernanceCommand,
  factor: string,
  code: string,
): Promise<{ kind: "ready"; intent: GovernanceIntent } | Failure> {
  if (!validGovernanceCommand(command)) return { kind: "invalid" };
  const frozen = Object.freeze({ ...command });
  const before = await readLiveStaffAccess(client, actor);
  if (before.kind !== "authorized") return before;
  if (!mayChangeGovernance(before.access, frozen)) return { kind: "denied" };
  const target = await readLiveStaffGovernance(client, actor, frozen.target);
  if (target.kind !== "ready") return target;
  if (!targetAllows(target, frozen)) return { kind: "denied" };
  const verified = await verifyStaffFactor(client, actor, factor, code);
  if (verified.kind !== "verified")
    return {
      kind:
        verified.kind === "rejected" || verified.kind === "invalid"
          ? verified.kind
          : "unknown",
    };
  const live = await readLiveStaffAccess(client, actor);
  if (live.kind !== "authorized") return live;
  if (!mayChangeGovernance(live.access, frozen)) return { kind: "denied" };
  // Only memory holds this token. It is not a bearer authority or recovery code.
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  const request = crypto.randomUUID();
  try {
    const reply = await client
      .rpc("pipstart_staff_receipt", { ...binding(frozen), p_token: token })
      .abortSignal(AbortSignal.timeout(8_000));
    if (reply.error)
      return {
        kind: ["42501", "22023"].includes(reply.error.code)
          ? "rejected"
          : "unknown",
      };
    if (
      !record(reply.data) ||
      Object.keys(reply.data).sort().join(",") !== "expires_at,status" ||
      !["issued", "already_issued"].includes(String(reply.data.status)) ||
      typeof reply.data.expires_at !== "string" ||
      !Number.isFinite(Date.parse(reply.data.expires_at))
    )
      return { kind: "unknown" };
    return {
      kind: "ready",
      intent: Object.freeze({
        actor,
        command: frozen,
        request,
        token,
        expiresAt: reply.data.expires_at,
      }),
    };
  } catch {
    return { kind: "unknown" };
  }
}
export type GovernanceCompletion =
  | {
      kind: "complete";
      status: "changed" | "unchanged" | "already_recorded";
      request: string;
    }
  | Failure;
export async function completeGovernanceIntent(
  client: SupabaseClient,
  intent: GovernanceIntent,
  reconcileOnly = false,
): Promise<GovernanceCompletion> {
  if (
    !intent ||
    !isFactorId(intent.actor) ||
    !isFactorId(intent.request) ||
    !/^[a-f0-9]{64}$/.test(intent.token) ||
    !validGovernanceCommand(intent.command)
  )
    return { kind: "invalid" };
  const live = await readLiveStaffAccess(client, intent.actor);
  if (live.kind !== "authorized") return live;
  if (!mayChangeGovernance(live.access, intent.command))
    return { kind: "denied" };
  try {
    // With an empty token the RPC can only acknowledge this exact previously
    // audited request; it cannot initiate a new mutation. Never retry a send.
    const reply = await client
      .rpc("pipstart_staff_change", {
        ...binding(intent.command),
        p_token: reconcileOnly ? "" : intent.token,
        p_request: intent.request,
        p_reason: intent.command.reason,
      })
      .abortSignal(AbortSignal.timeout(8_000));
    if (reply.error)
      return {
        kind: reconcileOnly
          ? "unknown"
          : ["42501", "22023"].includes(reply.error.code)
            ? "rejected"
            : "unknown",
      };
    if (
      !record(reply.data) ||
      Object.keys(reply.data).sort().join(",") !== "request_id,status" ||
      reply.data.request_id !== intent.request ||
      !["changed", "unchanged", "already_recorded"].includes(
        String(reply.data.status),
      ) ||
      (reconcileOnly && reply.data.status !== "already_recorded")
    )
      return { kind: "unknown" };
    return {
      kind: "complete",
      status: reply.data.status as "changed" | "unchanged" | "already_recorded",
      request: intent.request,
    };
  } catch {
    return { kind: "unknown" };
  }
}
