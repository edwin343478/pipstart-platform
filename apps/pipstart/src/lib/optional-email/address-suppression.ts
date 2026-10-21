import "server-only";
import { verifySignature } from "../email-monitor/monitor";

export type AddressReason = "hard_bounce" | "complaint" | "provider_suppressed";
export interface AddressEvidence { eventId: string; messageId: string; address: string; reason: AddressReason; occurredAt: string; }
export interface AddressSuppressionStore { record(event: AddressEvidence): Promise<"recorded" | "duplicate">; }
// Match the DB canonicalizer: lowercase unquoted ASCII mailbox, no dot/plus folding.
export function normalizeOptionalAddress(value: unknown): string | null {
  if (typeof value !== "string" || !/^[\x20-\x7e]+$/.test(value)) return null;
  const address = value.replace(/^ +| +$/g, "").toLowerCase();
  return address.length <= 254 && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(address) ? address : null;
}
function object(value: unknown): Record<string, unknown> | null { return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null; }
export function parseAddressEvidence(body: string, eventId: string): AddressEvidence | null {
  const event = object(JSON.parse(body));
  if (!event || typeof event.type !== "string") throw new Error("payload");
  if (!["email.bounced", "email.complained", "email.suppressed"].includes(event.type)) return null;
  const data = object(event.data);
  if (!data || typeof data.from !== "string") throw new Error("payload");
  // This endpoint never affects Skillcima/other brands or operational-alert mail.
  const from = data.from.trim().match(/^(?:[^<>]*<)?([^<>\s]+@[^<>\s]+)>?$/)?.[1]?.toLowerCase();
  if (from !== "no-reply@account.pipstart.net") return null;
  let reason: AddressReason;
  if (event.type === "email.bounced") {
    const bounce = object(data.bounce);
    if (!bounce || !["Permanent", "Transient", "Undetermined"].includes(bounce.type as string)) throw new Error("payload");
    if (bounce.type !== "Permanent") return null;
    reason = "hard_bounce";
  } else reason = event.type === "email.complained" ? "complaint" : "provider_suppressed";
  // Never attribute a multi-recipient bounce/complaint to every listed recipient.
  if (!Array.isArray(data.to) || data.to.length !== 1) throw new Error("ambiguous recipient");
  const address = normalizeOptionalAddress(data.to[0]);
  if (!address || !/^[A-Za-z0-9_-]{1,200}$/.test(eventId) || typeof data.email_id !== "string" || !/^[A-Za-z0-9_-]{1,200}$/.test(data.email_id) || typeof event.created_at !== "string" || event.created_at.length > 64 || !Number.isFinite(Date.parse(event.created_at))) throw new Error("payload");
  return { eventId, messageId: data.email_id, address, reason, occurredAt: new Date(event.created_at).toISOString() };
}
function reply(code: number, status: string) { return Response.json({ status }, { status: code, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }); }
async function readBody(request: Request) {
  const reader = request.body?.getReader();if (!reader) return "";
  const chunks: Uint8Array[] = [];let size = 0;
  try { while (true) { const { value, done } = await reader.read();if (done) break;size += value.byteLength;if (size > 65536) { await reader.cancel();throw new Error("size"); }chunks.push(value); } }
  finally { reader.releaseLock(); }
  return new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
}
export async function handleAddressSuppressionWebhook(request: Request, secret: string, store: AddressSuppressionStore | null): Promise<Response> {
  if (request.method !== "POST") return reply(405, "method_not_allowed");
  if (!secret || !store) return reply(503, "not_configured");
  if (!/^application\/json(?:;|$)/i.test(request.headers.get("content-type") ?? "")) return reply(415, "json_required");
  let body: string;
  try { body = await readBody(request); } catch (error) { return reply(error instanceof Error && error.message === "size" ? 413 : 400, "invalid_body"); }
  if (!verifySignature(body, request.headers, secret)) return reply(401, "invalid_signature");
  let event: AddressEvidence | null;
  try { event = parseAddressEvidence(body, request.headers.get("svix-id")!); } catch { return reply(400, "invalid_payload"); }
  if (!event) return reply(200, "ignored");
  try { const status = await store.record(event);if (!["recorded", "duplicate"].includes(status)) throw new Error();return reply(200, status); }
  catch { return reply(503, "retry_required"); }
}
