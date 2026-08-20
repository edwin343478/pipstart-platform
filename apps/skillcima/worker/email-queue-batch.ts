import {
  EMAIL_QUEUE_RETRY_DELAY_SECONDS,
  processEmailQueueMessage,
  type EmailDeliveryAdapter,
  type ProcessEmailQueueMessageResult,
} from "./email-queue-processor";
import type { SupabaseEnv } from "./supabase";

export interface QueueRetryOptions {
  delaySeconds?: number;
}

export interface EmailQueueRuntimeMessage {
  readonly body: unknown;
  readonly attempts: number;
  ack(): void;
  retry(options?: QueueRetryOptions): void;
}

export interface EmailQueueRuntimeBatch {
  readonly messages: readonly EmailQueueRuntimeMessage[];
}

export interface EmailQueueProcessorDependency {
  (
    env: SupabaseEnv,
    body: unknown,
    delivery: EmailDeliveryAdapter,
  ): Promise<ProcessEmailQueueMessageResult>;
}

export interface ProcessEmailQueueBatchResult {
  received: number;
  acknowledged: number;
  retried: number;
  processorExceptions: number;
}

export async function processEmailQueueBatch(
  env: SupabaseEnv,
  batch: EmailQueueRuntimeBatch,
  delivery: EmailDeliveryAdapter,
  processor: EmailQueueProcessorDependency = processEmailQueueMessage,
): Promise<ProcessEmailQueueBatchResult> {
  let acknowledged = 0;
  let retried = 0;
  let processorExceptions = 0;

  for (const message of batch.messages) {
    let result: ProcessEmailQueueMessageResult;

    try {
      result = await processor(env, message.body, delivery);
    } catch {
      processorExceptions += 1;

      message.retry({
        delaySeconds: EMAIL_QUEUE_RETRY_DELAY_SECONDS,
      });

      retried += 1;
      continue;
    }

    if (result.action === "ack") {
      message.ack();
      acknowledged += 1;
      continue;
    }

    message.retry({
      delaySeconds: result.delaySeconds,
    });

    retried += 1;
  }

  return {
    received: batch.messages.length,
    acknowledged,
    retried,
    processorExceptions,
  };
}
