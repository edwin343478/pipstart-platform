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

  SKILLCIMA_UNSUBSCRIBE_TOKEN_SECRET:
    "test-unsubscribe-secret-aaaaaaaaaaaaaaaa",

  RESEND_API_KEY: "re_test_fake_key",
  RESEND_WEBHOOK_SECRET: "whsec_dGVzdC1zZWNyZXQ=",

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
  it("routes malformed primary Queue messages through the normal batch handler and ACKs them", async () => {
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
        queue: "skillcima-email",
        messages: [message],
      },
      env,
    );

    expect(message.ack).toHaveBeenCalledTimes(1);

    expect(message.retry).not.toHaveBeenCalled();

    expect(fetchMock).not.toHaveBeenCalled();

    expect(logMock).toHaveBeenCalledWith(
      expect.stringContaining('"deliveryMode":"confirmation_email"'),
    );
  });

  it("runs a claimed primary confirmation job through provider acceptance and sent-state persistence", async () => {
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
      .mockResolvedValueOnce(
        jsonResponse({
          id: "provider-message-123",
        }),
      )
      .mockResolvedValueOnce(jsonResponse("sent"));

    vi.spyOn(console, "log").mockImplementation(() => undefined);

    const message = createMessage({
      version: 1,
      jobId: "11111111-1111-4111-8111-111111111111",
      jobType: "course_confirmation",
    });

    await worker.queue(
      {
        queue: "skillcima-email",
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
  });

  it("releases and retries a primary job when confirmation delivery is not configured", async () => {
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
        queue: "skillcima-email",
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
  });

  it("routes a platform DLQ message directly to database dead-letter reconciliation without delivery", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse("dead_letter"));

    const logMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    const message = createMessage({
      version: 1,
      jobId: "44444444-4444-4444-8444-444444444444",
      jobType: "course_confirmation",
    });

    await worker.queue(
      {
        queue: "skillcima-email-dlq",
        messages: [message],
      },
      env,
    );

    expect(message.ack).toHaveBeenCalledTimes(1);

    expect(message.retry).not.toHaveBeenCalled();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] ?? [];

    expect(String(requestUrl)).toContain(
      "/rest/v1/rpc/skillcima_mark_email_job_dead_letter",
    );

    expect(JSON.parse(String(requestInit?.body))).toEqual({
      p_job_id: "44444444-4444-4444-8444-444444444444",
      p_error_code: "CLOUDFLARE_QUEUE_RETRIES_EXHAUSTED",
    });

    expect(String(requestUrl)).not.toContain("skillcima_claim_email_job");

    expect(
      fetchMock.mock.calls.some(
        ([input]) => String(input) === "https://api.resend.com/emails",
      ),
    ).toBe(false);

    expect(logMock).toHaveBeenCalledWith(
      expect.stringContaining('"event":"email_queue_dlq_batch_completed"'),
    );
  });

  it("retries an unexpected Queue name rather than processing it with the wrong handler", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const errorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const message = createMessage({
      version: 1,
      jobId: "55555555-5555-4555-8555-555555555555",
      jobType: "course_confirmation",
    });

    await worker.queue(
      {
        queue: "unexpected-email-queue",
        messages: [message],
      },
      env,
    );

    expect(message.ack).not.toHaveBeenCalled();

    expect(message.retry).toHaveBeenCalledWith({
      delaySeconds: 300,
    });

    expect(fetchMock).not.toHaveBeenCalled();

    expect(errorMock).toHaveBeenCalledWith(
      expect.stringContaining('"event":"email_queue_unknown_batch"'),
    );
  });
});
