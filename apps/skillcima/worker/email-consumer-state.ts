import type { SkillcimaEmailQueueJobType } from "./email-queue";
import type { SupabaseEnv } from "./supabase";

interface SupabaseConfiguration {
  url: string;
  secretKey: string;
}

type RpcFailure =
  | {
      status: "misconfigured";
    }
  | {
      status: "unavailable";
      httpStatus?: number;
    };

type ClaimDatabaseStatus =
  | "claimed"
  | "not_found"
  | "job_type_mismatch"
  | "already_sent"
  | "dead_letter"
  | "already_processing"
  | "not_claimable";

interface ClaimRpcRow {
  result_status: ClaimDatabaseStatus;
  result_attempt_count: number | null;
}

export type ClaimEmailJobResult =
  | {
      status: "claimed";
      attemptCount: number;
    }
  | {
      status:
        | "not_found"
        | "job_type_mismatch"
        | "already_sent"
        | "dead_letter"
        | "already_processing"
        | "not_claimable";
      attemptCount: number | null;
    }
  | RpcFailure;

export type ReleaseEmailJobResult =
  | {
      status:
        | "queued"
        | "not_found"
        | "already_sent"
        | "dead_letter"
        | "invalid_state";
    }
  | RpcFailure;

export type MarkEmailJobSentResult =
  | {
      status:
        | "sent"
        | "not_found"
        | "already_sent"
        | "invalid_state"
        | "provider_mismatch"
        | "provider_conflict";
    }
  | RpcFailure;

export type MarkEmailJobDeadLetterResult =
  | {
      status:
        "dead_letter" | "not_found" | "already_sent" | "already_dead_letter";
    }
  | RpcFailure;

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

async function callRpc(
  env: SupabaseEnv,
  functionName: string,
  body: Record<string, unknown>,
): Promise<
  | {
      status: "ok";
      body: unknown;
    }
  | RpcFailure
> {
  const configuration = getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const url = new URL(`${configuration.url}/rest/v1/rpc/${functionName}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        apikey: configuration.secretKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const httpStatus = response.status;
      await response.body?.cancel();

      return {
        status: "unavailable",
        httpStatus,
      };
    }

    try {
      return {
        status: "ok",
        body: (await response.json()) as unknown,
      };
    } catch {
      return {
        status: "unavailable",
        httpStatus: response.status,
      };
    }
  } catch {
    return {
      status: "unavailable",
    };
  }
}

function isClaimDatabaseStatus(value: unknown): value is ClaimDatabaseStatus {
  return (
    value === "claimed" ||
    value === "not_found" ||
    value === "job_type_mismatch" ||
    value === "already_sent" ||
    value === "dead_letter" ||
    value === "already_processing" ||
    value === "not_claimable"
  );
}

function isScalarStatus<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

export async function claimEmailJob(
  env: SupabaseEnv,
  jobId: string,
  jobType: SkillcimaEmailQueueJobType,
): Promise<ClaimEmailJobResult> {
  const rpc = await callRpc(env, "skillcima_claim_email_job", {
    p_job_id: jobId,
    p_job_type: jobType,
  });

  if (rpc.status !== "ok") {
    return rpc;
  }

  if (!Array.isArray(rpc.body) || rpc.body.length !== 1) {
    return {
      status: "unavailable",
    };
  }

  const row = rpc.body[0];

  if (!row || typeof row !== "object") {
    return {
      status: "unavailable",
    };
  }

  const candidate = row as Partial<ClaimRpcRow>;

  if (!isClaimDatabaseStatus(candidate.result_status)) {
    return {
      status: "unavailable",
    };
  }

  const attemptCount = candidate.result_attempt_count;

  if (
    attemptCount !== null &&
    (typeof attemptCount !== "number" ||
      !Number.isInteger(attemptCount) ||
      attemptCount < 0)
  ) {
    return {
      status: "unavailable",
    };
  }

  if (candidate.result_status === "claimed") {
    if (typeof attemptCount !== "number" || attemptCount < 1) {
      return {
        status: "unavailable",
      };
    }

    return {
      status: "claimed",
      attemptCount,
    };
  }

  return {
    status: candidate.result_status,
    attemptCount,
  };
}

export async function releaseEmailJob(
  env: SupabaseEnv,
  jobId: string,
  errorCode: string,
): Promise<ReleaseEmailJobResult> {
  const rpc = await callRpc(env, "skillcima_release_email_job", {
    p_job_id: jobId,
    p_error_code: errorCode,
  });

  if (rpc.status !== "ok") {
    return rpc;
  }

  const allowed = [
    "queued",
    "not_found",
    "already_sent",
    "dead_letter",
    "invalid_state",
  ] as const;

  if (!isScalarStatus(rpc.body, allowed)) {
    return {
      status: "unavailable",
    };
  }

  return {
    status: rpc.body,
  };
}

export async function markEmailJobSent(
  env: SupabaseEnv,
  jobId: string,
  providerMessageId: string,
): Promise<MarkEmailJobSentResult> {
  const rpc = await callRpc(env, "skillcima_mark_email_job_sent", {
    p_job_id: jobId,
    p_provider_message_id: providerMessageId,
  });

  if (rpc.status !== "ok") {
    return rpc;
  }

  const allowed = [
    "sent",
    "not_found",
    "already_sent",
    "invalid_state",
    "provider_mismatch",
    "provider_conflict",
  ] as const;

  if (!isScalarStatus(rpc.body, allowed)) {
    return {
      status: "unavailable",
    };
  }

  return {
    status: rpc.body,
  };
}

export async function markEmailJobDeadLetter(
  env: SupabaseEnv,
  jobId: string,
  errorCode: string,
): Promise<MarkEmailJobDeadLetterResult> {
  const rpc = await callRpc(env, "skillcima_mark_email_job_dead_letter", {
    p_job_id: jobId,
    p_error_code: errorCode,
  });

  if (rpc.status !== "ok") {
    return rpc;
  }

  const allowed = [
    "dead_letter",
    "not_found",
    "already_sent",
    "already_dead_letter",
  ] as const;

  if (!isScalarStatus(rpc.body, allowed)) {
    return {
      status: "unavailable",
    };
  }

  return {
    status: rpc.body,
  };
}
