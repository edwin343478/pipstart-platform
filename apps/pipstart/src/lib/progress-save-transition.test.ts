import { describe, expect, it, vi } from "vitest";

import type { ProgressSnapshot } from "./permanent-progress";
import { runProgressSave } from "./progress-save-transition";

const previous: ProgressSnapshot = {
  authenticated: true,
  lessons: [
    {
      completedAt: null,
      isComplete: false,
      lastVisitedAt: "2026-09-16T10:00:00.000Z",
      lessonId: "what-is-forex",
      revision: 3,
    },
  ],
};

const confirmed: ProgressSnapshot = {
  authenticated: true,
  lessons: [
    {
      completedAt: "2026-09-16T10:01:00.000Z",
      isComplete: true,
      lastVisitedAt: "2026-09-16T10:01:00.000Z",
      lessonId: "what-is-forex",
      revision: 4,
    },
  ],
};

describe("Milestone 12 progress save transition", () => {
  it("publishes optimistic completion before persistence resolves", async () => {
    let resolve!: (snapshot: ProgressSnapshot) => void;
    const persist = vi.fn(
      () =>
        new Promise<ProgressSnapshot>((next) => {
          resolve = next;
        }),
    );
    const onOptimistic = vi.fn();
    const pending = runProgressSave({
      complete: true,
      lessonId: "what-is-forex",
      onOptimistic,
      persist,
      previous,
    });

    expect(onOptimistic).toHaveBeenCalledOnce();
    expect(onOptimistic.mock.calls[0]?.[0].lessons[0]?.isComplete).toBe(true);
    resolve(confirmed);
    await expect(pending).resolves.toMatchObject({
      retryComplete: null,
      snapshot: confirmed,
      state: "saved",
    });
  });

  it("rolls back failed saves without reporting a false saved state", async () => {
    const result = await runProgressSave({
      complete: true,
      lessonId: "what-is-forex",
      onOptimistic: vi.fn(),
      persist: vi.fn().mockRejectedValue(new Error("Progress was not saved.")),
      previous,
    });

    expect(result).toEqual({
      message: "Progress was not saved.",
      retryComplete: true,
      snapshot: previous,
      state: "error",
    });
  });

  it("preserves conflict messages and succeeds when the same intent is retried", async () => {
    const first = await runProgressSave({
      complete: true,
      lessonId: "what-is-forex",
      onOptimistic: vi.fn(),
      persist: vi
        .fn()
        .mockRejectedValue(
          new Error(
            "Progress changed on another device. Refresh and try again.",
          ),
        ),
      previous,
    });
    expect(first.state).toBe("error");
    expect(first.retryComplete).toBe(true);
    expect(first.message).toContain("another device");

    const persist = vi.fn().mockResolvedValue(confirmed);
    const retried = await runProgressSave({
      complete: first.retryComplete!,
      lessonId: "what-is-forex",
      onOptimistic: vi.fn(),
      persist,
      previous: first.snapshot,
    });
    expect(persist).toHaveBeenCalledOnce();
    expect(retried).toMatchObject({
      retryComplete: null,
      snapshot: confirmed,
      state: "saved",
    });
  });
});
