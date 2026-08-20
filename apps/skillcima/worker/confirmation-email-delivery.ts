import {
  composeConfirmationEmail,
  type ConfirmationEmailContentResult,
} from "./confirmation-email";
import {
  prepareConfirmationDelivery,
  type ConfirmationDeliveryEnv,
  type PrepareConfirmationDeliveryResult,
} from "./confirmation-delivery";
import {
  sendEmailWithResend,
  type ResendEmailEnv,
  type ResendEmailResult,
} from "./resend-email";
import type {
  EmailDeliveryAdapter,
  EmailDeliveryInput,
  EmailDeliveryResult,
} from "./email-queue-processor";

export type ConfirmationEmailDeliveryEnv = ConfirmationDeliveryEnv &
  ResendEmailEnv & {
    SKILLCIMA_PUBLIC_ORIGIN: string;
  };

export interface ConfirmationEmailDeliveryDependencies {
  prepareConfirmationDelivery: typeof prepareConfirmationDelivery;

  composeConfirmationEmail: typeof composeConfirmationEmail;

  sendEmailWithResend: typeof sendEmailWithResend;
}

const defaultDependencies: ConfirmationEmailDeliveryDependencies = {
  prepareConfirmationDelivery,
  composeConfirmationEmail,
  sendEmailWithResend,
};

function temporaryFailure(errorCode: string): EmailDeliveryResult {
  return {
    status: "temporary_failure",
    errorCode,
  };
}

function permanentFailure(errorCode: string): EmailDeliveryResult {
  return {
    status: "permanent_failure",
    errorCode,
  };
}

function mapPreparationFailure(
  result: Exclude<PrepareConfirmationDeliveryResult, { status: "ready" }>,
): EmailDeliveryResult {
  switch (result.status) {
    case "misconfigured":
      return temporaryFailure("CONFIRMATION_DELIVERY_NOT_CONFIGURED");

    case "unavailable":
      return temporaryFailure("CONFIRMATION_DELIVERY_UNAVAILABLE");

    case "invalid_job_state":
      /*
       * A successful Queue claim followed by an
       * invalid database state can be caused by a
       * concurrent state transition. Retry rather
       * than terminally discarding the job.
       */
      return temporaryFailure("CONFIRMATION_JOB_STATE_RACE");

    case "invalid_job_id":
      return permanentFailure("CONFIRMATION_JOB_INVALID");

    case "not_found":
      return permanentFailure("CONFIRMATION_JOB_NOT_FOUND");

    case "invalid_job_type":
      return permanentFailure("CONFIRMATION_JOB_TYPE_INVALID");

    case "already_confirmed":
      return permanentFailure("CONFIRMATION_ALREADY_CONFIRMED");

    case "not_deliverable":
      return permanentFailure("CONFIRMATION_NOT_DELIVERABLE");

    case "invalid_enrolment_state":
      return permanentFailure("CONFIRMATION_ENROLMENT_INVALID");

    case "token_mismatch":
      return permanentFailure("CONFIRMATION_TOKEN_MISMATCH");
  }
}

function mapProviderResult(result: ResendEmailResult): EmailDeliveryResult {
  if (result.status === "accepted") {
    return {
      status: "accepted",
    };
  }

  if (result.status === "misconfigured") {
    return temporaryFailure("RESEND_NOT_CONFIGURED");
  }

  if (result.status === "invalid_input") {
    return permanentFailure("RESEND_INVALID_INPUT");
  }

  return {
    status: result.status,
    errorCode: result.errorCode,
  };
}

export function createConfirmationEmailDelivery(
  env: ConfirmationEmailDeliveryEnv,
  dependencies: ConfirmationEmailDeliveryDependencies = defaultDependencies,
): EmailDeliveryAdapter {
  return {
    async deliver(input: EmailDeliveryInput): Promise<EmailDeliveryResult> {
      if (input.jobType !== "course_confirmation") {
        return permanentFailure("CONFIRMATION_JOB_TYPE_INVALID");
      }

      let prepared: PrepareConfirmationDeliveryResult;

      try {
        prepared = await dependencies.prepareConfirmationDelivery(
          env,
          input.jobId,
        );
      } catch {
        return temporaryFailure("CONFIRMATION_PREPARATION_EXCEPTION");
      }

      if (prepared.status !== "ready") {
        return mapPreparationFailure(prepared);
      }

      let content: ConfirmationEmailContentResult;

      try {
        content = dependencies.composeConfirmationEmail({
          publicOrigin: env.SKILLCIMA_PUBLIC_ORIGIN,
          firstName: prepared.firstName,
          courseSlug: prepared.courseSlug,
          confirmationToken: prepared.confirmationToken,
          confirmationExpiresAt: prepared.confirmationExpiresAt,
        });
      } catch {
        return permanentFailure("CONFIRMATION_EMAIL_COMPOSITION_EXCEPTION");
      }

      if (content.status !== "ready") {
        return permanentFailure("CONFIRMATION_EMAIL_INVALID");
      }

      let provider: ResendEmailResult;

      try {
        provider = await dependencies.sendEmailWithResend(env, {
          to: prepared.recipientEmail,
          subject: content.subject,
          html: content.html,
          text: content.text,
          idempotencyKey: input.idempotencyKey,
        });
      } catch {
        return temporaryFailure("RESEND_DELIVERY_EXCEPTION");
      }

      return mapProviderResult(provider);
    },
  };
}
