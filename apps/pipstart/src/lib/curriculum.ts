import "server-only";

import {
  type PublicationStatus,
  selectPublishedContent,
} from "./public-content";
import { cryptoLessons } from "../app/learn/crypto/level-1/lessons";
import { forexLessons } from "../app/learn/forex/level-1/lessons";
import { getPublishedLessons } from "../content/lesson-registry";

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

const forexOrientationLessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-0",
  course: "forex-orientation",
  module: "orientation-and-safety",
});

const forexBrokerLessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-2",
  course: "brokers-and-platforms",
  module: "broker-foundations",
});

const forexChartLessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-3",
  course: "charts",
  module: "chart-foundations",
});

const forexTechnicalLessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-4",
  course: "technical-tools",
  module: "technical-tool-foundations",
});

const forexRiskLessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-5",
  course: "risk-management",
  module: "risk-management-foundations",
});

const forexPriceActionLessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-6",
  course: "price-action",
  module: "price-action-foundations",
});

const forexFundamentalAnalysisLessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-7",
  course: "fundamental-analysis",
  module: "fundamental-analysis-foundations",
});

const forexPsychologyLessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-8",
  course: "psychology",
  module: "psychology-foundations",
});

const forexStrategyDevelopmentLessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-9",
  course: "strategy-development",
  module: "strategy-development-foundations",
});

const forexAdvancedForexLessons = getPublishedLessons({
  learningPath: "forex",
  level: "level-10",
  course: "advanced-forex",
  module: "advanced-forex-foundations",
});

const allLearningPaths: LearningPath[] = [
  {
    href: "/learn/forex",
    id: "forex",
    status: "published",
    title: "Learn Forex",
    levels: [
      {
        href: "/learn/forex/level-0",
        id: "level-0",
        order: 0,
        status: "published",
        title: "Level 0",
        courses: [
          {
            description:
              "Start with the purpose, limits and safety foundations of learning Forex.",
            href: "/learn/forex/level-0/forex-orientation",
            id: "forex-orientation",
            order: 1,
            status: "published",
            title: "Forex Orientation",
            modules: [
              {
                description:
                  "Understand trading versus investing, financial risk, practice accounts, scam warning signs and a safer learning plan.",
                href: "/learn/forex/level-0/forex-orientation/orientation-and-safety",
                id: "orientation-and-safety",
                order: 1,
                status: "published",
                title: "Orientation and Safety",
                lessons: forexOrientationLessons.map((lesson) => ({
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
      {
        href: "/learn/forex/level-2",
        id: "level-2",
        order: 2,
        status: "published",
        title: "Level 2",
        courses: [
          {
            description:
              "Research providers, rehearse platform controls, understand orders and reconcile costs before considering live funding.",
            href: "/learn/forex/level-2/brokers-and-platforms",
            id: "brokers-and-platforms",
            order: 1,
            status: "published",
            title: "Brokers and Platforms",
            modules: [
              {
                description:
                  "Four practical lessons on provider identity, demo life cycles, order instructions, trading costs and withdrawal safety.",
                href: "/learn/forex/level-2/brokers-and-platforms/broker-foundations",
                id: "broker-foundations",
                order: 1,
                status: "published",
                title: "Broker Foundations",
                assessmentRequirements: [
                  {
                    assessmentId: "broker-foundations-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...forexBrokerLessons.map((lesson) => ({
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
                    estimatedMinutes: 10,
                    href: "/learn/forex/level-2/quiz",
                    id: "broker-foundations-quiz",
                    objectives: [
                      "Check provider research, demo practice, order instructions and cost safety.",
                    ],
                    order: 5,
                    prerequisites: ["costs-withdrawals-and-safety"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Broker Foundations quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/forex/level-3",
        id: "level-3",
        order: 3,
        status: "published",
        title: "Level 3",
        courses: [
          {
            description:
              "Read chart data carefully before interpreting trends, swings, breakouts or volume.",
            href: "/learn/forex/level-3/charts",
            id: "charts",
            order: 1,
            status: "published",
            title: "Charts",
            modules: [
              {
                description:
                  "Four detailed lessons on chart types and timeframes, price landmarks, consistent breakout rules and data limits.",
                href: "/learn/forex/level-3/charts/chart-foundations",
                id: "chart-foundations",
                order: 1,
                status: "published",
                title: "Chart Foundations",
                assessmentRequirements: [
                  {
                    assessmentId: "chart-foundations-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...forexChartLessons.map((lesson) => ({
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
                    estimatedMinutes: 10,
                    href: "/learn/forex/level-3/quiz",
                    id: "chart-foundations-quiz",
                    objectives: [
                      "Review the module’s observations, calculations and limits.",
                    ],
                    order: 5,
                    prerequisites: ["volume-and-chart-limits"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Chart Foundations quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/forex/level-4",
        id: "level-4",
        order: 4,
        status: "published",
        title: "Level 4",
        courses: [
          {
            description:
              "Understand technical calculations and their limits before treating chart observations as a plan.",
            href: "/learn/forex/level-4/technical-tools",
            id: "technical-tools",
            order: 1,
            status: "published",
            title: "Technical Tools",
            modules: [
              {
                description:
                  "Three detailed lessons on averages and momentum, volatility, and levels and patterns.",
                href: "/learn/forex/level-4/technical-tools/technical-tool-foundations",
                id: "technical-tool-foundations",
                order: 1,
                status: "published",
                title: "Technical Tool Foundations",
                assessmentRequirements: [
                  {
                    assessmentId: "technical-tool-foundations-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...forexTechnicalLessons.map((lesson) => ({
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
                    estimatedMinutes: 12,
                    href: "/learn/forex/level-4/quiz",
                    id: "technical-tool-foundations-quiz",
                    objectives: [
                      "Review the module’s observations, calculations and limits.",
                    ],
                    order: 4,
                    prerequisites: ["levels-patterns-and-limits"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Technical Tool Foundations quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/forex/level-5",
        id: "level-5",
        order: 5,
        status: "published",
        title: "Level 5",
        courses: [
          {
            description:
              "Build a clear demo risk policy using cash budgets, account exposure and loss-limit rules.",
            href: "/learn/forex/level-5/risk-management",
            id: "risk-management",
            order: 1,
            status: "published",
            title: "Risk Management",
            modules: [
              {
                description:
                  "Three detailed lessons on sizing, leverage and account-wide risk, followed by a review quiz.",
                href: "/learn/forex/level-5/risk-management/risk-management-foundations",
                id: "risk-management-foundations",
                order: 1,
                status: "published",
                title: "Risk Management Foundations",
                assessmentRequirements: [
                  {
                    assessmentId: "risk-management-foundations-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...forexRiskLessons.map((lesson) => ({
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
                    estimatedMinutes: 12,
                    href: "/learn/forex/level-5/quiz",
                    id: "risk-management-foundations-quiz",
                    objectives: [
                      "Review sizing, leverage and account-wide risk with explicit assumptions.",
                    ],
                    order: 4,
                    prerequisites: ["combined-exposure-and-losing-streaks"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Risk Management Foundations quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/forex/level-6",
        id: "level-6",
        order: 6,
        status: "published",
        title: "Level 6",
        courses: [
          {
            description:
              "Describe chart structure, test explicit observations and connect them to a clear demo exit checklist.",
            href: "/learn/forex/level-6/price-action",
            id: "price-action",
            order: 1,
            status: "published",
            title: "Price Action",
            modules: [
              {
                description:
                  "Three detailed lessons on structure, reproducible conditions and cost-aware demo plans, followed by a quiz.",
                href: "/learn/forex/level-6/price-action/price-action-foundations",
                id: "price-action-foundations",
                order: 1,
                status: "published",
                title: "Price Action Foundations",
                assessmentRequirements: [
                  {
                    assessmentId: "price-action-foundations-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...forexPriceActionLessons.map((lesson) => ({
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
                    estimatedMinutes: 12,
                    href: "/learn/forex/level-6/quiz",
                    id: "price-action-foundations-quiz",
                    objectives: [
                      "Review available-data structure, testable observations and demo exit planning.",
                    ],
                    order: 4,
                    prerequisites: ["stops-targets-and-a-checklist"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Price Action Foundations quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/forex/level-7",
        id: "level-7",
        order: 7,
        status: "published",
        title: "Level 7",
        courses: [
          {
            description:
              "Understand economic releases, policy relationships and calendar preparation without treating headlines as trading signals.",
            href: "/learn/forex/level-7/fundamental-analysis",
            id: "fundamental-analysis",
            order: 1,
            status: "published",
            title: "Fundamental Analysis",
            modules: [
              {
                description:
                  "Three detailed lessons on currency demand, policy and careful calendar observation, followed by a quiz.",
                href: "/learn/forex/level-7/fundamental-analysis/fundamental-analysis-foundations",
                id: "fundamental-analysis-foundations",
                order: 1,
                status: "published",
                title: "Fundamental Analysis Foundations",
                assessmentRequirements: [
                  {
                    assessmentId: "fundamental-analysis-foundations-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...forexFundamentalAnalysisLessons.map((lesson) => ({
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
                    estimatedMinutes: 12,
                    href: "/learn/forex/level-7/quiz",
                    id: "fundamental-analysis-foundations-quiz",
                    objectives: [
                      "Review economic release comparisons, policy relationships and calendar preparation.",
                    ],
                    order: 4,
                    prerequisites: ["use-an-economic-calendar-safely"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Fundamental Analysis Foundations quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/forex/level-8",
        id: "level-8",
        order: 8,
        status: "published",
        title: "Level 8",
        courses: [
          {
            description:
              "Notice decision patterns, keep fair records and build a realistic observation or demo practice habit.",
            href: "/learn/forex/level-8/psychology",
            id: "psychology",
            order: 1,
            status: "published",
            title: "Psychology",
            modules: [
              {
                description:
                  "Three detailed lessons on emotions, thinking patterns and repeatable practice, followed by a quiz.",
                href: "/learn/forex/level-8/psychology/psychology-foundations",
                id: "psychology-foundations",
                order: 1,
                status: "published",
                title: "Psychology Foundations",
                assessmentRequirements: [
                  {
                    assessmentId: "psychology-foundations-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...forexPsychologyLessons.map((lesson) => ({
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
                    estimatedMinutes: 12,
                    href: "/learn/forex/level-8/quiz",
                    id: "psychology-foundations-quiz",
                    objectives: [
                      "Review emotion/action distinctions, fair evidence and repeatable practice.",
                    ],
                    order: 4,
                    prerequisites: ["a-repeatable-practice-habit"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Psychology Foundations quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/forex/level-9",
        id: "level-9",
        order: 9,
        status: "published",
        title: "Level 9",
        courses: [
          {
            description:
              "Write reproducible rules, test them without future information and describe results with complete costs and denominators.",
            href: "/learn/forex/level-9/strategy-development",
            id: "strategy-development",
            order: 1,
            status: "published",
            title: "Strategy Development",
            modules: [
              {
                description:
                  "Three detailed lessons on specification, fair testing and honest performance measures, followed by a quiz.",
                href: "/learn/forex/level-9/strategy-development/strategy-development-foundations",
                id: "strategy-development-foundations",
                order: 1,
                status: "published",
                title: "Strategy Development Foundations",
                assessmentRequirements: [
                  {
                    assessmentId: "strategy-development-foundations-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...forexStrategyDevelopmentLessons.map((lesson) => ({
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
                    estimatedMinutes: 12,
                    href: "/learn/forex/level-9/quiz",
                    id: "strategy-development-foundations-quiz",
                    objectives: [
                      "Review strategy specification, information timing, execution assumptions and sample performance.",
                    ],
                    order: 4,
                    prerequisites: ["read-the-results-honestly"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Strategy Development Foundations quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/forex/level-10",
        id: "level-10",
        order: 10,
        status: "published",
        title: "Level 10",
        courses: [
          {
            description:
              "Study changing relationships, liquidity, positioning and complete portfolio review with a seven-part learning portfolio.",
            href: "/learn/forex/level-10/advanced-forex",
            id: "advanced-forex",
            order: 1,
            status: "published",
            title: "Advanced Forex",
            modules: [
              {
                description:
                  "Three detailed lessons on relationships, liquidity and whole-account review, followed by a quiz.",
                href: "/learn/forex/level-10/advanced-forex/advanced-forex-foundations",
                id: "advanced-forex-foundations",
                order: 1,
                status: "published",
                title: "Advanced Forex Foundations",
                assessmentRequirements: [
                  {
                    assessmentId: "advanced-forex-foundations-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...forexAdvancedForexLessons.map((lesson) => ({
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
                    estimatedMinutes: 12,
                    href: "/learn/forex/level-10/quiz",
                    id: "advanced-forex-foundations-quiz",
                    objectives: [
                      "Review changing relationships, liquidity, positioning, combined exposure and graduation evidence.",
                    ],
                    order: 4,
                    prerequisites: ["review-the-whole-portfolio"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Advanced Forex Foundations quiz",
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

export function getCurriculumCourseInLevel(
  pathId: LearningPath["id"],
  levelId: string,
  courseId: string,
) {
  return getCurriculumLevel(pathId, levelId)?.courses.find(
    (course) => course.id === courseId,
  );
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

export function getCurriculumModuleInCourse(
  pathId: LearningPath["id"],
  levelId: string,
  courseId: string,
  moduleId: string,
) {
  return getCurriculumCourseInLevel(pathId, levelId, courseId)?.modules.find(
    (curriculumModule) => curriculumModule.id === moduleId,
  );
}

export const publishedHierarchyRoutes = learningPaths.flatMap((path) =>
  path.levels.flatMap((level) =>
    level.courses.flatMap((course) => [
      course.href,
      ...course.modules.map((module) => module.href),
    ]),
  ),
);
