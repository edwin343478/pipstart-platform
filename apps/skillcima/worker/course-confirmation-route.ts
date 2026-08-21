import { confirmCourse, type ConfirmCourseResult } from "./course-confirmation";

import type { SupabaseEnv } from "./supabase";

const MAX_CONFIRMATION_BODY_BYTES = 2048;

export interface CourseConfirmationRouteDependencies {
  confirmCourse: typeof confirmCourse;
}

const defaultDependencies: CourseConfirmationRouteDependencies = {
  confirmCourse,
};

interface ConfirmationRequestBody {
  token: string;
}

function jsonHeaders(): Headers {
  return new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders(),
  });
}

function isJsonContentType(request: Request): boolean {
  const value = request.headers.get("Content-Type")?.toLowerCase();

  if (!value) {
    return false;
  }

  return value === "application/json" || value.startsWith("application/json;");
}

function isExactConfirmationBody(
  value: unknown,
): value is ConfirmationRequestBody {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  const keys = Object.keys(record);

  return (
    keys.length === 1 && keys[0] === "token" && typeof record.token === "string"
  );
}

function mapConfirmationResult(result: ConfirmCourseResult): Response {
  switch (result.status) {
    case "confirmed":
      return jsonResponse(200, {
        ok: true,
        status: "confirmed",
        courseSlug: result.courseSlug,
      });

    case "already_confirmed":
      return jsonResponse(200, {
        ok: true,
        status: "already_confirmed",
        courseSlug: result.courseSlug,
      });

    case "expired":
      return jsonResponse(410, {
        ok: false,
        error: {
          code: "CONFIRMATION_EXPIRED",
          message: "This confirmation link has expired.",
        },
      });

    case "invalid_token":
    case "not_found":
      return jsonResponse(400, {
        ok: false,
        error: {
          code: "INVALID_CONFIRMATION_LINK",
          message: "This confirmation link is invalid.",
        },
      });

    case "not_deliverable":
      return jsonResponse(409, {
        ok: false,
        error: {
          code: "CONFIRMATION_NOT_AVAILABLE",
          message: "This course enrolment cannot be confirmed.",
        },
      });

    case "invalid_enrolment_state":
      return jsonResponse(409, {
        ok: false,
        error: {
          code: "CONFIRMATION_STATE_INVALID",
          message: "This course enrolment cannot be confirmed.",
        },
      });

    case "misconfigured":
      return jsonResponse(503, {
        ok: false,
        error: {
          code: "CONFIRMATION_NOT_CONFIGURED",
          message: "Confirmation is temporarily unavailable. Please try again.",
        },
      });

    case "unavailable":
      return jsonResponse(503, {
        ok: false,
        error: {
          code: "CONFIRMATION_UNAVAILABLE",
          message: "Confirmation is temporarily unavailable. Please try again.",
        },
      });
  }
}

export async function handleCourseConfirmationRequest(
  request: Request,
  env: SupabaseEnv,
  dependencies: CourseConfirmationRouteDependencies = defaultDependencies,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse(405, {
      ok: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "This endpoint only accepts POST requests.",
      },
    });
  }

  if (!isJsonContentType(request)) {
    return jsonResponse(415, {
      ok: false,
      error: {
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: "Content-Type must be application/json.",
      },
    });
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "The request body could not be read.",
      },
    });
  }

  if (
    new TextEncoder().encode(rawBody).byteLength > MAX_CONFIRMATION_BODY_BYTES
  ) {
    return jsonResponse(413, {
      ok: false,
      error: {
        code: "REQUEST_TOO_LARGE",
        message: "The request body is too large.",
      },
    });
  }

  if (!rawBody.trim()) {
    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "A JSON request body is required.",
      },
    });
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_JSON",
        message: "The request body contains invalid JSON.",
      },
    });
  }

  if (!isExactConfirmationBody(parsed)) {
    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_CONFIRMATION_REQUEST",
        message: "The confirmation request is invalid.",
      },
    });
  }

  let result: ConfirmCourseResult;

  try {
    result = await dependencies.confirmCourse(env, parsed.token);
  } catch {
    return jsonResponse(503, {
      ok: false,
      error: {
        code: "CONFIRMATION_UNAVAILABLE",
        message: "Confirmation is temporarily unavailable. Please try again.",
      },
    });
  }

  return mapConfirmationResult(result);
}
