import { afterEach, describe, expect, it, vi } from "vitest";

import {
  claimEmailJob,
  markEmailJobDeadLetter,
  markEmailJobSent,
  releaseEmailJob,
} from "./email-consumer-state";

const env = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-secret",
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

describe("Skillcima email consumer state adapter", () => {
  it("claims a queued email job", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "claimed",
          result_attempt_count: 2,
        },
      ]),
    );

    const result = await claimEmailJob(
      env,
      "11111111-1111-4111-8111-111111111111",
      "course_confirmation",
    );

    expect(result).toEqual({
      status: "claimed",
      attemptCount: 2,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, request] = fetchMock.mock.calls[0] ?? [];

    expect(String(url)).toContain("/rest/v1/rpc/skillcima_claim_email_job");

    expect(request).toMatchObject({
      method: "POST",
    });

    expect(JSON.parse(String((request as RequestInit).body))).toEqual({
      p_job_id: "11111111-1111-4111-8111-111111111111",
      p_job_type: "course_confirmation",
    });
  });

  it("preserves already-sent idempotency", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "already_sent",
          result_attempt_count: 2,
        },
      ]),
    );

    await expect(
      claimEmailJob(
        env,
        "22222222-2222-4222-8222-222222222222",
        "course_confirmation",
      ),
    ).resolves.toEqual({
      status: "already_sent",
      attemptCount: 2,
    });
  });

  it("returns unavailable for malformed claim data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "claimed",
          result_attempt_count: null,
        },
      ]),
    );

    await expect(
      claimEmailJob(
        env,
        "33333333-3333-4333-8333-333333333333",
        "course_confirmation",
      ),
    ).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("releases a temporary failure back to queued", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse("queued"));

    await expect(
      releaseEmailJob(
        env,
        "44444444-4444-4444-8444-444444444444",
        "PROVIDER_TEMPORARY_FAILURE",
      ),
    ).resolves.toEqual({
      status: "queued",
    });
  });

  it("marks a processing job sent", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse("sent"));

    await expect(
      markEmailJobSent(
        env,
        "55555555-5555-4555-8555-555555555555",
        "provider-message-123",
      ),
    ).resolves.toEqual({
      status: "sent",
    });
  });

  it("marks an exhausted job dead-letter", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse("dead_letter"),
    );

    await expect(
      markEmailJobDeadLetter(
        env,
        "66666666-6666-4666-8666-666666666666",
        "MAX_RETRIES_EXHAUSTED",
      ),
    ).resolves.toEqual({
      status: "dead_letter",
    });
  });

  it("returns misconfigured before calling Supabase", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      claimEmailJob(
        {
          SUPABASE_URL: "",
          SUPABASE_SECRET_KEY: "",
        },
        "77777777-7777-4777-8777-777777777777",
        "course_confirmation",
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

    await expect(
      claimEmailJob(
        env,
        "88888888-8888-4888-8888-888888888888",
        "course_confirmation",
      ),
    ).resolves.toEqual({
      status: "unavailable",
      httpStatus: 503,
    });
  });
});
