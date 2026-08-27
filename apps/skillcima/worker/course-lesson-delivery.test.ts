import { afterEach, describe, expect, it, vi } from "vitest";

import { prepareCourseLessonDelivery } from "./course-lesson-delivery";
import type { SupabaseEnv } from "./supabase";

const env: SupabaseEnv = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-service-role-secret",
};

const jobId = "11111111-1111-4111-8111-111111111111";

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

describe("Skillcima course lesson delivery preparation", () => {
  it("returns ready only for a valid prepared RPC response", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "prepared",
          result_email: "learner@example.com",
          result_first_name: "Amina",
          result_course_slug: "forex-foundations",
          result_enrolment_id: "22222222-2222-4222-8222-222222222222",
          result_confirmed_at: "2026-08-27T10:00:00.000Z",
        },
      ]),
    );

    await expect(prepareCourseLessonDelivery(env, jobId)).resolves.toEqual({
      status: "ready",
      recipientEmail: "learner@example.com",
      firstName: "Amina",
      courseSlug: "forex-foundations",
      enrolmentId: "22222222-2222-4222-8222-222222222222",
      confirmedAt: "2026-08-27T10:00:00.000Z",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, request] = fetchMock.mock.calls[0] ?? [];

    expect(String(url)).toBe(
      "https://example.supabase.co/rest/v1/rpc/skillcima_prepare_course_lesson_email",
    );

    const requestInit = request as RequestInit;

    expect(new Headers(requestInit.headers).get("apikey")).toBe(
      "test-service-role-secret",
    );

    expect(JSON.parse(String(requestInit.body))).toEqual({
      p_job_id: jobId,
    });

    expect(JSON.stringify(requestInit.body)).not.toContain(
      "learner@example.com",
    );
  });

  it.each([
    "not_found",
    "invalid_job_type",
    "invalid_job_state",
    "not_deliverable",
    "not_confirmed",
    "invalid_enrolment_state",
    "invalid_confirmation_state",
  ] as const)(
    "preserves database fail-closed status %s without recipient data",
    async (status) => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: status,
            result_email: null,
            result_first_name: null,
            result_course_slug: "forex-foundations",
            result_enrolment_id: "22222222-2222-4222-8222-222222222222",
            result_confirmed_at: null,
          },
        ]),
      );

      await expect(prepareCourseLessonDelivery(env, jobId)).resolves.toEqual({
        status,
      });
    },
  );

  it("rejects an invalid job id before network access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      prepareCourseLessonDelivery(env, "not-a-uuid"),
    ).resolves.toEqual({
      status: "invalid_job_id",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects missing Supabase configuration before network access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      prepareCourseLessonDelivery(
        {
          SUPABASE_URL: "",
          SUPABASE_SECRET_KEY: "",
        },
        jobId,
      ),
    ).resolves.toEqual({
      status: "misconfigured",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats network failure as unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("network"));

    await expect(prepareCourseLessonDelivery(env, jobId)).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("rejects malformed prepared recipient data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "prepared",
          result_email: "not-an-email",
          result_first_name: "Amina",
          result_course_slug: "forex-foundations",
          result_enrolment_id: "22222222-2222-4222-8222-222222222222",
          result_confirmed_at: "2026-08-27T10:00:00.000Z",
        },
      ]),
    );

    await expect(prepareCourseLessonDelivery(env, jobId)).resolves.toEqual({
      status: "unavailable",
      httpStatus: 200,
    });
  });

  it("rejects malformed RPC envelopes", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([]));

    await expect(prepareCourseLessonDelivery(env, jobId)).resolves.toEqual({
      status: "unavailable",
      httpStatus: 200,
    });
  });
});
