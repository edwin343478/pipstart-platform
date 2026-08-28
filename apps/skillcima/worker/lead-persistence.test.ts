import { afterEach, describe, expect, it, vi } from "vitest";

import type { PendingConsentEvent } from "./consent";
import type { SupabaseEnv } from "./supabase";

import {
  completeLeadSubmission,
  SKILLCIMA_COURSE_SLUG,
} from "./lead-persistence";

const env: SupabaseEnv = {
  SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_SECRET_KEY: "test-server-secret",
};

const consentEvents: PendingConsentEvent[] = [
  {
    category: "course_delivery",
    action: "requested",
    privacyNoticeVersion: "2026-08-06",
    consentWording:
      "Submitting the Skillcima enrolment form requests delivery of the free six-email Forex Foundations course by email.",
    consentWordingVersion: "1.0.0",
    landingPageVersion: "1.0.0",
  },
];

const input = {
  submissionId: "123e4567-e89b-42d3-a456-426614174000",
  requestFingerprint: "a".repeat(64),
  firstName: "Amina",
  email: "amina@example.com",
  consentEvents,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("completeLeadSubmission", () => {
  it("calls the atomic persistence RPC", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            result_lead_id: "11111111-1111-4111-8111-111111111111",
            result_enrolment_id: "22222222-2222-4222-8222-222222222222",
            result_status: "completed",
            result_replayed: false,
          },
        ]),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const result = await completeLeadSubmission(env, input);

    expect(result).toEqual({
      status: "completed",
      leadId: "11111111-1111-4111-8111-111111111111",
      enrolmentId: "22222222-2222-4222-8222-222222222222",
      replayed: false,
    });

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] ?? [];

    expect(String(requestUrl)).toBe(
      "http://127.0.0.1:54321/rest/v1/rpc/skillcima_complete_lead_submission",
    );

    expect(requestInit?.method).toBe("POST");

    const body = JSON.parse(String(requestInit?.body)) as Record<
      string,
      unknown
    >;

    expect(body).toEqual({
      p_submission_id: input.submissionId,
      p_request_fingerprint: input.requestFingerprint,
      p_first_name: "Amina",
      p_email: "amina@example.com",
      p_course_slug: SKILLCIMA_COURSE_SLUG,
      p_consent_events: [
        {
          category: "course_delivery",
          action: "requested",
          privacy_notice_version: "2026-08-06",
          consent_wording:
            "Submitting the Skillcima enrolment form requests delivery of the free six-email Forex Foundations course by email.",
          consent_wording_version: "1.0.0",
          landing_page_version: "1.0.0",
        },
      ],
    });
  });

  it("sends null when first name is absent", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            result_lead_id: "11111111-1111-4111-8111-111111111111",
            result_enrolment_id: "22222222-2222-4222-8222-222222222222",
            result_status: "completed",
            result_replayed: false,
          },
        ]),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    await completeLeadSubmission(env, {
      ...input,
      firstName: undefined,
    });

    const [, requestInit] = fetchMock.mock.calls[0] ?? [];

    const body = JSON.parse(String(requestInit?.body)) as Record<
      string,
      unknown
    >;

    expect(body.p_first_name).toBeNull();
  });

  it("returns a completed replay result", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            result_lead_id: "11111111-1111-4111-8111-111111111111",
            result_enrolment_id: "22222222-2222-4222-8222-222222222222",
            result_status: "completed",
            result_replayed: true,
          },
        ]),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const result = await completeLeadSubmission(env, input);

    expect(result).toMatchObject({
      status: "completed",
      replayed: true,
    });
  });

  it("maps an RPC submission conflict", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          code: "P0001",
          message: "SUBMISSION_CONFLICT",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const result = await completeLeadSubmission(env, input);

    expect(result).toEqual({
      status: "conflict",
    });
  });

  it("reports missing Supabase configuration", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const result = await completeLeadSubmission(
      {
        SUPABASE_URL: "",
        SUPABASE_SECRET_KEY: "",
      },
      input,
    );

    expect(result).toEqual({
      status: "misconfigured",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports an unavailable RPC response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          message: "temporary database failure",
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const result = await completeLeadSubmission(env, input);

    expect(result).toEqual({
      status: "unavailable",
      httpStatus: 503,
    });
  });

  it("rejects malformed successful RPC results", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const result = await completeLeadSubmission(env, input);

    expect(result).toEqual({
      status: "unavailable",
      httpStatus: 200,
    });
  });

  it("reports a network failure without leaking internals", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("database network details"),
    );

    const result = await completeLeadSubmission(env, input);

    expect(result).toEqual({
      status: "unavailable",
    });
  });
});
