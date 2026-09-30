import type {
  LessonBlock,
  LessonDocument,
  LessonMetadata,
  LessonSection,
} from "./lesson-content";
import { selectPublishableLessons } from "./lesson-content";
import {
  level0Lesson1,
  level0Lesson2,
  level0Lesson3,
  level0Lesson4,
} from "./lessons/forex/level-0-sections";
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
import { whatIsForexSections } from "./lessons/forex/what-is-forex-sections";

import { currencyPairsSections } from "./lessons/forex/currency-pairs-sections";

import { pipsAndLotsSections } from "./lessons/forex/pips-and-lots-sections";

import { bidAskSpreadSections } from "./lessons/forex/bid-ask-spread-sections";

import { tradingSessionsSections } from "./lessons/forex/trading-sessions-sections";

import { marketParticipantsSections } from "./lessons/forex/market-participants-sections";

import { choosingAProviderSections } from "./lessons/forex/choosing-a-forex-provider-sections";
import {
  blocks as choosingProviderBlocks,
  metadata as choosingProviderMetadata,
} from "./lessons/forex/choosing-a-forex-provider.mdx";
import { platformsAndDemoSections } from "./lessons/forex/platforms-and-demo-practice-sections";
import {
  blocks as platformsDemoBlocks,
  metadata as platformsDemoMetadata,
} from "./lessons/forex/platforms-and-demo-practice.mdx";
import { orderTypesAndExitsSections } from "./lessons/forex/order-types-and-exits-sections";
import {
  blocks as orderTypesBlocks,
  metadata as orderTypesMetadata,
} from "./lessons/forex/order-types-and-exits.mdx";
import { costsWithdrawalsAndSafetySections } from "./lessons/forex/costs-withdrawals-and-safety-sections";
import {
  blocks as costsSafetyBlocks,
  metadata as costsSafetyMetadata,
} from "./lessons/forex/costs-withdrawals-and-safety.mdx";

import { readAChartSections } from "./lessons/forex/read-a-chart-before-interpreting-it-sections";
import {
  blocks as readChartBlocks,
  metadata as readChartMetadata,
} from "./lessons/forex/read-a-chart-before-interpreting-it.mdx";
import { trendsAndLandmarksSections } from "./lessons/forex/trends-and-price-landmarks-sections";
import {
  blocks as trendsLandmarksBlocks,
  metadata as trendsLandmarksMetadata,
} from "./lessons/forex/trends-and-price-landmarks.mdx";
import { swingsAndBreakoutsSections } from "./lessons/forex/swings-breakouts-and-false-signals-sections";
import {
  blocks as swingsBreakoutsBlocks,
  metadata as swingsBreakoutsMetadata,
} from "./lessons/forex/swings-breakouts-and-false-signals.mdx";
import { volumeAndChartLimitsSections } from "./lessons/forex/volume-and-chart-limits-sections";
import {
  blocks as volumeLimitsBlocks,
  metadata as volumeLimitsMetadata,
} from "./lessons/forex/volume-and-chart-limits.mdx";

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
  sections?: LessonSection[],
): LessonDocument {
  return { blocks, metadata, ...(sections ? { sections } : {}) };
}

const allLessonDocuments = [
  level0Lesson1,
  level0Lesson2,
  level0Lesson3,
  level0Lesson4,
  lessonDocument(whatIsForexMetadata, whatIsForexBlocks, whatIsForexSections),
  lessonDocument(
    currencyPairsMetadata,
    currencyPairsBlocks,
    currencyPairsSections,
  ),
  lessonDocument(pipsLotsMetadata, pipsLotsBlocks, pipsAndLotsSections),
  lessonDocument(bidAskMetadata, bidAskBlocks, bidAskSpreadSections),
  lessonDocument(sessionsMetadata, sessionsBlocks, tradingSessionsSections),
  lessonDocument(
    participantsMetadata,
    participantsBlocks,
    marketParticipantsSections,
  ),
  lessonDocument(
    choosingProviderMetadata,
    choosingProviderBlocks,
    choosingAProviderSections,
  ),
  lessonDocument(
    platformsDemoMetadata,
    platformsDemoBlocks,
    platformsAndDemoSections,
  ),
  lessonDocument(
    orderTypesMetadata,
    orderTypesBlocks,
    orderTypesAndExitsSections,
  ),
  lessonDocument(
    costsSafetyMetadata,
    costsSafetyBlocks,
    costsWithdrawalsAndSafetySections,
  ),
  lessonDocument(readChartMetadata, readChartBlocks, readAChartSections),
  lessonDocument(
    trendsLandmarksMetadata,
    trendsLandmarksBlocks,
    trendsAndLandmarksSections,
  ),
  lessonDocument(
    swingsBreakoutsMetadata,
    swingsBreakoutsBlocks,
    swingsAndBreakoutsSections,
  ),
  lessonDocument(
    volumeLimitsMetadata,
    volumeLimitsBlocks,
    volumeAndChartLimitsSections,
  ),
  lessonDocument(bitcoinMetadata, bitcoinBlocks),
  lessonDocument(draftSecurityMetadata, draftSecurityBlocks),
];

type LessonRouteMetadata = Pick<
  LessonMetadata,
  "learningPath" | "level" | "position" | "slug"
>;

export function buildLessonHref(metadata: LessonRouteMetadata): `/${string}` {
  const levelRoot =
    `/learn/${metadata.learningPath}/${metadata.level}` as const;
  return metadata.position === 1 ? levelRoot : `${levelRoot}/${metadata.slug}`;
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
