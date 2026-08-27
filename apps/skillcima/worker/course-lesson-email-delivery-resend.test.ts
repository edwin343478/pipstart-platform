import { describe, expect, it, vi } from "vitest";

import {
  createCourseLessonEmailDelivery,
  type CourseLessonEmailDeliveryDependencies,
  type CourseLessonEmailDeliveryEnv,
} from "./course-lesson-email-delivery";
import type { SkillcimaEmailQueueJobType } from "./email-queue";
import type { EmailDeliveryInput } from "./email-queue-processor";

const jobId = "11111111-1111-4111-8111-111111111111";

const env: CourseLessonEmailDeliveryEnv = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-service-role-secret",
  RESEND_API_KEY: "re_test_key",
  SKILLCIMA_EMAIL_FROM: "Skillcima <learn@skillcima.com>",
};

function input(
  jobType: SkillcimaEmailQueueJobType = "course_day_1",
): EmailDeliveryInput {
  return {
    jobId,
    jobType,
    idempotencyKey: `skillcima/${jobType}/${jobId}`,
  };
}

function approvedDependencies(): CourseLessonEmailDeliveryDependencies {
  return {
    prepareCourseLessonDelivery: vi.fn().mockResolvedValue({
      status: "ready",
      recipientEmail: "learner@example.com",
      firstName: "Amina",
      courseSlug: "forex-foundations",
      enrolmentId: "22222222-2222-4222-8222-222222222222",
      confirmedAt: "2026-08-27T10:00:00.000Z",
    }),

    getCourseLessonContentStatus: vi.fn().mockReturnValue("approved"),

    composeCourseLessonEmail: vi.fn().mockReturnValue({
      subject: "Day 1: What Forex Really Is",
      html: "<html><body>Lesson</body></html>",
      text: "Lesson",
      contentVersion: "release-test",
    }),

    sendEmailWithResend: vi.fn().mockResolvedValue({
      status: "accepted",
      providerMessageId: "provider-message-123",
    }),

    enableProviderDelivery: true,
  };
}

describe("course lesson Resend integration", () => {
  it("sends approved content through the proven provider contract", async () => {
    const deps = approvedDependencies();

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(delivery.deliver(input())).resolves.toEqual({
      status: "accepted",
      providerMessageId: "provider-message-123",
    });

    expect(deps.composeCourseLessonEmail).toHaveBeenCalledWith({
      courseSlug: "forex-foundations",
      jobType: "course_day_1",
      firstName: "Amina",
      micrositeBaseUrl: "https://skillcima.com/",
      mainSiteBaseUrl: "https://pipstart.net/",
    });

    expect(deps.sendEmailWithResend).toHaveBeenCalledWith(env, {
      to: "learner@example.com",
      subject: "Day 1: What Forex Really Is",
      html: "<html><body>Lesson</body></html>",
      text: "Lesson",
      idempotencyKey: `skillcima/course_day_1/${jobId}`,
    });
  });

  it("blocks draft content before composition or provider access", async () => {
    const deps = approvedDependencies();

    deps.getCourseLessonContentStatus = vi.fn().mockReturnValue("draft");

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(delivery.deliver(input())).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "COURSE_LESSON_CONTENT_NOT_APPROVED",
    });

    expect(deps.composeCourseLessonEmail).not.toHaveBeenCalled();

    expect(deps.sendEmailWithResend).not.toHaveBeenCalled();
  });

  it("keeps approved content blocked when provider enablement is absent", async () => {
    const deps = approvedDependencies();

    deps.enableProviderDelivery = false;

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(delivery.deliver(input())).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "COURSE_LESSON_CONTENT_NOT_ENABLED",
    });

    expect(deps.composeCourseLessonEmail).not.toHaveBeenCalled();

    expect(deps.sendEmailWithResend).not.toHaveBeenCalled();
  });

  it("preserves provider temporary failures", async () => {
    const deps = approvedDependencies();

    deps.sendEmailWithResend = vi.fn().mockResolvedValue({
      status: "temporary_failure",
      errorCode: "RESEND_RATE_LIMITED",
    });

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(delivery.deliver(input())).resolves.toEqual({
      status: "temporary_failure",
      errorCode: "RESEND_RATE_LIMITED",
    });
  });

  it("preserves provider permanent failures", async () => {
    const deps = approvedDependencies();

    deps.sendEmailWithResend = vi.fn().mockResolvedValue({
      status: "permanent_failure",
      errorCode: "RESEND_REQUEST_REJECTED",
    });

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(delivery.deliver(input())).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "RESEND_REQUEST_REJECTED",
    });
  });

  it("fails closed when composition throws", async () => {
    const deps = approvedDependencies();

    deps.composeCourseLessonEmail = vi.fn(() => {
      throw new Error("invalid content");
    });

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(delivery.deliver(input())).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "COURSE_LESSON_CONTENT_COMPOSITION_INVALID",
    });

    expect(deps.sendEmailWithResend).not.toHaveBeenCalled();
  });

  it("turns provider exceptions into retryable failures", async () => {
    const deps = approvedDependencies();

    deps.sendEmailWithResend = vi
      .fn()
      .mockRejectedValue(new Error("provider unavailable"));

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(delivery.deliver(input())).resolves.toEqual({
      status: "temporary_failure",
      errorCode: "RESEND_DELIVERY_EXCEPTION",
    });
  });

  it("rejects confirmation jobs before preparation, composition, or provider access", async () => {
    const deps = approvedDependencies();

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(
      delivery.deliver(input("course_confirmation")),
    ).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "COURSE_LESSON_JOB_TYPE_INVALID",
    });

    expect(deps.prepareCourseLessonDelivery).not.toHaveBeenCalled();

    expect(deps.composeCourseLessonEmail).not.toHaveBeenCalled();

    expect(deps.sendEmailWithResend).not.toHaveBeenCalled();
  });
  it("maps missing Resend configuration to a retryable failure", async () => {
    const deps = approvedDependencies();

    deps.sendEmailWithResend = vi.fn().mockResolvedValue({
      status: "misconfigured",
    });

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(delivery.deliver(input())).resolves.toEqual({
      status: "temporary_failure",
      errorCode: "RESEND_NOT_CONFIGURED",
    });
  });

  it("maps invalid Resend input to a permanent failure", async () => {
    const deps = approvedDependencies();

    deps.sendEmailWithResend = vi.fn().mockResolvedValue({
      status: "invalid_input",
    });

    const delivery = createCourseLessonEmailDelivery(env, deps);

    await expect(delivery.deliver(input())).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "RESEND_INVALID_INPUT",
    });
  });
});
