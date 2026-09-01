import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getActiveNewsletterGrant,
  prepareNewsletterUnsubscribeDelivery,
  type NewsletterUnsubscribeDeliveryEnv,
} from "./newsletter-unsubscribe-delivery";

import { deriveNewsletterUnsubscribeToken } from "./newsletter-unsubscribe-token";

const leadId = "11111111-1111-4111-8111-111111111111";

const enrolmentId = "22222222-2222-4222-8222-222222222222";

const grantId = "33333333-3333-4333-8333-333333333333";

const env: NewsletterUnsubscribeDeliveryEnv = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-supabase-secret",

  SKILLCIMA_UNSUBSCRIBE_TOKEN_SECRET:
    "test-unsubscribe-secret-aaaaaaaaaaaaaaaa",

  SKILLCIMA_PUBLIC_ORIGIN: "https://skillcima.com",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function activeGrantResponse(): Response {
  return jsonResponse([
    {
      result_status: "active",
      result_lead_id: leadId,
      result_enrolment_id: enrolmentId,
      result_grant_consent_event_id: grantId,
      result_email: "learner@example.com",
      result_first_name: "Amina",
      result_granted_at: "2026-08-26T05:00:00.000Z",
    },
  ]);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Skillcima newsletter unsubscribe delivery preparation", () => {
  it("resolves the exact active newsletter grant", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(activeGrantResponse());

    await expect(getActiveNewsletterGrant(env, leadId)).resolves.toEqual({
      status: "active",
      leadId,
      enrolmentId,
      grantConsentEventId: grantId,
      recipientEmail: "learner@example.com",
      firstName: "Amina",
      grantedAt: "2026-08-26T05:00:00.000Z",
    });

    const [url, request] = fetchMock.mock.calls[0] ?? [];

    expect(String(url)).toBe(
      "https://example.supabase.co/rest/v1/rpc/skillcima_get_active_newsletter_grant",
    );

    expect(JSON.parse(String((request as RequestInit).body))).toEqual({
      p_lead_id: leadId,
    });
  });

  it("prepares only the token hash and returns an opaque unsubscribe URL", async () => {
    const expectedToken = await deriveNewsletterUnsubscribeToken(env, grantId);

    expect(expectedToken.status).toBe("ready");

    if (expectedToken.status !== "ready") {
      throw new Error("Expected ready unsubscribe token");
    }

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(activeGrantResponse())
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "prepared",
            result_lead_id: leadId,
            result_enrolment_id: enrolmentId,
            result_consent_event_id: grantId,
            result_prepared_at: "2026-08-26T05:10:00.000Z",
          },
        ]),
      );

    const result = await prepareNewsletterUnsubscribeDelivery(env, leadId);

    expect(result).toEqual({
      status: "ready",
      leadId,
      enrolmentId,
      grantConsentEventId: grantId,
      recipientEmail: "learner@example.com",
      firstName: "Amina",
      grantedAt: "2026-08-26T05:00:00.000Z",
      unsubscribeUrl: `https://skillcima.com/unsubscribe?token=${expectedToken.token}`,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [, prepareRequest] = fetchMock.mock.calls[1] ?? [];

    const prepareBody = String((prepareRequest as RequestInit).body);

    expect(prepareBody).not.toContain(expectedToken.token);

    expect(JSON.parse(prepareBody)).toEqual({
      p_consent_event_id: grantId,
      p_token_hash: expectedToken.tokenHash,
    });

    if (result.status !== "ready") {
      throw new Error("Expected ready unsubscribe delivery");
    }

    expect(result.unsubscribeUrl).not.toContain(leadId);

    expect(result.unsubscribeUrl).not.toContain(enrolmentId);

    expect(result.unsubscribeUrl).not.toContain(grantId);

    expect(result.unsubscribeUrl).not.toContain("learner@example.com");
  });

  it("accepts an already-prepared deterministic token binding", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(activeGrantResponse())
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "already_prepared",
            result_lead_id: leadId,
            result_enrolment_id: enrolmentId,
            result_consent_event_id: grantId,
            result_prepared_at: "2026-08-26T05:10:00.000Z",
          },
        ]),
      );

    const result = await prepareNewsletterUnsubscribeDelivery(env, leadId);

    expect(result.status).toBe("ready");
  });

  it("does not prepare a token for a withdrawn newsletter state", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "not_subscribed",
          result_lead_id: leadId,
          result_enrolment_id: enrolmentId,
          result_grant_consent_event_id: null,
          result_email: null,
          result_first_name: null,
          result_granted_at: null,
        },
      ]),
    );

    await expect(
      prepareNewsletterUnsubscribeDelivery(env, leadId),
    ).resolves.toEqual({
      status: "not_subscribed",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("maps unknown leads without preparing tokens", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "not_found",
          result_lead_id: null,
          result_enrolment_id: null,
          result_grant_consent_event_id: null,
          result_email: null,
          result_first_name: null,
          result_granted_at: null,
        },
      ]),
    );

    await expect(
      prepareNewsletterUnsubscribeDelivery(env, leadId),
    ).resolves.toEqual({
      status: "not_found",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("maps invalid newsletter consent states", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "invalid_consent_state",
          result_lead_id: leadId,
          result_enrolment_id: enrolmentId,
          result_grant_consent_event_id: grantId,
          result_email: null,
          result_first_name: null,
          result_granted_at: null,
        },
      ]),
    );

    await expect(
      prepareNewsletterUnsubscribeDelivery(env, leadId),
    ).resolves.toEqual({
      status: "invalid_consent_state",
    });
  });

  it("rejects malformed lead IDs before network access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      prepareNewsletterUnsubscribeDelivery(env, "not-a-lead-id"),
    ).resolves.toEqual({
      status: "invalid_lead_id",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects unsafe public origins before database access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      prepareNewsletterUnsubscribeDelivery(
        {
          ...env,
          SKILLCIMA_PUBLIC_ORIGIN: "http://skillcima.com",
        },
        leadId,
      ),
    ).resolves.toEqual({
      status: "invalid_public_origin",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed on malformed active-grant responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "active",
          result_lead_id: "bad-lead-id",
          result_enrolment_id: enrolmentId,
          result_grant_consent_event_id: grantId,
          result_email: "learner@example.com",
          result_first_name: "Amina",
          result_granted_at: "2026-08-26T05:00:00.000Z",
        },
      ]),
    );

    await expect(
      prepareNewsletterUnsubscribeDelivery(env, leadId),
    ).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("preserves active-grant database HTTP failures", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(
        {
          message: "Unavailable",
        },
        503,
      ),
    );

    await expect(
      prepareNewsletterUnsubscribeDelivery(env, leadId),
    ).resolves.toEqual({
      status: "unavailable",
      httpStatus: 503,
    });
  });

  it("fails safely when the unsubscribe token secret is missing", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(activeGrantResponse());

    await expect(
      prepareNewsletterUnsubscribeDelivery(
        {
          ...env,
          SKILLCIMA_UNSUBSCRIBE_TOKEN_SECRET: "",
        },
        leadId,
      ),
    ).resolves.toEqual({
      status: "misconfigured",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("maps deterministic token mismatch as a closed failure", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(activeGrantResponse())
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "token_mismatch",
            result_lead_id: leadId,
            result_enrolment_id: enrolmentId,
            result_consent_event_id: grantId,
            result_prepared_at: "2026-08-26T05:10:00.000Z",
          },
        ]),
      );

    await expect(
      prepareNewsletterUnsubscribeDelivery(env, leadId),
    ).resolves.toEqual({
      status: "token_mismatch",
    });
  });

  it("maps token-hash conflicts as a closed failure", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(activeGrantResponse())
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "token_conflict",
            result_lead_id: leadId,
            result_enrolment_id: enrolmentId,
            result_consent_event_id: grantId,
            result_prepared_at: null,
          },
        ]),
      );

    await expect(
      prepareNewsletterUnsubscribeDelivery(env, leadId),
    ).resolves.toEqual({
      status: "token_conflict",
    });
  });

  it("fails closed if token preparation returns different grant provenance", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(activeGrantResponse())
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "prepared",
            result_lead_id: leadId,
            result_enrolment_id: enrolmentId,
            result_consent_event_id: "44444444-4444-4444-8444-444444444444",
            result_prepared_at: "2026-08-26T05:10:00.000Z",
          },
        ]),
      );

    await expect(
      prepareNewsletterUnsubscribeDelivery(env, leadId),
    ).resolves.toEqual({
      status: "unavailable",
    });
  });
});
