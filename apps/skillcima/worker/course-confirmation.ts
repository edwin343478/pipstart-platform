import type { SupabaseEnv } from "./supabase";

const TOKEN_PATTERN = /^[0-9a-f]{64}$/;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ConfirmationDatabaseStatus =
  | "confirmed"
  | "already_confirmed"
  | "expired"
  | "not_found"
  | "not_deliverable"
  | "invalid_enrolment_state";

interface ConfirmationRpcRow {
  result_status: ConfirmationDatabaseStatus;

  result_enrolment_id: string | null;

  result_course_slug: string | null;

  result_confirmed_at: string | null;
}

interface SupabaseConfiguration {
  url: string;
  secretKey: string;
}

export type ConfirmCourseResult =
  | {
      status: "confirmed" | "already_confirmed";

      enrolmentId: string;
      courseSlug: string;
      confirmedAt: string;
    }
  | {
      status: "expired" | "not_deliverable" | "invalid_enrolment_state";

      enrolmentId: string;
      courseSlug: string;
    }
  | {
      status: "not_found";
    }
  | {
      status: "invalid_token";
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

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashConfirmationToken(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token);

  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return bytesToHex(digest);
}

function isDatabaseStatus(value: unknown): value is ConfirmationDatabaseStatus {
  return (
    value === "confirmed" ||
    value === "already_confirmed" ||
    value === "expired" ||
    value === "not_found" ||
    value === "not_deliverable" ||
    value === "invalid_enrolment_state"
  );
}

function isValidCourseSlug(value: unknown): value is string {
  return typeof value === "string" && value.length >= 1 && value.length <= 100;
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export async function confirmCourse(
  env: SupabaseEnv,
  rawToken: string,
): Promise<ConfirmCourseResult> {
  if (typeof rawToken !== "string" || !TOKEN_PATTERN.test(rawToken)) {
    return {
      status: "invalid_token",
    };
  }

  const configuration = getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const tokenHash = await hashConfirmationToken(rawToken);

  const url = new URL(
    `${configuration.url}/rest/v1/rpc/skillcima_confirm_course`,
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
        p_confirmation_token_hash: tokenHash,
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

  if (candidate.result_status === "not_found") {
    return {
      status: "not_found",
    };
  }

  if (
    typeof candidate.result_enrolment_id !== "string" ||
    !UUID_PATTERN.test(candidate.result_enrolment_id) ||
    !isValidCourseSlug(candidate.result_course_slug)
  ) {
    return {
      status: "unavailable",
    };
  }

  if (
    candidate.result_status === "confirmed" ||
    candidate.result_status === "already_confirmed"
  ) {
    if (!isValidTimestamp(candidate.result_confirmed_at)) {
      return {
        status: "unavailable",
      };
    }

    return {
      status: candidate.result_status,

      enrolmentId: candidate.result_enrolment_id,

      courseSlug: candidate.result_course_slug,

      confirmedAt: candidate.result_confirmed_at,
    };
  }

  return {
    status: candidate.result_status,

    enrolmentId: candidate.result_enrolment_id,

    courseSlug: candidate.result_course_slug,
  };
}
