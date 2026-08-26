import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  recordResendWebhookEvent,
} from "./resend-webhook-state";

import type {
  SupabaseEnv,
} from "./supabase";

const env: SupabaseEnv = {
  SUPABASE_URL:
    "https://example.supabase.co",
  SUPABASE_SECRET_KEY:
    "test-secret",
};

const eventId =
  "11111111-1111-4111-8111-111111111111";

const emailJobId =
  "22222222-2222-4222-8222-222222222222";

function jsonResponse(
  body: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        "Content-Type":
          "application/json",
      },
    },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe(
  "Skillcima Resend webhook ledger state adapter",
  () => {
    it(
      "records authenticated provider evidence through the ledger RPC",
      async () => {
        const fetchMock =
          vi.spyOn(
            globalThis,
            "fetch",
          ).mockResolvedValueOnce(
            jsonResponse([
              {
                result_status:
                  "recorded",
                result_event_id:
                  eventId,
                result_email_job_id:
                  emailJobId,
              },
            ]),
          );

        await expect(
          recordResendWebhookEvent(
            env,
            {
              providerEventId:
                " msg_provider_123 ",
              eventType:
                "email.bounced",
              providerMessageId:
                " provider-message-123 ",
              providerCreatedAt:
                "2026-08-26T11:15:31.575Z",
            },
          ),
        ).resolves.toEqual({
          status: "recorded",
          eventId,
          emailJobId,
        });

        expect(
          fetchMock,
        ).toHaveBeenCalledTimes(1);

        const [
          url,
          request,
        ] =
          fetchMock.mock.calls[0] ??
          [];

        expect(
          String(url),
        ).toBe(
          "https://example.supabase.co/rest/v1/rpc/skillcima_record_resend_webhook_event",
        );

        expect(
          request,
        ).toMatchObject({
          method: "POST",
        });

        expect(
          JSON.parse(
            String(
              (
                request as RequestInit
              ).body,
            ),
          ),
        ).toEqual({
          p_provider_event_id:
            "msg_provider_123",
          p_event_type:
            "email.bounced",
          p_provider_message_id:
            "provider-message-123",
          p_provider_created_at:
            "2026-08-26T11:15:31.575Z",
        });
      },
    );

    it(
      "maps an exact replay idempotently",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch",
        ).mockResolvedValueOnce(
          jsonResponse([
            {
              result_status:
                "already_recorded",
              result_event_id:
                eventId,
              result_email_job_id:
                emailJobId,
            },
          ]),
        );

        await expect(
          recordResendWebhookEvent(
            env,
            {
              providerEventId:
                "msg_provider_123",
              eventType:
                "email.bounced",
              providerMessageId:
                "provider-message-123",
              providerCreatedAt:
                "2026-08-26T11:15:31.575Z",
            },
          ),
        ).resolves.toEqual({
          status:
            "already_recorded",
          eventId,
          emailJobId,
        });
      },
    );

    it(
      "maps an event identity mismatch without mutating anything else",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch",
        ).mockResolvedValueOnce(
          jsonResponse([
            {
              result_status:
                "event_mismatch",
              result_event_id:
                eventId,
              result_email_job_id:
                null,
            },
          ]),
        );

        await expect(
          recordResendWebhookEvent(
            env,
            {
              providerEventId:
                "msg_provider_123",
              eventType:
                "email.complained",
              providerMessageId:
                "provider-message-456",
              providerCreatedAt:
                null,
            },
          ),
        ).resolves.toEqual({
          status:
            "event_mismatch",
          eventId,
          emailJobId: null,
        });
      },
    );

    it(
      "allows authenticated evidence with no email-job correlation",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch",
        ).mockResolvedValueOnce(
          jsonResponse([
            {
              result_status:
                "recorded",
              result_event_id:
                eventId,
              result_email_job_id:
                null,
            },
          ]),
        );

        await expect(
          recordResendWebhookEvent(
            env,
            {
              providerEventId:
                "msg_uncorrelated",
              eventType:
                "email.bounced",
              providerMessageId:
                "provider-unknown",
              providerCreatedAt:
                null,
            },
          ),
        ).resolves.toEqual({
          status: "recorded",
          eventId,
          emailJobId: null,
        });
      },
    );

    it(
      "rejects malformed input before network access",
      async () => {
        const fetchMock =
          vi.spyOn(
            globalThis,
            "fetch",
          );

        await expect(
          recordResendWebhookEvent(
            env,
            {
              providerEventId:
                "",
              eventType:
                "email.bounced",
              providerMessageId:
                "provider-message-123",
              providerCreatedAt:
                null,
            },
          ),
        ).resolves.toEqual({
          status:
            "invalid_input",
        });

        await expect(
          recordResendWebhookEvent(
            env,
            {
              providerEventId:
                "msg_provider_123",
              eventType:
                "email.bounced",
              providerMessageId:
                "",
              providerCreatedAt:
                null,
            },
          ),
        ).resolves.toEqual({
          status:
            "invalid_input",
        });

        await expect(
          recordResendWebhookEvent(
            env,
            {
              providerEventId:
                "msg_provider_123",
              eventType:
                "email.bounced",
              providerMessageId:
                "provider-message-123",
              providerCreatedAt:
                "not-a-timestamp",
            },
          ),
        ).resolves.toEqual({
          status:
            "invalid_input",
        });

        expect(
          fetchMock,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "fails closed when Supabase configuration is missing",
      async () => {
        const fetchMock =
          vi.spyOn(
            globalThis,
            "fetch",
          );

        await expect(
          recordResendWebhookEvent(
            {
              SUPABASE_URL:
                "",
              SUPABASE_SECRET_KEY:
                "",
            },
            {
              providerEventId:
                "msg_provider_123",
              eventType:
                "email.bounced",
              providerMessageId:
                "provider-message-123",
              providerCreatedAt:
                null,
            },
          ),
        ).resolves.toEqual({
          status:
            "misconfigured",
        });

        expect(
          fetchMock,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "preserves Supabase HTTP failure status without exposing its body",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch",
        ).mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              message:
                "database details must remain private",
            }),
            {
              status: 503,
              headers: {
                "Content-Type":
                  "application/json",
              },
            },
          ),
        );

        await expect(
          recordResendWebhookEvent(
            env,
            {
              providerEventId:
                "msg_provider_123",
              eventType:
                "email.bounced",
              providerMessageId:
                "provider-message-123",
              providerCreatedAt:
                null,
            },
          ),
        ).resolves.toEqual({
          status:
            "unavailable",
          httpStatus: 503,
        });
      },
    );

    it(
      "handles network failure as unavailable",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch",
        ).mockRejectedValueOnce(
          new Error(
            "network unavailable",
          ),
        );

        await expect(
          recordResendWebhookEvent(
            env,
            {
              providerEventId:
                "msg_provider_123",
              eventType:
                "email.complained",
              providerMessageId:
                "provider-message-123",
              providerCreatedAt:
                null,
            },
          ),
        ).resolves.toEqual({
          status:
            "unavailable",
        });
      },
    );

    it(
      "fails closed on malformed successful RPC responses",
      async () => {
        vi.spyOn(
          globalThis,
          "fetch",
        )
          .mockResolvedValueOnce(
            jsonResponse([]),
          )
          .mockResolvedValueOnce(
            jsonResponse([
              {
                result_status:
                  "recorded",
                result_event_id:
                  "bad-id",
                result_email_job_id:
                  emailJobId,
              },
            ]),
          )
          .mockResolvedValueOnce(
            jsonResponse([
              {
                result_status:
                  "unknown_status",
                result_event_id:
                  eventId,
                result_email_job_id:
                  emailJobId,
              },
            ]),
          );

        const input = {
          providerEventId:
            "msg_provider_123",
          eventType:
            "email.bounced" as const,
          providerMessageId:
            "provider-message-123",
          providerCreatedAt:
            null,
        };

        await expect(
          recordResendWebhookEvent(
            env,
            input,
          ),
        ).resolves.toEqual({
          status:
            "unavailable",
        });

        await expect(
          recordResendWebhookEvent(
            env,
            input,
          ),
        ).resolves.toEqual({
          status:
            "unavailable",
        });

        await expect(
          recordResendWebhookEvent(
            env,
            input,
          ),
        ).resolves.toEqual({
          status:
            "unavailable",
        });
      },
    );
  },
);