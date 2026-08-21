import { afterEach, describe, expect, it, vi } from "vitest";

import { confirmCourse } from "./course-confirmation";

import type { SupabaseEnv } from "./supabase";

const token = "a".repeat(64);

const enrolmentId = "11111111-1111-4111-8111-111111111111";

const env: SupabaseEnv = {
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

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);

  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Skillcima course confirmation adapter", () => {
  it("hashes the raw token server-side and sends only the hash to Supabase", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "confirmed",

          result_enrolment_id: enrolmentId,

          result_course_slug: "forex-foundations",

          result_confirmed_at: "2026-08-20T19:00:00.000Z",
        },
      ]),
    );

    const result = await confirmCourse(env, token);

    expect(result).toEqual({
      status: "confirmed",
      enrolmentId,
      courseSlug: "forex-foundations",
      confirmedAt: "2026-08-20T19:00:00.000Z",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, request] = fetchMock.mock.calls[0] ?? [];

    expect(String(url)).toBe(
      "https://example.supabase.co/rest/v1/rpc/skillcima_confirm_course",
    );

    const requestInit = request as RequestInit;

    const headers = new Headers(requestInit.headers);

    expect(headers.get("apikey")).toBe("test-secret");

    const bodyText = String(requestInit.body);

    expect(bodyText).not.toContain(token);

    const parsed = JSON.parse(bodyText);

    const expectedHash = await sha256Hex(token);

    expect(parsed).toEqual({
      p_confirmation_token_hash: expectedHash,
    });

    expect(parsed.p_confirmation_token_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("maps an already-confirmed replay idempotently", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "already_confirmed",

          result_enrolment_id: enrolmentId,

          result_course_slug: "forex-foundations",

          result_confirmed_at: "2026-08-20T19:00:00.000Z",
        },
      ]),
    );

    await expect(confirmCourse(env, token)).resolves.toEqual({
      status: "already_confirmed",
      enrolmentId,
      courseSlug: "forex-foundations",
      confirmedAt: "2026-08-20T19:00:00.000Z",
    });
  });

  it("maps expired confirmations without mutating them client-side", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "expired",

          result_enrolment_id: enrolmentId,

          result_course_slug: "forex-foundations",

          result_confirmed_at: null,
        },
      ]),
    );

    await expect(confirmCourse(env, token)).resolves.toEqual({
      status: "expired",
      enrolmentId,
      courseSlug: "forex-foundations",
    });
  });

  it("maps an unknown confirmation token to not_found", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "not_found",

          result_enrolment_id: null,

          result_course_slug: null,

          result_confirmed_at: null,
        },
      ]),
    );

    await expect(confirmCourse(env, token)).resolves.toEqual({
      status: "not_found",
    });
  });

  it("maps non-deliverable enrolments", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "not_deliverable",

          result_enrolment_id: enrolmentId,

          result_course_slug: "forex-foundations",

          result_confirmed_at: null,
        },
      ]),
    );

    await expect(confirmCourse(env, token)).resolves.toEqual({
      status: "not_deliverable",
      enrolmentId,
      courseSlug: "forex-foundations",
    });
  });

  it("maps invalid enrolment state defensively", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "invalid_enrolment_state",

          result_enrolment_id: enrolmentId,

          result_course_slug: "forex-foundations",

          result_confirmed_at: null,
        },
      ]),
    );

    await expect(confirmCourse(env, token)).resolves.toEqual({
      status: "invalid_enrolment_state",
      enrolmentId,
      courseSlug: "forex-foundations",
    });
  });

  it("rejects malformed raw tokens before database access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(confirmCourse(env, "not-a-token")).resolves.toEqual({
      status: "invalid_token",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects missing Supabase configuration before network access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      confirmCourse(
        {
          ...env,
          SUPABASE_SECRET_KEY: "",
        },
        token,
      ),
    ).resolves.toEqual({
      status: "misconfigured",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats network failure as unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network unavailable"),
    );

    await expect(confirmCourse(env, token)).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("preserves the HTTP status of failed Supabase requests", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(
        {
          message: "Unavailable",
        },
        503,
      ),
    );

    await expect(confirmCourse(env, token)).resolves.toEqual({
      status: "unavailable",
      httpStatus: 503,
    });
  });

  it("fails closed on malformed successful RPC responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([]));

    await expect(confirmCourse(env, token)).resolves.toEqual({
      status: "unavailable",
    });
  });
});
