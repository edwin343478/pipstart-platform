export type ForexLesson = {
  href: `/${string}`;
  introduction: string;
  keyPoints: string[];
  position: number;
  slug: string;
  title: string;
};

export const forexLessons: ForexLesson[] = [
  {
    href: "/learn/forex/level-1",
    introduction:
      "Forex, short for foreign exchange, is the global market where one currency is exchanged for another. People, businesses, banks and governments use this market to convert money for trade, travel and investment.",
    keyPoints: [
      "Forex means foreign exchange.",
      "Currencies are exchanged in pairs.",
      "Prices move as demand for each currency changes.",
    ],
    position: 1,
    slug: "what-is-forex",
    title: "What is Forex?",
  },
  {
    href: "/learn/forex/level-1/currency-pairs",
    introduction:
      "A currency pair compares the value of one currency with another. The first is the base currency and the second is the quote currency, so EUR/USD shows how many US dollars are needed for one euro.",
    keyPoints: [
      "The first currency is called the base currency.",
      "The second currency is called the quote currency.",
      "Buying a pair means buying the base while selling the quote.",
    ],
    position: 2,
    slug: "currency-pairs",
    title: "Currency pairs",
  },
  {
    href: "/learn/forex/level-1/pips-and-lots",
    introduction:
      "A pip is a standard way to describe a small price movement, while a lot describes trade size. Together they help traders compare movement and calculate how much money may be gained or lost.",
    keyPoints: [
      "Most currency pairs use 0.0001 as a conventional pip.",
      "Many JPY pairs use 0.01 as a conventional pip.",
      "Larger lot sizes make each pip worth more money.",
    ],
    position: 3,
    slug: "pips-and-lots",
    title: "Pips and lots",
  },
  {
    href: "/learn/forex/level-1/bid-ask-spread",
    introduction:
      "A Forex quote normally contains two prices. The bid is the price available when selling the base currency, the ask is the price available when buying it, and the difference is the spread.",
    keyPoints: [
      "The bid is normally lower than the ask.",
      "The spread is an immediate trading cost.",
      "Spreads can widen when markets are quiet or volatile.",
    ],
    position: 4,
    slug: "bid-ask-spread",
    title: "Bid, ask and spread",
  },
  {
    href: "/learn/forex/level-1/trading-sessions",
    introduction:
      "Forex trades across global financial centres throughout the working week. Activity is commonly discussed through the Sydney, Tokyo, London and New York sessions, whose opening hours overlap.",
    keyPoints: [
      "Forex activity moves between major global centres.",
      "London and New York overlap during part of their sessions.",
      "Liquidity and volatility can change throughout the day.",
    ],
    position: 5,
    slug: "trading-sessions",
    title: "Trading sessions",
  },
  {
    href: "/learn/forex/level-1/market-participants",
    introduction:
      "The Forex market includes central banks, commercial banks, companies, investment funds, brokers and individual traders. Each group participates for different reasons and with very different resources.",
    keyPoints: [
      "Companies exchange currencies for international business.",
      "Central banks may influence currencies through policy.",
      "Retail traders participate through brokers and trading platforms.",
    ],
    position: 6,
    slug: "market-participants",
    title: "Market participants",
  },
];

export function getForexLesson(slug: string): ForexLesson | undefined {
  return forexLessons.find((lesson) => lesson.slug === slug);
}
