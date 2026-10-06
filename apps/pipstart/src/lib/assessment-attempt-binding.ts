import { toPublicAssessment, type AssessmentDefinition } from "./assessment";

export type StoredAssessmentIdentity = {
  quiz_id: string;
  quiz_version: number;
  passing_percentage: number;
  public_snapshot: unknown;
};

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/** Resolve from the owned row first; client references are only a consistency check. */
export function requireBoundAssessment(
  row: StoredAssessmentIdentity,
  reference: { quizId: string; version: number },
  resolve: (id: string, version: number) => AssessmentDefinition | undefined,
): AssessmentDefinition {
  if (
    row.quiz_id !== reference.quizId ||
    row.quiz_version !== reference.version
  ) {
    throw new Error(
      "This quiz does not match the saved attempt. Reload the quiz.",
    );
  }
  const assessment = resolve(row.quiz_id, row.quiz_version);
  if (!assessment || !["published", "retired"].includes(assessment.status)) {
    throw new Error("The saved quiz version is unavailable.");
  }
  if (
    row.passing_percentage !== assessment.passingPercentage ||
    canonical(row.public_snapshot) !== canonical(toPublicAssessment(assessment))
  ) {
    throw new Error(
      "The saved quiz version has changed. Reload the quiz or contact support.",
    );
  }
  return assessment;
}
