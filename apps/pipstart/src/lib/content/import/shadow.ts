import "server-only";

// M22 MP05b shadow reads: rebuild what the site renders today from store rows (imported
// bodies). Parity tests compare the rebuild with the code registries; the MP05c-2 snapshot
// source (lib/content/source.ts) serves the site through these functions. Paths and levels
// stay code (D04), so the curriculum rebuild takes them from code and everything below from rows.
import type { AnalysisPost } from "../../../app/analysis/posts";
import type {
  LessonBlock,
  LessonDocument,
  LessonMetadata,
  LessonSection,
} from "../../../content/lesson-content";
import { buildLessonHref } from "../../../content/lesson-href";
import type { PublishedLesson } from "../../../content/lesson-registry";
import type { AssessmentDefinition } from "../../assessment";
import type {
  CurriculumCourse,
  CurriculumLesson,
  CurriculumModule,
  LearningPath,
} from "../../curriculum";
import type { CurriculumPresentation } from "../../curriculum-presentation";
import { hrefFor } from "../routes";

export type StoreRow = {
  id: string;
  family: "course" | "module" | "lesson" | "quiz" | "analysis";
  learningPath: "forex" | "crypto" | null;
  parentId: string | null;
  body: Record<string, unknown>;
};

// `route: "level"` keeps a quiz at its level URL (/learn/<path>/<level>/quiz); every other
// quiz lives under its module (/learn/<path>/<level>/<course>/<module>/quiz).
type Placement = {
  order: number;
  assessmentRequirements?: unknown[];
  route?: "level";
};
const meta = (row: StoreRow) => row.body.metadata as Record<string, unknown>;
const placement = (row: StoreRow) => meta(row).placement as Placement;
const requirements = (p: Placement) =>
  p.assessmentRequirements
    ? {
        assessmentRequirements:
          p.assessmentRequirements as CurriculumCourse["assessmentRequirements"],
      }
    : {};

/** Lesson documents for the registry's own publication pipeline (validation and ordering). */
export function snapshotLessonDocuments(
  rows: readonly StoreRow[],
): LessonDocument[] {
  return rows
    .filter((row) => row.family === "lesson")
    .map((row) => {
      const metadata: Record<string, unknown> = { ...meta(row) };
      delete metadata.placement;
      return {
        metadata: metadata as unknown as LessonMetadata,
        blocks: row.body.blocks as LessonBlock[],
        ...(row.body.sections
          ? { sections: row.body.sections as LessonSection[] }
          : {}),
      };
    });
}

/** Presentation text (breadcrumbs, SEO, quiz link labels), keyed by item ID. */
export function shadowPresentation(
  rows: readonly StoreRow[],
): Record<string, CurriculumPresentation> {
  return Object.fromEntries(
    rows
      .filter((row) => meta(row).presentation !== undefined)
      .map((row) => [row.id, meta(row).presentation as CurriculumPresentation]),
  );
}

export function shadowLesson(row: StoreRow): PublishedLesson {
  // Placement is store-only curriculum data, not a lesson field.
  const metadata: Record<string, unknown> = { ...meta(row) };
  delete metadata.placement;
  const blocks = row.body.blocks as LessonBlock[];
  const lesson = metadata as unknown as PublishedLesson;
  return {
    ...lesson,
    blocks,
    sections: row.body.sections as LessonSection[] | undefined,
    href: buildLessonHref(lesson),
    id: lesson.slug,
    introduction: lesson.description,
    keyPoints: blocks
      .filter((block) => block.type === "keyPoint")
      .flatMap((block) => block.points),
  };
}

export function shadowQuiz(row: StoreRow): AssessmentDefinition {
  const m = meta(row);
  return {
    id: m.assessmentId as string,
    version: m.version as number,
    title: m.title as string,
    scope: m.scope as AssessmentDefinition["scope"],
    learningPath: m.learningPath as AssessmentDefinition["learningPath"],
    courseId: m.courseId as string,
    ...(m.moduleId ? { moduleId: m.moduleId as string } : {}),
    ...(m.lessonId ? { lessonId: m.lessonId as string } : {}),
    passingPercentage: m.passingPercentage as number,
    retakeCooldownSeconds: m.retakeCooldownSeconds as number,
    status: m.status as AssessmentDefinition["status"],
    governance: m.governance as AssessmentDefinition["governance"],
    questions: row.body.questions as AssessmentDefinition["questions"],
  };
}

export function shadowAnalysisPost(row: StoreRow): AnalysisPost {
  const m = meta(row);
  return {
    slug: row.id,
    category: m.category as AnalysisPost["category"],
    tag: m.tag as string,
    title: m.title as string,
    excerpt: m.excerpt as string,
    body: row.body.paragraphs as string[],
    publishedAt: m.publishedAt as string,
    reviewedAt: m.reviewedAt as string,
    cluster: m.cluster as AnalysisPost["cluster"],
    status: "published",
  };
}

/** The curriculum tree: paths and levels from code, courses and below from store rows. */
export function shadowCurriculum(
  codePaths: readonly LearningPath[],
  rows: readonly StoreRow[],
): LearningPath[] {
  const children = (parent: string, family: StoreRow["family"][]) =>
    rows
      .filter((row) => row.parentId === parent && family.includes(row.family))
      .sort((a, b) => placement(a).order - placement(b).order);
  return codePaths.map((path) => ({
    ...path,
    levels: path.levels.map((level) => ({
      ...level,
      courses: rows
        .filter(
          (row) =>
            row.family === "course" &&
            row.learningPath === path.id &&
            meta(row).level === level.id,
        )
        .sort((a, b) => placement(a).order - placement(b).order)
        .map((course): CurriculumCourse => ({
          ...requirements(placement(course)),
          description: meta(course).description as string,
          href: hrefFor({
            kind: "course",
            path: path.id,
            level: level.id,
            course: course.id,
          }),
          id: course.id,
          order: placement(course).order,
          status: meta(course).status as CurriculumCourse["status"],
          title: meta(course).title as string,
          modules: children(course.id, ["module"]).map(
            (mod): CurriculumModule => ({
              ...requirements(placement(mod)),
              description: meta(mod).description as string,
              href: hrefFor({
                kind: "module",
                path: path.id,
                level: level.id,
                course: course.id,
                module: mod.id,
              }),
              id: mod.id,
              order: placement(mod).order,
              status: meta(mod).status as CurriculumModule["status"],
              title: meta(mod).title as string,
              lessons: children(mod.id, ["lesson", "quiz"]).map(
                (item): CurriculumLesson => {
                  if (item.family === "lesson") {
                    const lesson = shadowLesson(item);
                    return {
                      ...requirements(placement(item)),
                      estimatedMinutes: lesson.estimatedMinutes,
                      href: lesson.href,
                      id: lesson.id,
                      objectives: lesson.objectives,
                      order: placement(item).order,
                      prerequisites: lesson.prerequisites,
                      relatedLessonIds: lesson.relatedLessonIds,
                      relatedTermSlugs: lesson.relatedTermSlugs,
                      status: lesson.status,
                      title: lesson.title,
                      type: "lesson",
                    };
                  }
                  const p = placement(item) as Placement &
                    Omit<
                      CurriculumLesson,
                      "href" | "id" | "status" | "title" | "type"
                    >;
                  const quiz = shadowQuiz(item);
                  return {
                    ...requirements(p),
                    estimatedMinutes: p.estimatedMinutes,
                    href: hrefFor(
                      p.route === "level"
                        ? { kind: "quiz", path: path.id, level: level.id }
                        : {
                            kind: "quiz",
                            path: path.id,
                            level: level.id,
                            course: course.id,
                            module: mod.id,
                          },
                    ),
                    id: quiz.id,
                    objectives: p.objectives,
                    order: p.order,
                    prerequisites: p.prerequisites,
                    relatedLessonIds: p.relatedLessonIds,
                    relatedTermSlugs: p.relatedTermSlugs,
                    status: quiz.status === "published" ? "published" : "draft",
                    title: quiz.title,
                    type: "quiz",
                  };
                },
              ),
            }),
          ),
        })),
    })),
  }));
}
