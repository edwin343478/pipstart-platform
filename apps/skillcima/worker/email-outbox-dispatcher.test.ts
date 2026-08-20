import { afterEach, describe, expect, it, vi } from "vitest";

import type { EmailQueueBinding } from "./email-queue";
import { dispatchEmailOutbox } from "./email-outbox-dispatcher";

const env = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-secret",
};

const now = new Date("2026-08-20T09:00:00.000Z");

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

describe("Skillcima email outbox dispatcher", () => {
  it("returns misconfigured without touching the queue", async () => {
    const queue: EmailQueueBinding = {
      send: vi.fn(),
    };

    const result = await dispatchEmailOutbox(
      {
        SUPABASE_URL: "",
        SUPABASE_SECRET_KEY: "",
      },
      queue,
      { now },
    );

    expect(result).toEqual({
      status: "misconfigured",
    });

    expect(queue.send).not.toHaveBeenCalled();
  });

  it("sends a minimal message and marks the job queued", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: "11111111-1111-4111-8111-111111111111",
            job_type: "course_confirmation",
            status: "pending",
            attempt_count: 0,
            available_at: "2026-08-20T08:59:00.000Z",
          },
        ]),
      )
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: "11111111-1111-4111-8111-111111111111",
            status: "queued",
          },
        ]),
      );

    const send = vi.fn().mockResolvedValue(undefined);

    const result = await dispatchEmailOutbox(env, { send }, { now });

    expect(result).toEqual({
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
      jobId: "11111111-1111-4111-8111-111111111111",
      jobType: "course_confirmation",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const patchRequest = fetchMock.mock.calls[1];

    expect(patchRequest?.[1]).toMatchObject({
      method: "PATCH",
    });

    expect(
      JSON.parse(String((patchRequest?.[1] as RequestInit).body)),
    ).toMatchObject({
      status: "queued",
      queued_at: "2026-08-20T09:00:00.000Z",
      last_error_code: null,
    });
  });

  it("leaves the job retryable when Queue send fails", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse([
        {
          id: "22222222-2222-4222-8222-222222222222",
          job_type: "course_confirmation",
          status: "pending",
          attempt_count: 0,
          available_at: "2026-08-20T08:59:00.000Z",
        },
      ]),
    );

    const send = vi.fn().mockRejectedValue(new Error("Queue unavailable"));

    const result = await dispatchEmailOutbox(env, { send }, { now });

    expect(result).toEqual({
      status: "completed",
      selected: 1,
      sent: 0,
      markedQueued: 0,
      queueFailures: 1,
      stateUpdateFailures: 0,
    });

    // Only the initial database lookup occurred.
    // No queued status was written.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports an unconfirmed state update after a successful Queue send", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse([
          {
            id: "33333333-3333-4333-8333-333333333333",
            job_type: "course_confirmation",
            status: "failed",
            attempt_count: 1,
            available_at: "2026-08-20T08:59:00.000Z",
          },
        ]),
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 503,
        }),
      );

    const send = vi.fn().mockResolvedValue(undefined);

    const result = await dispatchEmailOutbox(env, { send }, { now });

    expect(result).toEqual({
      status: "completed",
      selected: 1,
      sent: 1,
      markedQueued: 0,
      queueFailures: 0,
      stateUpdateFailures: 1,
    });

    expect(send).toHaveBeenCalledTimes(1);
  });

  it("does nothing when no email jobs are eligible", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([]));

    const send = vi.fn();

    const result = await dispatchEmailOutbox(
      env,
      { send },
      {
        now,
        limit: 10,
      },
    );

    expect(result).toEqual({
      status: "completed",
      selected: 0,
      sent: 0,
      markedQueued: 0,
      queueFailures: 0,
      stateUpdateFailures: 0,
    });

    expect(send).not.toHaveBeenCalled();
  });
});
