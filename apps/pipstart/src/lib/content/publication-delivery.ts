import { configuredPublicationUrl } from "./publication-deploy-url";
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { staffDeadline } from "../auth/staff-entry";
import { readLiveStaffAccess } from "../auth/staff-role-flow";
import { createSupabaseAdminClient } from "../supabase/admin";
import { fetchEmailResponse } from "../email-response";
import {
  parsePublicationStatus,
  type PublicationResult,
} from "./publication-contract";
import { runPublication } from "./publication";
import {
  validDeliveryInput,
  type DeliveryInput,
  type DeliveryResult,
} from "./publication-delivery-contract";

type Dependencies = {
  admin?: () => SupabaseClient | null;
  send?: typeof fetch;
};
const limits = { timeoutMs: 8000, maxBytes: 4096, maxChunks: 128 };
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const positive = (v: unknown): v is number =>
  Number.isSafeInteger(v) && Number(v) > 0;

function groups(): string[] | null {
  const values = (process.env.PIPSTART_STORE_FAMILIES ?? "")
    .split(",")
    .map((v) => v.trim());
  if (
    !values.length ||
    values.some((v) => !["analysis", "curriculum"].includes(v)) ||
    new Set(values).size !== values.length
  )
    return null;
  return values.sort();
}
export function publicationDeliveryConfigured(): boolean {
  return (
    configuredPublicationUrl(process.env.PIPSTART_DEPLOY_HOOK_URL, true) !==
    null
  );
}

/** Live user authorization precedes privileged delivery. The existing SQL transition serializes
 * claims and caps attempts at 20. No publication operation is retried here. */
export async function runPublicationDelivery(
  client: SupabaseClient,
  input: unknown,
  deps: Dependencies = {},
): Promise<DeliveryResult> {
  if (process.env.PIPSTART_M22_STAFF_UI_ENABLED !== "true")
    return { kind: "denied" };
  if (!validDeliveryInput(input)) return { kind: "invalid" };
  const command: DeliveryInput = { ...input },
    send = deps.send ?? fetch;
  let claimed = false;
  try {
    const identity = await staffDeadline(client.auth.getUser());
    if (identity.error || !identity.data.user) return { kind: "denied" };
    const live = await readLiveStaffAccess(client, identity.data.user.id);
    if (live.kind !== "authorized")
      return { kind: live.kind === "unavailable" ? "unavailable" : "denied" };
    if (!live.access.roles.some((r) => r === "owner" || r === "editor"))
      return { kind: "denied" };
    const readStatus = async () => {
      const reply = await client
        .rpc("pipstart_publication_status", { p_id: null })
        .abortSignal(AbortSignal.timeout(8000));
      return reply.error ? null : parsePublicationStatus(reply.data, false);
    };
    const status = await readStatus();
    if (!status) return { kind: "unavailable" };
    if (status.generation !== command.generation) return { kind: "superseded" };
    if (!status.refresh) return { kind: "state" };
    const hook = configuredPublicationUrl(
        process.env.PIPSTART_DEPLOY_HOOK_URL,
        true,
      ),
      site = configuredPublicationUrl(process.env.NEXT_PUBLIC_SITE_URL, false),
      expectedGroups = groups();
    if (command.action === "retry" && !hook) return { kind: "not-configured" };
    if (command.action === "check" && (!site || !expectedGroups))
      return { kind: "not-configured" };
    const admin = (deps.admin ?? createSupabaseAdminClient)();
    if (!admin) return { kind: "unavailable" };
    const transition = async (
      state: "processing" | "failed" | "verified",
      note: string,
    ) => {
      const reply = await admin
        .rpc("pipstart_publication_refresh", {
          p_generation: command.generation,
          p_state: state,
          p_note: note,
        })
        .abortSignal(AbortSignal.timeout(8000));
      if (reply.error)
        return reply.error.code === "55000" ? "state" : "unknown";
      const r: unknown = reply.data;
      return object(r) &&
        Object.keys(r).sort().join(",") === "attempts,generation,state" &&
        r.generation === command.generation &&
        r.state === state &&
        positive(r.attempts) &&
        r.attempts <= 20
        ? "ok"
        : "unknown";
    };
    if (command.action === "retry") {
      if (
        !["pending", "failed"].includes(status.refresh.state) ||
        status.refresh.attempts >= 20
      )
        return { kind: "state" };
      claimed = true;
      const claim = await transition(
        "processing",
        "Deployment request claimed by authorized staff.",
      );
      if (claim !== "ok") return { kind: claim };
      const current = await readStatus();
      if (!current) return { kind: "unknown" };
      if (current.generation !== command.generation)
        return { kind: "superseded" };
      try {
        const reply = await fetchEmailResponse(
          send,
          hook!.href,
          { method: "POST", redirect: "error", cache: "no-store" },
          limits,
        );
        if (!reply.ok) throw new Error("Deployment not confirmed");
      } catch {
        const failed = await transition(
          "failed",
          "Deployment request not confirmed; it may have been accepted. Check before retrying.",
        );
        return { kind: failed === "ok" ? "failed" : "unknown" };
      }
      return { kind: "started" };
    }
    // The authoritative seal stays server-side with the private snapshot; no quiz data is
    // returned, logged or sent to the anonymous endpoint.
    const snapshot = await admin
      .rpc("pipstart_publication_snapshot", {})
      .abortSignal(AbortSignal.timeout(8000));
    if (
      snapshot.error ||
      !object(snapshot.data) ||
      !positive(snapshot.data.generation) ||
      typeof snapshot.data.snapshot_sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(snapshot.data.snapshot_sha256)
    )
      return { kind: "unavailable" };
    if (snapshot.data.generation !== command.generation)
      return { kind: "superseded" };
    let deployment: unknown;
    try {
      const reply = await fetchEmailResponse(
        send,
        new URL("/live-generation.json", site!).href,
        {
          method: "GET",
          redirect: "error",
          cache: "no-store",
          credentials: "omit",
          headers: { Accept: "application/json" },
        },
        limits,
      );
      if (!reply.ok) return { kind: "unreachable" };
      deployment = await reply.json();
    } catch {
      return { kind: "unreachable" };
    }
    if (
      !object(deployment) ||
      Object.keys(deployment).sort().join(",") !==
        "format,generation,groups,snapshotSha256" ||
      deployment.format !== "pipstart-deployment-generation" ||
      (deployment.generation !== null && !positive(deployment.generation)) ||
      !Array.isArray(deployment.groups) ||
      deployment.groups.some((v) => typeof v !== "string") ||
      (deployment.snapshotSha256 !== null &&
        (typeof deployment.snapshotSha256 !== "string" ||
          !/^[a-f0-9]{64}$/.test(deployment.snapshotSha256)))
    )
      return { kind: "different" };
    if (
      deployment.generation === null ||
      deployment.generation < command.generation
    )
      return { kind: "delivering" };
    if (
      deployment.generation !== command.generation ||
      deployment.snapshotSha256 !== snapshot.data.snapshot_sha256 ||
      [...deployment.groups].sort().join(",") !== expectedGroups!.join(",")
    )
      return { kind: "different" };
    const current = await readStatus();
    if (!current) return { kind: "unavailable" };
    if (current.generation !== command.generation)
      return { kind: "superseded" };
    if (current.refresh?.state === "verified") return { kind: "verified" };
    if (current.refresh?.state !== "processing") return { kind: "state" };
    const verified = await transition(
      "verified",
      "Anonymous deployment generation, seal and configured groups match.",
    );
    return { kind: verified === "ok" ? "verified" : verified };
  } catch {
    return { kind: claimed ? "unknown" : "unavailable" };
  }
}

/** Confirmed publication remains confirmed if delivery fails. Replays never re-trigger delivery. */
export async function runPublicationWithDelivery(
  client: SupabaseClient,
  input: unknown,
): Promise<PublicationResult> {
  const result = await runPublication(client, input);
  if (result.kind === "status")
    return { ...result, deliveryConfigured: publicationDeliveryConfigured() };
  if (result.kind !== "done" || result.replayed) return result;
  try {
    const delivery = await runPublicationDelivery(client, {
      action: "retry",
      generation: result.generation,
    });
    return { ...result, delivery: delivery.kind };
  } catch {
    return { ...result, delivery: "unknown" };
  }
}
