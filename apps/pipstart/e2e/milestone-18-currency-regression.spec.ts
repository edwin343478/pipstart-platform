import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Fixed synthetic rates keep acceptance reproducible and independent of the provider.
const rates = [
  ["USD", 1, 4000],
  ["EUR", 0.8, 5000],
  ["GBP", 0.75, 5000],
  ["JPY", 150, 0],
  ["CHF", 0.9, 4000],
  ["CAD", 1.25, 3000],
  ["AUD", 1.5, 2000],
  ["NZD", 2, 2000],
  ["TZS", 2500, 0],
  ["KES", 125, 0],
  ["GHS", 10, 0],
] as const;
function field(page: Page, label: string) {
  return page
    .locator("label")
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator("input, select");
}
const result = (page: Page) => page.locator('section[aria-live="polite"]');
const conversion = (page: Page) =>
  page.getByLabel("Quote-to-account conversion rate", { exact: true });
const calculate = (page: Page) =>
  page.getByRole("button", { name: "Calculate", exact: true }).click();
async function mockRates(page: Page) {
  await page.route("**/api/exchange-rate?**", async (route) => {
    const url = new URL(route.request().url());
    const currency = url.searchParams.get("quote");
    const rate = rates.find(([code]) => code === currency)?.[1];
    expect(url.searchParams.get("base")).toBe("USD");
    expect(rate).toBeDefined();
    await route.fulfill({
      json: {
        baseCurrency: "USD",
        quoteCurrency: currency,
        rate,
        rateDate: new Date().toISOString().slice(0, 10),
        retrievedAt: new Date().toISOString(),
        source: "Fixed currency regression fixture",
        stale: false,
      },
    });
  });
}
async function contained(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
}

for (const [currency, rate, units] of rates) {
  test(
    currency +
      ": 1000 balance gives a valid size or a clearly explained minimum; equivalent buying power works",
    async ({ page }, info) => {
      await mockRates(page);
      await page.goto("/tools/position-size-calculator");
      await page.waitForLoadState("networkidle");
      await field(page, "Account currency").selectOption(currency);
      if (currency !== "USD") {
        await expect(field(page, "Account balance")).toHaveValue("");
        await expect(result(page)).toContainText("Previous result.");
      }
      await expect(conversion(page)).toHaveValue(String(rate));
      await field(page, "Account balance").fill("1000");
      await field(page, "Risk per trade (%)").fill("1");
      await field(page, "Stop loss (pips)").fill("25");
      await calculate(page);
      await expect(page.locator('[id^="calculator-error-"]')).toHaveCount(0);
      await expect(result(page).locator("p")).toHaveText(
        units ? units.toLocaleString("en-US") + " units" : "No position fits",
      );
      await expect(result(page)).not.toContainText("Previous result.");
      if (!units) {
        await expect(result(page)).toContainText(
          "Your risk limit is " + currency + " 10.00",
        );
        await expect(result(page)).toContainText("No order fits that limit");
        if (currency === "JPY" || currency === "GHS") {
          const scan = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
            .analyze();
          expect(scan.violations).toEqual([]);
          await page.screenshot({
            path: info.outputPath(currency + "-minimum-state.png"),
            fullPage: true,
          });
        }
      }
      await contained(page);
      await field(page, "Account balance").fill(String(1000 * rate));
      await calculate(page);
      await expect(result(page).locator("p")).toHaveText("4,000 units");
      await expect(result(page)).not.toContainText("Previous result.");
      await contained(page);
    },
  );
}

for (const route of [
  "position-size-calculator",
  "pip-value-calculator",
  "profit-loss-calculator",
  "margin-calculator",
]) {
  test(
    route + ": loading or changed currencies never masquerade as a new result",
    async ({ page }) => {
      let release!: () => void;
      const held = new Promise<void>((resolve) => {
        release = resolve;
      });
      let requests = 0;
      await page.route("**/api/exchange-rate?**", async (routeHandler) => {
        requests++;
        const quote = new URL(routeHandler.request().url()).searchParams.get(
          "quote",
        );
        if (quote === "JPY") await held;
        await routeHandler.fulfill({
          json: {
            baseCurrency: "USD",
            quoteCurrency: quote,
            rate: quote === "JPY" ? 150 : 0.9,
            rateDate: new Date().toISOString().slice(0, 10),
            retrievedAt: new Date().toISOString(),
            source: "Fixed currency regression fixture",
            stale: false,
          },
        });
      });
      await page.goto("/tools/" + route);
      await page.waitForLoadState("networkidle");
      const previous = await result(page).locator("p").textContent();
      await field(page, "Account currency").selectOption("JPY");
      await expect.poll(() => requests).toBe(1);
      await expect(conversion(page)).toHaveValue("");
      await expect(result(page)).toContainText("Previous result.");
      if (route === "position-size-calculator") {
        await expect(field(page, "Account balance")).toHaveValue("");
        await field(page, "Account balance").fill("1000");
      }
      await calculate(page);
      await expect(page.locator("#calculator-error-conversion")).toBeVisible();
      await expect(result(page).locator("p")).toHaveText(previous!);
      release();
      await expect(conversion(page)).toHaveValue("150");
      await calculate(page);
      await expect(result(page)).not.toContainText("Previous result.");
      await field(page, "Account currency").selectOption("CHF");
      await expect(conversion(page)).toHaveValue("0.9");
      await expect(result(page)).toContainText("Previous result.");
      if (route === "position-size-calculator") {
        await expect(field(page, "Account balance")).toHaveValue("");
        await field(page, "Account balance").fill("1000");
      }
      await calculate(page);
      await expect(result(page)).not.toContainText("Previous result.");
      await expect(page.locator('[id^="calculator-error-"]')).toHaveCount(0);
      const expected = {
        "position-size-calculator": "4,000 units",
        "pip-value-calculator": "CHF 9.00",
        "profit-loss-calculator": "CHF 450.00 profit",
        "margin-calculator": "CHF 976.50",
      }[route]!;
      await expect(result(page).locator("p")).toHaveText(expected);
      await contained(page);
    },
  );
}

test("JPY exact minimum order passes; below it never rounds risk upwards", async ({
  page,
}) => {
  await mockRates(page);
  await page.goto("/tools/position-size-calculator");
  await page.waitForLoadState("networkidle");
  await field(page, "Account currency").selectOption("JPY");
  await expect(conversion(page)).toHaveValue("150");
  await field(page, "Account balance").fill("37500");
  await calculate(page);
  await expect(result(page).locator("p")).toHaveText("1,000 units");
  await field(page, "Account balance").fill("37499.99");
  await calculate(page);
  await expect(result(page).locator("p")).toHaveText("No position fits");
  await contained(page);
});

test("tiny manual conversion preserves nonzero 10-pip breakdown", async ({
  page,
}) => {
  await mockRates(page);
  await page.goto("/tools/pip-value-calculator");
  await page.waitForLoadState("networkidle");
  await field(page, "Account currency").selectOption("GHS");
  await expect(conversion(page)).toHaveValue("10");
  await page
    .getByRole("button", { name: "Use my own rate", exact: true })
    .click();
  await conversion(page).fill("0.000001");
  await field(page, "Position size (lots)").fill("0.0001");
  await calculate(page);
  const tenPips = result(page)
    .locator("dl div")
    .filter({ has: page.getByText("Value per 10 pips", { exact: true }) });
  await expect(tenPips.locator("dd")).toHaveText("GHS 0.00000001");
  await expect(result(page).locator("p")).toHaveText("GHS 0.000000001");
  await contained(page);
});
