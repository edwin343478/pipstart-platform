import "server-only";
import { createSupabaseAdminClient } from "../supabase/admin";
import { isOptionalEmailJob, type OptionalEmailJob } from "./dispatch";
import { isQueueClaim, type OptionalEmailQueue } from "./queue";
export type EnqueueResult =
  | { status: "queued" | "duplicate"; jobId: string }
  | { status: "conflict" }
  | {
      status: "suppressed";
      reason: "account_inactive" | "opted_out" | "frequency_changed";
    };
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function createOptionalEmailQueue():
  | (OptionalEmailQueue & {
      enqueue(
        job: Omit<OptionalEmailJob, "jobId">,
        dedupeKey: string,
        availableAt: string,
      ): Promise<EnqueueResult>;
    })
  | null {
  const client = createSupabaseAdminClient();
  if (!client) return null;
  async function rpc(name: string, args: Record<string, unknown>) {
    const { data, error } = await client!.rpc(name, args);
    if (error) throw new Error("Optional queue unavailable");
    return data;
  }
  async function booleanRpc(name: string, args: Record<string, unknown>) {
    const data = await rpc(name, args);
    if (typeof data !== "boolean")
      throw new Error("Optional queue unavailable");
    return data;
  }
  return {
    async enqueue(job, dedupeKey, availableAt) {
      if (
        !job ||
        Object.keys(job).sort().join() !== "html,kind,subject,text,userId" ||
        !isOptionalEmailJob({ ...job, jobId: "validation" }) ||
        !/^[A-Za-z0-9_-]{1,100}$/.test(dedupeKey) ||
        !/^\d{4}-\d{2}-\d{2}T/.test(availableAt) ||
        !Number.isFinite(Date.parse(availableAt))
      )
        throw new Error("Invalid optional job");
      const data = await rpc("pipstart_enqueue_optional_email", {
        p_user_id: job.userId,
        p_dedupe_key: dedupeKey,
        p_kind: job.kind,
        p_subject: job.subject,
        p_html: job.html,
        p_text: job.text,
        p_available_at: availableAt,
      });
      if (
        data &&
        ["queued", "duplicate"].includes(data.status) &&
        typeof data.jobId === "string" &&
        uuid.test(data.jobId) &&
        Object.keys(data).length === 2
      )
        return data as EnqueueResult;
      if (data?.status === "conflict" && Object.keys(data).length === 1)
        return data as EnqueueResult;
      if (
        data?.status === "suppressed" &&
        ["account_inactive", "opted_out", "frequency_changed"].includes(
          data.reason,
        ) &&
        Object.keys(data).length === 2
      )
        return data as EnqueueResult;
      throw new Error("Optional queue unavailable");
    },
    async claim(jobId) {
      const data = await rpc("pipstart_claim_optional_email", {
        p_job_id: jobId,
      });
      if (!isQueueClaim(data)) throw new Error("Optional queue unavailable");
      return data;
    },
    begin: (jobId, token, message) =>
      booleanRpc("pipstart_begin_optional_email", {
        p_job_id: jobId,
        p_token: token,
        p_message: message,
      }),
    finish: (jobId, token, outcome, reason, providerId) =>
      booleanRpc("pipstart_finish_optional_email", {
        p_job_id: jobId,
        p_token: token,
        p_outcome: outcome,
        p_reason: reason,
        p_provider_id: providerId,
      }),
    release: (jobId, token) =>
      booleanRpc("pipstart_release_optional_email", {
        p_job_id: jobId,
        p_token: token,
      }),
  };
}
