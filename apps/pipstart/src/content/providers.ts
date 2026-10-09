import "server-only";
import type { Provider } from "../lib/provider-directory";

// Owner-approved recommendation; public product/platform facts checked 2026-10-09.
// These sources do not establish eligibility for any particular country.
const checkedAt = "2026-10-09";
const homepage = { url: "https://deriv.com/", checkedAt };
const terms = {
  url: "https://deriv.com/terms-and-conditions/general-terms-of-use",
  checkedAt,
};
export const providers: readonly Provider[] = [
  {
    id: "deriv",
    name: "Deriv.com",
    shortName: "Deriv",
    kind: "forex-broker",
    status: "published",
    relationship: "affiliate",
    linkId: "deriv",
    brand: "deriv",
    summary:
      "Deriv is one of PipStart's recommended brokers. If you would like an account to follow along with our lessons, you are welcome to explore Deriv. Graduates are welcome too. A demo account lets you practise without using real money; opening or funding a live account is optional.",
    riskNotice:
      "Trading CFDs, options and crypto involves risk, and you can lose your trading funds. Leverage can magnify losses. Check the entity serving your country, product eligibility, fees and withdrawal terms before opening or funding an account.",
    facts: [
      {
        label: "Product",
        value:
          "Forex CFDs, Synthetic Indices, Binary Options and Crypto Exchange",
        verification: "verified",
        source: homepage,
      },
      {
        label: "Platform",
        value: "MT5, cTrader, TradingView and Deriv Trader",
        verification: "verified",
        source: homepage,
      },
      {
        label: "Demo account",
        value: "Available",
        verification: "verified",
        source: {
          url: "https://deriv.com/trading-platforms/deriv-mt5",
          checkedAt,
        },
      },
      {
        label: "Availability",
        value: "Available",
        verification: "verified",
        source: terms,
      },
    ],
    review: {
      status: "verified",
      reviewedAt: checkedAt,
      expiresAt: "2027-01-07",
      previousListingDate: null,
      sources: [
        homepage,
        terms,
        { url: "https://deriv.com/trading-platforms/deriv-mt5", checkedAt },
        {
          url: "https://deriv.com/trading-platforms/deriv-exchange",
          checkedAt,
        },
        { url: "https://deriv.com/trade/options/digital-options", checkedAt },
        { url: "https://deriv.com/help-centre/tradingview", checkedAt },
      ],
    },
    availability: { status: "unknown", allowed: [], blocked: [], source: null },
    entities: [],
    fees: [],
    payments: [],
    support: [],
    image: {
      src: "/brokers/deriv-forex-leverage.jpg",
      alt: "Deriv promotional artwork: Forex moves in pips. Leverage makes them count. This is provider advertising, not PipStart advice.",
      width: 928,
      height: 1152,
    },
  },
];
