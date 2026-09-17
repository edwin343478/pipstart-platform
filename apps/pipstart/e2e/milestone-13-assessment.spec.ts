import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Milestone 13 assessment UX", () => {
  test("keeps answers private until submit and handles unanswered confirmation", async ({
    page,
  }) => {
    await page.goto("/learn/forex/level-1/quiz");

    await expect(page.locator("fieldset")).toHaveCount(6);
    await expect(page.getByText("Needs review")).toHaveCount(0);
    await expect(page.getByText("Correct answer:")).toHaveCount(0);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await page.getByRole("button", { name: "Submit quiz" }).click();
    const confirmation = page.getByRole("alert").filter({
      hasText: "6 unanswered questions.",
    });
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toBeFocused();

    await page.getByRole("button", { name: "Review unanswered" }).click();
    await expect(page.locator("fieldset").first()).toBeFocused();

    await page.getByRole("button", { name: "Submit quiz" }).click();
    await page.getByRole("button", { name: "Submit anyway" }).click();

    const result = page.getByRole("heading", { name: /0 of 6 correct/ });
    await expect(result).toBeVisible();
    await expect(page.getByText("Needs review")).toHaveCount(6);
    await expect(
      page.getByText(
        "Forex is the global market where one currency is exchanged for another.",
      ),
    ).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await expect(
      page.getByRole("link", {
        name: "Sign in to save future quiz attempts and build your history.",
      }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Try again" }).click();
    await expect(
      page.getByRole("button", { name: "Submit quiz" }),
    ).toBeVisible();
    await expect(page.getByText("Needs review")).toHaveCount(0);
  });

  test("supports keyboard input, refreshes anonymously without false submit, and has no mobile overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/learn/forex/level-1/quiz");

    const firstRadio = page.locator('input[type="radio"]').first();
    await firstRadio.focus();
    await firstRadio.press("Space");
    await expect(firstRadio).toBeChecked();

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);

    await page.reload();
    await expect(
      page.getByRole("button", { name: "Submit quiz" }),
    ).toBeVisible();
    await expect(page.locator("input:checked")).toHaveCount(0);
    await expect(page.getByText("Passed")).toHaveCount(0);
    await expect(page.getByText("Ready to retry")).toHaveCount(0);

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
  });
});
