import "server-only";
import { timingSafeEqual } from "node:crypto";
import type { WorkerResult } from "./worker";

export type OptionalBatchConfiguration = Readonly<{
  enabled?: string; secret?: string; apiKey?: string;
}>;
type BatchRun = (apiKey: string) => Promise<WorkerResult>;
function response(status: string, code: number, processed = 0) {
  return Response.json({ status, processed }, {
    status: code, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
function validResult(value: unknown): value is WorkerResult {
  if (!value || typeof value !== "object" || Object.keys(value).sort().join() !== "processed,status") return false;
  const result = value as Record<string, unknown>;
  if (!Number.isInteger(result.processed) || (result.processed as number) < 0 || (result.processed as number) > 5) return false;
  if (result.status === "completed") return (result.processed as number) >= 1;
  if (result.status === "review_required") return true;
  return ["disabled", "unavailable", "busy", "empty"].includes(result.status as string) && result.processed === 0;
}
// Next's Node adapter can expose an empty POST as a non-null stream.
// Prove EOF/zero bytes after auth; never parse/buffer payloads or wait indefinitely.
async function hasEmptyBody(request: Request): Promise<boolean> {
  if (request.signal.aborted || request.bodyUsed || request.body?.locked) return false;
  if (request.body === null) return true;
  const reader = request.body.getReader();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Empty body verification timed out")), 1000);
  });
  try {
    // Bound empty-chunk work as well as bytes/time. No non-empty chunk is accepted.
    for (let count = 0; count < 4; count++) {
      const { done, value } = await Promise.race([reader.read(), timeout]);
      if (done) return !request.signal.aborted;
      if (!(value instanceof Uint8Array) || value.byteLength !== 0) return false;
    }
    return false;
  } catch { return false; }
  finally {
    if (timer !== undefined) clearTimeout(timer);
    // Do not await an untrusted/never-resolving cancellation callback.
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
// Machine-only trigger. Verify zero body bytes, never trust cookies or payloads.
// All authorization/configuration checks precede the lazy runtime callback.
export async function handleOptionalEmailBatch(request: Request, configuration: OptionalBatchConfiguration, run: BatchRun): Promise<Response> {
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } });
  const secret = configuration.secret ?? "";
  if (secret.length !== 64 || !/^[a-f0-9]{64}$/.test(secret)) return response("not_configured", 503);
  const authorization = request.headers.get("authorization") ?? "";
  const expected = "Bearer " + secret;
  if (authorization.length !== 71 || !/^Bearer [a-f0-9]{64}$/.test(authorization) ||
      !timingSafeEqual(Buffer.from(authorization, "ascii"), Buffer.from(expected, "ascii"))) return response("unauthorized", 401);
  const url = new URL(request.url);
  const length = request.headers.get("content-length");
  if (url.search || url.hash || request.headers.has("origin") ||
      (length !== null && length !== "0") || request.headers.has("transfer-encoding") || request.headers.has("content-type"))
    return response("invalid_request", 400);
  if (!await hasEmptyBody(request)) return response("invalid_request", 400);
  if (configuration.enabled !== "true") return response("disabled", 503);
  const apiKey = configuration.apiKey ?? "";
  if (apiKey.trim() !== apiKey || !/^re_[A-Za-z0-9_-]{10,}$/.test(apiKey)) return response("not_configured", 503);
  try {
    // One existing bounded worker invocation only. No loop, refill or retry.
    const result: unknown = await run(apiKey);
    if (!validResult(result)) return response("review_required", 503);
    const code = result.status === "completed" || result.status === "empty" ? 200 : result.status === "busy" ? 409 : 503;
    return response(result.status, code, result.processed);
  } catch {
    // An exception may follow acquisition/handoff. Never unlock or expose errors.
    return response("review_required", 503);
  }
}
