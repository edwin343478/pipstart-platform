import "server-only";
import { limitedFrom } from "./staff-action-limit";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import {
  parsePublicationStatus,
  validPublicationInput,
  type PublicationInput,
  type PublicationResult,
} from "./publication-contract";
import { bodyReferenceFindings, describeFinding } from "./reference-check";

// Navigation guidance only: the store (MP08a) decides every permission, rule and race.
const roles: Record<PublicationInput["action"], string[]> = {
  status: ["owner", "author", "reviewer", "editor", "affiliate_manager"],
  baseline: ["owner"],
  publish: ["owner", "editor"],
  // An assigned Affiliate Manager may take a link offline (revoke); SQL refuses anything else.
  withdraw: ["owner", "editor", "affiliate_manager"],
  restore: ["owner"],
};
const codes: Record<
  string,
  Exclude<
    PublicationResult["kind"],
    "status" | "done" | "uncertain" | "references" | "limited"
  >
> = {
  PT409: "conflict",
  "42501": "denied",
  "22023": "invalid",
  "55000": "state",
};

/**
 * One live-publication read or change for the signed-in staff member, through their own session
 * (never a service key). A change is sent at most once; an unclear outcome is "uncertain" and is
 * never retried or inferred.
 */
export async function runPublication(
  client: SupabaseClient,
  input: unknown,
): Promise<PublicationResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  if (!validPublicationInput(input)) return { kind: "invalid" };
  const command = structuredClone(input);
  let sent = false;
  try {
    const identity = await staffDeadline(client.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "denied" };
    const live = await readLiveStaffAccess(client, identity.data.user.id);
    if (live.kind !== "authorized")
      return { kind: live.kind === "unavailable" ? "unavailable" : "denied" };
    if (!live.access.roles.some((r) => roles[command.action].includes(r)))
      return { kind: "denied" };
    const call = (fn: string, args: Record<string, unknown>) =>
      client.rpc(fn, args).abortSignal(AbortSignal.timeout(8000));
    if (command.action === "status") {
      const { data, error } = await call("pipstart_publication_status", {
        p_id: command.id,
      });
      if (error) return { kind: codes[error.code ?? ""] ?? "unavailable" };
      const status = parsePublicationStatus(data, command.id !== null);
      return status ? { kind: "status", status } : { kind: "unavailable" };
    }
    if (command.action === "publish") {
      // MP10b (D4): read the exact revision on the user's own session and refuse Make live while it
      // points at a page or image this deployment does not have. Nothing is sent on refusal.
      const read = await call("pipstart_editorial_revision", {
        p_id: command.id,
        p_revision: command.revision,
      });
      if (read.error)
        return { kind: codes[read.error.code ?? ""] ?? "unavailable" };
      const data: unknown = read.data;
      const revision =
        data && typeof data === "object" && !Array.isArray(data)
          ? (data as { revision?: unknown }).revision
          : null;
      if (
        !revision ||
        typeof revision !== "object" ||
        (revision as { body_sha256?: unknown }).body_sha256 !== command.sha
      )
        return { kind: "conflict" };
      const findings = bodyReferenceFindings(
        command.id,
        (revision as { body?: unknown }).body,
      );
      if (findings.length)
        return {
          kind: "references",
          total: findings.length,
          references: findings.slice(0, 10).map(describeFinding),
        };
    }
    sent = true;
    const { data, error } =
      command.action === "baseline"
        ? await call("pipstart_publication_baseline", {
            p_operation: command.operation,
            p_reason: command.reason,
          })
        : command.action === "publish"
          ? await call("pipstart_publication_publish", {
              p_operation: command.operation,
              p_expected_generation: command.expected,
              p_id: command.id,
              p_revision: command.revision,
              p_sha: command.sha,
              p_reason: command.reason,
            })
          : command.action === "withdraw"
            ? await call("pipstart_publication_withdraw", {
                p_operation: command.operation,
                p_expected_generation: command.expected,
                p_id: command.id,
                p_reason: command.reason,
              })
            : await call("pipstart_publication_restore", {
                p_operation: command.operation,
                p_expected_generation: command.expected,
                p_from_generation: command.from,
                p_reason: command.reason,
              });
    if (error) {
      const limited = limitedFrom(error);
      if (limited) return limited;
      const kind = codes[error.code ?? ""];
      return { kind: kind ?? "uncertain" };
    }
    const expectedGeneration =
      command.action === "baseline" ? 1 : command.expected + 1;
    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data) ||
      Object.keys(data).sort().join(",") !==
        "entries,generation,item_id,kind,replayed,revision_no,snapshot_sha256" ||
      (data as { generation: unknown }).generation !== expectedGeneration ||
      typeof (data as { replayed: unknown }).replayed !== "boolean"
    )
      return { kind: "uncertain" };
    return {
      kind: "done",
      generation: expectedGeneration,
      replayed: (data as { replayed: boolean }).replayed,
    };
  } catch {
    return { kind: sent ? "uncertain" : "unavailable" };
  }
}
