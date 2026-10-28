import type { SupabaseClient } from "@supabase/supabase-js";
import { parseStaffAccess } from "./staff-access";
import { isFactorId, staffDeadline } from "./staff-entry";
import { parseStaffPeople } from "./staff-people";
import { verifyStaffFactor } from "./staff-mfa-flow";

export const STAFF_ROLES = [
  "owner",
  "administrator",
  "author",
  "reviewer",
  "editor",
  "moderator",
  "affiliate_manager",
] as const;
export const STAFF_REASONS = [
  "staff_onboarding",
  "access_change",
  "security_response",
  "owner_transfer",
] as const;
export type RoleCommand = Readonly<{
  target: string;
  operation: "grant_role" | "revoke_role";
  value: (typeof STAFF_ROLES)[number];
  reason: (typeof STAFF_REASONS)[number];
}>;
export type RoleIntent = Readonly<{
  actor: string;
  command: RoleCommand;
  request: string;
  token: string;
  expiresAt: string;
}>;
type Failure = {
  kind: "invalid" | "denied" | "unavailable" | "unknown" | "rejected";
};
export type LiveStaffAccess = Extract<
  ReturnType<typeof parseStaffAccess>,
  { kind: "authorized" }
>["access"];
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

// UI validation is guidance only. RPCs independently check the live actor,
// delegation ceiling, exact proof binding, last Owner and atomic audit write.
export function validRoleCommand(command: RoleCommand): boolean {
  return (
    !!command &&
    Object.keys(command).sort().join(",") === "operation,reason,target,value" &&
    isFactorId(command.target) &&
    ["grant_role", "revoke_role"].includes(command.operation) &&
    STAFF_ROLES.includes(command.value) &&
    STAFF_REASONS.includes(command.reason)
  );
}
export function mayChangeRole(
  access: LiveStaffAccess,
  command: RoleCommand,
): boolean {
  if (
    !validRoleCommand(command) ||
    (command.operation === "grant_role" && command.target === access.user_id)
  )
    return false;
  return (
    access.capabilities.includes("roles.manage") ||
    (access.capabilities.includes("roles.delegate") &&
      !["owner", "administrator"].includes(command.value) &&
      command.target !== access.user_id)
  );
}
export async function readLiveStaffAccess(
  client: SupabaseClient,
  actor: string,
): Promise<{ kind: "authorized"; access: LiveStaffAccess } | Failure> {
  try {
    const identity = await staffDeadline(client.auth.getUser());
    if (identity.error || identity.data.user?.id !== actor)
      return { kind: "denied" };
    const reply = await client
      .rpc("pipstart_staff_access", { p_kind: "", p_id: "" })
      .abortSignal(AbortSignal.timeout(8_000));
    if (reply.error) return { kind: "unavailable" };
    return parseStaffAccess(reply.data, actor);
  } catch {
    return { kind: "unavailable" };
  }
}
export async function readLiveStaffPeople(
  client: SupabaseClient,
  actor: string,
  query = "",
  after: string | null = null,
) {
  if (
    query !== query.trim() ||
    query.length > 60 ||
    (query !== "" && query.length < 2) ||
    (after !== null && !isFactorId(after))
  )
    return { kind: "invalid" } as const;
  const live = await readLiveStaffAccess(client, actor);
  if (live.kind !== "authorized") return live;
  if (!live.access.capabilities.includes("people.read"))
    return { kind: "denied" } as const;
  try {
    const reply = await client
      .rpc("pipstart_staff_people", {
        p_after: after,
        p_limit: 25,
        p_query: query,
        p_user: null,
      })
      .abortSignal(AbortSignal.timeout(8_000));
    if (reply.error)
      return {
        kind: reply.error.code === "42501" ? "denied" : "unavailable",
      } as const;
    const page = parseStaffPeople(reply.data);
    if (page.kind !== "ready") return page;
    // Refuse a stale/repeated page instead of looping over a bad cursor.
    if (after && page.items.some((p) => p.user_id <= after))
      return { kind: "unavailable" } as const;
    return { ...page, access: live.access };
  } catch {
    return { kind: "unavailable" } as const;
  }
}
function binding(command: RoleCommand) {
  return {
    p_target: command.target,
    p_operation: command.operation,
    p_value: command.value,
    p_kind: "",
    p_id: "",
  };
}
export async function prepareRoleIntent(
  client: SupabaseClient,
  actor: string,
  command: RoleCommand,
  factor: string,
  code: string,
): Promise<{ kind: "ready"; intent: RoleIntent } | Failure> {
  if (!validRoleCommand(command)) return { kind: "invalid" };
  const frozen = Object.freeze({ ...command });
  const before = await readLiveStaffAccess(client, actor);
  if (before.kind !== "authorized") return before;
  if (!mayChangeRole(before.access, frozen)) return { kind: "denied" };
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
  if (!mayChangeRole(live.access, frozen)) return { kind: "denied" };
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
export type RoleCompletion =
  | {
      kind: "complete";
      status: "changed" | "unchanged" | "already_recorded";
      request: string;
    }
  | Failure;
export async function completeRoleIntent(
  client: SupabaseClient,
  intent: RoleIntent,
  reconcileOnly = false,
): Promise<RoleCompletion> {
  if (
    !intent ||
    !isFactorId(intent.actor) ||
    !isFactorId(intent.request) ||
    !/^[a-f0-9]{64}$/.test(intent.token) ||
    !validRoleCommand(intent.command)
  )
    return { kind: "invalid" };
  const live = await readLiveStaffAccess(client, intent.actor);
  if (live.kind !== "authorized") return live;
  if (!mayChangeRole(live.access, intent.command)) return { kind: "denied" };
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
