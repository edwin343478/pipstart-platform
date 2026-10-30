// M22 MP04b content contract: one identity and one body shape per content family,
// matching what the MP04a editorial store accepts (schema version 1). Types only.
import type { AnalysisCategory } from "../../app/analysis/posts";
import type { LessonBlock, LessonSection } from "../../content/lesson-content";

export const contentFamilies = [
  "course",
  "module",
  "lesson",
  "quiz",
  "analysis",
] as const;
export type ContentFamily = (typeof contentFamilies)[number];
export type LearningPath = "forex" | "crypto";

/** Permanent identity. Learning content has a path; analysis posts have none and no parent. */
export type ContentIdentity =
  | {
      family: "course";
      id: string;
      learningPath: LearningPath;
      parentId: null;
    }
  | {
      family: "module" | "lesson" | "quiz";
      id: string;
      learningPath: LearningPath;
      parentId: string;
    }
  | { family: "analysis"; id: string; learningPath: null; parentId: null };

export type EditorialMetadata = { title: string } & Record<string, unknown>;

export type CourseBody = { metadata: EditorialMetadata };
export type ModuleBody = { metadata: EditorialMetadata };
export type LessonBody = {
  metadata: EditorialMetadata;
  blocks: LessonBlock[];
  sections?: LessonSection[];
};
export type QuizQuestionBody = {
  id: string;
  prompt: string;
  explanation: string;
  type: "single-choice" | "multiple-answer" | "true-false";
  choices: { id: string; label: string }[];
  correctChoiceIds: string[];
};
export type QuizBody = {
  metadata: EditorialMetadata;
  questions: QuizQuestionBody[];
};
export type AnalysisBody = {
  metadata: EditorialMetadata & {
    category: AnalysisCategory;
    excerpt: string;
  };
  paragraphs: string[];
};

export type ContentBody = {
  course: CourseBody;
  module: ModuleBody;
  lesson: LessonBody;
  quiz: QuizBody;
  analysis: AnalysisBody;
};

/** The lesson block types the store accepts; identical to the SQL `body_ok` list. */
export const lessonBlockTypes = [
  "heading",
  "paragraph",
  "learningLink",
  "section",
  "references",
  "riskStatement",
  "list",
  "quote",
  "reflection",
  "takeaway",
  "definition",
  "example",
  "warning",
  "keyPoint",
  "formula",
  "exercise",
  "practice",
  "diagram",
  "comparisonTable",
  "riskNotice",
  "affiliateDisclosure",
  "quizPreview",
] as const satisfies readonly LessonBlock["type"][];

/** Store limits, identical to MP04a. */
export const contentLimits = {
  bodyBytes: 262144,
  titleLength: 200,
  lessonBlocks: 500,
  quizQuestions: 100,
  quizChoicesMin: 2,
  quizChoicesMax: 10,
  analysisParagraphs: 200,
  analysisExcerptLength: 300,
} as const;
