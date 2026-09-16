import { expect, test } from "@playwright/test";

test.describe("Milestone 12 permanent progress", () => {
  test("keeps anonymous completion on the device", async ({ page }) => {
    await page.goto("/learn/forex/level-1");
    await expect(
      page.getByText("Progress is saved on this device."),
    ).toBeVisible();
    await page.getByRole("button", { name: "Mark complete" }).click();
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
  });
  test("shows mobile module progress without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(
      "/learn/forex/level-1/forex-kindergarten/forex-foundations",
    );
    await expect(page.getByText(/lessons complete · \d+%/)).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
  });
  test("keeps protected progress entry redirects at HTTP level", async ({
    request,
  }) => {
    const response = await request.get("/account/settings", {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toContain("/login?next=");
  });
});
