import "server-only";
import { limitedFrom } from "./staff-action-limit";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import { parseWorkspaceDetail } from "./editorial-workspace-contract";
import {
  linkBody,
  object,
  partnerBody,
  projectLink,
  projectPartner,
  validPartnerEditorInput,
  type PartnerEditorResult,
  type PartnerEditorView,
  type PartnerPolicyView,
} from "./partner-editor-contract";

// Navigation guidance only: the store (MP09a) decides every permission, host and policy rule.
const EDITORS = ["owner", "affiliate_manager"];
type Rpc = (
  fn: string,
  args: Record<string, unknown>,
) => Promise<{
  data: unknown;
  error: { code?: string; hint?: string } | null;
}>;
class StoreError extends Error {
  constructor(
    readonly code: string,
    readonly hint: string | null = null,
  ) {
    super(code);
  }
}

function policyView(
  v: unknown,
  kind: "partner" | "link",
): PartnerPolicyView | null {
  if (!object(v) || !Number.isSafeInteger(v.version) || Number(v.version) < 0)
    return null;
  if (v.version === 0)
    return { version: 0, riskNotice: null, allowedHosts: [] };
  if (v.kind !== kind) return null;
  const hosts = Array.isArray(v.allowed_hosts) ? v.allowed_hosts : [];
  if (hosts.some((h) => typeof h !== "string")) return null;
  return {
    version: Number(v.version),
    riskNotice: typeof v.risk_notice === "string" ? v.risk_notice : null,
    allowedHosts: hosts as string[],
  };
}

/** One partner or link editor operation, on the signed-in staff member's own session. A sent write
 * with an unclear outcome is reported as uncertain and never replayed. */
export async function runPartnerEditor(
  client: SupabaseClient,
  input: unknown,
): Promise<PartnerEditorResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  if (!validPartnerEditorInput(input)) return { kind: "invalid" };
  const command = structuredClone(input);
  let sent = false;
  try {
    const identity = await staffDeadline(client.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "denied" };
    const live = await readLiveStaffAccess(client, identity.data.user.id);
    if (live.kind !== "authorized")
      return { kind: live.kind === "unavailable" ? "unavailable" : "denied" };
    if (!live.access.roles.some((r) => EDITORS.includes(r)))
      return { kind: "denied" };
    const rpc: Rpc = async (fn, args) => {
      const r = await client
        .rpc(fn, args)
        .abortSignal(AbortSignal.timeout(8000));
      return { data: r.data, error: r.error };
    };
    const call = async (fn: string, args: Record<string, unknown>) => {
      const r = await rpc(fn, args);
      if (r.error)
        throw new StoreError(r.error.code ?? "", r.error.hint ?? null);
      return r.data;
    };
    const read = async (id: string): Promise<PartnerEditorView | null> => {
      const kind = id.startsWith("partner:") ? "partner" : "link";
      const raw = await rpc("pipstart_editorial_item", { p_id: id });
      if (raw.error) {
        if (raw.error.code === "22023") return null;
        throw new StoreError(raw.error.code ?? "");
      }
      const d = parseWorkspaceDetail(raw.data, id);
      const body =
        object(raw.data) && object(raw.data.revision)
          ? raw.data.revision.body
          : null;
      if (!d || d.family !== kind || !object(body))
        throw new StoreError("shape");
      const policy = policyView(
        await call("pipstart_partner_policy", { p_id: id }),
        kind,
      );
      if (!policy) throw new StoreError("shape");
      const base = {
        slug: id.slice(kind.length + 1),
        revision: d.revision,
        bodySha256: d.bodySha256,
        state: d.state,
        trashed: d.trashed,
        policy,
      };
      if (kind === "partner") {
        const fields = projectPartner(body);
        if (!fields) throw new StoreError("shape");
        const link = await rpc("pipstart_editorial_item", {
          p_id: "link:" + base.slug,
        });
        if (
          link.error &&
          link.error.code !== "22023" &&
          link.error.code !== "42501"
        )
          throw new StoreError(link.error.code ?? "");
        return { kind, fields, hasLink: !link.error, ...base };
      }
      const fields = projectLink(body);
      if (!fields) throw new StoreError("shape");
      return { kind, fields, ...base };
    };
    const savedResult = (
      v: unknown,
      id: string,
      revision: number,
    ): PartnerEditorResult =>
      object(v) &&
      v.item_id === id &&
      v.revision_no === revision &&
      v.state === "draft"
        ? { kind: "saved", id, revision }
        : { kind: "uncertain" };

    switch (command.kind) {
      case "load": {
        const view = await read(command.id);
        return view ? { kind: "ready", view } : { kind: "unavailable" };
      }
      case "read-policy": {
        const policy = policyView(
          await call("pipstart_partner_policy", { p_id: command.id }),
          command.id.startsWith("partner:") ? "partner" : "link",
        );
        return policy ? { kind: "policy", policy } : { kind: "unavailable" };
      }
      case "policy": {
        if (!live.access.roles.includes("owner")) return { kind: "denied" };
        const kind = command.id.startsWith("partner:") ? "partner" : "link";
        sent = true;
        const r = await call("pipstart_partner_policy_set", {
          p_id: command.id,
          p_kind: kind,
          p_expected_version: command.expectedVersion,
          p_value:
            kind === "partner"
              ? { riskNotice: command.riskNotice }
              : { allowedHosts: command.allowedHosts },
          p_reason: command.reason,
        });
        return object(r) &&
          r.item_id === command.id &&
          r.version === command.expectedVersion + 1
          ? {
              kind: "policy-saved",
              id: command.id,
              version: command.expectedVersion + 1,
            }
          : { kind: "uncertain" };
      }
      case "create-partner":
      case "create-link": {
        const isPartner = command.kind === "create-partner";
        const id = (isPartner ? "partner:" : "link:") + command.slug;
        sent = true;
        return savedResult(
          await call("pipstart_editorial_create", {
            p_id: id,
            p_family: isPartner ? "partner" : "link",
            p_learning_path: null,
            p_parent: isPartner ? null : "partner:" + command.slug,
            p_body: isPartner
              ? partnerBody(command.fields, null)
              : linkBody(command.fields),
            p_reason: command.reason,
          }),
          id,
          1,
        );
      }
      case "save-partner":
      case "save-link": {
        const isPartner = command.kind === "save-partner";
        const id = (isPartner ? "partner:" : "link:") + command.slug;
        const view = await read(id);
        if (!view) return { kind: "unavailable" };
        if (view.trashed) return { kind: "invalid" };
        if (
          view.revision !== command.baseRevision ||
          view.bodySha256 !== command.baseSha256
        )
          return { kind: "conflict" };
        const raw = await call("pipstart_editorial_item", { p_id: id });
        const previous =
          object(raw) && object(raw.revision) && object(raw.revision.body)
            ? raw.revision.body
            : null;
        if (!previous) return { kind: "unavailable" };
        sent = true;
        return savedResult(
          await call("pipstart_editorial_save", {
            p_id: id,
            p_base_revision: command.baseRevision,
            p_body: isPartner
              ? partnerBody(command.fields, previous)
              : linkBody(command.fields as never),
            p_reason: command.reason,
          }),
          id,
          command.baseRevision + 1,
        );
      }
    }
  } catch (error) {
    if (error instanceof StoreError) {
      if (error.code === "42501") return { kind: "denied" };
      if (error.code === "PT409") return { kind: "conflict" };
      const limited = limitedFrom(error);
      if (limited) return limited;
      if (["22023", "55000"].includes(error.code)) return { kind: "invalid" };
    }
    return { kind: sent ? "uncertain" : "unavailable" };
  }
}
