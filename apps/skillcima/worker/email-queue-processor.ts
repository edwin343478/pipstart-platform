import {
  claimEmailJob,
  markEmailJobDeadLetter,
  markEmailJobSent,
  releaseEmailJob,
} from "./email-consumer-state";
import {
  SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION,
  type SkillcimaEmailQueueJobType,
  type SkillcimaEmailQueueMessage,
} from "./email-queue";
import type { SupabaseEnv } from "./supabase";

export const EMAIL_QUEUE_RETRY_DELAY_SECONDS = 300;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface EmailDeliveryInput {
  jobId: string;
  jobType: SkillcimaEmailQueueJobType;
  idempotencyKey: string;
}

export type EmailDeliveryResult =
  | {
      status: "accepted";
    }
  | {
      status: "temporary_failure";
      errorCode: string;
    }
  | {
      status: "permanent_failure";
      errorCode: string;
    };

export interface EmailDeliveryAdapter {
  deliver(input: EmailDeliveryInput): Promise<EmailDeliveryResult>;
}

export interface EmailQueueStateDependencies {
  claimEmailJob: typeof claimEmailJob;
  releaseEmailJob: typeof releaseEmailJob;
  markEmailJobSent: typeof markEmailJobSent;
  markEmailJobDeadLetter: typeof markEmailJobDeadLetter;
}

const defaultStateDependencies: EmailQueueStateDependencies = {
  claimEmailJob,
  releaseEmailJob,
  markEmailJobSent,
  markEmailJobDeadLetter,
};

export type ProcessEmailQueueMessageResult =
  | {
      action: "ack";
      reason:
        | "invalid_message"
        | "sent"
        | "already_sent"
        | "dead_letter"
        | "not_found"
        | "job_type_mismatch"
        | "not_claimable";
      jobId?: string;
      attemptCount?: number | null;
    }
  | {
      action: "retry";
      reason:
        | "state_unavailable"
        | "already_processing"
        | "temporary_failure"
        | "state_update_failed";
      delaySeconds: number;
      jobId?: string;
      attemptCount?: number | null;
    };

function parseQueueMessage(value: unknown): SkillcimaEmailQueueMessage | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    candidate.version !== SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION ||
    candidate.jobType !== "course_confirmation" ||
    typeof candidate.jobId !== "string" ||
    !UUID_PATTERN.test(candidate.jobId)
  ) {
    return null;
  }

  const keys = Object.keys(candidate).sort();

  if (
    keys.length !== 3 ||
    keys[0] !== "jobId" ||
    keys[1] !== "jobType" ||
    keys[2] !== "version"
  ) {
    return null;
  }

  return {
    version: SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION,
    jobId: candidate.jobId,
    jobType: candidate.jobType,
  };
}

export function createEmailDeliveryIdempotencyKey(
  message: SkillcimaEmailQueueMessage,
): string {
  return `skillcima/${message.jobType}/${message.jobId}`;
}

function normalizeErrorCode(errorCode: string): string {
  const normalized = errorCode.trim();

  if (normalized.length < 1 || normalized.length > 100) {
    return "EMAIL_PROVIDER_TEMPORARY_FAILURE";
  }

  return normalized;
}

function retry(
  reason: Extract<
    ProcessEmailQueueMessageResult,
    { action: "retry" }
  >["reason"],
  details: {
    jobId?: string;
    attemptCount?: number | null;
  } = {},
): ProcessEmailQueueMessageResult {
  return {
    action: "retry",
    reason,
    delaySeconds: EMAIL_QUEUE_RETRY_DELAY_SECONDS,
    ...details,
  };
}

export async function processEmailQueueMessage(
  env: SupabaseEnv,
  body: unknown,
  delivery: EmailDeliveryAdapter,
  state: EmailQueueStateDependencies = defaultStateDependencies,
): Promise<ProcessEmailQueueMessageResult> {
  const message = parseQueueMessage(body);

  if (!message) {
    return {
      action: "ack",
      reason: "invalid_message",
    };
  }

  const claim = await state.claimEmailJob(env, message.jobId, message.jobType);

  if (claim.status === "misconfigured" || claim.status === "unavailable") {
    return retry("state_unavailable", {
      jobId: message.jobId,
    });
  }

  if (claim.status === "already_processing") {
    return retry("already_processing", {
      jobId: message.jobId,
      attemptCount: claim.attemptCount,
    });
  }

  if (claim.status !== "claimed") {
    return {
      action: "ack",
      reason: claim.status,
      jobId: message.jobId,
      attemptCount: claim.attemptCount,
    };
  }

  let deliveryResult: EmailDeliveryResult;

  try {
    deliveryResult = await delivery.deliver({
      jobId: message.jobId,
      jobType: message.jobType,
      idempotencyKey: createEmailDeliveryIdempotencyKey(message),
    });
  } catch {
    deliveryResult = {
      status: "temporary_failure",
      errorCode: "EMAIL_DELIVERY_EXCEPTION",
    };
  }

  if (deliveryResult.status === "temporary_failure") {
    const release = await state.releaseEmailJob(
      env,
      message.jobId,
      normalizeErrorCode(deliveryResult.errorCode),
    );

    if (release.status === "queued") {
      return retry("temporary_failure", {
        jobId: message.jobId,
        attemptCount: claim.attemptCount,
      });
    }

    if (release.status === "already_sent" || release.status === "dead_letter") {
      return {
        action: "ack",
        reason: release.status,
        jobId: message.jobId,
        attemptCount: claim.attemptCount,
      };
    }

    return retry("state_unavailable", {
      jobId: message.jobId,
      attemptCount: claim.attemptCount,
    });
  }

  if (deliveryResult.status === "permanent_failure") {
    const deadLetter = await state.markEmailJobDeadLetter(
      env,
      message.jobId,
      normalizeErrorCode(deliveryResult.errorCode),
    );

    if (
      deadLetter.status === "dead_letter" ||
      deadLetter.status === "already_dead_letter"
    ) {
      return {
        action: "ack",
        reason: "dead_letter",
        jobId: message.jobId,
        attemptCount: claim.attemptCount,
      };
    }

    if (deadLetter.status === "already_sent") {
      return {
        action: "ack",
        reason: "already_sent",
        jobId: message.jobId,
        attemptCount: claim.attemptCount,
      };
    }

    if (deadLetter.status === "not_found") {
      return {
        action: "ack",
        reason: "not_found",
        jobId: message.jobId,
        attemptCount: claim.attemptCount,
      };
    }

    return retry("state_update_failed", {
      jobId: message.jobId,
      attemptCount: claim.attemptCount,
    });
  }

  const sent = await state.markEmailJobSent(env, message.jobId);

  if (sent.status === "sent" || sent.status === "already_sent") {
    return {
      action: "ack",
      reason: sent.status,
      jobId: message.jobId,
      attemptCount: claim.attemptCount,
    };
  }

  return retry("state_update_failed", {
    jobId: message.jobId,
    attemptCount: claim.attemptCount,
  });
}
