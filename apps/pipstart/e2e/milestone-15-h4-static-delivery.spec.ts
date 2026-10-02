import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const publishedLessons = [
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

test("production build prerenders all 39 approved Forex lessons and every quiz", async () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.resolve(".next/prerender-manifest.json"), "utf8"),
  ) as { routes: Record<string, { initialRevalidateSeconds: number | false }> };
  expect(publishedLessons).toHaveLength(39);
  const routes = [
    "/learn/forex",
    "/learn/crypto",
    "/learn/crypto/level-1",
    ...publishedLessons.map(({ href }) => href),
    ...Array.from(
      { length: 10 },
      (_, index) => `/learn/forex/level-${index + 1}/quiz`,
    ),
  ];
  for (const route of routes) {
    expect(
      manifest.routes[route],
      `Missing prerendered route: ${route}`,
    ).toBeDefined();
    expect(manifest.routes[route].initialRevalidateSeconds).toBe(false);
  }
  for (const route of Object.keys(manifest.routes)) {
    expect(route).not.toMatch(/draft/);
  }
  expect(manifest.routes["/api/learner-navigation"]).toBeUndefined();
  expect(manifest.routes["/dashboard"]).toBeUndefined();
});

test("navigation status is verified independently and never publicly cached", async ({
  request,
}) => {
  const requestHeaders: Record<string, string>[] = [
    {},
    { Cookie: "sb-forged-auth-token=not-a-valid-session" },
  ];
  for (const headers of requestHeaders) {
    const response = await request.get("/api/learner-navigation", { headers });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ authenticated: false });
    expect(response.headers()["cache-control"]).toContain("private");
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["vary"]).toContain("Cookie");
  }
});

for (const width of [1440, 390, 320]) {
  test(`verified account navigation updates without moving approved controls at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    let authenticated = true;
    let checks = 0;
    await page.route("**/api/learner-navigation", async (route) => {
      checks += 1;
      await route.fulfill({ json: { authenticated } });
    });
    await page.goto("/learn/forex/level-2/quiz");
    const dashboard = page.getByRole("link", {
      name: "Dashboard",
      exact: true,
    });
    await expect(dashboard).toBeVisible();
    await expect(dashboard).toHaveAttribute("href", "/dashboard");
    const classes = await dashboard.getAttribute("class");
    authenticated = false;
    const previousChecks = checks;
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect.poll(() => checks).toBeGreaterThan(previousChecks);
    const login = page.getByRole("link", { name: "Log in", exact: true });
    await expect(login).toBeVisible();
    await expect(login).toHaveAttribute("href", "/login");
    expect(await login.getAttribute("class")).toBe(classes);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test("malformed or failed account checks cannot block lesson and quiz content", async ({
  page,
}) => {
  await page.route("**/api/learner-navigation", async (route) => {
    await route.fulfill({ json: { authenticated: "true" } });
  });
  const navigationResponse = page.waitForResponse("**/api/learner-navigation");
  await page.goto("/learn/forex/level-2/quiz");
  await navigationResponse;
  await expect(
    page.getByRole("link", { name: "Log in", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Dashboard", exact: true }),
  ).toHaveCount(0);
  await page.unroute("**/api/learner-navigation");
  await page.route("**/api/learner-navigation", (route) => route.abort());
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/learn/forex/level-0");
  await expect(page.locator("article[data-enhanced] h2").first()).toBeVisible();
});
