import {
  type PublicationStatus,
  selectPublishedContent,
} from "./public-content";

export type CurriculumLesson = {
  duration?: string;
  href: `/${string}`;
  id: string;
  order: number;
  status: PublicationStatus;
  title: string;
  type: "lesson" | "quiz";
};

export type CurriculumModule = {
  description: string;
  href: `/${string}`;
  id: string;
  lessons: readonly CurriculumLesson[];
  order: number;
  status: PublicationStatus;
  title: string;
};

export type CurriculumCourse = {
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

const forexLessons = [
  ["what-is-forex", "What is Forex?", "/learn/forex/level-1"],
  ["currency-pairs", "Currency pairs", "/learn/forex/level-1/currency-pairs"],
  ["pips-and-lots", "Pips and lots", "/learn/forex/level-1/pips-and-lots"],
  [
    "bid-ask-spread",
    "Bid, ask and spread",
    "/learn/forex/level-1/bid-ask-spread",
  ],
  [
    "trading-sessions",
    "Trading sessions",
    "/learn/forex/level-1/trading-sessions",
  ],
  [
    "market-participants",
    "Market participants",
    "/learn/forex/level-1/market-participants",
  ],
] as const;

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
                lessons: [
                  ...forexLessons.map(([id, title, href], index) => ({
                    href,
                    id,
                    order: index + 1,
                    status: "published" as const,
                    title,
                    type: "lesson" as const,
                  })),
                  {
                    href: "/learn/forex/level-1/quiz",
                    id: "level-1-quiz",
                    order: 7,
                    status: "draft",
                    title: "Level 1 quiz",
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
                lessons: [
                  {
                    href: "/learn/crypto/level-1",
                    id: "what-is-bitcoin",
                    order: 1,
                    status: "published",
                    title: "What is Bitcoin?",
                    type: "lesson",
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
