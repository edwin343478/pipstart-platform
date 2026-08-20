import { afterEach, describe, expect, it, vi } from "vitest";

import {
  sendEmailWithResend,
  type ResendEmailEnv,
  type ResendEmailInput,
} from "./resend-email";

const env: ResendEmailEnv = {
  RESEND_API_KEY: "re_test_fake_key",
  SKILLCIMA_EMAIL_FROM: "Skillcima <course@skillcima.com>",
};

const input: ResendEmailInput = {
  to: "learner@example.com",
  subject: "Confirm your free Skillcima course",
  html: "<p>Confirm your course</p>",
  text: "Confirm your course",
  idempotencyKey:
    "skillcima/course_confirmation/11111111-1111-4111-8111-111111111111",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Skillcima Resend email transport", () => {
  it("sends the expected email payload with Bearer auth and idempotency", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({
        id: "provider-message-123",
      }),
    );

    const result = await sendEmailWithResend(env, input);

    expect(result).toEqual({
      status: "accepted",
      providerMessageId: "provider-message-123",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, request] = fetchMock.mock.calls[0] ?? [];

    expect(String(url)).toBe("https://api.resend.com/emails");

    const requestInit = request as RequestInit;

    const headers = new Headers(requestInit.headers);

    expect(headers.get("Authorization")).toBe("Bearer re_test_fake_key");

    expect(headers.get("Idempotency-Key")).toBe(input.idempotencyKey);

    const body = JSON.parse(String(requestInit.body));

    expect(body).toEqual({
      from: "Skillcima <course@skillcima.com>",
      to: ["learner@example.com"],
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    expect(JSON.stringify(body)).not.toContain("re_test_fake_key");
  });

  it("rejects missing provider configuration before network access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      sendEmailWithResend(
        {
          ...env,
          RESEND_API_KEY: "",
        },
        input,
      ),
    ).resolves.toEqual({
      status: "misconfigured",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects invalid email input before network access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      sendEmailWithResend(env, {
        ...input,
        idempotencyKey: "",
      }),
    ).resolves.toEqual({
      status: "invalid_input",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats network exceptions as temporary failures", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network unavailable"),
    );

    await expect(sendEmailWithResend(env, input)).resolves.toEqual({
      status: "temporary_failure",
      errorCode: "RESEND_NETWORK_ERROR",
    });
  });

  it("treats rate limiting as retryable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(
        {
          name: "rate_limit_exceeded",
        },
        429,
      ),
    );

    await expect(sendEmailWithResend(env, input)).resolves.toEqual({
      status: "temporary_failure",
      errorCode: "RESEND_RATE_LIMITED",
      httpStatus: 429,
    });
  });

  it("treats concurrent idempotency requests as retryable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(
        {
          name: "concurrent_idempotent_requests",
        },
        409,
      ),
    );

    await expect(sendEmailWithResend(env, input)).resolves.toEqual({
      status: "temporary_failure",
      errorCode: "RESEND_IDEMPOTENCY_IN_PROGRESS",
      httpStatus: 409,
    });
  });

  it("treats changed payload reuse of an idempotency key as permanent", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(
        {
          name: "invalid_idempotent_request",
        },
        409,
      ),
    );

    await expect(sendEmailWithResend(env, input)).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "RESEND_IDEMPOTENCY_CONFLICT",
      httpStatus: 409,
    });
  });

  it("treats provider validation rejection as permanent", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(
        {
          name: "validation_error",
        },
        422,
      ),
    );

    await expect(sendEmailWithResend(env, input)).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "RESEND_REQUEST_REJECTED",
      httpStatus: 422,
    });
  });

  it("treats provider server failures as retryable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(
        {
          name: "internal_server_error",
        },
        503,
      ),
    );

    await expect(sendEmailWithResend(env, input)).resolves.toEqual({
      status: "temporary_failure",
      errorCode: "RESEND_SERVER_ERROR",
      httpStatus: 503,
    });
  });

  it("retries safely when a success response cannot be validated", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse({}));

    await expect(sendEmailWithResend(env, input)).resolves.toEqual({
      status: "temporary_failure",
      errorCode: "RESEND_INVALID_SUCCESS_RESPONSE",
      httpStatus: 200,
    });
  });
});
