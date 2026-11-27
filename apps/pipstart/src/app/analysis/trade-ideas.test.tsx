import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { TradeIdea } from "../../lib/content/trade-idea";
import type { AnalysisPost } from "./posts";

const trade = (state: "active" | "inactive"): TradeIdea => ({
  instrument: "EUR/USD",
  timeframe: "h4",
  direction: "buy-limit",
  entry: "1.0845",
  stopLoss: "1.0810",
  takeProfit: "1.0920",
  chart: {
    path: "eurusd-4h.png",
    thumbnailPath: "eurusd-4h-small.webp",
    credit: "PipStart Editorial Team",
    alt: "EUR/USD 4-hour chart",
    width: 1600,
    height: 900,
  },
  status:
    state === "active"
      ? { state, reason: "pending", updatedAt: "2026-11-27T14:30:00.000Z" }
      : {
          state,
          reason: "inactive-other",
          note: "Central bank comments moved price first",
          outcome: "void",
          updatedAt: "2026-11-28T09:00:00.000Z",
        },
});

const post = (
  slug: string,
  publishedAt: string,
  extra: Partial<AnalysisPost> = {},
): AnalysisPost => ({
  slug,
  category: "technical",
  tag: "Support & Resistance",
  title: `Title ${slug}`,
  excerpt: `Excerpt ${slug}`,
  body: [`Body ${slug}`],
  publishedAt,
  reviewedAt: publishedAt,
  cluster: "technical",
  status: "published",
  ...extra,
});

vi.mock("./posts", async (original) => ({
  ...(await original<typeof import("./posts")>()),
  analysisPosts: [
    post("eurusd-retest", "2026-11-27T09:00:00.000Z", {
      trade: trade("active"),
    }),
    post("usdjpy-fade", "2026-11-26T09:00:00.000Z", {
      trade: trade("inactive"),
    }),
    post("plain-technical", "2026-11-01T09:00:00.000Z"),
    post("plain-other", "2026-10-01T09:00:00.000Z"),
  ],
}));

const { default: AnalysisPage } = await import("./page");
const { default: AnalysisArticlePage } = await import("./[slug]/page");

const list = async (params: Record<string, string>) =>
  renderToStaticMarkup(
    await AnalysisPage({ searchParams: Promise.resolve(params) }),
  );
const article = async (slug: string) =>
  renderToStaticMarkup(
    await AnalysisArticlePage({ params: Promise.resolve({ slug }) }),
  );

afterEach(() => vi.unstubAllEnvs());

describe("trade ideas switched off (default)", () => {
  it("renders the list and the post exactly as plain articles", async () => {
    vi.stubEnv("PIPSTART_TRADE_IDEAS_ENABLED", "");
    const html = await list({ type: "technical", status: "active" });
    expect(html).toContain("not to call trades");
    expect(html).not.toContain("Filter trade ideas by status");
    expect(html).not.toContain("1.0845");
    expect(html).toContain("Title eurusd-retest");
    expect(html).toContain("Title usdjpy-fade");
    const page = await article("eurusd-retest");
    expect(page).toContain("Educational commentary, not financial advice.");
    expect(page).not.toContain("Trade information");
  });
});

describe("trade ideas switched on", () => {
  it("shows the status filter, levels and status on technical cards", async () => {
    vi.stubEnv("PIPSTART_TRADE_IDEAS_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    const html = await list({ type: "technical" });
    expect(html).toContain("Educational trade ideas, not financial advice.");
    expect(html).toContain('aria-label="Filter trade ideas by status"');
    expect(html).toContain("All · 4");
    expect(html).toContain("Active · 1");
    expect(html).toContain("Inactive · 1");
    expect(html).toContain("1.0845");
    expect(html).toContain("Pending: waiting for price to reach the entry");
    expect(html).toContain(
      'src="https://project.supabase.co/storage/v1/object/public/analysis-charts/eurusd-4h-small.webp"',
    );
    // Thumbnails are decorative in a card that already names the idea.
    expect(html).toContain('alt=""');
  });

  it("filters by status and keeps the filter in paging links", async () => {
    vi.stubEnv("PIPSTART_TRADE_IDEAS_ENABLED", "true");
    const html = await list({ type: "technical", status: "inactive" });
    expect(html).toContain("Title usdjpy-fade");
    expect(html).not.toContain("Title eurusd-retest");
    expect(html).not.toContain("Title plain-technical");
    expect(html).toContain("“Central bank comments moved price first”");
    expect(html).toContain("No longer valid");
    expect(html).toContain("Analyst note");
    expect(html).toContain('aria-current="page"');
  });

  it("ignores an unknown status and leaves Fundamental Analysis unchanged", async () => {
    vi.stubEnv("PIPSTART_TRADE_IDEAS_ENABLED", "true");
    const all = await list({ type: "technical", status: "closed" });
    // Unfiltered: four posts, two per page, and "All" is the current filter.
    expect(all).toContain("Page 1 of 2");
    expect(all).toContain('aria-current="page" class="_statusFilterActive');
    const fundamental = await list({ type: "fundamental", status: "active" });
    expect(fundamental).not.toContain("Filter trade ideas by status");
    expect(fundamental).toContain("not to call trades");
  });

  it("shows the trade layout on a post that carries a trade idea", async () => {
    vi.stubEnv("PIPSTART_TRADE_IDEAS_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    const page = await article("eurusd-retest");
    expect(page).toContain('aria-label="Trade status"');
    expect(page).toContain("Trade information");
    expect(page).toContain("Buy limit");
    expect(page).toContain("35 pips risk");
    expect(page).toContain("75 pips reward");
    expect(page).toContain("1 : 2.1");
    expect(page).toContain('alt="EUR/USD 4-hour chart"');
    expect(page).toContain("Open full-size chart");
    expect(page).toContain(
      'href="https://project.supabase.co/storage/v1/object/public/analysis-charts/eurusd-4h.png"',
    );
    expect(page).toContain(" · PipStart Editorial Team");
    expect(page).toMatch(/14:30.*UTC/);
    expect(page).toContain("Educational trade idea, not financial advice.");
    const plain = await article("plain-technical");
    expect(plain).not.toContain("Trade information");
  });

  it("shows a placeholder instead of a broken image without a storage origin", async () => {
    vi.stubEnv("PIPSTART_TRADE_IDEAS_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(await article("eurusd-retest")).toContain("Chart unavailable");
  });
});
