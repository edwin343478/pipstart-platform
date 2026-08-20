import { describe, expect, it } from "vitest";

import {
  createEmailQueueMessage,
  SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION,
} from "./email-queue";

describe("Skillcima email queue message contract", () => {
  it("creates a versioned course confirmation message", () => {
    expect(
      createEmailQueueMessage({
        jobId: "11111111-1111-4111-8111-111111111111",
        jobType: "course_confirmation",
      }),
    ).toEqual({
      version: SKILLCIMA_EMAIL_QUEUE_MESSAGE_VERSION,
      jobId: "11111111-1111-4111-8111-111111111111",
      jobType: "course_confirmation",
    });
  });

  it("does not include lead PII or email-delivery content", () => {
    const message = createEmailQueueMessage({
      jobId: "11111111-1111-4111-8111-111111111111",
      jobType: "course_confirmation",
    });

    expect(Object.keys(message).sort()).toEqual([
      "jobId",
      "jobType",
      "version",
    ]);

    expect(message).not.toHaveProperty("email");
    expect(message).not.toHaveProperty("firstName");
    expect(message).not.toHaveProperty("confirmationToken");
  });
});
