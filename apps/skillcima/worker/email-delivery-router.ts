import type {
  EmailDeliveryAdapter,
  EmailDeliveryInput,
  EmailDeliveryResult,
} from "./email-queue-processor";

export interface EmailDeliveryRouterDependencies {
  confirmationDelivery: EmailDeliveryAdapter;
  courseLessonDelivery?: EmailDeliveryAdapter;
}

function courseLessonDeliveryNotEnabled(): EmailDeliveryResult {
  return {
    status: "permanent_failure",
    errorCode: "COURSE_LESSON_DELIVERY_NOT_ENABLED",
  };
}

export function createEmailDeliveryRouter(
  dependencies: EmailDeliveryRouterDependencies,
): EmailDeliveryAdapter {
  return {
    async deliver(input: EmailDeliveryInput): Promise<EmailDeliveryResult> {
      if (input.jobType === "course_confirmation") {
        return dependencies.confirmationDelivery.deliver(input);
      }

      if (!dependencies.courseLessonDelivery) {
        return courseLessonDeliveryNotEnabled();
      }

      return dependencies.courseLessonDelivery.deliver(input);
    },
  };
}
