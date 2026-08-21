import { describe, expect, it, vi } from "vitest";

import {
  EMAIL_QUEUE_PLATFORM_DLQ_ERROR_CODE,
  processEmailDeadLetterBatch,
  type EmailDeadLetterStateDependencies,
} from "./email-queue-dead-letter";
import type {
  EmailQueueRuntimeMessage,
  QueueRetryOptions,
} from "./email-queue-batch";

const env = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-secret",
};

const validBody = {
  version: 1,
  jobId: "11111111-1111-4111-8111-111111111111",
  jobType: "course_confirmation",
};

function createMessage(body: unknown): EmailQueueRuntimeMessage {
  return {
    body,
    attempts: 1,
    ack: vi.fn<() => void>(),
    retry: vi.fn<(options?: QueueRetryOptions) => void>(),
  };
}

function createState(): EmailDeadLetterStateDependencies {
  return {
    markEmailJobDeadLetter:
      vi.fn<EmailDeadLetterStateDependencies["markEmailJobDeadLetter"]>(),
  };
}

describe("Skillcima platform DLQ reconciliation", () => {
  it("ACKs an invalid DLQ message without touching database state", async () => {
    const state = createState();

    const message = createMessage({
      ...validBody,
      unexpected: true,
    });

    const result = await processEmailDeadLetterBatch(
      env,
      {
        messages: [message],
      },
      state,
    );

    expect(message.ack).toHaveBeenCalledTimes(1);

    expect(message.retry).not.toHaveBeenCalled();

    expect(state.markEmailJobDeadLetter).not.toHaveBeenCalled();

    expect(result).toEqual({
      received: 1,
      acknowledged: 1,
      retried: 0,
      invalidMessages: 1,
      reconciled: 0,
      terminalNoops: 0,
      stateFailures: 0,
    });
  });

  it("marks an exhausted valid Queue job dead-letter and ACKs the DLQ message", async () => {
    const state = createState();

    vi.mocked(state.markEmailJobDeadLetter).mockResolvedValue({
      status: "dead_letter",
    });

    const message = createMessage(validBody);

    const result = await processEmailDeadLetterBatch(
      env,
      {
        messages: [message],
      },
      state,
    );

    expect(state.markEmailJobDeadLetter).toHaveBeenCalledWith(
      env,
      validBody.jobId,
      EMAIL_QUEUE_PLATFORM_DLQ_ERROR_CODE,
    );

    expect(message.ack).toHaveBeenCalledTimes(1);

    expect(message.retry).not.toHaveBeenCalled();

    expect(result.reconciled).toBe(1);
  });

  it.each(["already_dead_letter", "already_sent", "not_found"] as const)(
    "ACKs terminal database result %s without retrying",
    async (status) => {
      const state = createState();

      vi.mocked(state.markEmailJobDeadLetter).mockResolvedValue({
        status,
      });

      const message = createMessage(validBody);

      await processEmailDeadLetterBatch(
        env,
        {
          messages: [message],
        },
        state,
      );

      expect(message.ack).toHaveBeenCalledTimes(1);

      expect(message.retry).not.toHaveBeenCalled();
    },
  );

  it.each(["misconfigured", "unavailable"] as const)(
    "retries the DLQ message when database state is %s",
    async (status) => {
      const state = createState();

      vi.mocked(state.markEmailJobDeadLetter).mockResolvedValue({
        status,
      });

      const message = createMessage(validBody);

      const result = await processEmailDeadLetterBatch(
        env,
        {
          messages: [message],
        },
        state,
      );

      expect(message.ack).not.toHaveBeenCalled();

      expect(message.retry).toHaveBeenCalledWith({
        delaySeconds: 300,
      });

      expect(result.stateFailures).toBe(1);
    },
  );

  it("retries when dead-letter database reconciliation throws", async () => {
    const state = createState();

    vi.mocked(state.markEmailJobDeadLetter).mockRejectedValue(
      new Error("temporary database failure"),
    );

    const message = createMessage(validBody);

    await processEmailDeadLetterBatch(
      env,
      {
        messages: [message],
      },
      state,
    );

    expect(message.ack).not.toHaveBeenCalled();

    expect(message.retry).toHaveBeenCalledWith({
      delaySeconds: 300,
    });
  });
});
