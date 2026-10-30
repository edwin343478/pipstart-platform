import "server-only";

// M22 MP04b private projection: staff-only shapes that keep answer keys, explanations,
// governance and every status. Never imported by a client component or a public route
// (enforced by the content boundary test). The MP04b-2 database adapter adds drafts and
// review decisions from the MP04a store.
import type { AssessmentDefinition } from "../assessment";
import { assessmentRegistry } from "../assessment-registry";

export type PrivateQuiz = AssessmentDefinition;

/** Every quiz version in code, whatever its status, with its answer key. */
export function listPrivateQuizzes(): readonly PrivateQuiz[] {
  return assessmentRegistry;
}
