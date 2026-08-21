import {
  deriveConfirmationToken,
  type ConfirmationTokenEnv,
} from "./confirmation-token";
import type { SupabaseEnv } from "./supabase";

const CONFIRMATION_LIFETIME_MS = 24 * 60 * 60 * 1000;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface SupabaseConfiguration {
  url: string;
  secretKey: string;
}

type ConfirmationDatabaseStatus =
  | "prepared"
  | "not_found"
  | "invalid_job_type"
  | "invalid_job_state"
  | "already_confirmed"
  | "not_deliverable"
  | "invalid_enrolment_state"
  | "expired"
  | "token_mismatch";

interface ConfirmationRpcRow {
  result_status: ConfirmationDatabaseStatus;
  result_email: string | null;
  result_first_name: string | null;
  result_course_slug: string | null;
  result_enrolment_id: string | null;
  result_confirmation_expires_at: string | null;
}

export type ConfirmationDeliveryEnv = SupabaseEnv & ConfirmationTokenEnv;

export type PrepareConfirmationDeliveryResult =
  | {
      status: "ready";
      recipientEmail: string;
      firstName: string | null;
      courseSlug: string;
      enrolmentId: string;
      confirmationToken: string;
      confirmationTokenHash: string;
      confirmationExpiresAt: string;
    }
  | {
      status:
        | "not_found"
        | "invalid_job_type"
        | "invalid_job_state"
        | "already_confirmed"
        | "not_deliverable"
        | "invalid_enrolment_state"
        | "expired"
        | "token_mismatch";
    }
  | {
      status: "invalid_job_id";
    }
  | {
      status: "misconfigured";
    }
  | {
      status: "unavailable";
      httpStatus?: number;
    };

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

function isDatabaseStatus(value: unknown): value is ConfirmationDatabaseStatus {
  return (
    value === "prepared" ||
    value === "not_found" ||
    value === "invalid_job_type" ||
    value === "invalid_job_state" ||
    value === "already_confirmed" ||
    value === "not_deliverable" ||
    value === "invalid_enrolment_state" ||
    value === "expired" ||
    value === "token_mismatch"
  );
}

function isValidEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 3 &&
    value.length <= 254 &&
    value.includes("@")
  );
}

function isValidOptionalFirstName(value: unknown): value is string | null {
  return (
    value === null ||
    (typeof value === "string" && value.length >= 1 && value.length <= 100)
  );
}

function isValidCourseSlug(value: unknown): value is string {
  return typeof value === "string" && value.length >= 1 && value.length <= 100;
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export async function prepareConfirmationDelivery(
  env: ConfirmationDeliveryEnv,
  jobId: string,
  now = new Date(),
): Promise<PrepareConfirmationDeliveryResult> {
  const tokenResult = await deriveConfirmationToken(env, jobId);

  if (tokenResult.status === "invalid_job_id") {
    return {
      status: "invalid_job_id",
    };
  }

  if (tokenResult.status === "misconfigured") {
    return {
      status: "misconfigured",
    };
  }

  const configuration = getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const requestedExpiry = new Date(
    now.getTime() + CONFIRMATION_LIFETIME_MS,
  ).toISOString();

  const url = new URL(
    `${configuration.url}/rest/v1/rpc/skillcima_prepare_confirmation_email`,
  );

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        apikey: configuration.secretKey,
      },
      body: JSON.stringify({
        p_job_id: jobId,
        p_confirmation_token_hash: tokenResult.tokenHash,
        p_confirmation_expires_at: requestedExpiry,
      }),
    });
  } catch {
    return {
      status: "unavailable",
    };
  }

  if (!response.ok) {
    const httpStatus = response.status;

    await response.body?.cancel();

    return {
      status: "unavailable",
      httpStatus,
    };
  }

  let body: unknown;

  try {
    body = (await response.json()) as unknown;
  } catch {
    return {
      status: "unavailable",
      httpStatus: response.status,
    };
  }

  if (!Array.isArray(body) || body.length !== 1) {
    return {
      status: "unavailable",
    };
  }

  const row = body[0];

  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return {
      status: "unavailable",
    };
  }

  const candidate = row as Partial<ConfirmationRpcRow>;

  if (!isDatabaseStatus(candidate.result_status)) {
    return {
      status: "unavailable",
    };
  }

  if (candidate.result_status !== "prepared") {
    return {
      status: candidate.result_status,
    };
  }

  if (
    !isValidEmail(candidate.result_email) ||
    !isValidOptionalFirstName(candidate.result_first_name) ||
    !isValidCourseSlug(candidate.result_course_slug) ||
    typeof candidate.result_enrolment_id !== "string" ||
    !UUID_PATTERN.test(candidate.result_enrolment_id) ||
    !isValidTimestamp(candidate.result_confirmation_expires_at)
  ) {
    return {
      status: "unavailable",
    };
  }

  return {
    status: "ready",
    recipientEmail: candidate.result_email,
    firstName: candidate.result_first_name,
    courseSlug: candidate.result_course_slug,
    enrolmentId: candidate.result_enrolment_id,
    confirmationToken: tokenResult.token,
    confirmationTokenHash: tokenResult.tokenHash,
    confirmationExpiresAt: candidate.result_confirmation_expires_at,
  };
}
