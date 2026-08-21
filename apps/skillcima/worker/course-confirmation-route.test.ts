import { describe, expect, it, vi } from "vitest";

import { handleCourseConfirmationRequest } from "./course-confirmation-route";

import type { CourseConfirmationRouteDependencies } from "./course-confirmation-route";

import type { SupabaseEnv } from "./supabase";

const token = "a".repeat(64);

const env: SupabaseEnv = {
  SUPABASE_URL: "https://example.supabase.co",

  SUPABASE_SECRET_KEY: "test-secret",
};

function createRequest(
  body: unknown,
  options: {
    method?: string;
    contentType?: string;
  } = {},
): Request {
  const method = options.method ?? "POST";

  return new Request("https://skillcima.com/api/v1/confirm", {
    method,
    headers:
      method === "POST"
        ? {
            "Content-Type": options.contentType ?? "application/json",
          }
        : undefined,
    body:
      method === "POST"
        ? typeof body === "string"
          ? body
          : JSON.stringify(body)
        : undefined,
  });
}

function createDependencies(
  result: Awaited<
    ReturnType<CourseConfirmationRouteDependencies["confirmCourse"]>
  >,
): CourseConfirmationRouteDependencies {
  return {
    confirmCourse: vi.fn().mockResolvedValue(result),
  };
}

describe("Skillcima course confirmation HTTP handler", () => {
  it("confirms a valid course request", async () => {
    const dependencies = createDependencies({
      status: "confirmed",
      enrolmentId: "11111111-1111-4111-8111-111111111111",
      courseSlug: "forex-foundations",
      confirmedAt: "2026-08-21T05:00:00.000Z",
    });

    const response = await handleCourseConfirmationRequest(
      createRequest({
        token,
      }),
      env,
      dependencies,
    );

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "confirmed",
      courseSlug: "forex-foundations",
    });

    expect(dependencies.confirmCourse).toHaveBeenCalledWith(env, token);

    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("treats replayed confirmation as successful", async () => {
    const response = await handleCourseConfirmationRequest(
      createRequest({
        token,
      }),
      env,
      createDependencies({
        status: "already_confirmed",
        enrolmentId: "11111111-1111-4111-8111-111111111111",
        courseSlug: "forex-foundations",
        confirmedAt: "2026-08-21T05:00:00.000Z",
      }),
    );

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      status: "already_confirmed",
    });
  });

  it("maps expired confirmation to HTTP 410", async () => {
    const response = await handleCourseConfirmationRequest(
      createRequest({
        token,
      }),
      env,
      createDependencies({
        status: "expired",
        enrolmentId: "11111111-1111-4111-8111-111111111111",
        courseSlug: "forex-foundations",
      }),
    );

    expect(response.status).toBe(410);

    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "CONFIRMATION_EXPIRED",
      },
    });
  });

  it("does not distinguish malformed and unknown confirmation links publicly", async () => {
    const malformed = await handleCourseConfirmationRequest(
      createRequest({
        token: "not-a-token",
      }),
      env,
      createDependencies({
        status: "invalid_token",
      }),
    );

    const unknown = await handleCourseConfirmationRequest(
      createRequest({
        token,
      }),
      env,
      createDependencies({
        status: "not_found",
      }),
    );

    expect(malformed.status).toBe(400);

    expect(unknown.status).toBe(400);

    expect(await malformed.json()).toEqual(await unknown.json());
  });

  it("rejects non-POST requests", async () => {
    const dependencies = createDependencies({
      status: "not_found",
    });

    const response = await handleCourseConfirmationRequest(
      createRequest(
        {},
        {
          method: "GET",
        },
      ),
      env,
      dependencies,
    );

    expect(response.status).toBe(405);

    expect(dependencies.confirmCourse).not.toHaveBeenCalled();
  });

  it("requires application/json", async () => {
    const dependencies = createDependencies({
      status: "not_found",
    });

    const response = await handleCourseConfirmationRequest(
      createRequest(
        {
          token,
        },
        {
          contentType: "text/plain",
        },
      ),
      env,
      dependencies,
    );

    expect(response.status).toBe(415);

    expect(dependencies.confirmCourse).not.toHaveBeenCalled();
  });

  it("rejects extra request fields", async () => {
    const dependencies = createDependencies({
      status: "not_found",
    });

    const response = await handleCourseConfirmationRequest(
      createRequest({
        token,
        extra: "not-allowed",
      }),
      env,
      dependencies,
    );

    expect(response.status).toBe(400);

    expect(dependencies.confirmCourse).not.toHaveBeenCalled();
  });

  it("maps non-deliverable enrolments to conflict", async () => {
    const response = await handleCourseConfirmationRequest(
      createRequest({
        token,
      }),
      env,
      createDependencies({
        status: "not_deliverable",
        enrolmentId: "11111111-1111-4111-8111-111111111111",
        courseSlug: "forex-foundations",
      }),
    );

    expect(response.status).toBe(409);
  });

  it("maps confirmation-service outages to HTTP 503", async () => {
    const response = await handleCourseConfirmationRequest(
      createRequest({
        token,
      }),
      env,
      createDependencies({
        status: "unavailable",
        httpStatus: 503,
      }),
    );

    expect(response.status).toBe(503);
  });

  it("fails safely when the adapter throws unexpectedly", async () => {
    const dependencies: CourseConfirmationRouteDependencies = {
      confirmCourse: vi.fn().mockRejectedValue(new Error("Unexpected")),
    };

    const response = await handleCourseConfirmationRequest(
      createRequest({
        token,
      }),
      env,
      dependencies,
    );

    expect(response.status).toBe(503);
  });
});
