import { afterEach, describe, expect, it, vi } from "vitest";

import {
  prepareConfirmationDelivery,
  type ConfirmationDeliveryEnv,
} from "./confirmation-delivery";

const jobId = "11111111-1111-4111-8111-111111111111";

const enrolmentId = "22222222-2222-4222-8222-222222222222";

const env: ConfirmationDeliveryEnv = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-supabase-secret",
  SKILLCIMA_CONFIRMATION_TOKEN_SECRET:
    "test-confirmation-secret-aaaaaaaaaaaaaaaa",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function preparedResponse(expiresAt = "2026-08-21T12:00:00.000Z") {
  return [
    {
      result_status: "prepared",
      result_email: "learner@example.com",
      result_first_name: "Amina",
      result_course_slug: "forex-foundations",
      result_enrolment_id: enrolmentId,
      result_confirmation_expires_at: expiresAt,
    },
  ];
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Skillcima confirmation delivery adapter", () => {
  it("prepares recipient data using only the token hash in the database request", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(preparedResponse()));

    const result = await prepareConfirmationDelivery(
      env,
      jobId,
      new Date("2026-08-20T12:00:00.000Z"),
    );

    expect(result.status).toBe("ready");

    if (result.status !== "ready") {
      throw new Error("Expected ready confirmation delivery");
    }

    expect(result).toMatchObject({
      recipientEmail: "learner@example.com",
      firstName: "Amina",
      courseSlug: "forex-foundations",
      enrolmentId,
      confirmationExpiresAt: "2026-08-21T12:00:00.000Z",
    });

    expect(result.confirmationToken).toMatch(/^[0-9a-f]{64}$/);

    expect(result.confirmationTokenHash).toMatch(/^[0-9a-f]{64}$/);

    const [, request] = fetchMock.mock.calls[0] ?? [];

    const requestBody = JSON.parse(
      String((request as RequestInit).body),
    ) as Record<string, unknown>;

    expect(requestBody).toEqual({
      p_job_id: jobId,
      p_confirmation_token_hash: result.confirmationTokenHash,
      p_confirmation_expires_at: "2026-08-21T12:00:00.000Z",
    });

    expect(JSON.stringify(requestBody)).not.toContain(result.confirmationToken);
  });

  it("derives the same raw token and hash across Queue retry preparations", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse(preparedResponse("2026-08-21T12:00:00.000Z")),
      )
      .mockResolvedValueOnce(
        jsonResponse(preparedResponse("2026-08-21T12:00:00.000Z")),
      );

    const first = await prepareConfirmationDelivery(
      env,
      jobId,
      new Date("2026-08-20T12:00:00.000Z"),
    );

    const second = await prepareConfirmationDelivery(
      env,
      jobId,
      new Date("2026-08-20T13:00:00.000Z"),
    );

    expect(first.status).toBe("ready");

    expect(second.status).toBe("ready");

    if (first.status !== "ready" || second.status !== "ready") {
      throw new Error("Expected ready confirmation deliveries");
    }

    expect(first.confirmationToken).toBe(second.confirmationToken);

    expect(first.confirmationTokenHash).toBe(second.confirmationTokenHash);

    expect(second.confirmationExpiresAt).toBe(first.confirmationExpiresAt);

    const requestBodies = fetchMock.mock.calls.map(
      ([, request]) =>
        JSON.parse(String((request as RequestInit).body)) as Record<
          string,
          unknown
        >,
    );

    expect(requestBodies[0].p_confirmation_token_hash).toBe(
      requestBodies[1].p_confirmation_token_hash,
    );

    expect(requestBodies[0].p_confirmation_expires_at).not.toBe(
      requestBodies[1].p_confirmation_expires_at,
    );
  });

  it("surfaces token mismatch without returning delivery data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "token_mismatch",
          result_email: null,
          result_first_name: null,
          result_course_slug: "forex-foundations",
          result_enrolment_id: enrolmentId,
          result_confirmation_expires_at: "2026-08-21T12:00:00.000Z",
        },
      ]),
    );

    await expect(prepareConfirmationDelivery(env, jobId)).resolves.toEqual({
      status: "token_mismatch",
    });
  });

  it("preserves terminal database states", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "already_confirmed",
          result_email: null,
          result_first_name: null,
          result_course_slug: "forex-foundations",
          result_enrolment_id: enrolmentId,
          result_confirmation_expires_at: null,
        },
      ]),
    );

    await expect(prepareConfirmationDelivery(env, jobId)).resolves.toEqual({
      status: "already_confirmed",
    });
  });

  it("rejects malformed prepared database data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "prepared",
          result_email: null,
          result_first_name: "Amina",
          result_course_slug: "forex-foundations",
          result_enrolment_id: enrolmentId,
          result_confirmation_expires_at: "not-a-date",
        },
      ]),
    );

    await expect(prepareConfirmationDelivery(env, jobId)).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("rejects invalid job IDs before calling Supabase", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      prepareConfirmationDelivery(env, "not-a-job-id"),
    ).resolves.toEqual({
      status: "invalid_job_id",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects missing confirmation secrets before calling Supabase", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      prepareConfirmationDelivery(
        {
          ...env,
          SKILLCIMA_CONFIRMATION_TOKEN_SECRET: "",
        },
        jobId,
      ),
    ).resolves.toEqual({
      status: "misconfigured",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports Supabase HTTP failures without exposing response bodies", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, {
        status: 503,
      }),
    );

    await expect(prepareConfirmationDelivery(env, jobId)).resolves.toEqual({
      status: "unavailable",
      httpStatus: 503,
    });
  });
});
