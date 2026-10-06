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
        href: "/learn/crypto/level-0",
        id: "level-0",
        order: 0,
        status: "published",
        title: "Level 0",
        courses: [
          {
            id: "crypto-orientation",
            title: "Orientation and Safety",
            description:
              "Understand cryptocurrency, ownership, loss mechanisms and scam prevention before putting money at risk.",
            href: "/learn/crypto/level-0/crypto-orientation",
            order: 1,
            status: "published",
            modules: [
              {
                id: "crypto-orientation-and-safety",
                title: "Crypto Orientation and Safety",
                description:
                  "Four beginner lessons with paper practice, worked answers and a level quiz.",
                href: "/learn/crypto/level-0/crypto-orientation/crypto-orientation-and-safety",
                order: 1,
                status: "published",
                assessmentRequirements: [
                  {
                    assessmentId: "crypto-orientation-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...getPublishedLessons({
                    learningPath: "crypto",
                    level: "level-0",
                    course: "crypto-orientation",
                    module: "crypto-orientation-and-safety",
                  }).map((lesson) => ({
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
                    href: "/learn/crypto/level-0/quiz",
                    id: "crypto-orientation-quiz",
                    objectives: [
                      "Check orientation and safety understanding with ten questions.",
                    ],
                    order: 5,
                    prerequisites: ["crypto-scams-and-safe-learning"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Crypto Orientation and Safety quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },

      {
        href: "/learn/crypto/level-1",
        id: "level-1",
        order: 1,
        status: "published",
        title: "Level 1",
        courses: [
          {
            description:
              "Explore Bitcoin's history, shared-ledger checks, signatures, mining, fees and supply through five complete beginner lessons.",
            href: "/learn/crypto/level-1/bitcoin",
            id: "bitcoin",
            order: 1,
            status: "published",
            title: "Bitcoin and Shared Ledgers",
            modules: [
              {
                description:
                  "Build Bitcoin foundations with everyday examples, native tables, diagrams, paper practice and a fifteen-question quiz.",
                href: "/learn/crypto/level-1/bitcoin/bitcoin-foundations",
                id: "bitcoin-foundations",
                order: 1,
                status: "published",
                title: "Bitcoin Foundations",
                assessmentRequirements: [
                  {
                    assessmentId: "bitcoin-foundations-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...cryptoLessons.map((lesson) => ({
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
                    estimatedMinutes: 15,
                    href: "/learn/crypto/level-1/quiz",
                    id: "bitcoin-foundations-quiz",
                    objectives: [
                      "Check your understanding of Bitcoin and shared ledgers with fifteen questions.",
                    ],
                    order: 6,
                    prerequisites: ["bitcoin-supply-halvings-and-claims"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Bitcoin and Shared Ledgers quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/crypto/level-2",
        id: "level-2",
        order: 2,
        status: "published",
        title: "Level 2",
        courses: [
          {
            id: "wallets-and-security",
            title: "Wallets and Personal Security",
            description:
              "Understand wallet authority, recovery, transfer checks, permissions and incident response.",
            href: "/learn/crypto/level-2/wallets-and-security",
            order: 1,
            status: "published",
            modules: [
              {
                id: "wallet-and-personal-security",
                title: "Wallets and Personal Security",
                description:
                  "Five complete beginner lessons with fictional examples, paper practice and a fifteen-question quiz.",
                href: "/learn/crypto/level-2/wallets-and-security/wallet-and-personal-security",
                order: 1,
                status: "published",
                assessmentRequirements: [
                  {
                    assessmentId: "crypto-wallet-security-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...getPublishedLessons({
                    learningPath: "crypto",
                    level: "level-2",
                    course: "wallets-and-security",
                    module: "wallet-and-personal-security",
                  }).map((lesson) => ({
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
                    estimatedMinutes: 15,
                    href: "/learn/crypto/level-2/quiz",
                    id: "crypto-wallet-security-quiz",
                    objectives: [
                      "Check wallet and personal-security understanding with fifteen questions.",
                    ],
                    order: 6,
                    prerequisites: ["respond-to-a-crypto-compromise"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Wallets and Personal Security quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/crypto/level-3",
        id: "level-3",
        order: 3,
        status: "published",
        title: "Level 2",
        courses: [
          {
            id: "crypto-exchanges-and-markets",
            title: "Exchanges Stablecoins and Market Orders",
            description:
              "Compare exchange services, spot markets, execution costs, stablecoins and custody failure risks.",
            href: "/learn/crypto/level-3/crypto-exchanges-and-markets",
            order: 1,
            status: "published",
            modules: [
              {
                id: "exchanges-stablecoins-and-orders",
                title: "Exchanges Stablecoins and Market Orders",
                description:
                  "Five complete beginner lessons with fictional examples, paper practice and a fifteen-question quiz.",
                href: "/learn/crypto/level-3/crypto-exchanges-and-markets/exchanges-stablecoins-and-orders",
                order: 1,
                status: "published",
                assessmentRequirements: [
                  {
                    assessmentId: "crypto-exchange-markets-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...getPublishedLessons({
                    learningPath: "crypto",
                    level: "level-3",
                    course: "crypto-exchanges-and-markets",
                    module: "exchanges-stablecoins-and-orders",
                  }).map((lesson) => ({
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
                    estimatedMinutes: 15,
                    href: "/learn/crypto/level-3/quiz",
                    id: "crypto-exchange-markets-quiz",
                    objectives: [
                      "Check exchanges, stablecoins and market-order understanding with fifteen questions.",
                    ],
                    order: 6,
                    prerequisites: [
                      "crypto-deposits-withdrawals-and-exchange-failure",
                    ],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Exchanges Stablecoins and Market Orders quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/crypto/level-4",
        id: "level-4",
        order: 4,
        status: "published",
        title: "Level 4",
        courses: [
          {
            id: "crypto-ethereum-and-networks",
            title: "Ethereum Contracts and Connected Networks",
            description:
              "Understand Ethereum, smart-contract dependencies, gas, token identity and connected-network risks.",
            href: "/learn/crypto/level-4/crypto-ethereum-and-networks",
            order: 1,
            status: "published",
            modules: [
              {
                id: "ethereum-contracts-and-connected-networks",
                title: "Ethereum Contracts and Connected Networks",
                description:
                  "Five complete beginner lessons with fictional examples, paper practice and a fifteen-question quiz.",
                href: "/learn/crypto/level-4/crypto-ethereum-and-networks/ethereum-contracts-and-connected-networks",
                order: 1,
                status: "published",
                assessmentRequirements: [
                  {
                    assessmentId: "crypto-ethereum-networks-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...getPublishedLessons({
                    learningPath: "crypto",
                    level: "level-4",
                    course: "crypto-ethereum-and-networks",
                    module: "ethereum-contracts-and-connected-networks",
                  }).map((lesson) => ({
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
                    estimatedMinutes: 15,
                    href: "/learn/crypto/level-4/quiz",
                    id: "crypto-ethereum-networks-quiz",
                    objectives: [
                      "Check Ethereum, smart-contract, gas, token and bridge understanding with fifteen questions.",
                    ],
                    order: 6,
                    prerequisites: ["layer-one-layer-two-and-bridges"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Ethereum Contracts and Connected Networks quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/crypto/level-5",
        id: "level-5",
        order: 5,
        status: "published",
        title: "Level 5",
        courses: [
          {
            id: "crypto-tokens-and-research",
            title: "Tokens Supply and Research",
            description:
              "Understand token rights, supply and valuation, allocations and vesting, and evidence-based liquidity research.",
            href: "/learn/crypto/level-5/crypto-tokens-and-research",
            order: 1,
            status: "published",
            modules: [
              {
                id: "token-supply-and-research",
                title: "Tokens Supply and Research",
                description:
                  "Four complete beginner lessons with fictional examples, paper practice and a fifteen-question quiz.",
                href: "/learn/crypto/level-5/crypto-tokens-and-research/token-supply-and-research",
                order: 1,
                status: "published",
                assessmentRequirements: [
                  {
                    assessmentId: "crypto-token-research-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...getPublishedLessons({
                    learningPath: "crypto",
                    level: "level-5",
                    course: "crypto-tokens-and-research",
                    module: "token-supply-and-research",
                  }).map((lesson) => ({
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
                    estimatedMinutes: 15,
                    href: "/learn/crypto/level-5/quiz",
                    id: "crypto-token-research-quiz",
                    objectives: [
                      "Check token rights, supply, vesting and evidence-based research with fifteen questions.",
                    ],
                    order: 5,
                    prerequisites: [
                      "build-a-token-dossier-and-check-liquidity",
                    ],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Tokens Supply and Research quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/crypto/level-6",
        id: "level-6",
        order: 6,
        status: "published",
        title: "Level 6",
        courses: [
          {
            id: "crypto-defi-foundations",
            title: "DeFi Liquidity Lending and Rewards",
            description:
              "Understand swaps, liquidity provision, borrowing and liquidation, staking rewards and interacting DeFi risks.",
            href: "/learn/crypto/level-6/crypto-defi-foundations",
            order: 1,
            status: "published",
            modules: [
              {
                id: "defi-liquidity-lending-and-rewards",
                title: "DeFi Liquidity Lending and Rewards",
                description:
                  "Five complete beginner lessons with fictional examples, paper practice and a fifteen-question quiz.",
                href: "/learn/crypto/level-6/crypto-defi-foundations/defi-liquidity-lending-and-rewards",
                order: 1,
                status: "published",
                assessmentRequirements: [
                  {
                    assessmentId: "crypto-defi-foundations-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...getPublishedLessons({
                    learningPath: "crypto",
                    level: "level-6",
                    course: "crypto-defi-foundations",
                    module: "defi-liquidity-lending-and-rewards",
                  }).map((lesson) => ({
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
                    estimatedMinutes: 15,
                    href: "/learn/crypto/level-6/quiz",
                    id: "crypto-defi-foundations-quiz",
                    objectives: [
                      "Check DeFi swaps, liquidity, lending, rewards and protocol dependencies with fifteen questions.",
                    ],
                    order: 6,
                    prerequisites: [
                      "defi-dependencies-stablecoins-and-governance",
                    ],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "DeFi Liquidity Lending and Rewards quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/crypto/level-7",
        id: "level-7",
        order: 7,
        status: "published",
        title: "Level 7",
        courses: [
          {
            id: "crypto-charts-and-evidence",
            title: "Charts Market Context and Evidence",
            description:
              "Read price structure and market context, understand derivatives and on-chain measurement limits, and write an evidence-based research note.",
            href: "/learn/crypto/level-7/crypto-charts-and-evidence",
            order: 1,
            status: "published",
            modules: [
              {
                id: "charts-market-context-and-evidence",
                title: "Charts Market Context and Evidence",
                description:
                  "Five complete beginner lessons with fictional examples, paper practice and a fifteen-question quiz.",
                href: "/learn/crypto/level-7/crypto-charts-and-evidence/charts-market-context-and-evidence",
                order: 1,
                status: "published",
                assessmentRequirements: [
                  {
                    assessmentId: "crypto-charts-and-evidence-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...getPublishedLessons({
                    learningPath: "crypto",
                    level: "level-7",
                    course: "crypto-charts-and-evidence",
                    module: "charts-market-context-and-evidence",
                  }).map((lesson) => ({
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
                    estimatedMinutes: 15,
                    href: "/learn/crypto/level-7/quiz",
                    id: "crypto-charts-and-evidence-quiz",
                    objectives: [
                      "Check charts, market context, derivatives, on-chain data and research evidence with fifteen questions.",
                    ],
                    order: 6,
                    prerequisites: [
                      "sentiment-narratives-and-an-evidence-based-research-note",
                    ],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Charts Market Context and Evidence quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/crypto/level-8",
        id: "level-8",
        order: 8,
        status: "published",
        title: "Level 8",
        courses: [
          {
            id: "crypto-risk-and-portfolios",
            title: "Sizing Leverage and Portfolio Risk",
            description:
              "Choose a loss budget, understand leverage and shared risks, and document purchase schedules, exits and portfolio records.",
            href: "/learn/crypto/level-8/crypto-risk-and-portfolios",
            order: 1,
            status: "published",
            modules: [
              {
                id: "sizing-leverage-and-portfolio-risk",
                title: "Sizing Leverage and Portfolio Risk",
                description:
                  "Four complete beginner lessons with fictional examples, paper practice and a fifteen-question quiz.",
                href: "/learn/crypto/level-8/crypto-risk-and-portfolios/sizing-leverage-and-portfolio-risk",
                order: 1,
                status: "published",
                assessmentRequirements: [
                  {
                    assessmentId: "crypto-risk-and-portfolios-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...getPublishedLessons({
                    learningPath: "crypto",
                    level: "level-8",
                    course: "crypto-risk-and-portfolios",
                    module: "sizing-leverage-and-portfolio-risk",
                  }).map((lesson) => ({
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
                    estimatedMinutes: 15,
                    href: "/learn/crypto/level-8/quiz",
                    id: "crypto-risk-and-portfolios-quiz",
                    objectives: [
                      "Check sizing, leverage, concentration, purchase schedules and records with fifteen questions.",
                    ],
                    order: 5,
                    prerequisites: ["dca-rebalancing-exits-and-useful-records"],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Sizing Leverage and Portfolio Risk quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/crypto/level-9",
        id: "level-9",
        order: 9,
        status: "published",
        title: "Level 9",
        courses: [
          {
            id: "crypto-planning-and-practice",
            title: "Psychology Planning and Paper Practice",
            description:
              "Recognise biases, write observable rules, test without hindsight and review paper-practice evidence honestly.",
            href: "/learn/crypto/level-9/crypto-planning-and-practice",
            order: 1,
            status: "published",
            modules: [
              {
                id: "psychology-planning-and-paper-practice",
                title: "Psychology Planning and Paper Practice",
                description:
                  "Four complete beginner lessons with fictional examples, paper practice and a fifteen-question quiz.",
                href: "/learn/crypto/level-9/crypto-planning-and-practice/psychology-planning-and-paper-practice",
                order: 1,
                status: "published",
                assessmentRequirements: [
                  {
                    assessmentId: "crypto-planning-and-practice-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...getPublishedLessons({
                    learningPath: "crypto",
                    level: "level-9",
                    course: "crypto-planning-and-practice",
                    module: "psychology-planning-and-paper-practice",
                  }).map((lesson) => ({
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
                    estimatedMinutes: 15,
                    href: "/learn/crypto/level-9/quiz",
                    id: "crypto-planning-and-practice-quiz",
                    objectives: [
                      "Check decision habits, planning, testing limits and paper-practice review with fifteen questions.",
                    ],
                    order: 5,
                    prerequisites: [
                      "read-results-honestly-and-build-a-practice-routine",
                    ],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Psychology Planning and Paper Practice quiz",
                    type: "quiz",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        href: "/learn/crypto/level-10",
        id: "level-10",
        order: 10,
        status: "published",
        title: "Level 10",
        courses: [
          {
            id: "crypto-advanced-and-graduation",
            title: "Advanced Awareness and Graduation",
            description:
              "Review network assumptions, governance and product rights, then complete a consistent seven-part graduation dossier.",
            href: "/learn/crypto/level-10/crypto-advanced-and-graduation",
            order: 1,
            status: "published",
            modules: [
              {
                id: "advanced-awareness-and-graduation",
                title: "Advanced Awareness and Graduation",
                description:
                  "Four complete beginner lessons with fictional examples, paper practice and a fifteen-question quiz.",
                href: "/learn/crypto/level-10/crypto-advanced-and-graduation/advanced-awareness-and-graduation",
                order: 1,
                status: "published",
                assessmentRequirements: [
                  {
                    assessmentId: "crypto-advanced-and-graduation-quiz",
                    completionPolicy: "any-passed-version",
                  },
                ],
                lessons: [
                  ...getPublishedLessons({
                    learningPath: "crypto",
                    level: "level-10",
                    course: "crypto-advanced-and-graduation",
                    module: "advanced-awareness-and-graduation",
                  }).map((lesson) => ({
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
                    estimatedMinutes: 15,
                    href: "/learn/crypto/level-10/quiz",
                    id: "crypto-advanced-and-graduation-quiz",
                    objectives: [
                      "Check network security, governance, product rights and graduation evidence with fifteen questions.",
                    ],
                    order: 5,
                    prerequisites: [
                      "complete-the-crypto-graduation-research-and-safety-review",
                    ],
                    relatedLessonIds: [],
                    relatedTermSlugs: [],
                    status: "published",
                    title: "Advanced Awareness and Graduation quiz",
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
