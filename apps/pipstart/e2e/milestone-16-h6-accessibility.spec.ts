import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { cryptoLevel0Lessons } from "../src/content/lessons/crypto/level-0-lessons";
import { cryptoLevel1Lessons } from "../src/content/lessons/crypto/level-1-lessons";
import { cryptoLevel2Lessons } from "../src/content/lessons/crypto/level-2-lessons";
import { cryptoLevel3Lessons } from "../src/content/lessons/crypto/level-3-lessons";
import { cryptoLevel4Lessons } from "../src/content/lessons/crypto/level-4-lessons";
import { cryptoLevel5Lessons } from "../src/content/lessons/crypto/level-5-lessons";
import { cryptoLevel6Lessons } from "../src/content/lessons/crypto/level-6-lessons";
import { cryptoLevel7Lessons } from "../src/content/lessons/crypto/level-7-lessons";
import { cryptoLevel8Lessons } from "../src/content/lessons/crypto/level-8-lessons";
import { cryptoLevel9Lessons } from "../src/content/lessons/crypto/level-9-lessons";
import { cryptoLevel10Lessons } from "../src/content/lessons/crypto/level-10-lessons";

// Read approved course metadata in the test runner only; never send the catalogue to a page.
const lessonPaths = [
  ...cryptoLevel0Lessons,
  ...cryptoLevel1Lessons,
  ...cryptoLevel2Lessons,
  ...cryptoLevel3Lessons,
  ...cryptoLevel4Lessons,
  ...cryptoLevel5Lessons,
  ...cryptoLevel6Lessons,
  ...cryptoLevel7Lessons,
  ...cryptoLevel8Lessons,
  ...cryptoLevel9Lessons,
  ...cryptoLevel10Lessons,
]
  .filter(
    ({ metadata }) => metadata.approved && metadata.status === "published",
  )
  .map(
    ({ metadata }) =>
      `/learn/crypto/${metadata.level}${metadata.position === 1 ? "" : `/${metadata.slug}`}`,
  );
for (const width of [1440, 390, 320]) {
  test(`all published Crypto lessons pass accessibility checks at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(480_000);
    await page.setViewportSize({ width, height: 900 });
    const findings: { path: string; violations: unknown[] }[] = [];
    for (const path of lessonPaths) {
      await test.step(path, async () => {
        expect(
          (await page.goto(path, { waitUntil: "networkidle" }))?.status(),
        ).toBe(200);
        await page
          .getByRole("checkbox", {
            name: "Show all sections at once",
            exact: true,
          })
          .check({ timeout: 10_000 });
        // Expose native non-scored disclosures for the audit. Interaction is tested separately.
        await page
          .locator("main details")
          .evaluateAll((nodes) =>
            nodes.forEach((node) => ((node as HTMLDetailsElement).open = true)),
          );
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        findings.push({ path, violations: result.violations });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
          path,
        ).toBeLessThanOrEqual(width + 1);
      });
    }
    await testInfo.attach(`crypto-accessibility-${width}.json`, {
      body: JSON.stringify(findings, null, 2),
      contentType: "application/json",
    });
    expect(
      findings.filter((item) => item.violations.length),
      "See attached route-by-route accessibility report",
    ).toEqual([]);
  });
}

test("diagram text, original image and print remain available without JavaScript", async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/learn/crypto/level-1/shared-ledger-checks-and-security");
    const disclosure = page
      .locator("details")
      .filter({ has: page.getByText("Read diagram as text", { exact: true }) })
      .last();
    const summary = disclosure.locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(disclosure).toHaveAttribute("open", "");
    await expect(disclosure.getByText(/The miner icons differ/)).toBeVisible();
    const original = page.getByRole("link", {
      name: /Open original-size diagram: Miners A/,
    });
    expect(
      (await request.get((await original.getAttribute("href"))!)).status(),
    ).toBe(200);
    await summary.focus();
    await page.keyboard.press("Enter");
    await page.emulateMedia({ media: "print" });
    await expect(disclosure.getByText(/The miner icons differ/)).toBeVisible();
  } finally {
    await context.close();
  }
});

test("wide comparison tables can be scrolled using the keyboard on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/learn/crypto/level-2");
  await page
    .getByRole("checkbox", { name: "Show all sections at once", exact: true })
    .check({ timeout: 10_000 });
  const table = page
    .getByRole("region")
    .filter({ has: page.locator("table") })
    .first();
  await table.focus();
  await expect(table).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => table.evaluate((node) => node.scrollLeft))
    .toBeGreaterThan(0);
});

test.describe("Native glossary", () => {
  test.use({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  });
  test("glossary supports native search, alphabetical filters and deep links without JavaScript", async ({
    page,
  }) => {
    // Use the managed page fixture so context cleanup cannot mask the failed step.
    page.setDefaultTimeout(10_000);
    page.setDefaultNavigationTimeout(15_000);
    await test.step("Open all terms at the Gas anchor", async () => {
      expect((await page.goto("/glossary/crypto#gas"))?.status()).toBe(200);
      await expect(page.locator("article")).toHaveCount(136);
      await expect(page.locator("#gas")).toBeInViewport();
    });
    await test.step("Submit native GET search", async () => {
      await page
        .getByRole("searchbox", { name: "Search cryptocurrency terms" })
        .fill("gas");
      // Native keyboard activation avoids smooth-scrolling from the long glossary
      // to the header. The actual form and link navigation remain under test.
      await page.getByRole("button", { name: "Search", exact: true }).focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/glossary\/crypto\?q=gas(?:&category=)?$/);
      await expect(page.locator("#gas")).toBeVisible();
    });
    await test.step("Filter terms by M", async () => {
      await page.getByRole("link", { name: "M", exact: true }).focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/glossary\/crypto\?letter=M$/);
      await expect(page.locator("#mempool")).toBeVisible();
    });
    await test.step("Return to all terms without horizontal overflow", async () => {
      await page.getByRole("link", { name: "All", exact: true }).focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/glossary\/crypto$/);
      await expect(page.locator("article")).toHaveCount(136);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(321);
    });
  });
});

test("lesson key terms open the matching glossary entry and return to lesson context", async ({
  page,
}) => {
  await page.goto("/learn/crypto/level-4/gas-transactions-and-failed-attempts");
  const summary = page.getByText("Key terms in this lesson", { exact: true });
  await summary.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("link", { name: "Gas", exact: true }).click();
  await expect(page).toHaveURL(/\/glossary\/crypto#gas$/);
  await expect(page.locator("#gas")).toBeInViewport();
  await page
    .locator("#gas")
    .getByRole("link", { name: /Read in context/ })
    .first()
    .click();
  await expect(page).toHaveURL(/gas-transactions-and-failed-attempts$/);
});

test("glossary passes accessibility checks with search and context links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/glossary/crypto");
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
