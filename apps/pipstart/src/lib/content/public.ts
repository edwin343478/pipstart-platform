// M22 MP04b public projection: the only shapes a public route may receive. Each one is
// built field by field from an explicit allowlist, so a field added to a private source
// (answer keys, explanations, review notes, drafts) stays private until it is listed here.
import type { AnalysisPost } from "../../app/analysis/posts";
import type { PublishedLesson } from "../../content/lesson-registry";
import type { AssessmentDefinition } from "../assessment";
import type { LearningPath } from "./contract";

const pick = <T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): Pick<T, K> => {
  const out = {} as Pick<T, K>;
  for (const key of keys) if (source[key] !== undefined) out[key] = source[key];
  return out;
};

export const publicQuizKeys = [
  "id",
  "version",
  "title",
  "scope",
  "learningPath",
  "courseId",
  "moduleId",
  "lessonId",
  "passingPercentage",
  "retakeCooldownSeconds",
] as const satisfies readonly (keyof AssessmentDefinition)[];
export const publicQuestionKeys = ["id", "prompt", "type"] as const;
export const publicChoiceKeys = ["id", "label"] as const;

export type PublicQuiz = Pick<
  AssessmentDefinition,
  (typeof publicQuizKeys)[number]
> & {
  questions: {
    id: string;
    prompt: string;
    type: AssessmentDefinition["questions"][number]["type"];
    choices: { id: string; label: string }[];
  }[];
};

/** Questions and choices only: never `correctChoiceIds`, `explanation` or governance. */
export function toPublicQuiz(definition: AssessmentDefinition): PublicQuiz {
  return {
    ...pick(definition, publicQuizKeys),
    questions: definition.questions.map((question) => ({
      ...pick(question, publicQuestionKeys),
      choices: question.choices.map((choice) => pick(choice, publicChoiceKeys)),
    })),
  };
}

export const publicAnalysisKeys = [
  "slug",
  "category",
  "tag",
  "title",
  "excerpt",
  "body",
  "publishedAt",
  "reviewedAt",
  "cluster",
] as const satisfies readonly (keyof AnalysisPost)[];
export type PublicAnalysisPost = Pick<
  AnalysisPost,
  (typeof publicAnalysisKeys)[number]
>;
export function toPublicAnalysisPost(post: AnalysisPost): PublicAnalysisPost {
  return pick(post, publicAnalysisKeys);
}

// Every field public lesson pages use today. A new lesson field is private until listed.
export const publicLessonKeys = [
  "affiliateDisclosureRequired",
  "approved",
  "author",
  "blocks",
  "course",
  "description",
  "estimatedMinutes",
  "href",
  "id",
  "introduction",
  "keyPoints",
  "learningPath",
  "level",
  "module",
  "objectives",
  "position",
  "prerequisites",
  "publishedDate",
  "relatedLessonIds",
  "relatedTermSlugs",
  "reviewDate",
  "reviewer",
  "riskWarningRequired",
  "sections",
  "seoDescription",
  "seoTitle",
  "slug",
  "sources",
  "status",
  "title",
] as const satisfies readonly (keyof PublishedLesson)[];
export type PublicLesson = Pick<
  PublishedLesson,
  (typeof publicLessonKeys)[number]
>;
export function toPublicLesson(lesson: PublishedLesson): PublicLesson {
  return pick(lesson, publicLessonKeys);
}

/** What public routes may ask for. MP04b's code adapter serves it; MP08 adds the store. */
export interface PublicContentRepository {
  lessons(learningPath: LearningPath, level?: string): PublicLesson[];
  lesson(learningPath: LearningPath, slug: string): PublicLesson | undefined;
  currentQuiz(id: string): PublicQuiz | undefined;
  analysisPosts(category?: AnalysisPost["category"]): PublicAnalysisPost[];
  analysisPost(slug: string): PublicAnalysisPost | undefined;
}
