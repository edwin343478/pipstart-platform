import { afterEach, describe, expect, it, vi } from "vitest";

import worker from "./index";
import type {
  EmailQueueRuntimeMessage,
  QueueRetryOptions,
} from "./email-queue-batch";

const env = {
  TURNSTILE_SECRET_KEY: "test-turnstile",

  SUPABASE_URL: "https://example.supabase.co",

  SUPABASE_SECRET_KEY: "test-secret",

  SKILLCIMA_CONFIRMATION_TOKEN_SECRET:
    "test-confirmation-secret-aaaaaaaaaaaaaaaa",

  RESEND_API_KEY: "re_test_fake_key",

  SKILLCIMA_EMAIL_FROM: "Skillcima <course@skillcima.com>",

  SKILLCIMA_PUBLIC_ORIGIN: "https://skillcima.com",

  LEAD_RATE_LIMITER: {
    async limit() {
      return {
        success: true,
      };
    },
  },

  SKILLCIMA_EMAIL_QUEUE: {
    async send() {
      return;
    },
  },
};

function createMessage(body: unknown, attempts = 1) {
  const ack = vi.fn<() => void>();

  const retry = vi.fn<(options?: QueueRetryOptions) => void>();

  return {
    body,
    attempts,
    ack,
    retry,
  } satisfies EmailQueueRuntimeMessage;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Skillcima Worker Queue runtime", () => {
  it("routes malformed Queue messages through the batch handler and ACKs them", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const logMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    const message = createMessage({
      version: 99,
      jobId: "not-a-valid-job-id",
      jobType: "course_confirmation",
    });

    await worker.queue(
      {
        messages: [message],
      },
      env,
    );

    expect(message.ack).toHaveBeenCalledTimes(1);

    expect(message.retry).not.toHaveBeenCalled();

    expect(fetchMock).not.toHaveBeenCalled();

    expect(logMock).toHaveBeenCalledWith(
      expect.stringContaining('"event":"email_queue_batch_completed"'),
    );

    expect(logMock).toHaveBeenCalledWith(
      expect.stringContaining('"deliveryMode":"confirmation_email"'),
    );
  });

  it("runs a claimed confirmation job through preparation, provider acceptance, and sent-state persistence", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")

      // 1. Claim email job.
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "claimed",
            result_attempt_count: 1,
          },
        ]),
      )

      // 2. Prepare confirmation delivery.
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "prepared",
            result_email: "learner@example.com",
            result_first_name: "Amina",
            result_course_slug: "forex-foundations",
            result_enrolment_id: "22222222-2222-4222-8222-222222222222",
            result_confirmation_expires_at: "2099-08-21T12:00:00.000Z",
          },
        ]),
      )

      // 3. Resend accepts the email.
      .mockResolvedValueOnce(
        jsonResponse({
          id: "provider-message-123",
        }),
      )

      // 4. Persist sent state.
      .mockResolvedValueOnce(jsonResponse("sent"));

    const logMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    const message = createMessage({
      version: 1,
      jobId: "11111111-1111-4111-8111-111111111111",
      jobType: "course_confirmation",
    });

    await worker.queue(
      {
        messages: [message],
      },
      env,
    );

    expect(message.ack).toHaveBeenCalledTimes(1);

    expect(message.retry).not.toHaveBeenCalled();

    expect(fetchMock).toHaveBeenCalledTimes(4);

    const urls = fetchMock.mock.calls.map(([input]) => String(input));

    expect(urls[0]).toContain("/rest/v1/rpc/skillcima_claim_email_job");

    expect(urls[1]).toContain(
      "/rest/v1/rpc/skillcima_prepare_confirmation_email",
    );

    expect(urls[2]).toBe("https://api.resend.com/emails");

    expect(urls[3]).toContain("/rest/v1/rpc/skillcima_mark_email_job_sent");

    expect(
      urls.some((url) =>
        url.includes("/rest/v1/rpc/skillcima_release_email_job"),
      ),
    ).toBe(false);

    const resendRequest = fetchMock.mock.calls[2]?.[1];

    expect(resendRequest?.headers).toEqual(
      expect.objectContaining({
        "Idempotency-Key":
          "skillcima/course_confirmation/11111111-1111-4111-8111-111111111111",
      }),
    );

    const resendBody = JSON.parse(String(resendRequest?.body)) as {
      to: string[];
      subject: string;
      html: string;
      text: string;
    };

    expect(resendBody.to).toEqual(["learner@example.com"]);

    expect(resendBody.subject).toContain("Confirm");

    expect(resendBody.html).toContain("/confirm?token=");

    expect(resendBody.text).toContain("/confirm?token=");

    expect(logMock).toHaveBeenCalledWith(
      expect.stringContaining('"deliveryMode":"confirmation_email"'),
    );
  });

  it("releases and retries a claimed job when confirmation delivery is not configured", async () => {
    const incompleteEnv = {
      ...env,

      SKILLCIMA_CONFIRMATION_TOKEN_SECRET: "",
    };

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse([
          {
            result_status: "claimed",
            result_attempt_count: 1,
          },
        ]),
      )
      .mockResolvedValueOnce(jsonResponse("queued"));

    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const message = createMessage({
      version: 1,
      jobId: "33333333-3333-4333-8333-333333333333",
      jobType: "course_confirmation",
    });

    await worker.queue(
      {
        messages: [message],
      },
      incompleteEnv,
    );

    expect(message.ack).not.toHaveBeenCalled();

    expect(message.retry).toHaveBeenCalledWith({
      delaySeconds: 300,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const urls = fetchMock.mock.calls.map(([input]) => String(input));

    expect(urls[0]).toContain("/rest/v1/rpc/skillcima_claim_email_job");

    expect(urls[1]).toContain("/rest/v1/rpc/skillcima_release_email_job");

    expect(urls.some((url) => url === "https://api.resend.com/emails")).toBe(
      false,
    );

    expect(
      urls.some((url) =>
        url.includes("/rest/v1/rpc/skillcima_mark_email_job_sent"),
      ),
    ).toBe(false);
  });
});
