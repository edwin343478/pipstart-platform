import {
  forexFoundationsEmailCourse,
  type SixDayEmailJobType,
} from "@repo/content";

import {
  composeCourseLessonEmail,
  type ComposedCourseLessonEmail,
} from "./course-lesson-email";
import {
  prepareCourseLessonDelivery,
  type PrepareCourseLessonDeliveryResult,
} from "./course-lesson-delivery";
import type { SkillcimaEmailQueueJobType } from "./email-queue";
import type {
  EmailDeliveryAdapter,
  EmailDeliveryInput,
  EmailDeliveryResult,
} from "./email-queue-processor";
import {
  sendEmailWithResend,
  type ResendEmailEnv,
  type ResendEmailInput,
  type ResendEmailResult,
} from "./resend-email";
import type { SupabaseEnv } from "./supabase";

const SKILLCIMA_EMAIL_ORIGIN = "https://skillcima.com/";

const PIPSTART_EMAIL_ORIGIN = "https://pipstart.net/";

export type CourseLessonEmailDeliveryEnv = SupabaseEnv &
  Partial<ResendEmailEnv>;

export type CourseLessonContentAvailability =
  "draft" | "approved" | "unsupported";

type CourseLessonProviderSender = (
  env: CourseLessonEmailDeliveryEnv,
  input: ResendEmailInput,
) => Promise<ResendEmailResult>;

export interface CourseLessonEmailDeliveryDependencies {
  prepareCourseLessonDelivery: typeof prepareCourseLessonDelivery;

  getCourseLessonContentStatus?: (
    courseSlug: string,
  ) => CourseLessonContentAvailability;

  composeCourseLessonEmail?: typeof composeCourseLessonEmail;

  sendEmailWithResend?: CourseLessonProviderSender;

  /*
   * M4F.2E.2 provider lock.
   *
   * Delivery remains disabled unless a future
   * controlled runtime step explicitly enables it.
   */
  enableProviderDelivery?: boolean;
}

function getDefaultCourseLessonContentStatus(
  courseSlug: string,
): CourseLessonContentAvailability {
  if (courseSlug !== forexFoundationsEmailCourse.courseSlug) {
    return "unsupported";
  }

  return forexFoundationsEmailCourse.status;
}

async function sendCourseLessonWithResend(
  env: CourseLessonEmailDeliveryEnv,
  input: ResendEmailInput,
): Promise<ResendEmailResult> {
  return sendEmailWithResend(
    {
      RESEND_API_KEY: env.RESEND_API_KEY ?? "",
      SKILLCIMA_EMAIL_FROM: env.SKILLCIMA_EMAIL_FROM ?? "",
    },
    input,
  );
}

const defaultDependencies: CourseLessonEmailDeliveryDependencies = {
  prepareCourseLessonDelivery,
  getCourseLessonContentStatus: getDefaultCourseLessonContentStatus,
  composeCourseLessonEmail,
  sendEmailWithResend: sendCourseLessonWithResend,
  enableProviderDelivery: false,
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

function isCourseLessonJobType(
  value: SkillcimaEmailQueueJobType,
): value is SixDayEmailJobType {
  return (
    value === "course_day_1" ||
    value === "course_day_2" ||
    value === "course_day_3" ||
    value === "course_day_4" ||
    value === "course_day_5" ||
    value === "course_day_6"
  );
}

function mapPreparationFailure(
  result: Exclude<PrepareCourseLessonDeliveryResult, { status: "ready" }>,
): EmailDeliveryResult {
  switch (result.status) {
    case "misconfigured":
      return temporaryFailure("COURSE_LESSON_DELIVERY_NOT_CONFIGURED");

    case "unavailable":
      return temporaryFailure("COURSE_LESSON_DELIVERY_UNAVAILABLE");

    case "invalid_job_state":
      return temporaryFailure("COURSE_LESSON_JOB_STATE_RACE");

    case "invalid_job_id":
      return permanentFailure("COURSE_LESSON_JOB_INVALID");

    case "not_found":
      return permanentFailure("COURSE_LESSON_JOB_NOT_FOUND");

    case "invalid_job_type":
      return permanentFailure("COURSE_LESSON_JOB_TYPE_INVALID");

    case "not_deliverable":
      return permanentFailure("COURSE_LESSON_NOT_DELIVERABLE");

    case "not_confirmed":
      return permanentFailure("COURSE_LESSON_NOT_CONFIRMED");

    case "invalid_enrolment_state":
      return permanentFailure("COURSE_LESSON_ENROLMENT_INVALID");

    case "invalid_confirmation_state":
      return permanentFailure("COURSE_LESSON_CONFIRMATION_INVALID");
  }
}

function mapProviderResult(result: ResendEmailResult): EmailDeliveryResult {
  if (result.status === "accepted") {
    return {
      status: "accepted",
      providerMessageId: result.providerMessageId,
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

export function createCourseLessonEmailDelivery(
  env: CourseLessonEmailDeliveryEnv,
  dependencies: CourseLessonEmailDeliveryDependencies = defaultDependencies,
): EmailDeliveryAdapter {
  return {
    async deliver(input: EmailDeliveryInput): Promise<EmailDeliveryResult> {
      if (!isCourseLessonJobType(input.jobType)) {
        return permanentFailure("COURSE_LESSON_JOB_TYPE_INVALID");
      }

      let prepared: PrepareCourseLessonDeliveryResult;

      try {
        prepared = await dependencies.prepareCourseLessonDelivery(
          env,
          input.jobId,
        );
      } catch {
        return temporaryFailure("COURSE_LESSON_PREPARATION_EXCEPTION");
      }

      if (prepared.status !== "ready") {
        return mapPreparationFailure(prepared);
      }

      const getContentStatus =
        dependencies.getCourseLessonContentStatus ??
        getDefaultCourseLessonContentStatus;

      const contentStatus = getContentStatus(prepared.courseSlug);

      if (contentStatus === "unsupported") {
        return permanentFailure("COURSE_LESSON_CONTENT_UNSUPPORTED");
      }

      if (contentStatus !== "approved") {
        return permanentFailure("COURSE_LESSON_CONTENT_NOT_APPROVED");
      }

      if (dependencies.enableProviderDelivery !== true) {
        return permanentFailure("COURSE_LESSON_CONTENT_NOT_ENABLED");
      }

      const compose =
        dependencies.composeCourseLessonEmail ?? composeCourseLessonEmail;

      let content: ComposedCourseLessonEmail;

      try {
        content = compose({
          courseSlug: prepared.courseSlug,
          jobType: input.jobType,
          firstName: prepared.firstName,
          micrositeBaseUrl: SKILLCIMA_EMAIL_ORIGIN,
          mainSiteBaseUrl: PIPSTART_EMAIL_ORIGIN,
        });
      } catch {
        return permanentFailure("COURSE_LESSON_CONTENT_COMPOSITION_INVALID");
      }

      const send =
        dependencies.sendEmailWithResend ?? sendCourseLessonWithResend;

      let provider: ResendEmailResult;

      try {
        provider = await send(env, {
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
