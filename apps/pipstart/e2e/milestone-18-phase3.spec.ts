import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const tools = [
  ["risk-reward-calculator", "Entry price"],
  ["position-size-calculator", "Account balance"],
  ["pip-value-calculator", "Position size (lots)"],
  ["profit-loss-calculator", "Entry price"],
  ["margin-calculator", "Market price"],
  ["drawdown-calculator", "Starting balance"],
  ["gain-recovery-calculator", "Current balance"],
  ["crypto-position-size-calculator", "Account balance"],
  ["dollar-cost-averaging-calculator", "Investment per purchase"],
  ["compound-growth-illustration", "Number of periods"],
] as const;

function field(page: Page, label: string) {
  return page
    .locator("label")
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator("input, select");
}

async function tabTo(page: Page, target: Locator) {
  // No focus(), click() or pointer shortcut: exercise the real tab sequence.
  for (let index = 0; index < 100; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement))
      return;
    await page.keyboard.press("Tab");
  }
  throw new Error(
    "The target was not reachable within 100 keyboard Tab presses.",
  );
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}

async function accessible(page: Page, label: string) {
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  await test.info().attach(label, {
    body: JSON.stringify(scan.violations, null, 2),
    contentType: "application/json",
  });
  expect(scan.violations, label).toEqual([]);
}

for (const [route, editableLabel] of tools) {
  test(
    route + ": stable public route, metadata and accessible default state",
    async ({ page }) => {
      const response = await page.goto("/tools/" + route);
      expect(response?.status()).toBe(200);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page).toHaveTitle(/.+/);
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(new URL(canonical ?? "").pathname).toBe("/tools/" + route);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        /.+/,
      );
      await noOverflow(page);
      await accessible(page, route + "-default");
    },
  );

  test(
    route + ": keyboard-only blank-input error and successful recovery",
    async ({ page }) => {
      await page.goto("/tools/" + route);
      await page.waitForLoadState("networkidle");
      const input = field(page, editableLabel);
      const initial = await input.inputValue();
      expect(initial).not.toBe("");
      const calculate = page.getByRole("button", {
        name: "Calculate",
        exact: true,
      });
      await tabTo(page, input);
      await page.keyboard.press("ControlOrMeta+A");
      await page.keyboard.press("Backspace");
      await tabTo(page, calculate);
      await page.keyboard.press("Enter");
      const error = page.locator('[id^="calculator-error-"]');
      await expect(error).toBeVisible();
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await expect(input).toHaveAttribute(
        "aria-describedby",
        (await error.getAttribute("id")) ?? "",
      );
      await expect(error).toContainText(/valid/i);
      await accessible(page, route + "-invalid");
      await tabTo(page, input);
      await page.keyboard.type(initial);
      await tabTo(page, calculate);
      await page.keyboard.press("Enter");
      await expect(error).toHaveCount(0);
      await expect(input).not.toHaveAttribute("aria-invalid", "true");
      await expect(page.locator('section[aria-live="polite"]')).toBeVisible();
      await noOverflow(page);
    },
  );

  test(
    route + ": teaching and results survive custom text spacing",
    async ({ page }) => {
      await page.goto("/tools/" + route);
      await page.waitForLoadState("networkidle");
      await page
        .getByRole("button", { name: "Calculate", exact: true })
        .click();
      await expect(page.locator('[id^="calculator-error-"]')).toHaveCount(0);
      // Browser-only acceptance fixture, never a shipped stylesheet.
      await page.addStyleTag({
        content:
          "* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }",
      });
      await expect(
        page.getByRole("heading", {
          name: "How this calculation works",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Worked example", exact: true }),
      ).toBeVisible();
      await expect(page.locator('section[aria-live="polite"]')).toBeVisible();
      await noOverflow(page);
    },
  );
}

test("tools hub retains all ten public calculator links", async ({ page }) => {
  const response = await page.goto("/tools");
  expect(response?.status()).toBe(200);
  await page.waitForLoadState("networkidle");
  for (const [route] of tools) {
    await expect(page.locator('a[href="/tools/' + route + '"]')).toHaveCount(1);
  }
  await noOverflow(page);
});

test("compound rejects fractional/over-limit periods and safely recovers at the limit", async ({
  page,
}) => {
  await page.goto("/tools/compound-growth-illustration");
  await page.waitForLoadState("networkidle");
  const periods = field(page, "Number of periods");
  for (const invalid of ["1.5", "1201"]) {
    await periods.fill(invalid);
    await page.getByRole("button", { name: "Calculate", exact: true }).click();
    await expect(periods).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator('[id^="calculator-error-"]')).toBeVisible();
  }
  await periods.fill("1200");
  await field(page, "Illustrative growth per period (%)").fill("0");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.locator('[id^="calculator-error-"]')).toHaveCount(0);
  await noOverflow(page);
});

test("DCA reversed and purchase-cap dates produce linked errors", async ({
  page,
}) => {
  await page.goto("/tools/dollar-cost-averaging-calculator");
  await page.waitForLoadState("networkidle");
  await field(page, "First purchase date").fill("2026-10-08");
  await field(page, "Plan end date").fill("2026-10-07");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(field(page, "Plan end date")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await field(page, "Purchase frequency").selectOption("weekly");
  await field(page, "First purchase date").fill("1970-01-01");
  await field(page, "Plan end date").fill("2050-01-01");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.locator('[id^="calculator-error-"]')).toContainText(
    "2,400",
  );
  await expect(field(page, "Plan end date")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("total drawdown has an explanation rather than an infinite recovery", async ({
  page,
}) => {
  await page.goto("/tools/drawdown-calculator");
  await page.waitForLoadState("networkidle");
  await field(page, "Drawdown unit").selectOption("percent");
  await field(page, "Drawdown").fill("100");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.locator('[id^="calculator-error-"]')).toContainText(
    "Percentage recovery is not defined",
  );
  await expect(field(page, "Drawdown")).toHaveAttribute("aria-invalid", "true");
});
