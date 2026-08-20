import { describe, expect, it, vi } from "vitest";

import {
  EMAIL_QUEUE_RETRY_DELAY_SECONDS,
  type EmailDeliveryAdapter,
  type ProcessEmailQueueMessageResult,
} from "./email-queue-processor";
import {
  processEmailQueueBatch,
  type EmailQueueProcessorDependency,
  type EmailQueueRuntimeMessage,
  type QueueRetryOptions,
} from "./email-queue-batch";

const env = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-secret",
};

const delivery: EmailDeliveryAdapter = {
  deliver: vi.fn(),
};

function createMessage(body: unknown, attempts = 1) {
  const ack = vi.fn<() => void>();

  const retry = vi.fn<(options?: QueueRetryOptions) => void>();

  return {
    body,
    attempts,
    ack,
    retry,
  } satisfies EmailQueueRuntimeMessage;
}

describe("Skillcima email Queue batch handler", () => {
  it("acknowledges a processor ACK decision", async () => {
    const message = createMessage({
      jobId: "job-1",
    });

    const processor: EmailQueueProcessorDependency = vi.fn().mockResolvedValue({
      action: "ack",
      reason: "already_sent",
      jobId: "job-1",
      attemptCount: 2,
    } satisfies ProcessEmailQueueMessageResult);

    const result = await processEmailQueueBatch(
      env,
      {
        messages: [message],
      },
      delivery,
      processor,
    );

    expect(message.ack).toHaveBeenCalledTimes(1);
    expect(message.retry).not.toHaveBeenCalled();

    expect(result).toEqual({
      received: 1,
      acknowledged: 1,
      retried: 0,
      processorExceptions: 0,
    });
  });

  it("retries a processor retry decision with its delay", async () => {
    const message = createMessage({
      jobId: "job-2",
    });

    const processor: EmailQueueProcessorDependency = vi.fn().mockResolvedValue({
      action: "retry",
      reason: "temporary_failure",
      delaySeconds: 300,
      jobId: "job-2",
      attemptCount: 1,
    } satisfies ProcessEmailQueueMessageResult);

    const result = await processEmailQueueBatch(
      env,
      {
        messages: [message],
      },
      delivery,
      processor,
    );

    expect(message.ack).not.toHaveBeenCalled();

    expect(message.retry).toHaveBeenCalledWith({
      delaySeconds: 300,
    });

    expect(result).toEqual({
      received: 1,
      acknowledged: 0,
      retried: 1,
      processorExceptions: 0,
    });
  });

  it("handles ACK and retry decisions independently in one batch", async () => {
    const first = createMessage({
      jobId: "job-1",
    });

    const second = createMessage(
      {
        jobId: "job-2",
      },
      2,
    );

    const processor: EmailQueueProcessorDependency = vi
      .fn()
      .mockResolvedValueOnce({
        action: "ack",
        reason: "sent",
        jobId: "job-1",
        attemptCount: 1,
      } satisfies ProcessEmailQueueMessageResult)
      .mockResolvedValueOnce({
        action: "retry",
        reason: "already_processing",
        delaySeconds: 300,
        jobId: "job-2",
        attemptCount: 2,
      } satisfies ProcessEmailQueueMessageResult);

    const result = await processEmailQueueBatch(
      env,
      {
        messages: [first, second],
      },
      delivery,
      processor,
    );

    expect(first.ack).toHaveBeenCalledTimes(1);
    expect(first.retry).not.toHaveBeenCalled();

    expect(second.ack).not.toHaveBeenCalled();
    expect(second.retry).toHaveBeenCalledWith({
      delaySeconds: 300,
    });

    expect(result).toEqual({
      received: 2,
      acknowledged: 1,
      retried: 1,
      processorExceptions: 0,
    });
  });

  it("retries only the affected message when the processor throws", async () => {
    const first = createMessage({
      jobId: "job-1",
    });

    const second = createMessage({
      jobId: "job-2",
    });

    const processor: EmailQueueProcessorDependency = vi
      .fn()
      .mockRejectedValueOnce(new Error("Unexpected processor failure"))
      .mockResolvedValueOnce({
        action: "ack",
        reason: "already_sent",
        jobId: "job-2",
        attemptCount: 2,
      } satisfies ProcessEmailQueueMessageResult);

    const result = await processEmailQueueBatch(
      env,
      {
        messages: [first, second],
      },
      delivery,
      processor,
    );

    expect(first.retry).toHaveBeenCalledWith({
      delaySeconds: EMAIL_QUEUE_RETRY_DELAY_SECONDS,
    });

    expect(first.ack).not.toHaveBeenCalled();

    expect(second.ack).toHaveBeenCalledTimes(1);
    expect(second.retry).not.toHaveBeenCalled();

    expect(result).toEqual({
      received: 2,
      acknowledged: 1,
      retried: 1,
      processorExceptions: 1,
    });
  });

  it("returns an empty summary for an empty Queue batch", async () => {
    const processor: EmailQueueProcessorDependency = vi.fn();

    const result = await processEmailQueueBatch(
      env,
      {
        messages: [],
      },
      delivery,
      processor,
    );

    expect(processor).not.toHaveBeenCalled();

    expect(result).toEqual({
      received: 0,
      acknowledged: 0,
      retried: 0,
      processorExceptions: 0,
    });
  });
});
