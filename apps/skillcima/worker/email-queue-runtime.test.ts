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
      expect.stringContaining('"deliveryMode":"disabled"'),
    );
  });

  it("never marks a claimed job sent while delivery is disabled", async () => {
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
      jobId: "11111111-1111-4111-8111-111111111111",
      jobType: "course_confirmation",
    });

    await worker.queue(
      {
        messages: [message],
      },
      env,
    );

    expect(message.ack).not.toHaveBeenCalled();

    expect(message.retry).toHaveBeenCalledWith({
      delaySeconds: 300,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const urls = fetchMock.mock.calls.map(([url]) => String(url));

    expect(urls[0]).toContain("/rest/v1/rpc/skillcima_claim_email_job");

    expect(urls[1]).toContain("/rest/v1/rpc/skillcima_release_email_job");

    expect(
      urls.some((url) =>
        url.includes("/rest/v1/rpc/skillcima_mark_email_job_sent"),
      ),
    ).toBe(false);
  });
});
