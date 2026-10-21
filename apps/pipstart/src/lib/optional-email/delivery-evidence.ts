import "server-only";
import { verifySignature, eventTypes, type EventType } from "../email-monitor/monitor";
import { normalizeOptionalAddress } from "./address-suppression";
export interface OptionalDeliveryEvidence { eventId: string; jobId: string; providerId: string; preparedHash: string; recipient: string; type: EventType; occurredAt: string; }
export interface OptionalDeliveryStore { record(event: OptionalDeliveryEvidence): Promise<"recorded" | "duplicate" | "ignored">; }
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
function object(v: unknown): Record<string, unknown> | null { return v !== null && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : null; }
export function parseOptionalDeliveryEvidence(body: string, eventId: string): OptionalDeliveryEvidence | null {
  const event = object(JSON.parse(body)); if (!event || typeof event.type !== "string") throw new Error("payload");
  if (!eventTypes.includes(event.type as EventType)) return null;
  const data = object(event.data); if (!data || typeof data.from !== "string") throw new Error("payload");
  const from = data.from.trim().match(/^(?:[^<>]*<)?([^<>\s]+@[^<>\s]+)>?$/)?.[1]?.toLowerCase();
  if (from !== "no-reply@account.pipstart.net") return null;
  const tags = object(data.tags);
  if (data.tags != null && !tags) throw new Error("payload");
  // Untagged security/operator/other-app emails do not enter this optional ledger.
  if (!tags || !Object.hasOwn(tags, "pipstart_job_id")) return null;
  if (typeof tags.pipstart_job_id !== "string" || !uuid.test(tags.pipstart_job_id) || typeof tags.pipstart_payload_hash !== "string" || !/^[a-f0-9]{64}$/.test(tags.pipstart_payload_hash) || typeof data.email_id !== "string" || !uuid.test(data.email_id) || !/^[A-Za-z0-9_-]{1,200}$/.test(eventId) || !Array.isArray(data.to) || data.to.length !== 1) throw new Error("payload");
  const recipient = normalizeOptionalAddress(data.to[0]);
  if (!recipient || typeof event.created_at !== "string" || event.created_at.length > 64 || !Number.isFinite(Date.parse(event.created_at))) throw new Error("payload");
  return { eventId, jobId: tags.pipstart_job_id, providerId: data.email_id, preparedHash: tags.pipstart_payload_hash, recipient, type: event.type as EventType, occurredAt: new Date(event.created_at).toISOString() };
}
const reply = (code: number, status: string) => Response.json({ status }, { status: code, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
export async function handleOptionalDeliveryWebhook(request: Request, secret: string, store: OptionalDeliveryStore | null): Promise<Response> {
  if (request.method !== "POST") return reply(405, "method_not_allowed");
  if (!secret || !store) return reply(503, "not_configured");
  if (!/^application\/json(?:;|$)/i.test(request.headers.get("content-type") ?? "")) return reply(415, "json_required");
  let body: string;
  try {
    const reader = request.body?.getReader(); const chunks: Uint8Array[] = []; let size = 0;
    if (reader) { try { while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 65536) { await reader.cancel(); return reply(413, "body_too_large"); } chunks.push(value); } } finally { reader.releaseLock(); } }
    body = new TextDecoder("utf8", { fatal: true }).decode(Buffer.concat(chunks));
  } catch { return reply(400, "invalid_body"); }
  if (!verifySignature(body, request.headers, secret)) return reply(401, "invalid_signature");
  let event: OptionalDeliveryEvidence | null;
  try { event = parseOptionalDeliveryEvidence(body, request.headers.get("svix-id")!); } catch { return reply(400, "invalid_payload"); }
  if (!event) return reply(200, "ignored");
  try { const result = await store.record(event); if (!["recorded", "duplicate", "ignored"].includes(result)) throw new Error(); return reply(200, result); }
  catch { return reply(503, "retry_required"); }
}
