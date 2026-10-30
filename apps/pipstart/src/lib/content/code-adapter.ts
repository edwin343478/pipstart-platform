import "server-only";

// M22 MP04b code adapter: today's code-held content behind the public repository contract.
// It returns exactly what the existing registries publish (parity-tested), through the
// public allowlists. No public route is switched to it in MP04b.
import { analysisPosts } from "../../app/analysis/posts";
import {
  getPublishedLesson,
  getPublishedLessons,
  publishedLessons,
} from "../../content/lesson-registry";
import { getCurrentPublishedAssessment } from "../assessment-registry";
import { learningPaths } from "../curriculum";
import {
  type PublicContentRepository,
  toPublicAnalysisPost,
  toPublicLesson,
  toPublicQuiz,
} from "./public";
import type { RouteTarget } from "./routes";

export const codeContentRepository: PublicContentRepository = {
  lessons: (learningPath, level) =>
    getPublishedLessons({ learningPath, level }).map(toPublicLesson),
  lesson: (learningPath, slug) => {
    const lesson = getPublishedLesson(learningPath, slug);
    return lesson && toPublicLesson(lesson);
  },
  currentQuiz: (id) => {
    const quiz = getCurrentPublishedAssessment(id);
    return quiz && toPublicQuiz(quiz);
  },
  analysisPosts: (category) =>
    analysisPosts
      .filter((post) => category === undefined || post.category === category)
      .map(toPublicAnalysisPost),
  analysisPost: (slug) => {
    const post = analysisPosts.find((entry) => entry.slug === slug);
    return post && toPublicAnalysisPost(post);
  },
};

/** Every published URL target in code, with the URL the site uses today. */
export function codeRouteTargets(): { target: RouteTarget; href: string }[] {
  const out: { target: RouteTarget; href: string }[] = [];
  for (const path of learningPaths.filter((p) => p.status === "published")) {
    out.push({ target: { kind: "path", path: path.id }, href: path.href });
    for (const level of path.levels.filter((l) => l.status === "published")) {
      out.push({
        target: { kind: "level", path: path.id, level: level.id },
        href: level.href,
      });
      for (const course of level.courses.filter(
        (c) => c.status === "published",
      )) {
        out.push({
          target: {
            kind: "course",
            path: path.id,
            level: level.id,
            course: course.id,
          },
          href: course.href,
        });
        for (const mod of course.modules.filter(
          (m) => m.status === "published",
        )) {
          out.push({
            target: {
              kind: "module",
              path: path.id,
              level: level.id,
              course: course.id,
              module: mod.id,
            },
            href: mod.href,
          });
          for (const item of mod.lessons)
            if (item.type === "quiz" && item.status === "published")
              out.push({
                target: {
                  kind: "quiz",
                  path: path.id,
                  level: level.id,
                  id: item.id,
                },
                href: item.href,
              });
        }
      }
    }
  }
  for (const lesson of publishedLessons)
    out.push({
      target: {
        kind: "lesson",
        path: lesson.learningPath,
        level: lesson.level,
        slug: lesson.slug,
        position: lesson.position,
      },
      href: lesson.href,
    });
  for (const post of analysisPosts)
    out.push({
      target: { kind: "analysis", slug: post.slug },
      href: `/analysis/${post.slug}`,
    });
  return out;
}
