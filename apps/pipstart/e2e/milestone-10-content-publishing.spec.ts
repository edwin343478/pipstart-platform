import { expect, test } from "@playwright/test";

test.describe("Milestone 10 content publishing", () => {
  test("renders migrated Forex MDX content and review dates", async ({
    page,
  }) => {
    await page.goto("/learn/forex/level-1/currency-pairs");
    await expect(
      page.getByRole("heading", { name: "Currency pairs" }),
    ).toBeVisible();
    await expect(page.getByText(/Published 2026-09-15/)).toBeVisible();
    await expect(page.getByText(/Reviewed 2026-09-15/)).toBeVisible();
    await expect(
      page.getByText("The first currency is called the base currency."),
    ).toBeVisible();
  });

  test("renders migrated Crypto MDX content on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/learn/crypto/level-1");
    await expect(
      page.getByRole("heading", { name: "What is Bitcoin?" }),
    ).toBeVisible();
    await expect(page.getByText(/Published 2026-09-15/)).toBeVisible();
    await expect(
      page.getByText("Bitcoin operates without a central bank."),
    ).toBeVisible();
  });

  test("does not publish or index a draft lesson route", async ({ page }) => {
    await page.goto("/learn/crypto/level-1/bitcoin-security-basics");
    await expect(
      page.getByRole("heading", { name: "This page could not be found" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Bitcoin security basics" }),
    ).toHaveCount(0);

    await page.goto("/sitemap.xml");
    await expect(page.locator("body")).not.toContainText(
      "bitcoin-security-basics",
    );
  });
});
