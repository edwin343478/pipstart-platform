import { describe, expect, it, vi } from "vitest";

import {
  SKILLCIMA_EMAIL_QUEUE_JOB_TYPES,
  type SkillcimaEmailQueueJobType,
} from "./email-queue";
import {
  createEmailDeliveryRouter,
  type EmailDeliveryRouterDependencies,
} from "./email-delivery-router";
import type {
  EmailDeliveryAdapter,
  EmailDeliveryInput,
  EmailDeliveryResult,
} from "./email-queue-processor";

const jobId = "11111111-1111-4111-8111-111111111111";

type CourseDayJobType = Exclude<
  SkillcimaEmailQueueJobType,
  "course_confirmation"
>;

const courseDayJobTypes = SKILLCIMA_EMAIL_QUEUE_JOB_TYPES.filter(
  (jobType): jobType is CourseDayJobType => jobType !== "course_confirmation",
);

function createDeliveryMock(
  result: EmailDeliveryResult = {
    status: "accepted",
    providerMessageId: "test-provider-message-id",
  },
) {
  const deliver = vi.fn(async (): Promise<EmailDeliveryResult> => result);

  const adapter: EmailDeliveryAdapter = {
    deliver,
  };

  return {
    adapter,
    deliver,
  };
}

function createInput(jobType: SkillcimaEmailQueueJobType): EmailDeliveryInput {
  return {
    jobId,
    jobType,
    idempotencyKey: `skillcima/${jobType}/${jobId}`,
  };
}

describe("Skillcima email delivery router", () => {
  it("preserves the existing confirmation delivery path unchanged", async () => {
    const confirmation = createDeliveryMock();

    const router = createEmailDeliveryRouter({
      confirmationDelivery: confirmation.adapter,
    });

    const input = createInput("course_confirmation");

    await expect(router.deliver(input)).resolves.toEqual({
      status: "accepted",
      providerMessageId: "test-provider-message-id",
    });

    expect(confirmation.deliver).toHaveBeenCalledTimes(1);
    expect(confirmation.deliver).toHaveBeenCalledWith(input);
  });

  it("keeps exactly six course-day routes in this foundation", () => {
    expect(courseDayJobTypes).toEqual([
      "course_day_1",
      "course_day_2",
      "course_day_3",
      "course_day_4",
      "course_day_5",
      "course_day_6",
    ]);
  });

  it.each(courseDayJobTypes)(
    "fails closed for %s until course lesson delivery is explicitly enabled",
    async (jobType) => {
      const confirmation = createDeliveryMock();

      const router = createEmailDeliveryRouter({
        confirmationDelivery: confirmation.adapter,
      });

      await expect(router.deliver(createInput(jobType))).resolves.toEqual({
        status: "permanent_failure",
        errorCode: "COURSE_LESSON_DELIVERY_NOT_ENABLED",
      });

      expect(confirmation.deliver).not.toHaveBeenCalled();
    },
  );

  it.each(courseDayJobTypes)(
    "routes %s only to an explicitly supplied course lesson adapter",
    async (jobType) => {
      const confirmation = createDeliveryMock();

      const courseLesson = createDeliveryMock();

      const dependencies: EmailDeliveryRouterDependencies = {
        confirmationDelivery: confirmation.adapter,
        courseLessonDelivery: courseLesson.adapter,
      };

      const router = createEmailDeliveryRouter(dependencies);

      const input = createInput(jobType);

      await expect(router.deliver(input)).resolves.toEqual({
        status: "accepted",
        providerMessageId: "test-provider-message-id",
      });

      expect(courseLesson.deliver).toHaveBeenCalledTimes(1);
      expect(courseLesson.deliver).toHaveBeenCalledWith(input);

      expect(confirmation.deliver).not.toHaveBeenCalled();
    },
  );

  it("never sends a confirmation job to the course lesson adapter", async () => {
    const confirmation = createDeliveryMock();

    const courseLesson = createDeliveryMock();

    const router = createEmailDeliveryRouter({
      confirmationDelivery: confirmation.adapter,
      courseLessonDelivery: courseLesson.adapter,
    });

    const input = createInput("course_confirmation");

    await router.deliver(input);

    expect(confirmation.deliver).toHaveBeenCalledWith(input);
    expect(courseLesson.deliver).not.toHaveBeenCalled();
  });
});
