import "server-only";
import { processOptionalEmailJob } from "./queue";

export type WorkerAdmission =
  | { status: "busy" | "empty" }
  | { status: "acquired"; token: string; jobIds: string[] };
export interface OptionalWorkerStore {
  acquire(): Promise<WorkerAdmission>;
  finish(token: string): Promise<boolean>;
}
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function isWorkerAdmission(value: unknown): value is WorkerAdmission {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.status === "busy" || v.status === "empty")
    return Object.keys(v).length === 1;
  return (
    v.status === "acquired" &&
    Object.keys(v).sort().join() === "jobIds,status,token" &&
    typeof v.token === "string" &&
    uuid.test(v.token) &&
    Array.isArray(v.jobIds) &&
    v.jobIds.length >= 1 &&
    v.jobIds.length <= 5 &&
    v.jobIds.every((id) => typeof id === "string" && uuid.test(id)) &&
    new Set(v.jobIds.map((id) => id.toLowerCase())).size === v.jobIds.length
  );
}
export type WorkerResult = {
  status:
    | "disabled"
    | "unavailable"
    | "busy"
    | "empty"
    | "review_required"
    | "completed";
  processed: number;
};

// No env lookup, route, timer, retries or producer. Composition stays unwired.
export async function runOptionalEmailWorker(
  store: OptionalWorkerStore | null,
  dependencies: Parameters<typeof processOptionalEmailJob>[1],
  enabled = false,
): Promise<WorkerResult> {
  if (enabled !== true) return { status: "disabled", processed: 0 };
  if (
    !store ||
    !dependencies.queue ||
    !dependencies.store ||
    !dependencies.issuer ||
    !dependencies.transport
  )
    return { status: "unavailable", processed: 0 };
  let admission: WorkerAdmission;
  try {
    admission = await store.acquire();
    if (!isWorkerAdmission(admission))
      return { status: "review_required", processed: 0 };
  } catch {
    return { status: "review_required", processed: 0 };
  }
  if (admission.status !== "acquired")
    return { status: admission.status, processed: 0 };
  let processed = 0;
  for (const id of admission.jobIds) {
    try {
      const result = await processOptionalEmailJob(id, dependencies, true);
      processed++;
      // Every uncertain/unexpected outcome stops this run and retains admission.
      // lease_lost includes cadence deferrals; conservatively review, never loop.
      if (
        ![
          "accepted",
          "suppressed",
          "missing",
          "terminal",
          "not_due",
          "retry_later",
        ].includes(result.status)
      )
        return { status: "review_required", processed };
    } catch {
      return { status: "review_required", processed };
    }
  }
  try {
    return {
      status:
        (await store.finish(admission.token)) === true
          ? "completed"
          : "review_required",
      processed,
    };
  } catch {
    return { status: "review_required", processed };
  }
}
