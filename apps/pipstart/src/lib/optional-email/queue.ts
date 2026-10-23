import "server-only";
import {
  dispatchOptionalEmail,
  isDispatchState,
  isOptionalEmailJob,
  optionalEmailSuppression,
  type DispatchStateStore,
  type OptionalEmailJob,
  type OptionalEmailTransport,
} from "./dispatch";
import type { TokenIssuer } from "../email-unsubscribe/delivery";
export type PreparedOptionalMessage = Parameters<
  OptionalEmailTransport["deliver"]
>[0];
export type QueueClaim =
  | { status: "claimed"; token: string; job: OptionalEmailJob }
  | { status: "missing" | "terminal" | "manual" | "busy" | "not_due" };
export interface OptionalEmailQueue {
  claim(jobId: string): Promise<QueueClaim>;
  begin(
    jobId: string,
    token: string,
    message: PreparedOptionalMessage,
  ): Promise<boolean>;
  finish(
    jobId: string,
    token: string,
    outcome: "accepted" | "suppressed" | "manual",
    reason: string | null,
    providerId: string | null,
  ): Promise<boolean>;
  release(jobId: string, token: string): Promise<boolean>;
}
export interface DurableOptionalTransport {
  // Must perform immediate, non-queued handoff with this immutable payload/key.
  // This patch supplies no real provider adapter and NEVER retries a handoff.
  deliver(
    message: PreparedOptionalMessage,
    idempotencyKey: string,
  ): Promise<{ providerId: string }>;
}
export type QueueResult = {
  status:
    | "disabled"
    | "unavailable"
    | "missing"
    | "terminal"
    | "manual"
    | "busy"
    | "not_due"
    | "accepted"
    | "suppressed"
    | "retry_later"
    | "lease_lost"
    | "checkpoint_pending";
};
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function isQueueClaim(value: unknown): value is QueueClaim {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (item.status === "claimed")
    return (
      Object.keys(item).sort().join() === "job,status,token" &&
      typeof item.token === "string" &&
      uuid.test(item.token) &&
      isOptionalEmailJob(item.job)
    );
  return (
    Object.keys(item).length === 1 &&
    ["missing", "terminal", "manual", "busy", "not_due"].includes(
      item.status as string,
    )
  );
}
export async function processOptionalEmailJob(
  jobId: string,
  dependencies: {
    queue: OptionalEmailQueue | null;
    store: DispatchStateStore | null;
    issuer: TokenIssuer | null;
    transport: DurableOptionalTransport | null;
  },
  enabled = false,
): Promise<QueueResult> {
  if (!enabled) return { status: "disabled" };
  if (!uuid.test(jobId)) return { status: "unavailable" };
  const { queue, store, issuer, transport } = dependencies;
  if (!queue || !store || !issuer || !transport)
    return { status: "unavailable" };
  let claim: QueueClaim;
  try {
    claim = await queue.claim(jobId);
    if (!isQueueClaim(claim)) throw new Error();
  } catch {
    return { status: "unavailable" };
  }
  if (claim.status !== "claimed") return { status: claim.status };
  if (claim.job.jobId !== jobId) return { status: "unavailable" };
  const { token, job } = claim;
  let stage: "preparing" | "starting" | "sending" | "provider" = "preparing";
  let rejected = false;
  let override: { outcome: "suppressed" | "manual"; reason: string } | null =
    null;
  async function finish(
    outcome: "accepted" | "suppressed" | "manual",
    reason: string | null,
    providerId: string | null = null,
  ): Promise<QueueResult> {
    try {
      return (await queue!.finish(jobId, token, outcome, reason, providerId))
        ? { status: outcome }
        : { status: "checkpoint_pending" };
    } catch {
      return { status: "checkpoint_pending" };
    }
  }
  const result = await dispatchOptionalEmail(job, {
    store,
    issuer,
    transport: {
      async deliver(message) {
        const prepared = Object.freeze({
          ...message,
          headers: Object.freeze({ ...message.headers }),
        });
        // Set BEFORE awaiting: a lost DB acknowledgement may still mean commit.
        stage = "starting";
        if (!(await queue.begin(jobId, token, prepared))) {
          rejected = true;
          throw new Error("Lease unavailable");
        }
        stage = "sending";
        let current;
        try {
          current = await store.load(job.userId);
          if (!isDispatchState(current)) throw new Error();
        } catch {
          override = { outcome: "manual", reason: "eligibility_unavailable" };
          throw new Error("Eligibility unavailable");
        }
        const suppressed = optionalEmailSuppression(current, job.kind);
        if (suppressed) {
          override = { outcome: "suppressed", reason: suppressed.reason };
          throw new Error("Suppressed");
        }
        if (current.status !== "active" || current.email !== prepared.to) {
          override = { outcome: "manual", reason: "recipient_changed" };
          throw new Error("Recipient changed");
        }
        // No awaited work after this fresh check and before immediate handoff.
        stage = "provider";
        return transport.deliver(prepared, `pipstart-opt-v1-${jobId}`);
      },
    },
  });
  if (rejected) return { status: "lease_lost" };
  // Callback writes occur during dispatch; read through a function to avoid
  // TypeScript assuming closure-mutated values remain at their initial state.
  const checkpoint = () => ({ stage, override });
  const after = checkpoint();
  if (after.override)
    return finish(after.override.outcome, after.override.reason);
  if (result.status === "accepted")
    return finish("accepted", null, result.providerId);
  if (result.status === "suppressed")
    return finish("suppressed", result.reason);
  if (after.stage !== "preparing")
    return finish(
      "manual",
      after.stage === "provider" ? "provider_uncertain" : "handoff_uncertain",
    );
  // Only before any durable send marker or transport call is a retry permitted.
  try {
    return (await queue.release(jobId, token))
      ? { status: "retry_later" }
      : { status: "lease_lost" };
  } catch {
    return { status: "checkpoint_pending" };
  }
}
