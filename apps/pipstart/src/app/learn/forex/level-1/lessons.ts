import {
  type PublicationStatus,
  selectPublishedContent,
} from "../../../../lib/public-content";

export type ForexLesson = {
  estimatedMinutes: number;
  href: `/${string}`;
  id: string;
  introduction: string;
  keyPoints: string[];
  objectives: string[];
  position: number;
  prerequisites: string[];
  relatedLessonIds: string[];
  relatedTermSlugs: string[];
  slug: string;
  status: PublicationStatus;
  title: string;
};

const allForexLessons: ForexLesson[] = [
  {
    estimatedMinutes: 4,
    href: "/learn/forex/level-1",
    id: "what-is-forex",
    introduction:
      "Forex, short for foreign exchange, is the global market where one currency is exchanged for another. People, businesses, banks and governments use this market to convert money for trade, travel and investment.",
    keyPoints: [
      "Forex means foreign exchange.",
      "Currencies are exchanged in pairs.",
      "Prices move as demand for each currency changes.",
    ],
    objectives: [
      "Explain what the Forex market is and why currencies are exchanged.",
    ],
    position: 1,
    prerequisites: [],
    relatedLessonIds: ["currency-pairs"],
    relatedTermSlugs: [],
    slug: "what-is-forex",
    status: "published",
    title: "What is Forex?",
  },
  {
    estimatedMinutes: 5,
    href: "/learn/forex/level-1/currency-pairs",
    id: "currency-pairs",
    introduction:
      "A currency pair compares the value of one currency with another. The first is the base currency and the second is the quote currency, so EUR/USD shows how many US dollars are needed for one euro.",
    keyPoints: [
      "The first currency is called the base currency.",
      "The second currency is called the quote currency.",
      "Buying a pair means buying the base while selling the quote.",
    ],
    objectives: ["Identify the base and quote currencies in a currency pair."],
    position: 2,
    prerequisites: ["what-is-forex"],
    relatedLessonIds: ["what-is-forex", "pips-and-lots"],
    relatedTermSlugs: [],
    slug: "currency-pairs",
    status: "published",
    title: "Currency pairs",
  },
  {
    estimatedMinutes: 6,
    href: "/learn/forex/level-1/pips-and-lots",
    id: "pips-and-lots",
    introduction:
      "A pip is a standard way to describe a small price movement, while a lot describes trade size. Together they help traders compare movement and calculate how much money may be gained or lost.",
    keyPoints: [
      "Most currency pairs use 0.0001 as a conventional pip.",
      "Many JPY pairs use 0.01 as a conventional pip.",
      "Larger lot sizes make each pip worth more money.",
    ],
    objectives: [
      "Describe pips and lots and how trade size changes pip value.",
    ],
    position: 3,
    prerequisites: ["currency-pairs"],
    relatedLessonIds: ["currency-pairs", "bid-ask-spread"],
    relatedTermSlugs: ["pip", "position-size"],
    slug: "pips-and-lots",
    status: "published",
    title: "Pips and lots",
  },
  {
    estimatedMinutes: 5,
    href: "/learn/forex/level-1/bid-ask-spread",
    id: "bid-ask-spread",
    introduction:
      "A Forex quote normally contains two prices. The bid is the price available when selling the base currency, the ask is the price available when buying it, and the difference is the spread.",
    keyPoints: [
      "The bid is normally lower than the ask.",
      "The spread is an immediate trading cost.",
      "Spreads can widen when markets are quiet or volatile.",
    ],
    objectives: ["Distinguish bid, ask and spread in a Forex quote."],
    position: 4,
    prerequisites: ["currency-pairs"],
    relatedLessonIds: ["pips-and-lots", "trading-sessions"],
    relatedTermSlugs: [],
    slug: "bid-ask-spread",
    status: "published",
    title: "Bid, ask and spread",
  },
  {
    estimatedMinutes: 5,
    href: "/learn/forex/level-1/trading-sessions",
    id: "trading-sessions",
    introduction:
      "Forex trades across global financial centres throughout the working week. Activity is commonly discussed through the Sydney, Tokyo, London and New York sessions, whose opening hours overlap.",
    keyPoints: [
      "Forex activity moves between major global centres.",
      "London and New York overlap during part of their sessions.",
      "Liquidity and volatility can change throughout the day.",
    ],
    objectives: [
      "Name the major Forex sessions and explain why overlaps matter.",
    ],
    position: 5,
    prerequisites: ["what-is-forex"],
    relatedLessonIds: ["bid-ask-spread", "market-participants"],
    relatedTermSlugs: [],
    slug: "trading-sessions",
    status: "published",
    title: "Trading sessions",
  },
  {
    estimatedMinutes: 5,
    href: "/learn/forex/level-1/market-participants",
    id: "market-participants",
    introduction:
      "The Forex market includes central banks, commercial banks, companies, investment funds, brokers and individual traders. Each group participates for different reasons and with very different resources.",
    keyPoints: [
      "Companies exchange currencies for international business.",
      "Central banks may influence currencies through policy.",
      "Retail traders participate through brokers and trading platforms.",
    ],
    objectives: [
      "Compare the main Forex participants and their reasons for trading.",
    ],
    position: 6,
    prerequisites: ["what-is-forex"],
    relatedLessonIds: ["trading-sessions"],
    relatedTermSlugs: [],
    slug: "market-participants",
    status: "published",
    title: "Market participants",
  },
];

export const forexLessons = selectPublishedContent(allForexLessons);

export function getForexLesson(slug: string): ForexLesson | undefined {
  return forexLessons.find((lesson) => lesson.slug === slug);
}

export function getForexLessonById(id: string): ForexLesson | undefined {
  return forexLessons.find((lesson) => lesson.id === id);
}
