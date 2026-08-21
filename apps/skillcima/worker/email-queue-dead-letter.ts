import { markEmailJobDeadLetter } from "./email-consumer-state";
import type { EmailQueueRuntimeBatch } from "./email-queue-batch";
import {
  EMAIL_QUEUE_RETRY_DELAY_SECONDS,
  parseQueueMessage,
} from "./email-queue-processor";
import type { SupabaseEnv } from "./supabase";

export const EMAIL_QUEUE_PLATFORM_DLQ_ERROR_CODE =
  "CLOUDFLARE_QUEUE_RETRIES_EXHAUSTED";

export interface EmailDeadLetterStateDependencies {
  markEmailJobDeadLetter: typeof markEmailJobDeadLetter;
}

const defaultStateDependencies: EmailDeadLetterStateDependencies = {
  markEmailJobDeadLetter,
};

export interface ProcessEmailDeadLetterBatchResult {
  received: number;
  acknowledged: number;
  retried: number;
  invalidMessages: number;
  reconciled: number;
  terminalNoops: number;
  stateFailures: number;
}

export async function processEmailDeadLetterBatch(
  env: SupabaseEnv,
  batch: EmailQueueRuntimeBatch,
  state: EmailDeadLetterStateDependencies = defaultStateDependencies,
): Promise<ProcessEmailDeadLetterBatchResult> {
  let acknowledged = 0;
  let retried = 0;
  let invalidMessages = 0;
  let reconciled = 0;
  let terminalNoops = 0;
  let stateFailures = 0;

  for (const message of batch.messages) {
    const parsed = parseQueueMessage(message.body);

    if (!parsed) {
      /*
       * An invalid message cannot be mapped safely
       * to an application email job. ACK it so the
       * platform DLQ itself cannot enter a retry loop.
       */
      message.ack();

      acknowledged += 1;
      invalidMessages += 1;

      continue;
    }

    let result: Awaited<
      ReturnType<EmailDeadLetterStateDependencies["markEmailJobDeadLetter"]>
    >;

    try {
      result = await state.markEmailJobDeadLetter(
        env,
        parsed.jobId,
        EMAIL_QUEUE_PLATFORM_DLQ_ERROR_CODE,
      );
    } catch {
      message.retry({
        delaySeconds: EMAIL_QUEUE_RETRY_DELAY_SECONDS,
      });

      retried += 1;
      stateFailures += 1;

      continue;
    }

    if (result.status === "misconfigured" || result.status === "unavailable") {
      /*
       * Never ACK a valid DLQ message until its
       * terminal database state has been resolved.
       */
      message.retry({
        delaySeconds: EMAIL_QUEUE_RETRY_DELAY_SECONDS,
      });

      retried += 1;
      stateFailures += 1;

      continue;
    }

    message.ack();
    acknowledged += 1;

    if (
      result.status === "dead_letter" ||
      result.status === "already_dead_letter"
    ) {
      reconciled += 1;
      continue;
    }

    /*
     * already_sent and not_found are terminal no-ops.
     * A stale platform-DLQ message must never undo
     * a successful send.
     */
    terminalNoops += 1;
  }

  return {
    received: batch.messages.length,
    acknowledged,
    retried,
    invalidMessages,
    reconciled,
    terminalNoops,
    stateFailures,
  };
}
