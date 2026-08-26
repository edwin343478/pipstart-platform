import { afterEach, describe, expect, it, vi } from "vitest";

import {
  prepareNewsletterUnsubscribeToken,
  withdrawNewsletterByToken,
  type NewsletterWithdrawalEvidence,
} from "./newsletter-unsubscribe-state";

import type { SupabaseEnv } from "./supabase";

const leadId = "11111111-1111-4111-8111-111111111111";
const enrolmentId = "22222222-2222-4222-8222-222222222222";
const grantId = "33333333-3333-4333-8333-333333333333";
const withdrawalId = "44444444-4444-4444-8444-444444444444";

const rawToken = "a".repeat(64);
const tokenHash = "b".repeat(64);

const env: SupabaseEnv = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-secret",
};

const evidence: NewsletterWithdrawalEvidence = {
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

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Skillcima newsletter unsubscribe database adapter", () => {
  it("prepares a token hash for the exact newsletter grant", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "prepared",
          result_lead_id: leadId,
          result_enrolment_id: enrolmentId,
          result_consent_event_id: grantId,
          result_prepared_at: "2026-08-26T05:00:00.000Z",
        },
      ]),
    );

    await expect(
      prepareNewsletterUnsubscribeToken(env, {
        consentEventId: grantId,
        tokenHash,
      }),
    ).resolves.toEqual({
      status: "prepared",
      leadId,
      enrolmentId,
      consentEventId: grantId,
      preparedAt: "2026-08-26T05:00:00.000Z",
    });

    const [url, request] = fetchMock.mock.calls[0] ?? [];

    expect(String(url)).toBe(
      "https://example.supabase.co/rest/v1/rpc/skillcima_prepare_newsletter_unsubscribe_token",
    );

    expect(JSON.parse(String((request as RequestInit).body))).toEqual({
      p_consent_event_id: grantId,
      p_token_hash: tokenHash,
    });
  });

  it("maps preparation replay idempotently", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "already_prepared",
          result_lead_id: leadId,
          result_enrolment_id: enrolmentId,
          result_consent_event_id: grantId,
          result_prepared_at: "2026-08-26T05:00:00.000Z",
        },
      ]),
    );

    await expect(
      prepareNewsletterUnsubscribeToken(env, {
        consentEventId: grantId,
        tokenHash,
      }),
    ).resolves.toEqual({
      status: "already_prepared",
      leadId,
      enrolmentId,
      consentEventId: grantId,
      preparedAt: "2026-08-26T05:00:00.000Z",
    });
  });

  it("maps preparation token mismatch and token conflict", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "token_mismatch",
            result_lead_id: leadId,
            result_enrolment_id: enrolmentId,
            result_consent_event_id: grantId,
            result_prepared_at: "2026-08-26T05:00:00.000Z",
          },
        ]),
      )
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
      prepareNewsletterUnsubscribeToken(env, {
        consentEventId: grantId,
        tokenHash,
      }),
    ).resolves.toEqual({
      status: "token_mismatch",
      leadId,
      enrolmentId,
      consentEventId: grantId,
      preparedAt: "2026-08-26T05:00:00.000Z",
    });

    await expect(
      prepareNewsletterUnsubscribeToken(env, {
        consentEventId: grantId,
        tokenHash,
      }),
    ).resolves.toEqual({
      status: "token_conflict",
      leadId,
      enrolmentId,
      consentEventId: grantId,
    });
  });

  it("maps invalid grants and unknown grant ids", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "invalid_grant",
            result_lead_id: leadId,
            result_enrolment_id: enrolmentId,
            result_consent_event_id: grantId,
            result_prepared_at: null,
          },
        ]),
      )
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "not_found",
            result_lead_id: null,
            result_enrolment_id: null,
            result_consent_event_id: null,
            result_prepared_at: null,
          },
        ]),
      );

    await expect(
      prepareNewsletterUnsubscribeToken(env, {
        consentEventId: grantId,
        tokenHash,
      }),
    ).resolves.toEqual({
      status: "invalid_grant",
      leadId,
      enrolmentId,
      consentEventId: grantId,
    });

    await expect(
      prepareNewsletterUnsubscribeToken(env, {
        consentEventId: grantId,
        tokenHash,
      }),
    ).resolves.toEqual({
      status: "not_found",
    });
  });

  it("rejects malformed preparation inputs before network access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      prepareNewsletterUnsubscribeToken(env, {
        consentEventId: "not-a-uuid",
        tokenHash,
      }),
    ).resolves.toEqual({
      status: "invalid_consent_event_id",
    });

    await expect(
      prepareNewsletterUnsubscribeToken(env, {
        consentEventId: grantId,
        tokenHash: "bad-hash",
      }),
    ).resolves.toEqual({
      status: "invalid_token_hash",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("hashes the raw unsubscribe token before sending it to Supabase", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "withdrawn",
          result_lead_id: leadId,
          result_enrolment_id: enrolmentId,
          result_grant_consent_event_id: grantId,
          result_withdrawal_consent_event_id: withdrawalId,
          result_withdrawn_at: "2026-08-26T05:10:00.000Z",
        },
      ]),
    );

    await expect(
      withdrawNewsletterByToken(env, rawToken, evidence),
    ).resolves.toEqual({
      status: "withdrawn",
      leadId,
      enrolmentId,
      grantConsentEventId: grantId,
      withdrawalConsentEventId: withdrawalId,
      withdrawnAt: "2026-08-26T05:10:00.000Z",
    });

    const [url, request] = fetchMock.mock.calls[0] ?? [];

    expect(String(url)).toBe(
      "https://example.supabase.co/rest/v1/rpc/skillcima_withdraw_newsletter_by_token",
    );

    const bodyText = String((request as RequestInit).body);

    expect(bodyText).not.toContain(rawToken);

    expect(JSON.parse(bodyText)).toEqual({
      p_token_hash: await sha256Hex(rawToken),
      p_privacy_notice_version: "privacy-v1",
      p_consent_wording:
        "Withdraw optional Skillcima educational newsletter consent.",
      p_consent_wording_version: "unsubscribe-v1",
      p_landing_page_version: "unsubscribe-page-v1",
    });
  });

  it("maps an already-withdrawn token replay idempotently", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "already_withdrawn",
          result_lead_id: leadId,
          result_enrolment_id: enrolmentId,
          result_grant_consent_event_id: grantId,
          result_withdrawal_consent_event_id: withdrawalId,
          result_withdrawn_at: "2026-08-26T05:10:00.000Z",
        },
      ]),
    );

    await expect(
      withdrawNewsletterByToken(env, rawToken, evidence),
    ).resolves.toEqual({
      status: "already_withdrawn",
      leadId,
      enrolmentId,
      grantConsentEventId: grantId,
      withdrawalConsentEventId: withdrawalId,
      withdrawnAt: "2026-08-26T05:10:00.000Z",
    });
  });

  it("maps stale tokens without withdrawing the newer grant", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "stale",
          result_lead_id: leadId,
          result_enrolment_id: enrolmentId,
          result_grant_consent_event_id: grantId,
          result_withdrawal_consent_event_id: null,
          result_withdrawn_at: null,
        },
      ]),
    );

    await expect(
      withdrawNewsletterByToken(env, rawToken, evidence),
    ).resolves.toEqual({
      status: "stale",
      leadId,
      enrolmentId,
      grantConsentEventId: grantId,
    });
  });

  it("maps unknown and invalid token states", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "not_found",
            result_lead_id: null,
            result_enrolment_id: null,
            result_grant_consent_event_id: null,
            result_withdrawal_consent_event_id: null,
            result_withdrawn_at: null,
          },
        ]),
      )
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "invalid_token_state",
            result_lead_id: leadId,
            result_enrolment_id: enrolmentId,
            result_grant_consent_event_id: grantId,
            result_withdrawal_consent_event_id: null,
            result_withdrawn_at: null,
          },
        ]),
      );

    await expect(
      withdrawNewsletterByToken(env, rawToken, evidence),
    ).resolves.toEqual({
      status: "not_found",
    });

    await expect(
      withdrawNewsletterByToken(env, rawToken, evidence),
    ).resolves.toEqual({
      status: "invalid_token_state",
      leadId,
      enrolmentId,
      grantConsentEventId: grantId,
    });
  });

  it("maps invalid consent state defensively", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          result_status: "invalid_consent_state",
          result_lead_id: leadId,
          result_enrolment_id: enrolmentId,
          result_grant_consent_event_id: grantId,
          result_withdrawal_consent_event_id: withdrawalId,
          result_withdrawn_at: null,
        },
      ]),
    );

    await expect(
      withdrawNewsletterByToken(env, rawToken, evidence),
    ).resolves.toEqual({
      status: "invalid_consent_state",
      leadId,
      enrolmentId,
      grantConsentEventId: grantId,
      latestConsentEventId: withdrawalId,
    });
  });

  it("rejects malformed raw unsubscribe tokens before database access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      withdrawNewsletterByToken(env, "not-a-token", evidence),
    ).resolves.toEqual({
      status: "invalid_token",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects missing Supabase configuration before network access", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(
      withdrawNewsletterByToken(
        {
          ...env,
          SUPABASE_SECRET_KEY: "",
        },
        rawToken,
        evidence,
      ),
    ).resolves.toEqual({
      status: "misconfigured",
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves failed Supabase HTTP status and handles network failure", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse(
          {
            message: "Unavailable",
          },
          503,
        ),
      )
      .mockRejectedValueOnce(
        new Error("Network unavailable"),
      );

    await expect(
      withdrawNewsletterByToken(env, rawToken, evidence),
    ).resolves.toEqual({
      status: "unavailable",
      httpStatus: 503,
    });

    await expect(
      withdrawNewsletterByToken(env, rawToken, evidence),
    ).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("fails closed on malformed successful RPC responses", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "withdrawn",
            result_lead_id: "bad-id",
            result_enrolment_id: enrolmentId,
            result_grant_consent_event_id: grantId,
            result_withdrawal_consent_event_id: withdrawalId,
            result_withdrawn_at: "2026-08-26T05:10:00.000Z",
          },
        ]),
      );

    await expect(
      prepareNewsletterUnsubscribeToken(env, {
        consentEventId: grantId,
        tokenHash,
      }),
    ).resolves.toEqual({
      status: "unavailable",
    });

    await expect(
      withdrawNewsletterByToken(env, rawToken, evidence),
    ).resolves.toEqual({
      status: "unavailable",
    });
  });
});
