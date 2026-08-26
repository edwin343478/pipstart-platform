import { Webhook, WebhookVerificationError } from "svix";

import {
  recordResendWebhookEvent,
  type RecordResendWebhookEventResult,
  type ResendDeliverabilityEventType,
} from "./resend-webhook-state";

import type { SupabaseEnv } from "./supabase";

const MAX_RESEND_WEBHOOK_BODY_BYTES = 64 * 1024;

export interface ResendWebhookEnv extends SupabaseEnv {
  RESEND_WEBHOOK_SECRET: string;
}

export interface ResendWebhookRouteDependencies {
  recordResendWebhookEvent: typeof recordResendWebhookEvent;
}

const defaultDependencies: ResendWebhookRouteDependencies = {
  recordResendWebhookEvent,
};

interface ResendWebhookEvent {
  type: string;
  created_at?: string;
  data?: Record<string, unknown>;
}

function jsonHeaders(): Headers {
  return new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders(),
  });
}

function isJsonContentType(request: Request): boolean {
  const value = request.headers.get("Content-Type")?.toLowerCase();

  if (!value) {
    return false;
  }

  return value === "application/json" || value.startsWith("application/json;");
}

function isVerifiedEvent(value: unknown): value is ResendWebhookEvent {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return typeof record.type === "string";
}

function getProviderMessageId(event: ResendWebhookEvent): string | null {
  if (
    !event.data ||
    typeof event.data !== "object" ||
    Array.isArray(event.data)
  ) {
    return null;
  }

  const value = event.data.email_id;

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (normalized.length === 0 || normalized.length > 200) {
    return null;
  }

  return normalized;
}

function isDeliverabilityEvent(
  type: string,
): type is "email.bounced" | "email.complained" {
  return type === "email.bounced" || type === "email.complained";
}

function getProviderCreatedAt(
  event: ResendWebhookEvent,
): string | null | undefined {
  const value: unknown = event.created_at;

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  if (normalized.length === 0 || !Number.isFinite(Date.parse(normalized))) {
    return undefined;
  }

  return normalized;
}

function mapPersistenceResult(
  result: RecordResendWebhookEventResult,
  eventType: ResendDeliverabilityEventType,
): Response {
  switch (result.status) {
    case "recorded":
      return jsonResponse(200, {
        ok: true,
        status: "recorded",
        eventType,
      });

    case "already_recorded":
      return jsonResponse(200, {
        ok: true,
        status: "already_recorded",
        eventType,
      });

    case "event_mismatch":
      return jsonResponse(409, {
        ok: false,
        error: {
          code: "WEBHOOK_EVENT_CONFLICT",
          message:
            "The webhook event conflicts with previously recorded evidence.",
        },
      });

    case "invalid_input":
      return jsonResponse(400, {
        ok: false,
        error: {
          code: "INVALID_WEBHOOK_PAYLOAD",
          message: "The webhook payload is invalid.",
        },
      });

    case "misconfigured":
      return jsonResponse(503, {
        ok: false,
        error: {
          code: "WEBHOOK_NOT_CONFIGURED",
          message: "Webhook processing is temporarily unavailable.",
        },
      });

    case "unavailable":
      return jsonResponse(503, {
        ok: false,
        error: {
          code: "WEBHOOK_UNAVAILABLE",
          message: "Webhook processing is temporarily unavailable.",
        },
      });
  }
}

export async function handleResendWebhookRequest(
  request: Request,
  env: ResendWebhookEnv,
  dependencies: ResendWebhookRouteDependencies = defaultDependencies,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse(405, {
      ok: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "This endpoint only accepts POST requests.",
      },
    });
  }

  if (!isJsonContentType(request)) {
    return jsonResponse(415, {
      ok: false,
      error: {
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: "Content-Type must be application/json.",
      },
    });
  }

  const webhookSecret = env.RESEND_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    return jsonResponse(503, {
      ok: false,
      error: {
        code: "WEBHOOK_NOT_CONFIGURED",
        message: "Webhook processing is temporarily unavailable.",
      },
    });
  }

  const messageId = request.headers.get("svix-id");

  const timestamp = request.headers.get("svix-timestamp");

  const signature = request.headers.get("svix-signature");

  if (!messageId || !timestamp || !signature) {
    return jsonResponse(401, {
      ok: false,
      error: {
        code: "WEBHOOK_AUTHENTICATION_FAILED",
        message: "Webhook authentication failed.",
      },
    });
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "The request body could not be read.",
      },
    });
  }

  if (
    new TextEncoder().encode(rawBody).byteLength > MAX_RESEND_WEBHOOK_BODY_BYTES
  ) {
    return jsonResponse(413, {
      ok: false,
      error: {
        code: "REQUEST_TOO_LARGE",
        message: "The webhook request body is too large.",
      },
    });
  }

  if (!rawBody.trim()) {
    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "A webhook request body is required.",
      },
    });
  }

  let webhook: Webhook;

  try {
    webhook = new Webhook(webhookSecret);
  } catch {
    return jsonResponse(503, {
      ok: false,
      error: {
        code: "WEBHOOK_NOT_CONFIGURED",
        message: "Webhook processing is temporarily unavailable.",
      },
    });
  }

  let verified: unknown;

  try {
    verified = webhook.verify(rawBody, {
      "svix-id": messageId,
      "svix-timestamp": timestamp,
      "svix-signature": signature,
    });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return jsonResponse(401, {
        ok: false,
        error: {
          code: "WEBHOOK_AUTHENTICATION_FAILED",
          message: "Webhook authentication failed.",
        },
      });
    }

    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_WEBHOOK_PAYLOAD",
        message: "The webhook payload is invalid.",
      },
    });
  }

  if (!isVerifiedEvent(verified)) {
    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_WEBHOOK_PAYLOAD",
        message: "The webhook payload is invalid.",
      },
    });
  }

  if (!isDeliverabilityEvent(verified.type)) {
    /*
     * Valid, authenticated Resend events that
     * are outside this deliverability contract
     * are deliberately acknowledged and ignored.
     */
    return jsonResponse(200, {
      ok: true,
      status: "ignored",
    });
  }

  const providerMessageId = getProviderMessageId(verified);

  if (!providerMessageId) {
    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_WEBHOOK_PAYLOAD",
        message: "The webhook payload is invalid.",
      },
    });
  }

  const providerCreatedAt = getProviderCreatedAt(verified);

  if (providerCreatedAt === undefined) {
    return jsonResponse(400, {
      ok: false,
      error: {
        code: "INVALID_WEBHOOK_PAYLOAD",
        message: "The webhook payload is invalid.",
      },
    });
  }

  let result: RecordResendWebhookEventResult;

  try {
    result = await dependencies.recordResendWebhookEvent(env, {
      providerEventId: messageId,

      eventType: verified.type,

      providerMessageId,

      providerCreatedAt,
    });
  } catch {
    return jsonResponse(503, {
      ok: false,
      error: {
        code: "WEBHOOK_UNAVAILABLE",
        message: "Webhook processing is temporarily unavailable.",
      },
    });
  }

  return mapPersistenceResult(result, verified.type);
}
