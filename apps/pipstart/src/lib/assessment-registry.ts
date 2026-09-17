import type { AssessmentDefinition, AssessmentQuestion } from "./assessment";
import {
  getCurriculumCourse,
  getCurriculumModule,
  getLearningPath,
  learningPaths,
  type CurriculumAssessmentRequirement,
} from "./curriculum";

export const forexFoundationsQuizV1: AssessmentDefinition = {
  id: "forex-foundations-quiz",
  version: 1,
  title: "Forex Foundations quiz",
  scope: "module",
  learningPath: "forex",
  courseId: "forex-kindergarten",
  moduleId: "forex-foundations",
  passingPercentage: 70,
  status: "published",
  questions: [
    {
      id: "forex-market-purpose",
      prompt: "What is the foreign exchange (Forex) market mainly used for?",
      explanation: "Forex is the global market where one currency is exchanged for another.",
      type: "single-choice",
      choices: [
        { id: "exchange-currencies", label: "Exchanging one currency for another" },
        { id: "buy-company-shares", label: "Buying shares in companies" },
        { id: "store-crypto", label: "Storing cryptocurrency" },
      ],
      correctChoiceIds: ["exchange-currencies"],
    },
    {
      id: "currency-pair-order",
      prompt: "In EUR/USD, which currency is the base currency?",
      explanation: "The first currency in a pair is the base currency, so EUR is the base in EUR/USD.",
      type: "single-choice",
      choices: [
        { id: "eur", label: "EUR" },
        { id: "usd", label: "USD" },
        { id: "both", label: "Both currencies" },
      ],
      correctChoiceIds: ["eur"],
    },
    {
      id: "pip-and-lot",
      prompt: "Which statements correctly describe pips and lots?",
      explanation: "A pip describes a small price movement, while a lot describes trade size.",
      type: "multiple-choice",
      choices: [
        { id: "pip-price-move", label: "A pip measures a small price movement" },
        { id: "lot-trade-size", label: "A lot describes the size of a trade" },
        { id: "pip-market-hours", label: "A pip tells you when a market session opens" },
        { id: "lot-currency-name", label: "A lot is the name of a currency" },
      ],
      correctChoiceIds: ["pip-price-move", "lot-trade-size"],
    },
    {
      id: "spread-meaning",
      prompt: "The bid-ask spread is the difference between the bid and ask prices.",
      explanation: "The spread is the gap between the price at which the market buys and the price at which it sells.",
      type: "true-false",
      choices: [
        { id: "true", label: "True" },
        { id: "false", label: "False" },
      ],
      correctChoiceIds: ["true"],
    },
    {
      id: "trading-sessions",
      prompt: "Why do Forex traders pay attention to trading sessions?",
      explanation: "Different financial centres are active at different times, which changes market activity and liquidity.",
      type: "single-choice",
      choices: [
        { id: "activity-varies", label: "Market activity can vary as different financial centres open and close" },
        { id: "fixed-daily-price", label: "Each session fixes currency prices for the day" },
        { id: "weekend-only", label: "Forex can only be traded during weekend sessions" },
      ],
      correctChoiceIds: ["activity-varies"],
    },
    {
      id: "market-participants",
      prompt: "Which of these can participate in the Forex market?",
      explanation: "Forex participants include banks, businesses and individual traders.",
      type: "multiple-choice",
      choices: [
        { id: "banks", label: "Banks" },
        { id: "businesses", label: "Businesses" },
        { id: "individual-traders", label: "Individual traders" },
        { id: "only-central-banks", label: "Only central banks" },
      ],
      correctChoiceIds: ["banks", "businesses", "individual-traders"],
    },
  ],
};

export const assessmentRegistry: readonly AssessmentDefinition[] = [
  forexFoundationsQuizV1,
];

function nonEmpty(value: string, label: string) {
  if (!value.trim()) throw new Error(`${label} must not be empty`);
}

function validateQuestion(question: AssessmentQuestion) {
  nonEmpty(question.id, "Question id");
  nonEmpty(question.prompt, `Question "${question.id}" prompt`);
  nonEmpty(question.explanation, `Question "${question.id}" explanation`);

  if (!["single-choice", "multiple-choice", "true-false"].includes(question.type)) {
    throw new Error(`Unsupported question type for "${question.id}"`);
  }
  if (question.choices.length < 2) {
    throw new Error(`Question "${question.id}" must have at least two choices`);
  }

  const choiceIds = new Set<string>();
  for (const choice of question.choices) {
    nonEmpty(choice.id, `Choice id in "${question.id}"`);
    nonEmpty(choice.label, `Choice "${choice.id}" label`);
    if (choiceIds.has(choice.id)) {
      throw new Error(`Duplicate choice id "${choice.id}" in "${question.id}"`);
    }
    choiceIds.add(choice.id);
  }

  if (new Set(question.correctChoiceIds).size !== question.correctChoiceIds.length) {
    throw new Error(`Duplicate correct choice id in "${question.id}"`);
  }
  for (const id of question.correctChoiceIds) {
    if (!choiceIds.has(id)) throw new Error(`Unknown correct choice "${id}" in "${question.id}"`);
  }

  if (
    (question.type === "single-choice" || question.type === "true-false") &&
    question.correctChoiceIds.length !== 1
  ) {
    throw new Error(`Question "${question.id}" must have one correct choice`);
  }
  if (question.type === "multiple-choice" && question.correctChoiceIds.length < 2) {
    throw new Error(`Multiple-choice question "${question.id}" needs at least two correct choices`);
  }
  if (
    question.type === "true-false" &&
    (question.choices.length !== 2 ||
      !question.choices.some((choice) => choice.id === "true") ||
      !question.choices.some((choice) => choice.id === "false"))
  ) {
    throw new Error(`True-false question "${question.id}" must use true and false choices`);
  }
}

function validateCurriculumReference(assessment: AssessmentDefinition) {
  if (!getLearningPath(assessment.learningPath)) {
    throw new Error(`Unknown published learning path "${assessment.learningPath}"`);
  }
  const course = getCurriculumCourse(assessment.learningPath, assessment.courseId);
  if (!course) throw new Error(`Unknown published course "${assessment.courseId}"`);

  if (assessment.scope === "course") {
    if (assessment.moduleId || assessment.lessonId) {
      throw new Error("Course assessment cannot declare moduleId or lessonId");
    }
    return;
  }

  if (!assessment.moduleId) throw new Error(`${assessment.scope} assessment requires moduleId`);
  const curriculumModule = getCurriculumModule(
    assessment.learningPath,
    assessment.moduleId,
  );
  if (
    !curriculumModule ||
    !course.modules.some((item) => item.id === curriculumModule.id)
  ) {
    throw new Error(`Unknown module "${assessment.moduleId}" for course "${assessment.courseId}"`);
  }

  if (assessment.scope === "module") {
    if (assessment.lessonId) throw new Error("Module assessment cannot declare lessonId");
    return;
  }

  if (!assessment.lessonId) throw new Error("Lesson assessment requires lessonId");
  if (
    !curriculumModule.lessons.some(
      (lesson) =>
        lesson.type === "lesson" && lesson.id === assessment.lessonId,
    )
  ) {
    throw new Error(`Unknown published lesson "${assessment.lessonId}" for module "${assessment.moduleId}"`);
  }
}

function validateRequirement(
  requirement: CurriculumAssessmentRequirement,
  registry: readonly AssessmentDefinition[],
  expected: {
    courseId: string;
    lessonId?: string;
    moduleId?: string;
    scope: AssessmentDefinition["scope"];
  },
) {
  if (requirement.completionPolicy !== "any-passed-version") {
    throw new Error(
      `Unsupported completion policy for assessment "${requirement.assessmentId}"`,
    );
  }
  const assessment = registry
    .filter(
      (item) =>
        item.id === requirement.assessmentId && item.status === "published",
    )
    .sort((left, right) => right.version - left.version)[0];
  if (!assessment) {
    throw new Error(
      `Required assessment "${requirement.assessmentId}" is not published`,
    );
  }
  if (
    assessment.scope !== expected.scope ||
    assessment.courseId !== expected.courseId ||
    assessment.moduleId !== expected.moduleId ||
    assessment.lessonId !== expected.lessonId
  ) {
    throw new Error(
      `Required assessment "${requirement.assessmentId}" does not match its curriculum scope`,
    );
  }
}

function validateCurriculumRequirements(
  registry: readonly AssessmentDefinition[],
) {
  for (const path of learningPaths)
    for (const level of path.levels)
      for (const course of level.courses) {
        for (const requirement of course.assessmentRequirements ?? [])
          validateRequirement(requirement, registry, {
            courseId: course.id,
            scope: "course",
          });
        for (const curriculumModule of course.modules) {
          for (const requirement of
            curriculumModule.assessmentRequirements ?? [])
            validateRequirement(requirement, registry, {
              courseId: course.id,
              moduleId: curriculumModule.id,
              scope: "module",
            });
          for (const lesson of curriculumModule.lessons)
            for (const requirement of lesson.assessmentRequirements ?? [])
              validateRequirement(requirement, registry, {
                courseId: course.id,
                lessonId: lesson.id,
                moduleId: curriculumModule.id,
                scope: "lesson",
              });
        }
      }
}

export function assertValidAssessmentRegistry(
  registry: readonly AssessmentDefinition[] = assessmentRegistry,
) {
  const versions = new Set<string>();

  for (const assessment of registry) {
    nonEmpty(assessment.id, "Assessment id");
    nonEmpty(assessment.title, `Assessment "${assessment.id}" title`);

    if (!Number.isInteger(assessment.version) || assessment.version <= 0) {
      throw new Error(`Assessment "${assessment.id}" has invalid version`);
    }
    if (
      !Number.isInteger(assessment.passingPercentage) ||
      assessment.passingPercentage < 1 ||
      assessment.passingPercentage > 100
    ) {
      throw new Error(`Assessment "${assessment.id}" has invalid passing percentage`);
    }
    if (!assessment.questions.length) {
      throw new Error(`Assessment "${assessment.id}" has no questions`);
    }

    const key = `${assessment.id}@${assessment.version}`;
    if (versions.has(key)) throw new Error(`Duplicate assessment version "${key}"`);
    versions.add(key);

    const questionIds = new Set<string>();
    for (const question of assessment.questions) {
      if (questionIds.has(question.id)) {
        throw new Error(`Duplicate question id "${question.id}" in "${assessment.id}"`);
      }
      questionIds.add(question.id);
      validateQuestion(question);
    }

    if (assessment.status === "published") validateCurriculumReference(assessment);
  }

  validateCurriculumRequirements(registry);
}

export function getAssessment(id: string, version: number) {
  return assessmentRegistry.find(
    (assessment) => assessment.id === id && assessment.version === version,
  );
}

export function getCurrentPublishedAssessment(id: string) {
  return assessmentRegistry
    .filter((assessment) => assessment.id === id && assessment.status === "published")
    .sort((left, right) => right.version - left.version)[0];
}

assertValidAssessmentRegistry();
