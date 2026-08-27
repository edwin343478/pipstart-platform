import { handleCourseConfirmationRequest } from "./course-confirmation-route";
import { handleNewsletterUnsubscribeRequest } from "./newsletter-unsubscribe-route";
import { handleResendWebhookRequest } from "./resend-webhook-route";
import { leadRequestSchema } from "@repo/validation";

import { createConfirmationEmailDelivery } from "./confirmation-email-delivery";
import { createCourseLessonEmailDelivery } from "./course-lesson-email-delivery";
import { createEmailDeliveryRouter } from "./email-delivery-router";
import { dispatchEmailOutbox } from "./email-outbox-dispatcher";
import {
  processEmailQueueBatch,
  type EmailQueueRuntimeNamedBatch,
} from "./email-queue-batch";
import { processEmailDeadLetterBatch } from "./email-queue-dead-letter";
import type { EmailQueueBinding } from "./email-queue";
import { EMAIL_QUEUE_RETRY_DELAY_SECONDS } from "./email-queue-processor";
import { persistVerifiedLead } from "./lead-workflow";
import { checkSupabaseConnection } from "./supabase";
import { verifyTurnstile } from "./turnstile";

const MAX_JSON_BODY_BYTES = 16 * 1024;

const SKILLCIMA_EMAIL_QUEUE_NAME = "skillcima-email";

const SKILLCIMA_EMAIL_DLQ_NAME = "skillcima-email-dlq";

const PRODUCTION_ORIGINS = new Set([
  "https://skillcima.com",
  "https://www.skillcima.com",
]);

interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  TURNSTILE_SECRET_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;

  SKILLCIMA_CONFIRMATION_TOKEN_SECRET: string;
  SKILLCIMA_UNSUBSCRIBE_TOKEN_SECRET: string;
  RESEND_API_KEY: string;
  RESEND_WEBHOOK_SECRET: string;
  SKILLCIMA_EMAIL_FROM: string;
  SKILLCIMA_PUBLIC_ORIGIN: string;

  LEAD_RATE_LIMITER: RateLimitBinding;
  SKILLCIMA_EMAIL_QUEUE: EmailQueueBinding;
}

interface ApiError {
  code: string;
  message: string;
}

interface ApiSuccess<T> {
  ok: true;
  data: T;
  requestId: string;
}

interface ApiFailure {
  ok: false;
  error: ApiError;
  requestId: string;
}

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

async function createEmailRateLimitKey(email: string): Promise<string> {
  const encodedEmail = new TextEncoder().encode(email);

  const digest = await crypto.subtle.digest("SHA-256", encodedEmail);

  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `skillcima:lead:${hash}`;
}

function getAllowedOrigin(request: Request): string | null {
  const origin = request.headers.get("Origin");

  if (!origin) {
    return null;
  }

  const requestUrl = new URL(request.url);

  if (isLocalHostname(requestUrl.hostname)) {
    return origin === requestUrl.origin ? origin : null;
  }

  return PRODUCTION_ORIGINS.has(origin) ? origin : null;
}

function createHeaders(origin?: string): Headers {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });

  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Vary", "Origin");
  }

  return headers;
}

function successResponse<T>(
  requestId: string,
  data: T,
  status = 200,
  origin?: string,
): Response {
  const body: ApiSuccess<T> = {
    ok: true,
    data,
    requestId,
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: createHeaders(origin),
  });
}

function errorResponse(
  requestId: string,
  status: number,
  error: ApiError,
  origin?: string,
): Response {
  const body: ApiFailure = {
    ok: false,
    error,
    requestId,
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: createHeaders(origin),
  });
}

async function readBodyWithLimit(
  request: Request,
  maxBytes: number,
): Promise<string> {
  const contentLength = request.headers.get("Content-Length");

  if (contentLength) {
    const declaredLength = Number(contentLength);

    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      throw new Error("REQUEST_BODY_TOO_LARGE");
    }
  }

  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();

  let totalBytes = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    totalBytes += value.byteLength;

    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new Error("REQUEST_BODY_TOO_LARGE");
    }

    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();

  return body;
}

async function handleLeadRequest(
  request: Request,
  requestId: string,
  env: Env,
): Promise<Response> {
  const allowedOrigin = getAllowedOrigin(request);

  if (!allowedOrigin) {
    return errorResponse(requestId, 403, {
      code: "ORIGIN_NOT_ALLOWED",
      message: "This request origin is not allowed.",
    });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: createHeaders(allowedOrigin),
    });
  }

  if (request.method !== "POST") {
    return errorResponse(
      requestId,
      405,
      {
        code: "METHOD_NOT_ALLOWED",
        message: "This endpoint only accepts POST requests.",
      },
      allowedOrigin,
    );
  }

  const contentType = request.headers
    .get("Content-Type")
    ?.split(";")[0]
    ?.trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    return errorResponse(
      requestId,
      415,
      {
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: "Content-Type must be application/json.",
      },
      allowedOrigin,
    );
  }

  let rawBody: string;

  try {
    rawBody = await readBodyWithLimit(request, MAX_JSON_BODY_BYTES);
  } catch (error) {
    if (error instanceof Error && error.message === "REQUEST_BODY_TOO_LARGE") {
      return errorResponse(
        requestId,
        413,
        {
          code: "REQUEST_BODY_TOO_LARGE",
          message: "The request body exceeds the maximum allowed size.",
        },
        allowedOrigin,
      );
    }

    return errorResponse(
      requestId,
      400,
      {
        code: "REQUEST_BODY_READ_FAILED",
        message: "The request body could not be read.",
      },
      allowedOrigin,
    );
  }

  if (!rawBody.trim()) {
    return errorResponse(
      requestId,
      400,
      {
        code: "EMPTY_REQUEST_BODY",
        message: "A JSON request body is required.",
      },
      allowedOrigin,
    );
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return errorResponse(
      requestId,
      400,
      {
        code: "INVALID_JSON",
        message: "The request body contains invalid JSON.",
      },
      allowedOrigin,
    );
  }

  const validationResult = leadRequestSchema.safeParse(parsedBody);

  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "The submitted data is invalid.",
          issues: validationResult.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
            code: issue.code,
          })),
        },
        requestId,
      }),
      {
        status: 400,
        headers: createHeaders(allowedOrigin),
      },
    );
  }

  const validatedRequest = validationResult.data;

  const rateLimitKey = await createEmailRateLimitKey(
    validatedRequest.lead.email,
  );

  const rateLimitResult = await env.LEAD_RATE_LIMITER.limit({
    key: rateLimitKey,
  });

  if (!rateLimitResult.success) {
    console.warn(
      JSON.stringify({
        requestId,
        route: "/api/v1/lead",
        stage: "rate_limit",
        result: "blocked",
      }),
    );

    const response = errorResponse(
      requestId,
      429,
      {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many attempts. Please wait before trying again.",
      },
      allowedOrigin,
    );

    response.headers.set("Retry-After", "60");

    return response;
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    return errorResponse(
      requestId,
      503,
      {
        code: "TURNSTILE_NOT_CONFIGURED",
        message: "Verification is temporarily unavailable. Please try again.",
      },
      allowedOrigin,
    );
  }

  const remoteIp = request.headers.get("CF-Connecting-IP") ?? undefined;

  const turnstileResult = await verifyTurnstile({
    secret: env.TURNSTILE_SECRET_KEY,
    token: validatedRequest.turnstileToken,
    remoteIp,
    idempotencyKey: validatedRequest.submissionId,
  });

  if (turnstileResult.status === "unavailable") {
    return errorResponse(
      requestId,
      503,
      {
        code: "TURNSTILE_UNAVAILABLE",
        message: "Verification is temporarily unavailable. Please try again.",
      },
      allowedOrigin,
    );
  }

  if (turnstileResult.status === "failed") {
    return errorResponse(
      requestId,
      403,
      {
        code: "TURNSTILE_FAILED",
        message: "Verification failed. Please try again.",
      },
      allowedOrigin,
    );
  }

  const persistenceResult = await persistVerifiedLead(env, validatedRequest);

  if (persistenceResult.status === "conflict") {
    return errorResponse(
      requestId,
      409,
      {
        code: "SUBMISSION_CONFLICT",
        message:
          "This submission ID has already been used with different data.",
      },
      allowedOrigin,
    );
  }

  if (persistenceResult.status === "misconfigured") {
    return errorResponse(
      requestId,
      503,
      {
        code: "DATABASE_NOT_CONFIGURED",
        message:
          "The submission service is temporarily unavailable. Please try again.",
      },
      allowedOrigin,
    );
  }

  if (persistenceResult.status === "unavailable") {
    console.error(
      JSON.stringify({
        requestId,
        route: "/api/v1/lead",
        stage: "persistence",
        result: "unavailable",
        httpStatus: persistenceResult.httpStatus ?? null,
      }),
    );

    return errorResponse(
      requestId,
      503,
      {
        code: "DATABASE_UNAVAILABLE",
        message:
          "The submission service is temporarily unavailable. Please try again.",
      },
      allowedOrigin,
    );
  }

  return successResponse(
    requestId,
    {
      status: "completed",
      submissionId: validatedRequest.submissionId,
      leadId: persistenceResult.leadId,
      enrolmentId: persistenceResult.enrolmentId,
      replayed: persistenceResult.replayed,
    },
    200,
    allowedOrigin,
  );
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestId = crypto.randomUUID();
    const url = new URL(request.url);

    if (url.pathname === "/api/v1/health") {
      if (request.method !== "GET") {
        return errorResponse(requestId, 405, {
          code: "METHOD_NOT_ALLOWED",
          message: "This endpoint only accepts GET requests.",
        });
      }

      const database = await checkSupabaseConnection(env);

      if (database.status === "misconfigured") {
        return errorResponse(requestId, 503, {
          code: "DATABASE_NOT_CONFIGURED",
          message: "The database connection is not configured.",
        });
      }

      if (database.status === "unavailable") {
        console.error(
          JSON.stringify({
            requestId,
            event: "health_check_failed",
            dependency: "supabase",
            httpStatus: database.httpStatus ?? null,
          }),
        );

        return errorResponse(requestId, 503, {
          code: "DATABASE_UNAVAILABLE",
          message: "The database service is currently unavailable.",
        });
      }

      return successResponse(requestId, {
        status: "ok",
        service: "skillcima-api",
        version: "1",
        database: "ok",
      });
    }

    if (url.pathname === "/api/v1/lead") {
      return handleLeadRequest(request, requestId, env);
    }

    if (url.pathname === "/api/v1/confirm") {
      return handleCourseConfirmationRequest(request, env);
    }

    if (url.pathname === "/api/v1/unsubscribe") {
      return handleNewsletterUnsubscribeRequest(request, env);
    }

    if (url.pathname === "/api/v1/webhooks/resend") {
      return handleResendWebhookRequest(request, env);
    }

    return errorResponse(requestId, 404, {
      code: "API_ROUTE_NOT_FOUND",
      message: "The requested API route does not exist.",
    });
  },

  async queue(batch: EmailQueueRuntimeNamedBatch, env: Env): Promise<void> {
    if (batch.queue === SKILLCIMA_EMAIL_DLQ_NAME) {
      const result = await processEmailDeadLetterBatch(env, batch);

      const log = result.retried > 0 ? console.error : console.log;

      log(
        JSON.stringify({
          event: "email_queue_dlq_batch_completed",
          queue: batch.queue,
          received: result.received,
          acknowledged: result.acknowledged,
          retried: result.retried,
          invalidMessages: result.invalidMessages,
          reconciled: result.reconciled,
          terminalNoops: result.terminalNoops,
          stateFailures: result.stateFailures,
        }),
      );

      return;
    }

    if (batch.queue !== SKILLCIMA_EMAIL_QUEUE_NAME) {
      for (const message of batch.messages) {
        message.retry({
          delaySeconds: EMAIL_QUEUE_RETRY_DELAY_SECONDS,
        });
      }

      console.error(
        JSON.stringify({
          event: "email_queue_unknown_batch",
          queue: batch.queue,
          received: batch.messages.length,
          retried: batch.messages.length,
        }),
      );

      return;
    }

    const delivery = createEmailDeliveryRouter({
      confirmationDelivery: createConfirmationEmailDelivery(env),
      courseLessonDelivery: createCourseLessonEmailDelivery(env),
    });

    const result = await processEmailQueueBatch(env, batch, delivery);

    const hasRetries = result.retried > 0 || result.processorExceptions > 0;

    const log = hasRetries ? console.error : console.log;

    log(
      JSON.stringify({
        event: "email_queue_batch_completed",
        queue: batch.queue,
        deliveryMode: "email_router",
        received: result.received,
        acknowledged: result.acknowledged,
        retried: result.retried,
        processorExceptions: result.processorExceptions,
      }),
    );
  },

  async scheduled(_controller: unknown, env: Env): Promise<void> {
    const result = await dispatchEmailOutbox(env, env.SKILLCIMA_EMAIL_QUEUE);

    if (result.status !== "completed") {
      console.error(
        JSON.stringify({
          event: "email_outbox_dispatch_failed",
          status: result.status,
          stage: result.status === "unavailable" ? result.stage : null,
          httpStatus:
            result.status === "unavailable"
              ? (result.httpStatus ?? null)
              : null,
        }),
      );

      return;
    }

    const hasFailures =
      result.queueFailures > 0 || result.stateUpdateFailures > 0;

    const log = hasFailures ? console.error : console.log;

    log(
      JSON.stringify({
        event: "email_outbox_dispatch_completed",
        selected: result.selected,
        sent: result.sent,
        markedQueued: result.markedQueued,
        queueFailures: result.queueFailures,
        stateUpdateFailures: result.stateUpdateFailures,
      }),
    );
  },
};

export default worker;
