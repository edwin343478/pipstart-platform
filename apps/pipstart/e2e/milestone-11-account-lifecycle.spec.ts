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
    test.setTimeout(90_000);

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

    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill(updatedPassword);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/account\/settings$/);

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
