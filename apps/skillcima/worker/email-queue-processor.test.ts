import { describe, expect, it, vi } from "vitest";

import type { EmailQueueStateDependencies } from "./email-queue-processor";
import {
  createEmailDeliveryIdempotencyKey,
  EMAIL_QUEUE_RETRY_DELAY_SECONDS,
  processEmailQueueMessage,
} from "./email-queue-processor";

const env = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-secret",
};

const message = {
  version: 1 as const,
  jobId: "11111111-1111-4111-8111-111111111111",
  jobType: "course_confirmation" as const,
};

function createState(
  overrides: Partial<EmailQueueStateDependencies> = {},
): EmailQueueStateDependencies {
  return {
    claimEmailJob: vi.fn().mockResolvedValue({
      status: "claimed",
      attemptCount: 1,
    }),
    releaseEmailJob: vi.fn().mockResolvedValue({
      status: "queued",
    }),
    markEmailJobSent: vi.fn().mockResolvedValue({
      status: "sent",
    }),
    ...overrides,
  };
}

describe("Skillcima email Queue processor", () => {
  it("acknowledges malformed Queue messages without database access", async () => {
    const state = createState();
    const deliver = vi.fn();

    const result = await processEmailQueueMessage(
      env,
      {
        version: 99,
        jobId: "not-a-uuid",
        jobType: "course_confirmation",
      },
      { deliver },
      state,
    );

    expect(result).toEqual({
      action: "ack",
      reason: "invalid_message",
    });

    expect(state.claimEmailJob).not.toHaveBeenCalled();

    expect(deliver).not.toHaveBeenCalled();
  });

  it("acknowledges already-sent duplicate delivery", async () => {
    const state = createState({
      claimEmailJob: vi.fn().mockResolvedValue({
        status: "already_sent",
        attemptCount: 2,
      }),
    });

    const result = await processEmailQueueMessage(
      env,
      message,
      { deliver: vi.fn() },
      state,
    );

    expect(result).toEqual({
      action: "ack",
      reason: "already_sent",
      jobId: message.jobId,
      attemptCount: 2,
    });
  });

  it("retries a fresh processing lease", async () => {
    const state = createState({
      claimEmailJob: vi.fn().mockResolvedValue({
        status: "already_processing",
        attemptCount: 1,
      }),
    });

    const result = await processEmailQueueMessage(
      env,
      message,
      { deliver: vi.fn() },
      state,
    );

    expect(result).toEqual({
      action: "retry",
      reason: "already_processing",
      delaySeconds: EMAIL_QUEUE_RETRY_DELAY_SECONDS,
      jobId: message.jobId,
      attemptCount: 1,
    });
  });

  it("retries when consumer state cannot be reached", async () => {
    const state = createState({
      claimEmailJob: vi.fn().mockResolvedValue({
        status: "unavailable",
        httpStatus: 503,
      }),
    });

    const result = await processEmailQueueMessage(
      env,
      message,
      { deliver: vi.fn() },
      state,
    );

    expect(result).toEqual({
      action: "retry",
      reason: "state_unavailable",
      delaySeconds: EMAIL_QUEUE_RETRY_DELAY_SECONDS,
      jobId: message.jobId,
    });
  });

  it("releases a temporary delivery failure and retries", async () => {
    const state = createState();

    const deliver = vi.fn().mockResolvedValue({
      status: "temporary_failure",
      errorCode: "PROVIDER_TEMPORARY_FAILURE",
    });

    const result = await processEmailQueueMessage(
      env,
      message,
      { deliver },
      state,
    );

    expect(state.releaseEmailJob).toHaveBeenCalledWith(
      env,
      message.jobId,
      "PROVIDER_TEMPORARY_FAILURE",
    );

    expect(result).toEqual({
      action: "retry",
      reason: "temporary_failure",
      delaySeconds: EMAIL_QUEUE_RETRY_DELAY_SECONDS,
      jobId: message.jobId,
      attemptCount: 1,
    });
  });

  it("converts delivery exceptions into retryable failures", async () => {
    const state = createState();

    const deliver = vi.fn().mockRejectedValue(new Error("Network failure"));

    const result = await processEmailQueueMessage(
      env,
      message,
      { deliver },
      state,
    );

    expect(state.releaseEmailJob).toHaveBeenCalledWith(
      env,
      message.jobId,
      "EMAIL_DELIVERY_EXCEPTION",
    );

    expect(result.action).toBe("retry");
  });

  it("uses a deterministic delivery idempotency key and marks accepted delivery sent", async () => {
    const state = createState();

    const deliver = vi.fn().mockResolvedValue({
      status: "accepted",
    });

    const result = await processEmailQueueMessage(
      env,
      message,
      { deliver },
      state,
    );

    expect(deliver).toHaveBeenCalledWith({
      jobId: message.jobId,
      jobType: "course_confirmation",
      idempotencyKey:
        "skillcima/course_confirmation/11111111-1111-4111-8111-111111111111",
    });

    expect(state.markEmailJobSent).toHaveBeenCalledWith(env, message.jobId);

    expect(result).toEqual({
      action: "ack",
      reason: "sent",
      jobId: message.jobId,
      attemptCount: 1,
    });
  });

  it("retries safely when provider acceptance succeeded but sent-state persistence failed", async () => {
    const state = createState({
      markEmailJobSent: vi.fn().mockResolvedValue({
        status: "unavailable",
        httpStatus: 503,
      }),
    });

    const result = await processEmailQueueMessage(
      env,
      message,
      {
        deliver: vi.fn().mockResolvedValue({
          status: "accepted",
        }),
      },
      state,
    );

    expect(result).toEqual({
      action: "retry",
      reason: "state_update_failed",
      delaySeconds: EMAIL_QUEUE_RETRY_DELAY_SECONDS,
      jobId: message.jobId,
      attemptCount: 1,
    });
  });

  it("builds the same idempotency key for the same durable email job", () => {
    expect(createEmailDeliveryIdempotencyKey(message)).toBe(
      "skillcima/course_confirmation/11111111-1111-4111-8111-111111111111",
    );

    expect(createEmailDeliveryIdempotencyKey(message)).toBe(
      createEmailDeliveryIdempotencyKey(message),
    );
  });
});
