import {
  describe,
  expect,
  it,
} from "vitest";

import { Webhook } from "svix";

import {
  handleResendWebhookRequest,
  type ResendWebhookEnv,
} from "./resend-webhook-route";

const WEBHOOK_SECRET =
  "whsec_dGVzdC1zZWNyZXQ=";

const env: ResendWebhookEnv = {
  RESEND_WEBHOOK_SECRET:
    WEBHOOK_SECRET,
};

const endpoint =
  "https://skillcima.com/api/v1/webhooks/resend";

function signedRequest(
  payload: string,
  options: {
    secret?: string;
    messageId?: string;
    timestamp?: Date;
  } = {},
): Request {
  const secret =
    options.secret ??
    WEBHOOK_SECRET;

  const messageId =
    options.messageId ??
    "msg_test_123";

  const timestamp =
    options.timestamp ??
    new Date();

  const webhook =
    new Webhook(secret);

  const signature =
    webhook.sign(
      messageId,
      timestamp,
      payload,
    );

  return new Request(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        "svix-id":
          messageId,
        "svix-timestamp":
          Math.floor(
            timestamp.getTime() /
              1000,
          ).toString(),
        "svix-signature":
          signature,
      },
      body: payload,
    },
  );
}

function eventPayload(
  type: string,
  emailId:
    | string
    | null =
      "provider-message-123",
): string {
  return JSON.stringify({
    type,
    created_at:
      new Date().toISOString(),
    data:
      emailId === null
        ? {}
        : {
            email_id: emailId,
          },
  });
}

describe(
  "Skillcima Resend webhook HTTP handler",
  () => {
    it(
      "authenticates a signed bounce event",
      async () => {
        const response =
          await handleResendWebhookRequest(
            signedRequest(
              eventPayload(
                "email.bounced",
              ),
            ),
            env,
          );

        expect(
          response.status,
        ).toBe(200);

        await expect(
          response.json(),
        ).resolves.toEqual({
          ok: true,
          status:
            "authenticated",
          eventType:
            "email.bounced",
        });

        expect(
          response.headers.get(
            "Cache-Control",
          ),
        ).toBe("no-store");
      },
    );

    it(
      "authenticates a signed complaint event",
      async () => {
        const response =
          await handleResendWebhookRequest(
            signedRequest(
              eventPayload(
                "email.complained",
              ),
            ),
            env,
          );

        expect(
          response.status,
        ).toBe(200);

        await expect(
          response.json(),
        ).resolves.toMatchObject({
          ok: true,
          status:
            "authenticated",
          eventType:
            "email.complained",
        });
      },
    );

    it(
      "acknowledges an authenticated unrelated Resend event without acting on it",
      async () => {
        const response =
          await handleResendWebhookRequest(
            signedRequest(
              eventPayload(
                "email.delivered",
              ),
            ),
            env,
          );

        expect(
          response.status,
        ).toBe(200);

        await expect(
          response.json(),
        ).resolves.toEqual({
          ok: true,
          status: "ignored",
        });
      },
    );

    it(
      "rejects a tampered body after signing",
      async () => {
        const original =
          eventPayload(
            "email.bounced",
            "provider-original",
          );

        const request =
          signedRequest(original);

        const headers =
          new Headers(
            request.headers,
          );

        const tampered =
          eventPayload(
            "email.bounced",
            "provider-tampered",
          );

        const response =
          await handleResendWebhookRequest(
            new Request(
              endpoint,
              {
                method:
                  "POST",
                headers,
                body: tampered,
              },
            ),
            env,
          );

        expect(
          response.status,
        ).toBe(401);

        await expect(
          response.json(),
        ).resolves.toMatchObject({
          ok: false,
          error: {
            code:
              "WEBHOOK_AUTHENTICATION_FAILED",
          },
        });
      },
    );

    it(
      "rejects an invalid signature",
      async () => {
        const payload =
          eventPayload(
            "email.bounced",
          );

        const correctlySigned =
          signedRequest(
            payload,
            {
              secret:
                "whsec_b3RoZXItdGVzdC1zZWNyZXQ=",
            },
          );

        const response =
          await handleResendWebhookRequest(
            correctlySigned,
            env,
          );

        expect(
          response.status,
        ).toBe(401);
      },
    );

    it(
      "rejects missing signature headers",
      async () => {
        const response =
          await handleResendWebhookRequest(
            new Request(
              endpoint,
              {
                method:
                  "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body:
                  eventPayload(
                    "email.bounced",
                  ),
              },
            ),
            env,
          );

        expect(
          response.status,
        ).toBe(401);
      },
    );

    it(
      "rejects a relevant signed event without email_id",
      async () => {
        const response =
          await handleResendWebhookRequest(
            signedRequest(
              eventPayload(
                "email.bounced",
                null,
              ),
            ),
            env,
          );

        expect(
          response.status,
        ).toBe(400);

        await expect(
          response.json(),
        ).resolves.toMatchObject({
          ok: false,
          error: {
            code:
              "INVALID_WEBHOOK_PAYLOAD",
          },
        });
      },
    );

    it(
      "rejects non-POST requests",
      async () => {
        const response =
          await handleResendWebhookRequest(
            new Request(
              endpoint,
              {
                method: "GET",
              },
            ),
            env,
          );

        expect(
          response.status,
        ).toBe(405);
      },
    );

    it(
      "requires application/json",
      async () => {
        const response =
          await handleResendWebhookRequest(
            new Request(
              endpoint,
              {
                method:
                  "POST",
                headers: {
                  "Content-Type":
                    "text/plain",
                },
                body: "{}",
              },
            ),
            env,
          );

        expect(
          response.status,
        ).toBe(415);
      },
    );

    it(
      "fails closed when the webhook secret is unavailable",
      async () => {
        const response =
          await handleResendWebhookRequest(
            new Request(
              endpoint,
              {
                method:
                  "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body:
                  eventPayload(
                    "email.bounced",
                  ),
              },
            ),
            {
              RESEND_WEBHOOK_SECRET:
                "",
            },
          );

        expect(
          response.status,
        ).toBe(503);
      },
    );
  },
);
