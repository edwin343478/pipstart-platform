import { expect, test, type Page } from "@playwright/test";

function field(page: Page, name: string) {
  return page
    .locator("label")
    .filter({
      has: page.locator("span").filter({
        hasText: new RegExp(
          "^" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
        ),
      }),
    })
    .locator("input, select");
}
const calculate = (page: Page) =>
  page.getByRole("button", { name: "Calculate", exact: true }).click();
const result = (page: Page) => page.locator('section[aria-live="polite"]');

test("exact recovery targets and genuinely higher targets use the right period", async ({
  page,
}) => {
  await page.goto("/tools/gain-recovery-calculator");
  await field(page, "Current balance").fill("100");
  await field(page, "Recovery target").fill("144");
  await field(page, "Planned gain per period (%)").fill("20");
  await calculate(page);
  await expect(result(page).locator("p")).toHaveText("2 periods");
  await field(page, "Recovery target").fill("144.00000000000003");
  await calculate(page);
  await expect(result(page).locator("p")).toHaveText("3 periods");
});

test("exact venue boundaries retain the maximum valid lot step", async ({
  page,
}) => {
  await page.goto("/tools/position-size-calculator");
  await expect(
    page.getByLabel("Quote-to-account conversion rate", { exact: true }),
  ).toHaveValue("1");
  await field(page, "Account balance").fill("205");
  await field(page, "Risk per trade (%)").fill("1");
  await field(page, "Stop loss (pips)").fill("0.1");
  await calculate(page);
  await expect(result(page).locator("p")).toHaveText("205,000 units");
  await expect(result(page)).toContainText("2.0500");
});

test("changing direction preserves entered prices and requires recalculation", async ({
  page,
}) => {
  await page.goto("/tools/risk-reward-calculator");
  await field(page, "Entry price").fill("100");
  await field(page, "Stop-loss price").fill("90");
  await field(page, "Target price").fill("120");
  await field(page, "Trade direction").selectOption("short");
  await expect(field(page, "Entry price")).toHaveValue("100");
  await expect(field(page, "Stop-loss price")).toHaveValue("90");
  await expect(field(page, "Target price")).toHaveValue("120");
  await expect(result(page)).toContainText("Previous result.");
  await field(page, "Stop-loss price").fill("110");
  await field(page, "Target price").fill("80");
  await calculate(page);
  await expect(result(page).locator("p")).toHaveText("1 : 2.00");
  await expect(result(page)).not.toContainText("Previous result.");
});

test("eight-decimal crypto orders never appear as a zero quantity", async ({
  page,
}) => {
  await page.goto("/tools/crypto-position-size-calculator");
  await field(page, "Account balance").fill("1");
  await field(page, "Risk per trade (%)").fill("0.01");
  await field(page, "Entry price").fill("60000");
  await field(page, "Stop-loss price").fill("50000");
  await field(page, "Minimum order quantity").fill("0.00000001");
  await field(page, "Quantity step").fill("0.00000001");
  await calculate(page);
  await expect(result(page).locator("p")).toHaveText("0.00000001 BTC");
});

test("crypto results distinguish capped risk and leveraged funding", async ({
  page,
}, testInfo) => {
  await page.goto("/tools/crypto-position-size-calculator");
  await field(page, "Stop-loss price").fill("59990");
  await calculate(page);
  await expect(result(page)).toContainText("Risk limit: USD 10.00.");
  await expect(
    result(page)
      .locator("dl div")
      .filter({
        has: page.getByText("Modeled stop-loss risk", { exact: true }),
      }),
  ).toContainText("USD 0.17");
  await field(page, "Trading mode").selectOption("leveraged");
  await calculate(page);
  await expect(result(page)).toContainText("Risk-sized only;");
  await expect(result(page)).not.toContainText(
    "within the available cash balance",
  );
  await page.screenshot({
    path: testInfo.outputPath("crypto-result.png"),
    fullPage: true,
  });
});

test("accepted micro-prices retain a nonzero DCA average cost", async ({
  page,
}) => {
  await page.goto("/tools/dollar-cost-averaging-calculator");
  await field(page, "First purchase date").fill("2026-01-01");
  await field(page, "Plan end date").fill("2026-01-01");
  await field(page, "Starting asset price").fill("0.000001");
  await field(page, "Ending asset price").fill("0.000001");
  await calculate(page);
  await expect(
    result(page)
      .locator("dl div")
      .filter({ has: page.getByText("Average cost", { exact: true }) }),
  ).toContainText("USD 0.000001");
});

test("zero drawdown and gross break-even are valid but total loss stays explained", async ({
  page,
}) => {
  await page.goto("/tools/drawdown-calculator");
  await field(page, "Drawdown").fill("0");
  await calculate(page);
  await expect(result(page).locator("p")).toHaveText("0.00%");
  await field(page, "Drawdown").fill("100");
  await calculate(page);
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "A total loss leaves no balance to grow.",
  );
  await page.goto("/tools/profit-loss-calculator");
  await expect(
    page.getByLabel("Quote-to-account conversion rate", { exact: true }),
  ).toHaveValue("1");
  await field(page, "Exit price").fill("1.1");
  await calculate(page);
  await expect(result(page).locator("p")).toHaveText("USD 0.00 break-even");
});

test("blank compound growth is an error while explicit zero still works", async ({
  page,
}) => {
  await page.goto("/tools/compound-growth-illustration");
  const previous = await result(page).locator("p").textContent();
  await field(page, "Illustrative growth per period (%)").fill("");
  await calculate(page);
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Enter a valid illustrative growth per period.",
  );
  await expect(result(page).locator("p")).toHaveText(previous!);
  await field(page, "Illustrative growth per period (%)").fill("0");
  await calculate(page);
  await expect(result(page).locator("p")).toHaveText("USD 3400.00");
});

test("manual override works during loading, wins over late data, and can refresh", async ({
  page,
}) => {
  let release!: () => void;
  let complete!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const firstFinished = new Promise<void>((resolve) => {
    complete = resolve;
  });
  let requests = 0;
  await page.route("**/api/exchange-rate?**", async (route) => {
    requests++;
    const first = requests === 1;
    if (first) await held;
    try {
      await route.fulfill({
        json: {
          baseCurrency: "USD",
          quoteCurrency: "GBP",
          rate: 1.5,
          rateDate: new Date().toISOString().slice(0, 10),
          retrievedAt: new Date().toISOString(),
          source: "Mock reference rate",
          stale: false,
        },
      });
    } catch {
      // The first request is deliberately aborted by the manual override.
    } finally {
      if (first) complete();
    }
  });
  await page.goto("/tools/position-size-calculator");
  await field(page, "Account currency").selectOption("GBP");
  await expect.poll(() => requests).toBe(1);
  await expect(
    page.getByText(
      "Retrieving the latest available indicative reference rate…",
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Use my own rate", exact: true })
    .click();
  const conversion = page.getByLabel("Quote-to-account conversion rate", {
    exact: true,
  });
  await conversion.fill("1.25");
  release();
  await firstFinished;
  await expect(conversion).toHaveValue("1.25");
  await expect(
    page.getByText("Manual rate override.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Use latest rate", exact: true })
    .click();
  await expect(conversion).toHaveValue("1.5");
  await expect(conversion).toHaveAttribute("readonly", "");
  expect(requests).toBe(2);
});

test("bad reference data gives a usable manual fallback", async ({ page }) => {
  await page.route("**/api/exchange-rate?**", (route) =>
    route.fulfill({
      json: {
        baseCurrency: "USD",
        quoteCurrency: "GBP",
        rate: 1.5,
        rateDate: "2099-01-01",
        retrievedAt: new Date().toISOString(),
        source: "Mock invalid rate",
        stale: false,
      },
    }),
  );
  await page.goto("/tools/position-size-calculator");
  await field(page, "Account currency").selectOption("GBP");
  await expect(
    page.getByText("Reference rate unavailable.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Use my own rate", exact: true })
    .click();
  await page
    .getByLabel("Quote-to-account conversion rate", { exact: true })
    .fill("1.25");
  // Currency switches now deliberately require a fresh account balance.
  await field(page, "Account balance").fill("1000");
  await calculate(page);
  await expect(result(page).locator("p")).toHaveText("3,000 units");
});

test.afterEach(async ({ page }) => {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
});
