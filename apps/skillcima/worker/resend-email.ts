const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails";

const MAX_IDEMPOTENCY_KEY_LENGTH = 256;

export interface ResendEmailEnv {
  RESEND_API_KEY: string;
  SKILLCIMA_EMAIL_FROM: string;
}

export interface ResendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}

export type ResendEmailResult =
  | {
      status: "accepted";
      providerMessageId: string;
    }
  | {
      status: "misconfigured";
    }
  | {
      status: "invalid_input";
    }
  | {
      status: "temporary_failure";
      errorCode: string;
      httpStatus?: number;
    }
  | {
      status: "permanent_failure";
      errorCode: string;
      httpStatus?: number;
    };

interface ResendSuccessBody {
  id: string;
}

interface ResendErrorBody {
  name?: string;
}

function isValidEmailAddress(value: string): boolean {
  const normalized = value.trim();

  return (
    normalized.length >= 3 &&
    normalized.length <= 254 &&
    normalized.includes("@")
  );
}

function isValidFromAddress(value: string): boolean {
  const normalized = value.trim();

  return (
    normalized.length >= 3 &&
    normalized.length <= 320 &&
    normalized.includes("@")
  );
}

function validateInput(input: ResendEmailInput): boolean {
  return (
    isValidEmailAddress(input.to) &&
    input.subject.trim().length >= 1 &&
    input.subject.length <= 500 &&
    input.html.length >= 1 &&
    input.text.length >= 1 &&
    input.idempotencyKey.length >= 1 &&
    input.idempotencyKey.length <= MAX_IDEMPOTENCY_KEY_LENGTH
  );
}

async function readErrorName(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return null;
    }

    const candidate = body as ResendErrorBody;

    return typeof candidate.name === "string" ? candidate.name : null;
  } catch {
    return null;
  }
}

function classifyHttpFailure(
  httpStatus: number,
  errorName: string | null,
): ResendEmailResult {
  if (httpStatus === 409 && errorName === "concurrent_idempotent_requests") {
    return {
      status: "temporary_failure",
      errorCode: "RESEND_IDEMPOTENCY_IN_PROGRESS",
      httpStatus,
    };
  }

  if (httpStatus === 409 && errorName === "invalid_idempotent_request") {
    return {
      status: "permanent_failure",
      errorCode: "RESEND_IDEMPOTENCY_CONFLICT",
      httpStatus,
    };
  }

  if (httpStatus === 429) {
    return {
      status: "temporary_failure",
      errorCode: "RESEND_RATE_LIMITED",
      httpStatus,
    };
  }

  if (httpStatus === 408 || httpStatus === 425 || httpStatus >= 500) {
    return {
      status: "temporary_failure",
      errorCode:
        httpStatus >= 500 ? "RESEND_SERVER_ERROR" : "RESEND_REQUEST_TIMEOUT",
      httpStatus,
    };
  }

  if (httpStatus === 401 || httpStatus === 403) {
    return {
      status: "permanent_failure",
      errorCode: "RESEND_AUTH_REJECTED",
      httpStatus,
    };
  }

  if (httpStatus === 400 || httpStatus === 422) {
    return {
      status: "permanent_failure",
      errorCode: "RESEND_REQUEST_REJECTED",
      httpStatus,
    };
  }

  if (httpStatus >= 400 && httpStatus < 500) {
    /*
     * Unknown conflicts are kept retryable rather
     * than risking silent message loss. Known
     * permanent idempotency conflicts are handled
     * above.
     */
    if (httpStatus === 409) {
      return {
        status: "temporary_failure",
        errorCode: "RESEND_UNKNOWN_CONFLICT",
        httpStatus,
      };
    }

    return {
      status: "permanent_failure",
      errorCode: "RESEND_CLIENT_ERROR",
      httpStatus,
    };
  }

  return {
    status: "temporary_failure",
    errorCode: "RESEND_HTTP_ERROR",
    httpStatus,
  };
}

export async function sendEmailWithResend(
  env: ResendEmailEnv,
  input: ResendEmailInput,
): Promise<ResendEmailResult> {
  const apiKey = env.RESEND_API_KEY?.trim();

  const from = env.SKILLCIMA_EMAIL_FROM?.trim();

  if (!apiKey || !from || !isValidFromAddress(from)) {
    return {
      status: "misconfigured",
    };
  }

  if (!validateInput(input)) {
    return {
      status: "invalid_input",
    };
  }

  let response: Response;

  try {
    response = await fetch(RESEND_EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
  } catch {
    return {
      status: "temporary_failure",
      errorCode: "RESEND_NETWORK_ERROR",
    };
  }

  if (!response.ok) {
    const errorName = await readErrorName(response);

    return classifyHttpFailure(response.status, errorName);
  }

  let body: unknown;

  try {
    body = (await response.json()) as unknown;
  } catch {
    /*
     * The provider may already have accepted
     * the email. Treat malformed success data
     * as retryable so the same idempotency key
     * is used again.
     */
    return {
      status: "temporary_failure",
      errorCode: "RESEND_INVALID_SUCCESS_RESPONSE",
      httpStatus: response.status,
    };
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      status: "temporary_failure",
      errorCode: "RESEND_INVALID_SUCCESS_RESPONSE",
      httpStatus: response.status,
    };
  }

  const candidate = body as Partial<ResendSuccessBody>;

  if (
    typeof candidate.id !== "string" ||
    candidate.id.trim().length < 1 ||
    candidate.id.length > 200
  ) {
    return {
      status: "temporary_failure",
      errorCode: "RESEND_INVALID_SUCCESS_RESPONSE",
      httpStatus: response.status,
    };
  }

  return {
    status: "accepted",
    providerMessageId: candidate.id,
  };
}
