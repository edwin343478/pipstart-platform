import { expect, test } from "@playwright/test";

const lessons = [
  {
    href: "/learn/forex/level-8/a-repeatable-practice-habit",
    title: "A repeatable practice habit",
  },
  {
    href: "/learn/forex/level-4",
    title: "Averages and momentum",
  },
  {
    href: "/learn/forex/level-1/bid-ask-spread",
    title: "Bid, ask and spread",
  },
  {
    href: "/learn/forex/level-6/build-a-testable-observation",
    title: "Build a testable observation",
  },
  {
    href: "/learn/forex/level-2",
    title: "Choosing a Forex provider",
  },
  {
    href: "/learn/forex/level-5/combined-exposure-and-losing-streaks",
    title: "Combined exposure and losing streaks",
  },
  {
    href: "/learn/forex/level-2/costs-withdrawals-and-safety",
    title: "Costs, withdrawals and safety",
  },
  {
    href: "/learn/forex/level-1/currency-pairs",
    title: "Currency pairs",
  },
  {
    href: "/learn/forex/level-5",
    title: "Decide the loss before the size",
  },
  {
    href: "/learn/forex/level-6",
    title: "Describe structure without guessing",
  },
  {
    href: "/learn/forex/level-7",
    title: "Economic news and currency demand",
  },
  {
    href: "/learn/forex/level-8",
    title: "Emotions around a decision",
  },
  {
    href: "/learn/forex/level-8/how-thinking-can-go-wrong",
    title: "How thinking can go wrong",
  },
  {
    href: "/learn/forex/level-4/levels-patterns-and-limits",
    title: "Levels, patterns and limits",
  },
  {
    href: "/learn/forex/level-10/liquidity-and-market-positioning",
    title: "Liquidity and market positioning",
  },
  {
    href: "/learn/forex/level-5/margin-leverage-and-drawdown",
    title: "Margin, leverage and drawdown",
  },
  {
    href: "/learn/forex/level-1/market-participants",
    title: "Market participants",
  },
  {
    href: "/learn/forex/level-0/money-risk-and-demo",
    title: "Money at Risk: Leverage, Losses and Demo Accounts",
  },
  {
    href: "/learn/forex/level-2/order-types-and-exits",
    title: "Order types and exits",
  },
  {
    href: "/learn/forex/level-0",
    title: "Start Here: What This Course Can and Cannot Do",
  },
  {
    href: "/learn/forex/level-1/pips-and-lots",
    title: "Pips and lots",
  },
  {
    href: "/learn/forex/level-2/platforms-and-demo-practice",
    title: "Platforms and demo practice",
  },
  {
    href: "/learn/forex/level-7/policy-and-market-relationships",
    title: "Policy and market relationships",
  },
  {
    href: "/learn/forex/level-3",
    title: "Read a chart before interpreting it",
  },
  {
    href: "/learn/forex/level-9/read-the-results-honestly",
    title: "Read the results honestly",
  },
  {
    href: "/learn/forex/level-10",
    title: "Relationships that can change",
  },
  {
    href: "/learn/forex/level-10/review-the-whole-portfolio",
    title: "Review the whole portfolio",
  },
  {
    href: "/learn/forex/level-0/spot-forex-scams-and-safety",
    title: "Spot Forex Scams and Make a Safer Learning Plan",
  },
  {
    href: "/learn/forex/level-6/stops-targets-and-a-checklist",
    title: "Stops, targets and a checklist",
  },
  {
    href: "/learn/forex/level-3/swings-breakouts-and-false-signals",
    title: "Swings, breakouts and false signals",
  },
  {
    href: "/learn/forex/level-9/test-without-looking-ahead",
    title: "Test without looking ahead",
  },
  {
    href: "/learn/forex/level-1/trading-sessions",
    title: "Trading sessions",
  },
  {
    href: "/learn/forex/level-0/trading-versus-investing",
    title: "Trading, Investing and Everyday Currency Exchange",
  },
  {
    href: "/learn/forex/level-3/trends-and-price-landmarks",
    title: "Trends and price landmarks",
  },
  {
    href: "/learn/forex/level-7/use-an-economic-calendar-safely",
    title: "Use an economic calendar safely",
  },
  {
    href: "/learn/forex/level-4/volatility-tools",
    title: "Volatility tools",
  },
  {
    href: "/learn/forex/level-3/volume-and-chart-limits",
    title: "Volume and chart limits",
  },
  {
    href: "/learn/forex/level-1",
    title: "What is Forex?",
  },
  {
    href: "/learn/forex/level-9",
    title: "Write a strategy that can be checked",
  },
];
const draftMarker = "This draft is not approved for publication.";

// This also runs without browser binaries: it exercises real production responses.
test("all 39 approved Forex routes and the draft boundary respond correctly", async ({
  request,
}) => {
  test.setTimeout(120_000);
  for (const lesson of lessons) {
    const response = await request.get(lesson.href);
    expect(response.status(), lesson.href).toBe(200);
    const html = await response.text();
    expect(html, lesson.href).not.toContain(draftMarker);
    const heading = /<h1[^>]*>([\s\S]*?)<\/h1>/
      .exec(html)?.[1]
      .replace(/<[^>]+>/g, "")
      .replaceAll("&amp;", "&")
      .replaceAll("&#x27;", "'")
      .replaceAll("&quot;", '"');
    expect(heading, lesson.href).toBe(lesson.title);
    expect(html, lesson.href).toContain("Show all sections at once");
  }
  for (let level = 1; level <= 10; level++) {
    const response = await request.get(`/learn/forex/level-${level}/quiz`);
    expect(response.status(), `Level ${level} quiz`).toBe(200);
    expect(await response.text()).not.toContain(draftMarker);
  }
  const draft = await request.get(
    "/learn/crypto/level-1/bitcoin-security-basics",
  );
  expect(draft.status()).toBe(404);
  expect(await draft.text()).not.toContain(draftMarker);
});

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`approved lesson interactions remain available at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    for (const href of [
      "/learn/forex/level-0",
      "/learn/forex/level-1",
      "/learn/forex/level-10",
    ]) {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(href);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const tabs = page.getByRole("tab");
      expect(await tabs.count()).toBeGreaterThan(1);
      await tabs.nth(1).click();
      await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
      await expect(
        page.getByRole("button", { name: "Back", exact: true }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Back", exact: true }).click();
      await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
      await page
        .getByRole("checkbox", { name: "Show all sections at once" })
        .check();
      await expect(page.getByRole("button", { name: /^Next:/ })).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Back", exact: true }),
      ).toHaveCount(0);
      await page
        .getByRole("checkbox", { name: "Show all sections at once" })
        .uncheck();
      await tabs.last().click();
      await expect(
        page.getByRole("button", { name: "Mark complete", exact: true }),
      ).toBeVisible();
      expect(errors).toEqual([]);
    }
    await page.goto("/learn/forex/level-10/quiz");
    await expect(
      page.getByRole("button", { name: "Submit quiz", exact: true }),
    ).toBeVisible();
  });
}
