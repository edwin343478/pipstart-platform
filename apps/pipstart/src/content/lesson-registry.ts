import type {
  LessonBlock,
  LessonDocument,
  LessonMetadata,
} from "./lesson-content";
import { selectPublishableLessons } from "./lesson-content";
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
  lessonDocument(whatIsForexMetadata, whatIsForexBlocks),
  lessonDocument(currencyPairsMetadata, currencyPairsBlocks),
  lessonDocument(pipsLotsMetadata, pipsLotsBlocks),
  lessonDocument(bidAskMetadata, bidAskBlocks),
  lessonDocument(sessionsMetadata, sessionsBlocks),
  lessonDocument(participantsMetadata, participantsBlocks),
  lessonDocument(bitcoinMetadata, bitcoinBlocks),
  lessonDocument(draftSecurityMetadata, draftSecurityBlocks),
];

function lessonHref(metadata: LessonMetadata): `/${string}` {
  if (metadata.position === 1) return `/learn/${metadata.learningPath}/level-1`;
  return `/learn/${metadata.learningPath}/level-1/${metadata.slug}`;
}

export const publishedLessons: PublishedLesson[] = selectPublishableLessons(
  allLessonDocuments,
  { validTermSlugs: relatedTermSlugs },
).map(({ blocks, metadata }) => ({
  ...metadata,
  blocks,
  href: lessonHref(metadata),
  id: metadata.slug,
  introduction: metadata.description,
  keyPoints: blocks
    .filter((block) => block.type === "keyPoint")
    .flatMap((block) => block.points),
}));

export const forexLessonDocuments = publishedLessons.filter(
  (lesson) => lesson.learningPath === "forex",
);
export const cryptoLessonDocuments = publishedLessons.filter(
  (lesson) => lesson.learningPath === "crypto",
);

export function getPublishedLesson(path: "crypto" | "forex", slug: string) {
  return publishedLessons.find(
    (lesson) => lesson.learningPath === path && lesson.slug === slug,
  );
}
