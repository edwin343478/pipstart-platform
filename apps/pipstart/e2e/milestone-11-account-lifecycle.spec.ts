import { expect, test } from "@playwright/test";

const email = process.env.PIPSTART_E2E_ACCOUNT_EMAIL ?? "";
const password = process.env.PIPSTART_E2E_ACCOUNT_PASSWORD ?? "";
const updatedPassword = `${password}A1!`;

test.describe("Milestone 11 real Supabase account lifecycle", () => {
  test.skip(
    !email || !password,
    "Run pnpm test:e2e:account-lifecycle with the required release-gate environment.",
  );

  test("creates, updates, secures, signs out, signs in and deletes a learner", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    await page.goto("/register");
    await page.getByLabel("Display name").fill("Lifecycle Learner");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password (8+ characters)").fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByLabel(/I accept the Terms/).check();
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/welcome$/);
    await expect(
      page.getByRole("heading", { name: "Welcome to PipStart" }),
    ).toBeVisible();

    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/learn/forex/level-1");
    await expect(
      page.getByText("Progress is synchronized with your account."),
    ).toBeVisible();
    let rejectedSave = false;
    await page.route("**/learn/forex/level-1", async (route) => {
      if (!rejectedSave && route.request().method() === "POST") {
        rejectedSave = true;
        await route.abort("failed");
        return;
      }
      await route.continue();
    });
    await page.getByRole("button", { name: "Mark complete" }).click();
    const retry = page.getByRole("button", { name: "Retry save" });
    await expect(retry).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
    await expect(
      page.getByRole("button", { name: "Mark complete" }),
    ).toBeVisible();
    await retry.focus();
    await expect(retry).toBeFocused();
    await page.unroute("**/learn/forex/level-1");
    await retry.press("Enter");
    await expect(
      page.getByText("Progress saved to your account."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();

    // Preserve this explicit undo when stale anonymous completion is imported later.
    await page.getByRole("button", { name: "Completed" }).click();
    await expect(
      page.getByText("Progress saved to your account."),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Mark complete" }),
    ).toBeVisible();

    // Create an ordinary incomplete server row that a true union import may upgrade.
    await page.goto("/learn/forex/level-1/currency-pairs");
    await expect(
      page.getByText("Progress is synchronized with your account."),
    ).toBeVisible();

    await page.setViewportSize({ height: 720, width: 1280 });
    await page.goto("/account/profile");
    await page.getByLabel("Display name").fill("Lifecycle Updated");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByText("Profile updated.")).toBeVisible();

    await page.goto("/account/email-preferences");
    await page.getByLabel(/Product news/).check();
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(page.getByText("Email preferences updated.")).toBeVisible();

    await page.goto("/account/security");
    await page.getByLabel("Current password").fill(password);
    await page.getByLabel("New password (8+ characters)").fill(updatedPassword);
    await page.getByLabel("Confirm new password").fill(updatedPassword);
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.getByText("Password updated.")).toBeVisible();
    await page.getByRole("button", { name: "Sign out everywhere" }).click();
    await expect(page).toHaveURL(/\/login\?notice=signed-out/);

    await page.evaluate(() => {
      window.localStorage.setItem(
        "pipstart:learn:forex:level-1:progress",
        JSON.stringify({
          completedLessonSlugs: ["what-is-forex", "currency-pairs"],
          version: 1,
        }),
      );
    });

    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill(updatedPassword);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/account\/settings$/);

    await page.goto("/learn/forex/level-1");
    await expect(
      page.getByText("Progress is synchronized with your account."),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Mark complete" }),
    ).toBeVisible();
    await page.goto("/learn/forex/level-1/currency-pairs");
    await expect(
      page.getByText("Progress is synchronized with your account."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();

    await page.goto("/account/delete");
    await page.getByLabel("Type DELETE to confirm").fill("DELETE");
    await page.getByLabel("Password").fill(updatedPassword);
    await page.getByRole("button", { name: "Delete my account" }).click();
    await expect(page).toHaveURL(/\/account-deleted$/);
    await expect(
      page.getByRole("heading", { name: "Account deleted" }),
    ).toBeVisible();

    await page.goto("/login");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill(updatedPassword);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(
      page.getByText("Email or password is incorrect."),
    ).toBeVisible();
  });
});
