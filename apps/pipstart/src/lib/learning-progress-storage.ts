export type LearningProgressPath = "crypto" | "forex";

const legacyStorageKeys: Record<string, string> = {
  "crypto:level-1:bitcoin": "pipstart:learn:crypto:level-1:progress",
  "forex:level-1:forex-kindergarten":
    "pipstart:learn:forex:level-1:progress",
};

export function getLearningProgressStorageKey(
  learningPath: LearningProgressPath,
  levelId: string,
  courseId: string,
) {
  const legacyKey = legacyStorageKeys[
    `${learningPath}:${levelId}:${courseId}`
  ];
  return (
    legacyKey ??
    `pipstart:learn:${learningPath}:${levelId}:${courseId}:progress`
  );
}
