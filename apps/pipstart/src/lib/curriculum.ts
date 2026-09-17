import {
  type PublicationStatus,
  selectPublishedContent,
} from "./public-content";
import { cryptoLessons } from "../app/learn/crypto/level-1/lessons";
import { forexLessons } from "../app/learn/forex/level-1/lessons";

export type CurriculumAssessmentRequirement = {
  assessmentId: string;
  completionPolicy: "any-passed-version";
};

export type CurriculumLesson = {
  assessmentRequirements?: readonly CurriculumAssessmentRequirement[];
  estimatedMinutes: number;
  href: `/${string}`;
  id: string;
  objectives: readonly string[];
  order: number;
  prerequisites: readonly string[];
  relatedLessonIds: readonly string[];
  relatedTermSlugs: readonly string[];
  status: PublicationStatus;
  title: string;
  type: "lesson" | "quiz";
};

export type CurriculumModule = {
  assessmentRequirements?: readonly CurriculumAssessmentRequirement[];
  description: string;
  href: `/${string}`;
  id: string;
  lessons: readonly CurriculumLesson[];
  order: number;
  status: PublicationStatus;
  title: string;
};

export type CurriculumCourse = {
  assessmentRequirements?: readonly CurriculumAssessmentRequirement[];
  description: string;
  href: `/${string}`;
  id: string;
  modules: readonly CurriculumModule[];
  order: number;
  status: PublicationStatus;
  title: string;
};

export type CurriculumLevel = {
  courses: readonly CurriculumCourse[];
  href: `/${string}`;
  id: string;
  order: number;
  status: PublicationStatus;
  title: string;
};

export type LearningPath = {
  href: `/${string}`;
  id: "crypto" | "forex";
  levels: readonly CurriculumLevel[];
  status: PublicationStatus;
  title: string;
};

const allLearningPaths: LearningPath[] = [
  {
    href: "/learn/forex",
    id: "forex",
    status: "published",
    title: "Learn Forex",
    levels: [
      {
        href: "/learn/forex/level-1",
        id: "level-1",
        order: 1,
        status: "published",
        title: "Level 1",
        courses: [
          {
            description:
              "Build a practical vocabulary for understanding the global currency market.",
            href: "/learn/forex/level-1/forex-kindergarten",
            id: "forex-kindergarten",
            order: 1,
            status: "published",
            title: "Forex Kindergarten",
            modules: [
              {
                description:
                  "Learn how currency pairs, prices, trade sizes, sessions and participants fit together.",
                href: "/learn/forex/level-1/forex-kindergarten/forex-foundations",
                id: "forex-foundations",
                order: 1,
                status: "published",
                title: "Forex Foundations",
                assessmentRequirements: [
                  {
                    assessmentId: "forex-foundations-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...forexLessons.map((lesson) => ({
                    estimatedMinutes: lesson.estimatedMinutes,
                    href: lesson.href,
                    id: lesson.id,
                    objectives: lesson.objectives,
                    order: lesson.position,
                    prerequisites: lesson.prerequisites,
                    relatedLessonIds: lesson.relatedLessonIds,
                    relatedTermSlugs: lesson.relatedTermSlugs,
                    status: lesson.status,
                    title: lesson.title,
                    type: "lesson" as const,
                  })),
                  {
                    estimatedMinutes: 5,
                    href: "/learn/forex/level-1/quiz",
                    id: "forex-foundations-quiz",
                    objectives: [
                      "Check your understanding of the six Forex Foundations lessons.",
                    ],
                    order: 7,
                    prerequisites: ["market-participants"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Forex Foundations quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    href: "/learn/crypto",
    id: "crypto",
    status: "published",
    title: "Learn Crypto",
    levels: [
      {
        href: "/learn/crypto/level-1",
        id: "level-1",
        order: 1,
        status: "published",
        title: "Level 1",
        courses: [
          {
            description:
              "Understand Bitcoin's purpose before exploring the technology behind it.",
            href: "/learn/crypto/level-1/bitcoin",
            id: "bitcoin",
            order: 1,
            status: "published",
            title: "Bitcoin",
            modules: [
              {
                description:
                  "Begin with Bitcoin's decentralized network, shared ledger and core ideas.",
                href: "/learn/crypto/level-1/bitcoin/bitcoin-foundations",
                id: "bitcoin-foundations",
                order: 1,
                status: "published",
                title: "Bitcoin Foundations",
                lessons: cryptoLessons.map((lesson) => ({
                  estimatedMinutes: lesson.estimatedMinutes,
                  href: lesson.href,
                  id: lesson.id,
                  objectives: lesson.objectives,
                  order: lesson.position,
                  prerequisites: lesson.prerequisites,
                  relatedLessonIds: lesson.relatedLessonIds,
                  relatedTermSlugs: lesson.relatedTermSlugs,
                  status: lesson.status,
                  title: lesson.title,
                  type: "lesson" as const,
                })),
              },
            ],
          },
        ],
      },
    ],
  },
];

export const learningPaths = selectPublishedContent(allLearningPaths).map(
  (path) => ({
    ...path,
    levels: selectPublishedContent(path.levels).map((level) => ({
      ...level,
      courses: selectPublishedContent(level.courses).map((course) => ({
        ...course,
        modules: selectPublishedContent(course.modules).map((module) => ({
          ...module,
          lessons: selectPublishedContent(module.lessons),
        })),
      })),
    })),
  }),
);

export function getLearningPath(id: LearningPath["id"]) {
  return learningPaths.find((path) => path.id === id);
}

export function getCurriculumCourse(
  pathId: LearningPath["id"],
  courseId: string,
) {
  return getLearningPath(pathId)
    ?.levels.flatMap((level) => level.courses)
    .find((course) => course.id === courseId);
}

export function getCurriculumLevel(
  pathId: LearningPath["id"],
  levelId: string,
) {
  return getLearningPath(pathId)?.levels.find((level) => level.id === levelId);
}

export function getCurriculumModule(
  pathId: LearningPath["id"],
  moduleId: string,
) {
  return getLearningPath(pathId)
    ?.levels.flatMap((level) => level.courses)
    .flatMap((course) => course.modules)
    .find((curriculumModule) => curriculumModule.id === moduleId);
}

export const publishedHierarchyRoutes = learningPaths.flatMap((path) =>
  path.levels.flatMap((level) =>
    level.courses.flatMap((course) => [
      course.href,
      ...course.modules.map((module) => module.href),
    ]),
  ),
);
