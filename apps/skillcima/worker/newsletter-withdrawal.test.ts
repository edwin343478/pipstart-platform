import { afterEach, describe, expect, it, vi } from "vitest";

import {
  withdrawNewsletterConsent,
  type WithdrawNewsletterConsentInput,
} from "./newsletter-withdrawal";

import type { SupabaseEnv } from "./supabase";

const leadId = "11111111-1111-4111-8111-111111111111";
const enrolmentId = "22222222-2222-4222-8222-222222222222";
const consentEventId = "33333333-3333-4333-8333-333333333333";
const withdrawnAt = "2026-08-25T12:00:00.000Z";

const env: SupabaseEnv = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-secret",
};

const input: WithdrawNewsletterConsentInput = {
  leadId,
  withdrawalMethod: "unsubscribe_link",
  privacyNoticeVersion: "privacy-v1",
  consentWording: "Withdraw optional Skillcima educational newsletter consent.",
  consentWordingVersion: "unsubscribe-v1",
  landingPageVersion: "unsubscribe-page-v1",
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

describe("Skillcima newsletter withdrawal adapter", () => {
  it("calls the withdrawal RPC with the expected server-side contract", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "withdrawn",
          result_lead_id: leadId,
          result_enrolment_id: enrolmentId,
          result_consent_event_id: consentEventId,
          result_withdrawn_at: withdrawnAt,
        },
      ]),
    );

    await expect(withdrawNewsletterConsent(env, input)).resolves.toEqual({
      status: "withdrawn",
      leadId,
      enrolmentId,
      consentEventId,
      withdrawnAt,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, request] = fetchMock.mock.calls[0] ?? [];

    expect(String(url)).toBe(
      "https://example.supabase.co/rest/v1/rpc/skillcima_withdraw_newsletter_consent",
    );

    const requestInit = request as RequestInit;
    const headers = new Headers(requestInit.headers);

    expect(requestInit.method).toBe("POST");
    expect(headers.get("apikey")).toBe("test-secret");
    expect(headers.get("Content-Type")).toBe("application/json");

    expect(JSON.parse(String(requestInit.body))).toEqual({
      p_lead_id: leadId,
      p_withdrawal_method: "unsubscribe_link",
      p_privacy_notice_version: "privacy-v1",
      p_consent_wording:
        "Withdraw optional Skillcima educational newsletter consent.",
      p_consent_wording_version: "unsubscribe-v1",
      p_landing_page_version: "unsubscribe-page-v1",
    });
  });

  it("maps an already-withdrawn replay idempotently", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "already_withdrawn",
          result_lead_id: leadId,
          result_enrolment_id: enrolmentId,
          result_consent_event_id: consentEventId,
          result_withdrawn_at: withdrawnAt,
        },
      ]),
    );

    await expect(withdrawNewsletterConsent(env, input)).resolves.toEqual({
      status: "already_withdrawn",
      leadId,
      enrolmentId,
      consentEventId,
      withdrawnAt,
    });
  });

  it("maps a lead with no active newsletter grant to not_subscribed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "not_subscribed",
          result_lead_id: leadId,
          result_enrolment_id: null,
          result_consent_event_id: null,
          result_withdrawn_at: null,
        },
      ]),
    );

    await expect(withdrawNewsletterConsent(env, input)).resolves.toEqual({
      status: "not_subscribed",
      leadId,
    });
  });

  it("maps an unknown lead to not_found", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "not_found",
          result_lead_id: null,
          result_enrolment_id: null,
          result_consent_event_id: null,
          result_withdrawn_at: null,
        },
      ]),
    );

    await expect(withdrawNewsletterConsent(env, input)).resolves.toEqual({
      status: "not_found",
    });
  });

  it("maps an invalid database consent state defensively", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "invalid_consent_state",
          result_lead_id: leadId,
          result_enrolment_id: enrolmentId,
          result_consent_event_id: consentEventId,
          result_withdrawn_at: null,
        },
      ]),
    );

    await expect(withdrawNewsletterConsent(env, input)).resolves.toEqual({
      status: "invalid_consent_state",
      leadId,
      enrolmentId,
      consentEventId,
    });
  });

  it("rejects missing Supabase configuration before network access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      withdrawNewsletterConsent(
        {
          ...env,
          SUPABASE_SECRET_KEY: "",
        },
        input,
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

    await expect(withdrawNewsletterConsent(env, input)).resolves.toEqual({
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

    await expect(withdrawNewsletterConsent(env, input)).resolves.toEqual({
      status: "unavailable",
      httpStatus: 503,
    });
  });

  it("fails closed on malformed successful RPC responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([]));

    await expect(withdrawNewsletterConsent(env, input)).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("fails closed when successful withdrawal identifiers are malformed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "withdrawn",
          result_lead_id: "not-a-uuid",
          result_enrolment_id: enrolmentId,
          result_consent_event_id: consentEventId,
          result_withdrawn_at: withdrawnAt,
        },
      ]),
    );

    await expect(withdrawNewsletterConsent(env, input)).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("fails closed when a withdrawal timestamp is malformed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "already_withdrawn",
          result_lead_id: leadId,
          result_enrolment_id: enrolmentId,
          result_consent_event_id: consentEventId,
          result_withdrawn_at: "not-a-timestamp",
        },
      ]),
    );

    await expect(withdrawNewsletterConsent(env, input)).resolves.toEqual({
      status: "unavailable",
    });
  });
});
