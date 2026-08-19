import { afterEach, describe, expect, it, vi } from "vitest";

import type { LeadRequestData } from "@repo/validation";

import { createLeadRequestFingerprint } from "./fingerprint";
import { persistVerifiedLead } from "./lead-workflow";
import type { SupabaseEnv } from "./supabase";

const env: SupabaseEnv = {
  SUPABASE_URL: "http://127.0.0.1:54321",
  SUPABASE_SECRET_KEY: "test-server-secret",
};

const request: LeadRequestData = {
  submissionId: "123e4567-e89b-42d3-a456-426614174000",
  turnstileToken: "TURNSTILE-TOKEN",
  lead: {
    firstName: "Amina",
    email: "amina@example.com",
    privacyAcknowledged: true,
    newsletterConsent: true,
  },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("persistVerifiedLead", () => {
  it("reserves and atomically completes a new verified submission", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    fetchMock
      .mockResolvedValueOnce(
        new Response("[]", {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 201,
        }),
      )
      .mockResolvedValueOnce(
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

    const result = await persistVerifiedLead(env, request);

    expect(result).toEqual({
      status: "completed",
      leadId: "11111111-1111-4111-8111-111111111111",
      enrolmentId: "22222222-2222-4222-8222-222222222222",
      replayed: false,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);

    const [, rpcInit] = fetchMock.mock.calls[2] ?? [];

    const rpcBody = JSON.parse(String(rpcInit?.body)) as Record<
      string,
      unknown
    >;

    const events = rpcBody.p_consent_events as Array<Record<string, unknown>>;

    expect(events).toHaveLength(2);

    expect(events.map((event) => event.category).sort()).toEqual([
      "course_delivery",
      "educational_newsletter",
    ]);
  });

  it("returns conflict before persistence when the submission ID has different content", async () => {
    const actualFingerprint = await createLeadRequestFingerprint(request);

    const conflictingFingerprint = actualFingerprint.startsWith("a")
      ? `b${actualFingerprint.slice(1)}`
      : `a${actualFingerprint.slice(1)}`;

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            submission_id: request.submissionId,
            request_fingerprint: conflictingFingerprint,
            status: "received",
            lead_id: null,
            enrolment_id: null,
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

    const result = await persistVerifiedLead(env, request);

    expect(result).toEqual({
      status: "conflict",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("replays a completed identical submission through the atomic RPC", async () => {
    const actualFingerprint = await createLeadRequestFingerprint(request);

    const fetchMock = vi.spyOn(globalThis, "fetch");

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              submission_id: request.submissionId,
              request_fingerprint: actualFingerprint,
              status: "completed",
              lead_id: "11111111-1111-4111-8111-111111111111",
              enrolment_id: "22222222-2222-4222-8222-222222222222",
            },
          ]),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
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

    const result = await persistVerifiedLead(env, request);

    expect(result).toEqual({
      status: "completed",
      leadId: "11111111-1111-4111-8111-111111111111",
      enrolmentId: "22222222-2222-4222-8222-222222222222",
      replayed: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reports missing database configuration", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const result = await persistVerifiedLead(
      {
        SUPABASE_URL: "",
        SUPABASE_SECRET_KEY: "",
      },
      request,
    );

    expect(result).toEqual({
      status: "misconfigured",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports an unavailable submission ledger", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, {
        status: 503,
      }),
    );

    const result = await persistVerifiedLead(env, request);

    expect(result).toEqual({
      status: "unavailable",
      httpStatus: 503,
    });
  });

  it("reports an unavailable atomic persistence call", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    fetchMock
      .mockResolvedValueOnce(
        new Response("[]", {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 201,
        }),
      )
      .mockResolvedValueOnce(
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

    const result = await persistVerifiedLead(env, request);

    expect(result).toEqual({
      status: "unavailable",
      httpStatus: 503,
    });
  });
});
