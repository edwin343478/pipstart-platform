import type {
  LessonBlock,
  LessonDocument,
  LessonMetadata,
  LessonSection,
} from "./lesson-content";
import { selectPublishableLessons } from "./lesson-content";
import { level0Lesson1, level0Lesson2, level0Lesson3, level0Lesson4 } from "./lessons/forex/level-0-sections";
import { relatedTermSlugs } from "../lib/related-learning";
import {
  blocks as draftSecurityBlocks,
  metadata as draftSecurityMetadata,
} from "./lessons/crypto/draft-security-basics.mdx";
import {
  blocks as bitcoinBlocks,
  metadata as bitcoinMetadata,
} from "./lessons/crypto/what-is-bitcoin.mdx";
import {
  blocks as bidAskBlocks,
  metadata as bidAskMetadata,
} from "./lessons/forex/bid-ask-spread.mdx";
import {
  blocks as currencyPairsBlocks,
  metadata as currencyPairsMetadata,
} from "./lessons/forex/currency-pairs.mdx";
import {
  blocks as participantsBlocks,
  metadata as participantsMetadata,
} from "./lessons/forex/market-participants.mdx";
import {
  blocks as pipsLotsBlocks,
  metadata as pipsLotsMetadata,
} from "./lessons/forex/pips-and-lots.mdx";
import {
  blocks as sessionsBlocks,
  metadata as sessionsMetadata,
} from "./lessons/forex/trading-sessions.mdx";
import {
  blocks as whatIsForexBlocks,
  metadata as whatIsForexMetadata,
} from "./lessons/forex/what-is-forex.mdx";
export type PublishedLesson = LessonMetadata & {
  blocks: LessonBlock[];
  sections?: LessonSection[];
  href: `/${string}`;
  id: string;
  introduction: string;
  keyPoints: string[];
};

function lessonDocument(
  metadata: LessonMetadata,
  blocks: LessonBlock[],
): LessonDocument {
  return { blocks, metadata };
}

const allLessonDocuments = [
  level0Lesson1,
  level0Lesson2,
  level0Lesson3,
  level0Lesson4,
  lessonDocument(whatIsForexMetadata, whatIsForexBlocks),
  lessonDocument(currencyPairsMetadata, currencyPairsBlocks),
  lessonDocument(pipsLotsMetadata, pipsLotsBlocks),
  lessonDocument(bidAskMetadata, bidAskBlocks),
  lessonDocument(sessionsMetadata, sessionsBlocks),
  lessonDocument(participantsMetadata, participantsBlocks),
  lessonDocument(bitcoinMetadata, bitcoinBlocks),
  lessonDocument(draftSecurityMetadata, draftSecurityBlocks),
];

type LessonRouteMetadata = Pick<
  LessonMetadata,
  "learningPath" | "level" | "position" | "slug"
>;

export function buildLessonHref(
  metadata: LessonRouteMetadata,
): `/${string}` {
  const levelRoot = `/learn/${metadata.learningPath}/${metadata.level}` as const;
  return metadata.position === 1
    ? levelRoot
    : `${levelRoot}/${metadata.slug}`;
}

export const publishedLessons: PublishedLesson[] = selectPublishableLessons(
  allLessonDocuments,
  { validTermSlugs: relatedTermSlugs },
).map(({ blocks, metadata, sections }) => ({
  ...metadata,
  blocks,
  sections,
  href: buildLessonHref(metadata),
  id: metadata.slug,
  introduction: metadata.description,
  keyPoints: blocks
    .filter((block) => block.type === "keyPoint")
    .flatMap((block) => block.points),
}));

type PublishedLessonSelector = {
  course?: string;
  learningPath: LessonMetadata["learningPath"];
  level?: string;
  module?: string;
};

export function getPublishedLessons({
  course,
  learningPath,
  level,
  module,
}: PublishedLessonSelector) {
  return publishedLessons.filter(
    (lesson) =>
      lesson.learningPath === learningPath &&
      (level === undefined || lesson.level === level) &&
      (course === undefined || lesson.course === course) &&
      (module === undefined || lesson.module === module),
  );
}

export const forexLessonDocuments = getPublishedLessons({
  learningPath: "forex",
});
export const cryptoLessonDocuments = getPublishedLessons({
  learningPath: "crypto",
});

export function getPublishedLesson(path: "crypto" | "forex", slug: string) {
  return publishedLessons.find(
    (lesson) => lesson.learningPath === path && lesson.slug === slug,
  );
}
