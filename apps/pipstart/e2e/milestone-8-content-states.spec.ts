import { expect, test } from "@playwright/test";

test.describe("Milestone 8 public content states", () => {
  test("serves the branded recovery page with a 404 response", async ({
    page,
  }) => {
    const response = await page.goto("/this-page-does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "This page could not be found" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Start learning" }),
    ).toHaveAttribute("href", "/start-here");
  });

  test("keeps the 404 recovery page within a 320px viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/missing-mobile-page");

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
});
