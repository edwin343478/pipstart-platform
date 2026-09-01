import { describe, expect, it, vi } from "vitest";

import {
  handleNewsletterUnsubscribeRequest,
  type NewsletterUnsubscribeRouteDependencies,
} from "./newsletter-unsubscribe-route";

import type { WithdrawNewsletterByTokenResult } from "./newsletter-unsubscribe-state";

import type { SupabaseEnv } from "./supabase";

const token = "a".repeat(64);

const leadId = "11111111-1111-4111-8111-111111111111";

const enrolmentId = "22222222-2222-4222-8222-222222222222";

const grantId = "33333333-3333-4333-8333-333333333333";

const withdrawalId = "44444444-4444-4444-8444-444444444444";

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

  return new Request("https://skillcima.com/api/v1/unsubscribe", {
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
  result: WithdrawNewsletterByTokenResult,
): NewsletterUnsubscribeRouteDependencies {
  return {
    withdrawNewsletterByToken: vi.fn().mockResolvedValue(result),
  };
}

describe("Skillcima newsletter unsubscribe HTTP handler", () => {
  it("withdraws newsletter consent through an explicit POST", async () => {
    const dependencies = createDependencies({
      status: "withdrawn",
      leadId,
      enrolmentId,
      grantConsentEventId: grantId,
      withdrawalConsentEventId: withdrawalId,
      withdrawnAt: "2026-08-26T06:00:00.000Z",
    });

    const response = await handleNewsletterUnsubscribeRequest(
      createRequest({
        token,
      }),
      env,
      dependencies,
    );

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "unsubscribed",
    });

    expect(dependencies.withdrawNewsletterByToken).toHaveBeenCalledWith(
      env,
      token,
      {
        privacyNoticeVersion: "2026-08-06",

        consentWording:
          "Unsubscribe me from continuing Skillcima educational emails.",

        consentWordingVersion: "1.0.0",

        landingPageVersion: "1.0.0",
      },
    );

    expect(response.headers.get("Cache-Control")).toBe("no-store");

    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
  });

  it("treats replayed unsubscribe as successful", async () => {
    const response = await handleNewsletterUnsubscribeRequest(
      createRequest({
        token,
      }),
      env,
      createDependencies({
        status: "already_withdrawn",
        leadId,
        enrolmentId,
        grantConsentEventId: grantId,
        withdrawalConsentEventId: withdrawalId,
        withdrawnAt: "2026-08-26T06:00:00.000Z",
      }),
    );

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "already_unsubscribed",
    });
  });

  it("maps stale subscription-cycle links to HTTP 410", async () => {
    const response = await handleNewsletterUnsubscribeRequest(
      createRequest({
        token,
      }),
      env,
      createDependencies({
        status: "stale",
        leadId,
        enrolmentId,
        grantConsentEventId: grantId,
      }),
    );

    expect(response.status).toBe(410);

    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "UNSUBSCRIBE_LINK_STALE",
      },
    });
  });

  it("does not publicly distinguish malformed and unknown tokens", async () => {
    const malformed = await handleNewsletterUnsubscribeRequest(
      createRequest({
        token: "not-a-token",
      }),
      env,
      createDependencies({
        status: "invalid_token",
      }),
    );

    const unknown = await handleNewsletterUnsubscribeRequest(
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

  it("rejects GET before database mutation", async () => {
    const dependencies = createDependencies({
      status: "not_found",
    });

    const response = await handleNewsletterUnsubscribeRequest(
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

    expect(dependencies.withdrawNewsletterByToken).not.toHaveBeenCalled();
  });

  it("requires application/json", async () => {
    const dependencies = createDependencies({
      status: "not_found",
    });

    const response = await handleNewsletterUnsubscribeRequest(
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

    expect(dependencies.withdrawNewsletterByToken).not.toHaveBeenCalled();
  });

  it("rejects extra request fields", async () => {
    const dependencies = createDependencies({
      status: "not_found",
    });

    const response = await handleNewsletterUnsubscribeRequest(
      createRequest({
        token,
        extra: "not-allowed",
      }),
      env,
      dependencies,
    );

    expect(response.status).toBe(400);

    expect(dependencies.withdrawNewsletterByToken).not.toHaveBeenCalled();
  });

  it("rejects oversized request bodies", async () => {
    const dependencies = createDependencies({
      status: "not_found",
    });

    const response = await handleNewsletterUnsubscribeRequest(
      createRequest({
        token: "a".repeat(3000),
      }),
      env,
      dependencies,
    );

    expect(response.status).toBe(413);

    expect(dependencies.withdrawNewsletterByToken).not.toHaveBeenCalled();
  });

  it("maps invalid consent state to conflict", async () => {
    const response = await handleNewsletterUnsubscribeRequest(
      createRequest({
        token,
      }),
      env,
      createDependencies({
        status: "invalid_consent_state",
        leadId,
        enrolmentId,
        grantConsentEventId: grantId,
        latestConsentEventId: withdrawalId,
      }),
    );

    expect(response.status).toBe(409);

    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "UNSUBSCRIBE_STATE_INVALID",
      },
    });
  });

  it("maps database outages to HTTP 503", async () => {
    const response = await handleNewsletterUnsubscribeRequest(
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

  it("fails safely when the withdrawal adapter throws", async () => {
    const dependencies: NewsletterUnsubscribeRouteDependencies = {
      withdrawNewsletterByToken: vi
        .fn()
        .mockRejectedValue(new Error("Unexpected")),
    };

    const response = await handleNewsletterUnsubscribeRequest(
      createRequest({
        token,
      }),
      env,
      dependencies,
    );

    expect(response.status).toBe(503);
  });
});
