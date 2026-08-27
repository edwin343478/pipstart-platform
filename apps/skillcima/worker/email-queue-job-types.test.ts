import { describe, expect, it } from "vitest";

import {
  createEmailQueueMessage,
  isSkillcimaEmailQueueJobType,
  SKILLCIMA_EMAIL_QUEUE_JOB_TYPES,
  SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION,
} from "./email-queue";
import { parseQueueMessage } from "./email-queue-processor";

const jobId = "11111111-1111-4111-8111-111111111111";

describe("Skillcima five-day email Queue job-type contract", () => {
  it.each(SKILLCIMA_EMAIL_QUEUE_JOB_TYPES)(
    "creates and parses %s without changing the Queue envelope",
    (jobType) => {
      const message = createEmailQueueMessage({
        jobId,
        jobType,
      });

      expect(message).toEqual({
        version: SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION,
        jobId,
        jobType,
      });

      expect(Object.keys(message).sort()).toEqual([
        "jobId",
        "jobType",
        "version",
      ]);

      expect(isSkillcimaEmailQueueJobType(jobType)).toBe(true);

      expect(parseQueueMessage(message)).toEqual(message);
    },
  );

  it("rejects unsupported email workflow types at runtime", () => {
    expect(isSkillcimaEmailQueueJobType("unsupported_email_workflow")).toBe(
      false,
    );

    expect(
      parseQueueMessage({
        version: SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION,
        jobId,
        jobType: "unsupported_email_workflow",
      }),
    ).toBeNull();
  });

  it("does not weaken version, UUID, or exact-envelope validation", () => {
    expect(
      parseQueueMessage({
        version: 99,
        jobId,
        jobType: "course_day_1",
      }),
    ).toBeNull();

    expect(
      parseQueueMessage({
        version: SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION,
        jobId: "not-a-uuid",
        jobType: "course_day_1",
      }),
    ).toBeNull();

    expect(
      parseQueueMessage({
        version: SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION,
        jobId,
        jobType: "course_day_1",
        email: "must-not-be-in-queue@example.com",
      }),
    ).toBeNull();
  });
});
