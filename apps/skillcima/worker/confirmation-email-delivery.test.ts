import { describe, expect, it, vi } from "vitest";

import { prepareConfirmationDelivery } from "./confirmation-delivery";
import { composeConfirmationEmail } from "./confirmation-email";
import {
  createConfirmationEmailDelivery,
  type ConfirmationEmailDeliveryDependencies,
  type ConfirmationEmailDeliveryEnv,
} from "./confirmation-email-delivery";
import { sendEmailWithResend } from "./resend-email";
import type { EmailDeliveryInput } from "./email-queue-processor";

const jobId = "11111111-1111-4111-8111-111111111111";

const enrolmentId = "22222222-2222-4222-8222-222222222222";

const confirmationToken = "a".repeat(64);

const confirmationTokenHash = "b".repeat(64);

const env: ConfirmationEmailDeliveryEnv = {
  SUPABASE_URL: "https://example.supabase.co",

  SUPABASE_SECRET_KEY: "test-supabase-secret",

  SKILLCIMA_CONFIRMATION_TOKEN_SECRET:
    "test-confirmation-secret-aaaaaaaaaaaaaaaa",

  RESEND_API_KEY: "re_test_fake_key",

  SKILLCIMA_EMAIL_FROM: "Skillcima <course@skillcima.com>",

  SKILLCIMA_PUBLIC_ORIGIN: "https://skillcima.com",
};

const input: EmailDeliveryInput = {
  jobId,
  jobType: "course_confirmation",
  idempotencyKey: `skillcima/course_confirmation/${jobId}`,
};

const preparedResult = {
  status: "ready" as const,
  recipientEmail: "learner@example.com",
  firstName: "Amina",
  courseSlug: "forex-foundations",
  enrolmentId,
  confirmationToken,
  confirmationTokenHash,
  confirmationExpiresAt: "2026-08-21T12:00:00.000Z",
};

const composedResult = {
  status: "ready" as const,
  subject: "Confirm your free Skillcima Forex Foundations course",
  text: "Confirm your course",
  html: "<p>Confirm your course</p>",
  confirmationUrl: `https://skillcima.com/confirm?token=${confirmationToken}`,
};

function createDependencies(
  overrides: Partial<ConfirmationEmailDeliveryDependencies> = {},
): ConfirmationEmailDeliveryDependencies {
  const defaults: ConfirmationEmailDeliveryDependencies = {
    prepareConfirmationDelivery: vi
      .fn<typeof prepareConfirmationDelivery>()
      .mockResolvedValue(preparedResult),

    composeConfirmationEmail: vi
      .fn<typeof composeConfirmationEmail>()
      .mockReturnValue(composedResult),

    sendEmailWithResend: vi.fn<typeof sendEmailWithResend>().mockResolvedValue({
      status: "accepted",
      providerMessageId: "provider-message-123",
    }),
  };

  return {
    ...defaults,
    ...overrides,
  };
}

describe("Skillcima complete confirmation email delivery", () => {
  it("prepares, composes, and sends one confirmation email using the Queue idempotency key", async () => {
    const dependencies = createDependencies();

    const delivery = createConfirmationEmailDelivery(env, dependencies);

    await expect(delivery.deliver(input)).resolves.toEqual({
      status: "accepted",
    });

    expect(dependencies.prepareConfirmationDelivery).toHaveBeenCalledWith(
      env,
      jobId,
    );

    expect(dependencies.composeConfirmationEmail).toHaveBeenCalledWith({
      publicOrigin: "https://skillcima.com",
      firstName: "Amina",
      courseSlug: "forex-foundations",
      confirmationToken,
      confirmationExpiresAt: "2026-08-21T12:00:00.000Z",
    });

    expect(dependencies.sendEmailWithResend).toHaveBeenCalledWith(env, {
      to: "learner@example.com",
      subject: composedResult.subject,
      html: composedResult.html,
      text: composedResult.text,
      idempotencyKey: input.idempotencyKey,
    });
  });

  it("turns confirmation preparation outages into retryable failures", async () => {
    const delivery = createConfirmationEmailDelivery(
      env,
      createDependencies({
        prepareConfirmationDelivery: vi
          .fn<typeof prepareConfirmationDelivery>()
          .mockResolvedValue({
            status: "unavailable",
            httpStatus: 503,
          }),
      }),
    );

    await expect(delivery.deliver(input)).resolves.toEqual({
      status: "temporary_failure",
      errorCode: "CONFIRMATION_DELIVERY_UNAVAILABLE",
    });
  });

  it("treats an invalid job-state race as retryable", async () => {
    const delivery = createConfirmationEmailDelivery(
      env,
      createDependencies({
        prepareConfirmationDelivery: vi
          .fn<typeof prepareConfirmationDelivery>()
          .mockResolvedValue({
            status: "invalid_job_state",
          }),
      }),
    );

    await expect(delivery.deliver(input)).resolves.toEqual({
      status: "temporary_failure",
      errorCode: "CONFIRMATION_JOB_STATE_RACE",
    });
  });

  it("never calls the composer or Resend for an expired preserved confirmation link", async () => {
    const composeMock = vi.fn<typeof composeConfirmationEmail>();

    const sendMock = vi.fn<typeof sendEmailWithResend>();

    const delivery = createConfirmationEmailDelivery(
      env,
      createDependencies({
        prepareConfirmationDelivery: vi
          .fn<typeof prepareConfirmationDelivery>()
          .mockResolvedValue({
            status: "expired",
          }),

        composeConfirmationEmail: composeMock,

        sendEmailWithResend: sendMock,
      }),
    );

    await expect(delivery.deliver(input)).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "CONFIRMATION_LINK_EXPIRED",
    });

    expect(composeMock).not.toHaveBeenCalled();

    expect(sendMock).not.toHaveBeenCalled();
  });
  it("treats confirmation-token mismatches as permanent failures", async () => {
    const delivery = createConfirmationEmailDelivery(
      env,
      createDependencies({
        prepareConfirmationDelivery: vi
          .fn<typeof prepareConfirmationDelivery>()
          .mockResolvedValue({
            status: "token_mismatch",
          }),
      }),
    );

    await expect(delivery.deliver(input)).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "CONFIRMATION_TOKEN_MISMATCH",
    });
  });

  it("does not call Resend when email composition is invalid", async () => {
    const sendMock = vi.fn<typeof sendEmailWithResend>();

    const delivery = createConfirmationEmailDelivery(
      env,
      createDependencies({
        composeConfirmationEmail: vi
          .fn<typeof composeConfirmationEmail>()
          .mockReturnValue({
            status: "invalid_input",
          }),

        sendEmailWithResend: sendMock,
      }),
    );

    await expect(delivery.deliver(input)).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "CONFIRMATION_EMAIL_INVALID",
    });

    expect(sendMock).not.toHaveBeenCalled();
  });

  it("preserves retryable Resend failures", async () => {
    const delivery = createConfirmationEmailDelivery(
      env,
      createDependencies({
        sendEmailWithResend: vi
          .fn<typeof sendEmailWithResend>()
          .mockResolvedValue({
            status: "temporary_failure",
            errorCode: "RESEND_RATE_LIMITED",
            httpStatus: 429,
          }),
      }),
    );

    await expect(delivery.deliver(input)).resolves.toEqual({
      status: "temporary_failure",
      errorCode: "RESEND_RATE_LIMITED",
    });
  });

  it("preserves permanent Resend failures", async () => {
    const delivery = createConfirmationEmailDelivery(
      env,
      createDependencies({
        sendEmailWithResend: vi
          .fn<typeof sendEmailWithResend>()
          .mockResolvedValue({
            status: "permanent_failure",
            errorCode: "RESEND_REQUEST_REJECTED",
            httpStatus: 422,
          }),
      }),
    );

    await expect(delivery.deliver(input)).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "RESEND_REQUEST_REJECTED",
    });
  });

  it("treats missing Resend configuration as retryable rather than silently losing the job", async () => {
    const delivery = createConfirmationEmailDelivery(
      env,
      createDependencies({
        sendEmailWithResend: vi
          .fn<typeof sendEmailWithResend>()
          .mockResolvedValue({
            status: "misconfigured",
          }),
      }),
    );

    await expect(delivery.deliver(input)).resolves.toEqual({
      status: "temporary_failure",
      errorCode: "RESEND_NOT_CONFIGURED",
    });
  });

  it("treats Resend input rejection as a permanent application failure", async () => {
    const delivery = createConfirmationEmailDelivery(
      env,
      createDependencies({
        sendEmailWithResend: vi
          .fn<typeof sendEmailWithResend>()
          .mockResolvedValue({
            status: "invalid_input",
          }),
      }),
    );

    await expect(delivery.deliver(input)).resolves.toEqual({
      status: "permanent_failure",
      errorCode: "RESEND_INVALID_INPUT",
    });
  });
});
