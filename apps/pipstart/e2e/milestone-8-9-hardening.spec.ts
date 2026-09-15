import { expect, test } from "@playwright/test";

test.describe("Milestones 8 and 9 learner journeys", () => {
  test("exposes the Forex hierarchy and supports direct refresh", async ({
    page,
  }) => {
    await page.goto("/learn/forex/level-1");
    await page
      .getByRole("link", { name: "Forex Kindergarten" })
      .first()
      .click();
    await expect(page).toHaveURL(
      /\/learn\/forex\/level-1\/forex-kindergarten$/,
    );

    await page.getByRole("link", { name: /Forex Foundations/ }).click();
    await expect(
      page.getByRole("heading", { name: "Forex Foundations" }),
    ).toBeVisible();
    await page.locator('a[href="/learn/forex/level-1"]').click();
    await expect(page).toHaveURL(/\/learn\/forex\/level-1$/);
    await expect(
      page.getByRole("heading", { name: "What is Forex?" }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "What is Forex?" }),
    ).toBeVisible();
  });

  test("uses an explicit completed-module destination", async ({ page }) => {
    await page.goto("/learn/forex");
    await page.evaluate(() =>
      localStorage.setItem(
        "pipstart:learn:forex:level-1:progress",
        JSON.stringify({
          completedLessonSlugs: [
            "what-is-forex",
            "currency-pairs",
            "pips-and-lots",
            "bid-ask-spread",
            "trading-sessions",
            "market-participants",
          ],
          version: 1,
        }),
      ),
    );
    await page.reload();

    await expect(
      page.getByRole("link", { name: /Forex Kindergarten/ }),
    ).toHaveAttribute(
      "href",
      "/learn/forex/level-1/forex-kindergarten/forex-foundations",
    );
    await expect(page.getByText("Review completed module")).toBeVisible();
  });

  test("recovers from corrupt progress and publishes only real Crypto lessons", async ({
    page,
  }) => {
    await page.goto("/learn/crypto/level-1");
    await page.evaluate(() =>
      localStorage.setItem(
        "pipstart:learn:crypto:level-1:progress",
        "not-json",
      ),
    );
    await page.reload();

    await expect(page.getByText("0 of 1 complete").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "What is Bitcoin?" }).first(),
    ).toBeVisible();
    await expect(page.getByText("Transactions and blocks")).toHaveCount(0);
  });
});
