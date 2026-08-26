import { describe, expect, it, vi } from "vitest";

import { Webhook } from "svix";

import {
  handleResendWebhookRequest,
  type ResendWebhookEnv,
  type ResendWebhookRouteDependencies,
} from "./resend-webhook-route";

import type { RecordResendWebhookEventResult } from "./resend-webhook-state";

const WEBHOOK_SECRET = "whsec_dGVzdC1zZWNyZXQ=";

const PROVIDER_CREATED_AT = "2026-08-26T11:15:31.575Z";

const eventId = "11111111-1111-4111-8111-111111111111";

const emailJobId = "22222222-2222-4222-8222-222222222222";

const env: ResendWebhookEnv = {
  RESEND_WEBHOOK_SECRET: WEBHOOK_SECRET,

  SUPABASE_URL: "https://example.supabase.co",

  SUPABASE_SECRET_KEY: "test-secret",
};

const endpoint = "https://skillcima.com/api/v1/webhooks/resend";

function createDependencies(
  result: RecordResendWebhookEventResult,
): ResendWebhookRouteDependencies {
  return {
    recordResendWebhookEvent: vi.fn().mockResolvedValue(result),
  };
}

function signedRequest(
  payload: string,
  options: {
    secret?: string;
    messageId?: string;
    timestamp?: Date;
  } = {},
): Request {
  const secret = options.secret ?? WEBHOOK_SECRET;

  const messageId = options.messageId ?? "msg_test_123";

  const timestamp = options.timestamp ?? new Date();

  const webhook = new Webhook(secret);

  const signature = webhook.sign(messageId, timestamp, payload);

  return new Request(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "svix-id": messageId,
      "svix-timestamp": Math.floor(timestamp.getTime() / 1000).toString(),
      "svix-signature": signature,
    },
    body: payload,
  });
}

function eventPayload(
  type: string,
  emailId: string | null = "provider-message-123",
  createdAt: string | null = PROVIDER_CREATED_AT,
): string {
  return JSON.stringify({
    type,
    created_at: createdAt,
    data:
      emailId === null
        ? {}
        : {
            email_id: emailId,
          },
  });
}

describe("Skillcima Resend webhook HTTP handler", () => {
  it("authenticates and durably records a signed bounce event", async () => {
    const dependencies = createDependencies({
      status: "recorded",
      eventId,
      emailJobId,
    });

    const response = await handleResendWebhookRequest(
      signedRequest(eventPayload("email.bounced")),
      env,
      dependencies,
    );

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "recorded",
      eventType: "email.bounced",
    });

    expect(dependencies.recordResendWebhookEvent).toHaveBeenCalledWith(env, {
      providerEventId: "msg_test_123",

      eventType: "email.bounced",

      providerMessageId: "provider-message-123",

      providerCreatedAt: PROVIDER_CREATED_AT,
    });

    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("authenticates and durably records a signed complaint event", async () => {
    const response = await handleResendWebhookRequest(
      signedRequest(eventPayload("email.complained")),
      env,
      createDependencies({
        status: "recorded",
        eventId,
        emailJobId: null,
      }),
    );

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "recorded",
      eventType: "email.complained",
    });
  });

  it("acknowledges an exact webhook replay as successful", async () => {
    const response = await handleResendWebhookRequest(
      signedRequest(eventPayload("email.bounced")),
      env,
      createDependencies({
        status: "already_recorded",
        eventId,
        emailJobId,
      }),
    );

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "already_recorded",
      eventType: "email.bounced",
    });
  });

  it("fails closed on conflicting event identity", async () => {
    const response = await handleResendWebhookRequest(
      signedRequest(eventPayload("email.bounced")),
      env,
      createDependencies({
        status: "event_mismatch",
        eventId,
        emailJobId,
      }),
    );

    expect(response.status).toBe(409);

    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "WEBHOOK_EVENT_CONFLICT",
      },
    });
  });

  it("maps missing persistence configuration to HTTP 503", async () => {
    const response = await handleResendWebhookRequest(
      signedRequest(eventPayload("email.bounced")),
      env,
      createDependencies({
        status: "misconfigured",
      }),
    );

    expect(response.status).toBe(503);

    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "WEBHOOK_NOT_CONFIGURED",
      },
    });
  });

  it("maps persistence outages to retryable HTTP 503", async () => {
    const response = await handleResendWebhookRequest(
      signedRequest(eventPayload("email.bounced")),
      env,
      createDependencies({
        status: "unavailable",
        httpStatus: 503,
      }),
    );

    expect(response.status).toBe(503);

    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "WEBHOOK_UNAVAILABLE",
      },
    });
  });

  it("fails safely when the persistence adapter throws", async () => {
    const dependencies: ResendWebhookRouteDependencies = {
      recordResendWebhookEvent: vi
        .fn()
        .mockRejectedValue(new Error("Unexpected")),
    };

    const response = await handleResendWebhookRequest(
      signedRequest(eventPayload("email.complained")),
      env,
      dependencies,
    );

    expect(response.status).toBe(503);
  });

  it("rejects an invalid provider timestamp before persistence", async () => {
    const dependencies = createDependencies({
      status: "recorded",
      eventId,
      emailJobId,
    });

    const response = await handleResendWebhookRequest(
      signedRequest(
        eventPayload(
          "email.bounced",
          "provider-message-123",
          "not-a-timestamp",
        ),
      ),
      env,
      dependencies,
    );

    expect(response.status).toBe(400);

    expect(dependencies.recordResendWebhookEvent).not.toHaveBeenCalled();
  });
  it("acknowledges an authenticated unrelated Resend event without acting on it", async () => {
    const response = await handleResendWebhookRequest(
      signedRequest(eventPayload("email.delivered")),
      env,
    );

    expect(response.status).toBe(200);

    await expect(response.json()).resolves.toEqual({
      ok: true,
      status: "ignored",
    });
  });

  it("rejects a tampered body after signing", async () => {
    const original = eventPayload("email.bounced", "provider-original");

    const request = signedRequest(original);

    const headers = new Headers(request.headers);

    const tampered = eventPayload("email.bounced", "provider-tampered");

    const response = await handleResendWebhookRequest(
      new Request(endpoint, {
        method: "POST",
        headers,
        body: tampered,
      }),
      env,
    );

    expect(response.status).toBe(401);

    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "WEBHOOK_AUTHENTICATION_FAILED",
      },
    });
  });

  it("rejects an invalid signature", async () => {
    const payload = eventPayload("email.bounced");

    const correctlySigned = signedRequest(payload, {
      secret: "whsec_b3RoZXItdGVzdC1zZWNyZXQ=",
    });

    const response = await handleResendWebhookRequest(correctlySigned, env);

    expect(response.status).toBe(401);
  });

  it("rejects missing signature headers", async () => {
    const response = await handleResendWebhookRequest(
      new Request(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: eventPayload("email.bounced"),
      }),
      env,
    );

    expect(response.status).toBe(401);
  });

  it("rejects a relevant signed event without email_id", async () => {
    const response = await handleResendWebhookRequest(
      signedRequest(eventPayload("email.bounced", null)),
      env,
    );

    expect(response.status).toBe(400);

    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        code: "INVALID_WEBHOOK_PAYLOAD",
      },
    });
  });

  it("rejects non-POST requests", async () => {
    const response = await handleResendWebhookRequest(
      new Request(endpoint, {
        method: "GET",
      }),
      env,
    );

    expect(response.status).toBe(405);
  });

  it("requires application/json", async () => {
    const response = await handleResendWebhookRequest(
      new Request(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: "{}",
      }),
      env,
    );

    expect(response.status).toBe(415);
  });

  it("fails closed when the webhook secret is unavailable", async () => {
    const response = await handleResendWebhookRequest(
      new Request(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: eventPayload("email.bounced"),
      }),
      {
        ...env,
        RESEND_WEBHOOK_SECRET: "",
      },
    );

    expect(response.status).toBe(503);
  });
});
