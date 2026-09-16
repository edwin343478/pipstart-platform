import { expect, test } from "@playwright/test";

test.describe("Milestone 11 learner accounts", () => {
  test("renders registration and validates required account fields", async ({
    page,
  }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: "Create your account" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(
      page.getByText("Please correct the highlighted fields.", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  });

  test("uses a neutral password-reset response in every service state", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email address").fill("learner@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(
      page.getByText(
        /^(If an account matches that email|Account services are temporarily unavailable)/,
      ),
    ).toBeVisible();
  });

  test("welcomes a newly created learner with clear next steps", async ({
    page,
  }) => {
    await page.goto("/welcome");
    await expect(
      page.getByRole("heading", { name: "Welcome to PipStart" }),
    ).toBeVisible();
    await expect(page.getByText(/You’re all set!/)).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Start learning" }),
    ).toBeVisible();
  });

  test("preserves completed registration fields after a missing step", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.getByLabel("Display name").fill("Asha Learner");
    await page.getByLabel("Email address").fill("asha@example.com");
    await page.getByLabel("Password (6+ characters)").fill("learn1");
    await page.getByLabel("Confirm password").fill("learn1");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(
      page.getByText("You must accept the Terms and Privacy Policy."),
    ).toBeVisible();
    await expect(page.getByLabel("Display name")).toHaveValue("Asha Learner");
    await expect(page.getByLabel("Email address")).toHaveValue(
      "asha@example.com",
    );
    await expect(page.getByLabel("Password (6+ characters)")).toHaveValue(
      "learn1",
    );
  });

  test("redirects anonymous learners away from account and administrator pages", async ({
    page,
  }) => {
    await page.goto("/account/settings");
    await expect(page).toHaveURL(
      /\/login\?next=%2Faccount%2Fsettings|\/login\?next=\/account\/settings/,
    );
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("renders the mobile login experience without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
    const hasOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasOverflow).toBe(false);
  });

  test("keeps account footers at the mobile viewport edge", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ["/register", "/login", "/welcome"]) {
      await page.goto(route);
      const footer = await page.locator("#main-content + footer").boundingBox();
      expect(footer).not.toBeNull();
      expect((footer?.y ?? 0) + (footer?.height ?? 0)).toBeGreaterThanOrEqual(
        844 - 70,
      );
    }
  });

  test("shows login in the mobile homepage header and expanded menu", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(
      page
        .getByRole("navigation", { name: "Primary navigation" })
        .getByRole("link", { name: "Log in" }),
    ).toBeVisible();
  });
});
