import { describe, expect, it, vi } from "vitest";

import { prepareCourseLessonDelivery } from "./course-lesson-delivery";
import {
  createCourseLessonEmailDelivery,
  type CourseLessonEmailDeliveryDependencies,
} from "./course-lesson-email-delivery";
import type { SkillcimaEmailQueueJobType } from "./email-queue";
import type { EmailDeliveryInput } from "./email-queue-processor";
import type { SupabaseEnv } from "./supabase";

const env: SupabaseEnv = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-service-role-secret",
};

const jobId = "11111111-1111-4111-8111-111111111111";

const dayJobTypes = [
  "course_day_1",
  "course_day_2",
  "course_day_3",
  "course_day_4",
  "course_day_5",
  "course_day_6",
] as const;

function input(jobType: SkillcimaEmailQueueJobType): EmailDeliveryInput {
  return {
    jobId,
    jobType,
    idempotencyKey: `skillcima/${jobType}/${jobId}`,
  };
}

function dependencies(
  result: Awaited<ReturnType<typeof prepareCourseLessonDelivery>> = {
    status: "ready",
    recipientEmail: "learner@example.com",
    firstName: "Amina",
    courseSlug: "forex-foundations",
    enrolmentId: "22222222-2222-4222-8222-222222222222",
    confirmedAt: "2026-08-27T10:00:00.000Z",
  },
): CourseLessonEmailDeliveryDependencies {
  return {
    prepareCourseLessonDelivery: vi
      .fn<typeof prepareCourseLessonDelivery>()
      .mockResolvedValue(result),
  };
}

describe("Skillcima course lesson email delivery adapter foundation", () => {
  it("rejects confirmation jobs without touching the lesson read model", async () => {
    const deps = dependencies();

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(
      delivery.deliver(input("course_confirmation")),
    ).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "COURSE_LESSON_JOB_TYPE_INVALID",
    });

    expect(deps.prepareCourseLessonDelivery).not.toHaveBeenCalled();
  });

  it.each(dayJobTypes)(
    "prepares %s and stops at the provider-disabled lock",
    async (jobType) => {
      const deps = dependencies();

      const delivery = createCourseLessonEmailDelivery(env, deps);

      await expect(delivery.deliver(input(jobType))).resolves.toEqual({
        status: "permanent_failure",
        errorCode: "COURSE_LESSON_CONTENT_NOT_ENABLED",
      });

      expect(deps.prepareCourseLessonDelivery).toHaveBeenCalledTimes(1);

      expect(deps.prepareCourseLessonDelivery).toHaveBeenCalledWith(env, jobId);
    },
  );

  it.each([
    [
      "misconfigured",
      "temporary_failure",
      "COURSE_LESSON_DELIVERY_NOT_CONFIGURED",
    ],
    ["unavailable", "temporary_failure", "COURSE_LESSON_DELIVERY_UNAVAILABLE"],
    ["invalid_job_state", "temporary_failure", "COURSE_LESSON_JOB_STATE_RACE"],
    ["invalid_job_id", "permanent_failure", "COURSE_LESSON_JOB_INVALID"],
    ["not_found", "permanent_failure", "COURSE_LESSON_JOB_NOT_FOUND"],
    ["invalid_job_type", "permanent_failure", "COURSE_LESSON_JOB_TYPE_INVALID"],
    ["not_deliverable", "permanent_failure", "COURSE_LESSON_NOT_DELIVERABLE"],
    ["not_confirmed", "permanent_failure", "COURSE_LESSON_NOT_CONFIRMED"],
    [
      "invalid_enrolment_state",
      "permanent_failure",
      "COURSE_LESSON_ENROLMENT_INVALID",
    ],
    [
      "invalid_confirmation_state",
      "permanent_failure",
      "COURSE_LESSON_CONFIRMATION_INVALID",
    ],
  ] as const)(
    "maps preparation status %s to %s",
    async (preparationStatus, deliveryStatus, errorCode) => {
      const deps = dependencies({
        status: preparationStatus,
      } as Awaited<ReturnType<typeof prepareCourseLessonDelivery>>);

      const delivery = createCourseLessonEmailDelivery(env, deps);

      await expect(delivery.deliver(input("course_day_1"))).resolves.toEqual({
        status: deliveryStatus,
        errorCode,
      });
    },
  );

  it("turns preparation exceptions into retryable delivery failures", async () => {
    const deps: CourseLessonEmailDeliveryDependencies = {
      prepareCourseLessonDelivery: vi
        .fn<typeof prepareCourseLessonDelivery>()
        .mockRejectedValue(new Error("unexpected")),
    };

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(delivery.deliver(input("course_day_1"))).resolves.toEqual({
      status: "temporary_failure",
      errorCode: "COURSE_LESSON_PREPARATION_EXCEPTION",
    });
  });

  it("keeps approved content behind the provider-disabled lock", async () => {
    const deps = dependencies();

    deps.getCourseLessonContentStatus = vi.fn().mockReturnValue("approved");

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(delivery.deliver(input("course_day_1"))).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "COURSE_LESSON_CONTENT_NOT_ENABLED",
    });
  });

  it("fails closed for an unsupported course content source", async () => {
    const deps = dependencies();

    deps.getCourseLessonContentStatus = vi.fn().mockReturnValue("unsupported");

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(delivery.deliver(input("course_day_1"))).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "COURSE_LESSON_CONTENT_UNSUPPORTED",
    });
  });
});
