import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readBoundedRequestBody } from "../http/request-body";
import { staffDeadline } from "../auth/staff-entry";
import { fetchEmailResponse } from "../email-response";
import { configuredPublicationUrl } from "./publication-deploy-url";
type Configuration = { enabled?: string; secret?: string; hook?: string };
type Dependencies = { admin: () => SupabaseClient | null; send?: typeof fetch };
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const reply = (status: number, state: string) =>
  Response.json(
    { status: state },
    { status, headers: { "Cache-Control": "no-store" } },
  );
/** Delivery only. No human JWT, caller-selected generation, publication or automatic retry. */
export async function handleScheduledPublicationDelivery(
  request: Request,
  config: Configuration,
  deps: Dependencies,
): Promise<Response> {
  if (config.enabled !== "true") return reply(503, "disabled");
  const secret = config.secret;
  if (!secret || !/^[A-Za-z0-9_-]{32,128}$/.test(secret))
    return reply(503, "not_configured");
  const auth = request.headers.get("authorization") ?? "";
  if (
    auth.length > 160 ||
    !/^Bearer [A-Za-z0-9_-]{32,128}$/.test(auth) ||
    !timingSafeEqual(
      createHash("sha256").update(auth.slice(7)).digest(),
      createHash("sha256").update(secret).digest(),
    )
  )
    return reply(401, "unauthorized");
  if (request.method !== "POST") return reply(405, "method");
  try {
    const body = new TextDecoder("utf-8", { fatal: true })
      .decode(
        await readBoundedRequestBody(request, { maxBytes: 32, maxChunks: 8 }),
      )
      .trim();
    if (body !== "" && body !== "{}") return reply(400, "invalid");
  } catch {
    return reply(400, "invalid");
  }
  const hook = configuredPublicationUrl(config.hook, true);
  if (!hook) return reply(503, "not_configured");
  try {
    const admin = deps.admin();
    if (!admin) return reply(503, "unavailable");
    const claim = await staffDeadline(
      admin
        .rpc("pipstart_publication_scheduler_claim", {})
        .abortSignal(AbortSignal.timeout(8000)),
    );
    if (claim.error || !object(claim.data)) return reply(503, "unknown");
    const c = claim.data;
    if (
      Object.keys(c).join(",") === "state" &&
      ["disabled", "idle"].includes(String(c.state))
    )
      return reply(200, String(c.state));
    if (
      Object.keys(c).sort().join(",") !== "generation,state,token" ||
      c.state !== "claimed" ||
      !Number.isSafeInteger(c.generation) ||
      Number(c.generation) < 1 ||
      typeof c.token !== "string" ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
        c.token,
      )
    )
      return reply(503, "unknown");
    let sent = false;
    try {
      const response = await fetchEmailResponse(
        deps.send ?? fetch,
        hook.href,
        { method: "POST", redirect: "error", cache: "no-store" },
        { timeoutMs: 8000, maxBytes: 4096, maxChunks: 128 },
      );
      sent = response.ok;
    } catch {
      /* An unconfirmed request may have been accepted. Persist uncertainty. */
    }
    const finish = await staffDeadline(
      admin
        .rpc("pipstart_publication_scheduler_finish", {
          p_generation: c.generation,
          p_token: c.token,
          p_sent: sent,
        })
        .abortSignal(AbortSignal.timeout(8000)),
    );
    if (finish.error || finish.data !== true) return reply(503, "unknown");
    return reply(sent ? 200 : 503, sent ? "started" : "unknown");
  } catch {
    return reply(503, "unknown");
  }
}
