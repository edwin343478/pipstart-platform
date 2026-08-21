import { afterEach, describe, expect, it, vi } from "vitest";

import worker from "./index";

const token = "a".repeat(64);

const env = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-secret",
} as unknown as Parameters<typeof worker.fetch>[1];

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

describe("Skillcima confirmation Worker runtime", () => {
  it("routes POST /api/v1/confirm through the real confirmation adapter", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "confirmed",
          result_enrolment_id: "11111111-1111-4111-8111-111111111111",
          result_course_slug: "forex-foundations",
          result_confirmed_at: "2026-08-21T05:00:00.000Z",
        },
      ]),
    );

    const response = await worker.fetch(
      new Request("https://skillcima.com/api/v1/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
        }),
      }),
      env,
    );

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "confirmed",
      courseSlug: "forex-foundations",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, requestInit] = fetchMock.mock.calls[0] ?? [];

    const bodyText = String((requestInit as RequestInit).body);

    expect(bodyText).not.toContain(token);

    const parsed = JSON.parse(bodyText);

    expect(parsed.p_confirmation_token_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("keeps GET /api/v1/confirm read-only and rejects it before database access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await worker.fetch(
      new Request("https://skillcima.com/api/v1/confirm", {
        method: "GET",
      }),
      env,
    );

    expect(response.status).toBe(405);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves the existing Worker 404 behavior for unknown API routes", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await worker.fetch(
      new Request("https://skillcima.com/api/v1/not-real"),
      env,
    );

    expect(response.status).toBe(404);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
