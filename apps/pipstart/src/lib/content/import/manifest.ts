import "server-only";

// M22 MP05a import manifest: every course, module, lesson, quiz and analysis post in code as
// a store body, parents before children, with the code IDs unchanged (lesson slugs are the
// progress lesson IDs; quiz IDs and versions are what attempts reference). Paths and levels
// stay in code (D04); a course records its level. Images stay in the repository.
// MP05c-2: a course, module or quiz with presentation text carries it as metadata.presentation,
// and a quiz served at its level URL records placement.route "level" (others live under their
// module), so an approved snapshot reproduces the site without code.
import { analysisPosts } from "../../../app/analysis/posts";
import type { LessonMetadata } from "../../../content/lesson-content";
import { publishedLessons } from "../../../content/lesson-registry";
import { getCurrentPublishedAssessment } from "../../assessment-registry";
import { learningPaths } from "../../curriculum";
import { codeCurriculumPresentation } from "../../curriculum-presentation";
import type { ContentFamily, LearningPath } from "../contract";
import { jsonbSha256, jsonbText } from "../jsonb";
import { hrefFor } from "../routes";
import { checkContentBody } from "../validate";

export type ManifestItem = {
  seq: number;
  id: string;
  family: ContentFamily;
  learningPath: LearningPath | null;
  parentId: string | null;
  sourceRef: string;
  body: Record<string, unknown>;
  bodySha256: string;
  bodyBytes: number;
};

// The editorial fields of a lesson; href, id, introduction and keyPoints are derived.
const lessonMetadataKeys = [
  "affiliateDisclosureRequired",
  "approved",
  "author",
  "course",
  "description",
  "estimatedMinutes",
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
  "seoDescription",
  "seoTitle",
  "slug",
  "sources",
  "status",
  "title",
] as const satisfies readonly (keyof LessonMetadata)[];

const presentation = (id: string) =>
  codeCurriculumPresentation[id]
    ? { presentation: codeCurriculumPresentation[id] }
    : {};

const placement = (item: {
  order: number;
  assessmentRequirements?: readonly unknown[];
}) => ({
  order: item.order,
  ...(item.assessmentRequirements
    ? { assessmentRequirements: item.assessmentRequirements }
    : {}),
});

export async function buildImportManifest(): Promise<ManifestItem[]> {
  const raw: Omit<ManifestItem, "seq" | "bodySha256" | "bodyBytes">[] = [];
  for (const path of learningPaths) {
    for (const level of path.levels) {
      for (const course of level.courses) {
        raw.push({
          id: course.id,
          family: "course",
          learningPath: path.id,
          parentId: null,
          sourceRef: `curriculum:${path.id}/${level.id}/${course.id}`,
          body: {
            metadata: {
              title: course.title,
              description: course.description,
              level: level.id,
              status: course.status,
              placement: placement(course),
              ...presentation(course.id),
            },
          },
        });
        for (const mod of course.modules) {
          raw.push({
            id: mod.id,
            family: "module",
            learningPath: path.id,
            parentId: course.id,
            sourceRef: `curriculum:${path.id}/${level.id}/${course.id}/${mod.id}`,
            body: {
              metadata: {
                title: mod.title,
                description: mod.description,
                status: mod.status,
                placement: placement(mod),
                ...presentation(mod.id),
              },
            },
          });
          for (const item of mod.lessons) {
            if (item.type === "lesson") {
              const lesson = publishedLessons.find(
                (l) => l.learningPath === path.id && l.slug === item.id,
              );
              if (!lesson)
                throw new Error(
                  `Curriculum lesson missing: ${path.id}/${item.id}`,
                );
              const metadata: Record<string, unknown> = {};
              for (const key of lessonMetadataKeys) metadata[key] = lesson[key];
              metadata.placement = placement(item);
              raw.push({
                id: lesson.slug,
                family: "lesson",
                learningPath: path.id,
                parentId: mod.id,
                sourceRef: `lesson-registry:${path.id}/${lesson.slug}`,
                body: {
                  metadata,
                  blocks: lesson.blocks,
                  ...(lesson.sections ? { sections: lesson.sections } : {}),
                },
              });
            } else {
              const quiz = getCurrentPublishedAssessment(item.id);
              if (!quiz) throw new Error(`Curriculum quiz missing: ${item.id}`);
              raw.push({
                id: quiz.id,
                family: "quiz",
                learningPath: path.id,
                parentId: mod.id,
                sourceRef: `assessment-registry:${quiz.id}@v${quiz.version}`,
                body: {
                  metadata: {
                    title: quiz.title,
                    assessmentId: quiz.id,
                    version: quiz.version,
                    scope: quiz.scope,
                    learningPath: quiz.learningPath,
                    courseId: quiz.courseId,
                    ...(quiz.moduleId ? { moduleId: quiz.moduleId } : {}),
                    ...(quiz.lessonId ? { lessonId: quiz.lessonId } : {}),
                    passingPercentage: quiz.passingPercentage,
                    retakeCooldownSeconds: quiz.retakeCooldownSeconds,
                    status: quiz.status,
                    governance: quiz.governance,
                    ...presentation(quiz.id),
                    placement: {
                      ...placement(item),
                      ...(item.href ===
                      hrefFor({ kind: "quiz", path: path.id, level: level.id })
                        ? { route: "level" }
                        : {}),
                      estimatedMinutes: item.estimatedMinutes,
                      objectives: item.objectives,
                      prerequisites: item.prerequisites,
                      relatedLessonIds: item.relatedLessonIds,
                      relatedTermSlugs: item.relatedTermSlugs,
                    },
                  },
                  questions: quiz.questions,
                },
              });
            }
          }
        }
      }
    }
  }
  for (const post of analysisPosts)
    raw.push({
      id: post.slug,
      family: "analysis",
      learningPath: null,
      parentId: null,
      sourceRef: `analysis:${post.slug}`,
      body: {
        metadata: {
          title: post.title,
          category: post.category,
          excerpt: post.excerpt,
          tag: post.tag,
          publishedAt: post.publishedAt,
          reviewedAt: post.reviewedAt,
          cluster: post.cluster,
        },
        paragraphs: post.body,
      },
    });

  const seen = new Map<string, string>();
  const items: ManifestItem[] = [];
  for (const [index, item] of raw.entries()) {
    // Round-trip through JSON so the body is exactly what the store will receive.
    const body = JSON.parse(JSON.stringify(item.body)) as Record<
      string,
      unknown
    >;
    const check = checkContentBody(item.family, body);
    if (!check.ok) throw new Error(`${item.sourceRef}: ${check.reason}`);
    const owner = seen.get(item.id);
    if (owner)
      throw new Error(
        `Store ID ${item.id} used by ${owner} and ${item.sourceRef}`,
      );
    seen.set(item.id, item.sourceRef);
    items.push({
      ...item,
      body,
      seq: index + 1,
      bodySha256: await jsonbSha256(body),
      bodyBytes: new TextEncoder().encode(jsonbText(body)).length,
    });
  }
  return items;
}
