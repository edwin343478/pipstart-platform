import type { SupabaseEnv } from "./supabase";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CourseLessonDatabaseStatus =
  | "prepared"
  | "not_found"
  | "invalid_job_type"
  | "invalid_job_state"
  | "not_deliverable"
  | "not_confirmed"
  | "invalid_enrolment_state"
  | "invalid_confirmation_state";

interface CourseLessonRpcRow {
  result_status: unknown;
  result_email: unknown;
  result_first_name: unknown;
  result_course_slug: unknown;
  result_enrolment_id: unknown;
  result_confirmed_at: unknown;
}

interface SupabaseConfiguration {
  url: string;
  secretKey: string;
}

export type PrepareCourseLessonDeliveryResult =
  | {
      status: "ready";
      recipientEmail: string;
      firstName: string | null;
      courseSlug: string;
      enrolmentId: string;
      confirmedAt: string;
    }
  | {
      status:
        | "not_found"
        | "invalid_job_type"
        | "invalid_job_state"
        | "not_deliverable"
        | "not_confirmed"
        | "invalid_enrolment_state"
        | "invalid_confirmation_state";
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

function isDatabaseStatus(value: unknown): value is CourseLessonDatabaseStatus {
  return (
    value === "prepared" ||
    value === "not_found" ||
    value === "invalid_job_type" ||
    value === "invalid_job_state" ||
    value === "not_deliverable" ||
    value === "not_confirmed" ||
    value === "invalid_enrolment_state" ||
    value === "invalid_confirmation_state"
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

export async function prepareCourseLessonDelivery(
  env: SupabaseEnv,
  jobId: string,
): Promise<PrepareCourseLessonDeliveryResult> {
  if (!UUID_PATTERN.test(jobId)) {
    return {
      status: "invalid_job_id",
    };
  }

  const configuration = getSupabaseConfiguration(env);

  if (!configuration) {
    return {
      status: "misconfigured",
    };
  }

  const url = new URL(
    `${configuration.url}/rest/v1/rpc/skillcima_prepare_course_lesson_email`,
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

  if (
    !Array.isArray(body) ||
    body.length !== 1 ||
    !body[0] ||
    typeof body[0] !== "object" ||
    Array.isArray(body[0])
  ) {
    return {
      status: "unavailable",
      httpStatus: response.status,
    };
  }

  const candidate = body[0] as Partial<CourseLessonRpcRow>;

  if (!isDatabaseStatus(candidate.result_status)) {
    return {
      status: "unavailable",
      httpStatus: response.status,
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
    !isValidTimestamp(candidate.result_confirmed_at)
  ) {
    return {
      status: "unavailable",
      httpStatus: response.status,
    };
  }

  return {
    status: "ready",
    recipientEmail: candidate.result_email,
    firstName: candidate.result_first_name,
    courseSlug: candidate.result_course_slug,
    enrolmentId: candidate.result_enrolment_id,
    confirmedAt: candidate.result_confirmed_at,
  };
}
