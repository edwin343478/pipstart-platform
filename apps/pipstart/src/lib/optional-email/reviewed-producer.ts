import "server-only";
import { createHash } from "node:crypto";
import { createOptionalEmailQueue, type EnqueueResult } from "./queue-store";
import { canonicalContentTime, findReviewedOptionalContent, isReviewedContentId, isReviewedOptionalContent } from "./content-catalog";

export type ReviewedJobRequest = Readonly<{ userId: string; contentId: string; occurrenceKey: string; availableAt: string }>;
export type ReviewedJobResult = EnqueueResult | { status: "disabled" | "invalid_request" | "not_approved" | "unavailable" | "review_required" };
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
function validRequest(value: unknown): value is ReviewedJobRequest {
  if (!value || typeof value !== "object" || Object.keys(value).sort().join() !== "availableAt,contentId,occurrenceKey,userId") return false;
  const request = value as ReviewedJobRequest;
  return typeof request.userId === "string" && request.userId.length === 36 && uuid.test(request.userId) &&
    isReviewedContentId(request.contentId) && isReviewedContentId(request.occurrenceKey) && canonicalContentTime(request.availableAt) !== null;
}
// Does NOT include revision/body/schedule: changing copy cannot silently create
// a second job for the same account/content/occurrence. Existing SQL conflicts.
export function reviewedJobDedupeKey(contentId: string, occurrenceKey: string): string {
  if (!isReviewedContentId(contentId) || !isReviewedContentId(occurrenceKey)) throw new Error("Invalid reviewed occurrence");
  return "m21-reviewed-v1-" + createHash("sha256").update([contentId, occurrenceKey].map(v => Buffer.byteLength(v, "utf8") + ":" + v).join(""), "utf8").digest("hex");
}
function safeResult(value: unknown): ReviewedJobResult {
  if (!value || typeof value !== "object") return { status: "review_required" };
  const result = value as Record<string, unknown>, keys = Object.keys(result).sort().join();
  if ((result.status === "queued" || result.status === "duplicate") && keys === "jobId,status" &&
      typeof result.jobId === "string" && result.jobId.length === 36 && uuid.test(result.jobId)) return { status: result.status, jobId: result.jobId };
  if (result.status === "conflict" && keys === "status") return { status: "conflict" };
  if (result.status === "suppressed" && keys === "reason,status" &&
      (result.reason === "account_inactive" || result.reason === "opted_out" || result.reason === "frequency_changed")) return { status: "suppressed", reason: result.reason };
  return { status: "review_required" };
}
// Private, dormant one-job producer. No env flag, HTTP route, enumeration,
// template interpolation, preference override, claim, worker or provider call.
export async function enqueueReviewedOptionalEmail(input: unknown, enabled = false): Promise<ReviewedJobResult> {
  if (enabled !== true) return { status: "disabled" };
  if (!validRequest(input)) return { status: "invalid_request" };
  // Snapshot primitives before the first await.
  const request = Object.freeze({ ...input });
  const found = findReviewedOptionalContent(request.contentId);
  if (!isReviewedOptionalContent(found) || found.id !== request.contentId) return { status: "not_approved" };
  const entry = Object.freeze({ ...found });
  const start = canonicalContentTime(entry.notBefore)!, end = canonicalContentTime(entry.notAfter)!;
  const available = canonicalContentTime(request.availableAt)!, now = Date.now();
  if (now < start || now >= end || available < now || available < start || available >= end) return { status: "not_approved" };
  let queue: ReturnType<typeof createOptionalEmailQueue>;
  try { queue = createOptionalEmailQueue(); } catch { return { status: "unavailable" }; }
  if (!queue) return { status: "unavailable" };
  try {
    return safeResult(await queue.enqueue(Object.freeze({
      userId: request.userId, kind: entry.kind, subject: entry.subject, html: entry.html, text: entry.text,
    }), reviewedJobDedupeKey(entry.id, request.occurrenceKey), request.availableAt));
  } catch {
    // A lost enqueue acknowledgement may follow a committed job. Never retry,
    // create a replacement occurrence, start a worker, or expose raw errors.
    return { status: "review_required" };
  }
}
