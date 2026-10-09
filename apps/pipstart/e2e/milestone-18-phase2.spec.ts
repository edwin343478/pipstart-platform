import { expect, test, type Page } from "@playwright/test";
import {
  calculatorLearning,
  type CalculatorLearningRoute,
} from "../src/app/tools/calculator-learning";

function field(page: Page, label: string) {
  return page
    .locator("label")
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator("input, select");
}

const examples = {
  "risk-reward-calculator": {
    fill: {
      "Entry price": "100",
      "Stop-loss price": "90",
      "Target price": "120",
    },
    select: {
      "Trade direction": "long",
    },
    heading: "Risk-to-reward ratio",
    value: "1 : 2.00",
  },
  "position-size-calculator": {
    fill: {
      "Account balance": "1000",
      "Risk per trade (%)": "1",
      "Stop loss (pips)": "20",
    },
    select: {
      "Account currency": "USD",
      "Currency pair or metal": "EUR/USD",
    },
    heading: "Maximum position size",
    value: "5,000",
  },
  "pip-value-calculator": {
    fill: {
      "Position size (lots)": "0.1",
    },
    select: {
      "Account currency": "USD",
      "Currency pair or metal": "EUR/USD",
    },
    heading: "Value per pip",
    value: "USD 1.00",
  },
  "profit-loss-calculator": {
    fill: {
      "Position size (lots)": "0.1",
      "Entry price": "1.1",
      "Exit price": "1.105",
    },
    select: {
      "Account currency": "USD",
      "Currency pair or metal": "EUR/USD",
      "Trade direction": "long",
    },
    heading: "Estimated gross result",
    value: "USD 50.00",
  },
  "margin-calculator": {
    fill: {
      "Position size (lots)": "0.1",
      "Market price": "1.1",
    },
    select: {
      "Account currency": "USD",
      "Currency pair or metal": "EUR/USD",
      Leverage: "50",
    },
    heading: "Estimated required margin",
    value: "USD 220.00",
  },
  "drawdown-calculator": {
    fill: {
      "Starting balance": "1000",
      Drawdown: "20",
    },
    select: {
      "Account currency": "USD",
      "Drawdown unit": "percent",
    },
    heading: "Gain required to recover",
    value: "25.00%",
  },
  "gain-recovery-calculator": {
    fill: {
      "Current balance": "100",
      "Recovery target": "144",
      "Planned gain per period (%)": "20",
    },
    select: {
      "Account currency": "USD",
    },
    heading: "Estimated recovery time",
    value: "2",
  },
  "crypto-position-size-calculator": {
    fill: {
      "Account balance": "1000",
      "Risk per trade (%)": "1",
      "Entry price": "100",
      "Stop-loss price": "90",
      "Minimum order quantity": "0.01",
      "Quantity step": "0.01",
    },
    select: {
      "Account currency": "USD",
      "Trading mode": "spot",
      "Trade direction": "long",
      "Crypto asset": "BTC",
    },
    heading: "Maximum position size",
    value: "1.000000 BTC",
  },
  "dollar-cost-averaging-calculator": {
    fill: {
      "Investment per purchase": "100",
      "First purchase date": "2026-01-01",
      "Plan end date": "2026-02-01",
      "Starting asset price": "10",
      "Ending asset price": "20",
    },
    select: {
      "Account currency": "USD",
      Asset: "BTC",
      "Purchase frequency": "monthly",
    },
    heading: "Illustrated ending value",
    value: "USD 300.00",
  },
  "compound-growth-illustration": {
    fill: {
      "Starting amount": "100",
      "Contribution per period": "10",
      "Number of periods": "2",
      "Illustrative growth per period (%)": "10",
    },
    select: {
      "Account currency": "USD",
      "Contribution timing": "end",
    },
    heading: "Illustrated ending balance",
    value: "USD 142.00",
  },
} satisfies Record<
  CalculatorLearningRoute,
  {
    fill: Record<string, string>;
    select: Record<string, string>;
    heading: string;
    value: string;
  }
>;

for (const route of Object.keys(
  calculatorLearning,
) as CalculatorLearningRoute[]) {
  test(`${route}: teaching is readable and its topic link opens the published lesson`, async ({
    page,
  }, testInfo) => {
    await page.goto(`/tools/${route}`);
    await page.waitForLoadState("networkidle");
    const content = calculatorLearning[route];
    const teaching = page.getByRole("region", {
      name: "How this calculation works",
      exact: true,
    });
    const example = page.getByRole("region", {
      name: "Worked example",
      exact: true,
    });
    await expect(teaching).toBeVisible();
    await expect(
      teaching.getByRole("heading", { name: "Formula in plain language" }),
    ).toBeVisible();
    await expect(example).toContainText(content.example.result);
    await expect(example.locator("ol > li")).toHaveCount(
      content.example.steps.length,
    );
    await expect(example.locator("ol")).toHaveCSS("list-style-type", "decimal");
    await expect(teaching.getByRole("heading", { level: 2 })).toHaveCSS(
      "font-weight",
      "700",
    );
    await expect(example).toContainText("separate from your current inputs");
    const ids = await page
      .locator("[id]")
      .evaluateAll((nodes) => nodes.map((node) => node.id));
    expect(new Set(ids).size).toBe(ids.length);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
    if (route === "compound-growth-illustration")
      await page.screenshot({
        path: testInfo.outputPath("teaching-page.png"),
        fullPage: true,
      });
    const topic = page.getByRole("complementary", {
      name: content.lesson.title,
      exact: true,
    });
    const link = topic.getByRole("link", { name: "Open lesson" });
    await expect(link).toHaveAttribute("href", content.lesson.href);
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(content.lesson.href + "$"), {
      timeout: 75_000,
    });
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      content.lesson.title,
    );
  });

  test(`${route}: the visible worked example reproduces in the existing form`, async ({
    page,
  }) => {
    await page.goto(`/tools/${route}`);
    await page.waitForLoadState("networkidle");
    const example: {
      fill: Record<string, string>;
      select: Record<string, string>;
      heading: string;
      value: string;
    } = examples[route];
    for (const [label, value] of Object.entries(example.select)) {
      const control = field(page, label);
      if (await control.isDisabled()) {
        // Spot mode deliberately fixes direction to Long / Buy.
        await expect(control).toHaveValue(value);
      } else {
        await control.selectOption(value);
      }
    }
    for (const [label, value] of Object.entries(example.fill))
      await field(page, label).fill(value);
    await page.getByRole("button", { name: "Calculate", exact: true }).click();
    const result = page.locator("section").filter({
      has: page.getByRole("heading", { name: example.heading, exact: true }),
    });
    await expect(result).toContainText(example.value);
    await expect(page.locator('[id^="calculator-error-"]')).toHaveCount(0);
    // Static teaching must not change when a user calculates their own scenario.
    await expect(
      page.getByRole("region", { name: "Worked example", exact: true }),
    ).toContainText(calculatorLearning[route].example.result);
  });
}
