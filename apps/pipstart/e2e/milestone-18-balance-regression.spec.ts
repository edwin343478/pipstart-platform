import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

function field(page: Page, label: string) {
  return page
    .locator("label")
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator("input, select");
}
const result = (page: Page) => page.locator('section[aria-live="polite"]');
const fixtures = [
  ["position-size-calculator", ["Account balance"], ["1000"]],
  [
    "crypto-position-size-calculator",
    ["Account balance", "Entry price", "Stop-loss price"],
    ["1000", "60000", "58800"],
  ],
  ["drawdown-calculator", ["Starting balance"], ["10000"]],
  [
    "gain-recovery-calculator",
    ["Current balance", "Recovery target"],
    ["8000", "10000"],
  ],
  [
    "compound-growth-illustration",
    ["Starting amount", "Contribution per period"],
    ["1000", "100"],
  ],
  [
    "dollar-cost-averaging-calculator",
    ["Investment per purchase", "Starting asset price", "Ending asset price"],
    ["100", "50000", "60000"],
  ],
] as const;

for (const [slug, labels, values] of fixtures) {
  test(
    slug +
      ": each currency switch requires fresh monetary inputs, including switching back",
    async ({ page }) => {
      await page.route("**/api/exchange-rate?**", async (route) => {
        const quote = new URL(route.request().url()).searchParams.get("quote");
        await route.fulfill({
          json: {
            baseCurrency: "USD",
            quoteCurrency: quote,
            rate: 0.8,
            rateDate: new Date().toISOString().slice(0, 10),
            retrievedAt: new Date().toISOString(),
            source: "Fixed balance test fixture",
            stale: false,
          },
        });
      });
      await page.goto("/tools/" + slug);
      await page.waitForLoadState("networkidle");
      await field(page, "Account currency").selectOption("EUR");
      for (const label of labels)
        await expect(field(page, label)).toHaveValue("");
      await expect(page.locator('[id^="calculator-error-"]')).toContainText(
        "Currency changed to EUR",
      );
      await expect(result(page)).toContainText("Previous result.");
      await page
        .getByRole("button", { name: "Calculate", exact: true })
        .click();
      await expect(page.locator('[id^="calculator-error-"]')).toBeVisible();
      for (let i = 0; i < labels.length; i++)
        await field(page, labels[i]).fill(values[i]);
      if (slug === "position-size-calculator")
        await expect(
          page.getByLabel("Quote-to-account conversion rate", { exact: true }),
        ).toHaveValue("0.8");
      await page
        .getByRole("button", { name: "Calculate", exact: true })
        .click();
      await expect(page.locator('[id^="calculator-error-"]')).toHaveCount(0);
      await expect(result(page)).not.toContainText("Previous result.");
      await field(page, "Account currency").selectOption("USD");
      for (const label of labels)
        await expect(field(page, label)).toHaveValue("");
      await expect(result(page)).toContainText("Previous result.");
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
    },
  );
}

test("GHS minimum balance explains shortfall and succeeds at the displayed threshold", async ({
  page,
}, info) => {
  await page.route("**/api/exchange-rate?**", async (route) =>
    route.fulfill({
      json: {
        baseCurrency: "USD",
        quoteCurrency: "GHS",
        rate: 11.7905,
        rateDate: new Date().toISOString().slice(0, 10),
        retrievedAt: new Date().toISOString(),
        source: "Fixed GHS fixture",
        stale: false,
      },
    }),
  );
  await page.goto("/tools/position-size-calculator");
  await page.waitForLoadState("networkidle");
  await field(page, "Account currency").selectOption("GHS");
  await expect(field(page, "Account balance")).toHaveValue("");
  await expect(
    page.getByLabel("Quote-to-account conversion rate", { exact: true }),
  ).toHaveValue("11.7905");
  await field(page, "Account balance").fill("1000");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(result(page)).toContainText("No position fits");
  await expect(result(page)).toContainText(
    "minimum account balance is GHS 2947.63",
  );
  await expect(result(page)).toContainText(
    "not a recommendation to add funds or increase risk",
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({
    path: info.outputPath("GHS-minimum-balance.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  await field(page, "Account balance").fill("2947.63");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(result(page).locator("p")).toHaveText("1,000 units");
});

test("drawdown currency-amount mode clears both denomination-sensitive inputs", async ({
  page,
}) => {
  await page.goto("/tools/drawdown-calculator");
  await page.waitForLoadState("networkidle");
  await field(page, "Drawdown unit").selectOption("amount");
  await field(page, "Drawdown").fill("2000");
  await field(page, "Account currency").selectOption("JPY");
  await expect(field(page, "Starting balance")).toHaveValue("");
  await expect(field(page, "Drawdown")).toHaveValue("");
  await field(page, "Starting balance").fill("10000");
  await field(page, "Drawdown").fill("2000");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.locator('[id^="calculator-error-"]')).toHaveCount(0);
  await expect(result(page)).not.toContainText("Previous result.");
});

test("crypto below-minimum guidance uses balance field and spot affordability", async ({
  page,
}) => {
  await page.goto("/tools/crypto-position-size-calculator");
  await page.waitForLoadState("networkidle");
  await field(page, "Account balance").fill("1");
  await field(page, "Entry price").fill("100");
  await field(page, "Stop-loss price").fill("99.9");
  await field(page, "Minimum order quantity").fill("0.015");
  await field(page, "Quantity step").fill("0.01");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.locator("#calculator-error-balance")).toContainText(
    "minimum account balance is USD 2.00",
  );
  await field(page, "Account balance").fill("2");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.locator('[id^="calculator-error-"]')).toHaveCount(0);
});
