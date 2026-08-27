import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SKILLCIMA_EMAIL_QUEUE_JOB_TYPES,
  type EmailQueueBinding,
} from "./email-queue";
import { dispatchEmailOutbox } from "./email-outbox-dispatcher";

const env = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-secret",
};

const now = new Date("2026-08-27T08:00:00.000Z");

const jobId = "11111111-1111-4111-8111-111111111111";

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

describe("Skillcima five-day outbox dispatcher job types", () => {
  it.each(SKILLCIMA_EMAIL_QUEUE_JOB_TYPES)(
    "dispatches %s using the unchanged minimal Queue envelope",
    async (jobType) => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          jsonResponse([
            {
              id: jobId,
              job_type: jobType,
              status: "pending",
              attempt_count: 0,
              available_at: "2026-08-27T07:59:00.000Z",
            },
          ]),
        )
        .mockResolvedValueOnce(
          jsonResponse([
            {
              id: jobId,
              status: "queued",
            },
          ]),
        );

      const send = vi.fn().mockResolvedValue(undefined);

      const queue: EmailQueueBinding = {
        send,
      };

      await expect(
        dispatchEmailOutbox(env, queue, {
          now,
        }),
      ).resolves.toEqual({
        status: "completed",
        selected: 1,
        sent: 1,
        markedQueued: 1,
        queueFailures: 0,
        stateUpdateFailures: 0,
      });

      expect(send).toHaveBeenCalledTimes(1);

      expect(send).toHaveBeenCalledWith({
        version: 1,
        jobId,
        jobType,
      });

      expect(Object.keys(send.mock.calls[0]?.[0] ?? {}).sort()).toEqual([
        "jobId",
        "jobType",
        "version",
      ]);

      expect(fetchMock).toHaveBeenCalledTimes(2);

      const patchRequest = fetchMock.mock.calls[1];

      expect(patchRequest?.[1]).toMatchObject({
        method: "PATCH",
      });

      expect(
        JSON.parse(String((patchRequest?.[1] as RequestInit).body)),
      ).toMatchObject({
        status: "queued",
        queued_at: now.toISOString(),
        last_error_code: null,
      });
    },
  );

  it("rejects an unsupported database job type before Queue delivery", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          id: jobId,
          job_type: "unsupported_email_workflow",
          status: "pending",
          attempt_count: 0,
          available_at: "2026-08-27T07:59:00.000Z",
        },
      ]),
    );

    const send = vi.fn();

    await expect(
      dispatchEmailOutbox(
        env,
        {
          send,
        },
        {
          now,
        },
      ),
    ).resolves.toEqual({
      status: "unavailable",
      stage: "lookup",
    });

    expect(send).not.toHaveBeenCalled();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
