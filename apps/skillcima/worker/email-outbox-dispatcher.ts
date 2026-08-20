import {
  createEmailQueueMessage,
  type EmailQueueBinding,
  type SkillcimaEmailQueueJobType,
} from "./email-queue";
import type { SupabaseEnv } from "./supabase";

const DEFAULT_DISPATCH_LIMIT = 10;
const MAX_DISPATCH_LIMIT = 50;

type DispatchableEmailJobStatus = "pending" | "failed";

interface DispatchableEmailJobRow {
  id: string;
  job_type: SkillcimaEmailQueueJobType;
  status: DispatchableEmailJobStatus;
  attempt_count: number;
  available_at: string;
}

interface SupabaseConfiguration {
  url: string;
  secretKey: string;
}

export type DispatchEmailOutboxResult =
  | {
      status: "completed";
      selected: number;
      sent: number;
      markedQueued: number;
      queueFailures: number;
      stateUpdateFailures: number;
    }
  | {
      status: "misconfigured";
    }
  | {
      status: "unavailable";
      stage: "lookup";
      httpStatus?: number;
    };

export interface DispatchEmailOutboxOptions {
  limit?: number;
  now?: Date;
}

function getSupabaseConfiguration(
  env: SupabaseEnv,
): SupabaseConfiguration | null {
  const url = env.SUPABASE_URL?.trim();
  const secretKey = env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !secretKey) {
    return null;
  }

  return {
    url: url.replace(/\/+$/, ""),
    secretKey,
  };
}

function normalizeLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || !Number.isInteger(limit)) {
    return DEFAULT_DISPATCH_LIMIT;
  }

  return Math.min(Math.max(limit, 1), MAX_DISPATCH_LIMIT);
}

function isDispatchableEmailJobRow(
  value: unknown,
): value is DispatchableEmailJobRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.id === "string" &&
    row.id.length > 0 &&
    row.job_type === "course_confirmation" &&
    (row.status === "pending" || row.status === "failed") &&
    typeof row.attempt_count === "number" &&
    Number.isInteger(row.attempt_count) &&
    row.attempt_count >= 0 &&
    typeof row.available_at === "string"
  );
}

async function markEmailJobQueued(
  configuration: SupabaseConfiguration,
  jobId: string,
  queuedAt: Date,
): Promise<boolean> {
  const url = new URL(`${configuration.url}/rest/v1/email_jobs`);

  url.searchParams.set("id", `eq.${jobId}`);
  url.searchParams.set("status", "in.(pending,failed)");
  url.searchParams.set("select", "id,status");

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Prefer: "return=representation",
        apikey: configuration.secretKey,
      },
      body: JSON.stringify({
        status: "queued",
        queued_at: queuedAt.toISOString(),
        last_error_code: null,
        updated_at: queuedAt.toISOString(),
      }),
    });

    if (!response.ok) {
      await response.body?.cancel();
      return false;
    }

    const rows = (await response.json()) as unknown[];

    // An empty result means another process changed the
    // job state before this conditional update completed.
    // The Queue message was already sent, so a later
    // idempotent consumer must safely absorb duplicates.
    if (rows.length === 0) {
      return true;
    }

    const row = rows[0];

    return (
      rows.length === 1 &&
      !!row &&
      typeof row === "object" &&
      (row as Record<string, unknown>).id === jobId &&
      (row as Record<string, unknown>).status === "queued"
    );
  } catch {
    return false;
  }
}

export async function dispatchEmailOutbox(
  env: SupabaseEnv,
  queue: EmailQueueBinding,
  options: DispatchEmailOutboxOptions = {},
): Promise<DispatchEmailOutboxResult> {
  const configuration = getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const now = options.now ?? new Date();
  const limit = normalizeLimit(options.limit);

  const url = new URL(`${configuration.url}/rest/v1/email_jobs`);

  url.searchParams.set(
    "select",
    "id,job_type,status,attempt_count,available_at",
  );
  url.searchParams.set("status", "in.(pending,failed)");
  url.searchParams.set("available_at", `lte.${now.toISOString()}`);
  url.searchParams.set("order", "created_at.asc");
  url.searchParams.set("limit", String(limit));

  let jobs: unknown[];

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        apikey: configuration.secretKey,
      },
    });

    if (!response.ok) {
      const httpStatus = response.status;
      await response.body?.cancel();

      return {
        status: "unavailable",
        stage: "lookup",
        httpStatus,
      };
    }

    jobs = (await response.json()) as unknown[];
  } catch {
    return {
      status: "unavailable",
      stage: "lookup",
    };
  }

  if (!Array.isArray(jobs)) {
    return {
      status: "unavailable",
      stage: "lookup",
    };
  }

  const dispatchableJobs = jobs.filter(isDispatchableEmailJobRow);

  if (dispatchableJobs.length !== jobs.length) {
    return {
      status: "unavailable",
      stage: "lookup",
    };
  }

  let sent = 0;
  let markedQueued = 0;
  let queueFailures = 0;
  let stateUpdateFailures = 0;

  for (const job of dispatchableJobs) {
    try {
      await queue.send(
        createEmailQueueMessage({
          jobId: job.id,
          jobType: job.job_type,
        }),
      );

      sent += 1;
    } catch {
      // The database row is intentionally left pending
      // or failed so a later dispatcher run can retry it.
      queueFailures += 1;
      continue;
    }

    const marked = await markEmailJobQueued(configuration, job.id, now);

    if (marked) {
      markedQueued += 1;
    } else {
      // The Queue send already succeeded. Leaving the
      // durable database state unchanged is safer than
      // pretending it was confirmed. A later dispatch
      // may produce a duplicate Queue message, which the
      // consumer must handle idempotently.
      stateUpdateFailures += 1;
    }
  }

  return {
    status: "completed",
    selected: dispatchableJobs.length,
    sent,
    markedQueued,
    queueFailures,
    stateUpdateFailures,
  };
}
