import type { ProgressSnapshot } from "./permanent-progress";

export type ProgressSaveTransition = {
  message: string;
  retryComplete: boolean | null;
  snapshot: ProgressSnapshot;
  state: "error" | "saved";
};

export function createOptimisticProgress(
  previous: ProgressSnapshot,
  lessonId: string,
  complete: boolean,
  now = new Date().toISOString(),
): ProgressSnapshot {
  const record = previous.lessons.find((item) => item.lessonId === lessonId);
  return {
    ...previous,
    lessons: [
      ...previous.lessons.filter((item) => item.lessonId !== lessonId),
      {
        completedAt: complete ? now : null,
        isComplete: complete,
        lastVisitedAt: now,
        lessonId,
        revision: record?.revision ?? 0,
      },
    ],
  };
}

export async function runProgressSave({
  complete,
  lessonId,
  onOptimistic,
  persist,
  previous,
}: {
  complete: boolean;
  lessonId: string;
  onOptimistic: (snapshot: ProgressSnapshot) => void;
  persist: () => Promise<ProgressSnapshot>;
  previous: ProgressSnapshot;
}): Promise<ProgressSaveTransition> {
  onOptimistic(createOptimisticProgress(previous, lessonId, complete));
  try {
    return {
      message: "Progress saved to your account.",
      retryComplete: null,
      snapshot: await persist(),
      state: "saved",
    };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Progress was not saved.",
      retryComplete: complete,
      snapshot: previous,
      state: "error",
    };
  }
}
