import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const remoteUrl = process.env.PIPSTART_M13_SUPABASE_URL?.trim() ?? "";
const remotePublishableKey =
  process.env.PIPSTART_M13_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
const remoteSecretKey =
  process.env.PIPSTART_M13_SUPABASE_SECRET_KEY?.trim() ?? "";
const remoteEnvironmentReady = Boolean(
  remoteUrl && remotePublishableKey && remoteSecretKey,
);

let admin: ReturnType<typeof createClient> | null = null;
let userId: string | null = null;
let email = "";
let password = "";

test.describe("Milestone 13 authenticated assessment journey", () => {
  test.skip(
    !remoteEnvironmentReady,
    "Run the authenticated assessment gate with the Milestone 13 remote Supabase environment.",
  );

  test.beforeAll(async () => {
    admin = createClient(remoteUrl, remoteSecretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    email = `pipstart-m13-e2e-${Date.now()}-${randomUUID().slice(0, 8)}@example.com`;
    password = `M13-${randomUUID()}-Aa1!`;

    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
      user_metadata: { display_name: "Milestone 13 E2E learner" },
    });
    if (created.error || !created.data.user) {
      throw new Error(
        `Could not provision disposable learner: ${created.error?.message ?? "unknown error"}`,
      );
    }
    userId = created.data.user.id;
  });

  test.afterAll(async () => {
    if (!admin || !userId) return;
    const deleted = await admin.auth.admin.deleteUser(userId, false);
    if (deleted.error) {
      throw new Error(
        `Could not remove disposable learner: ${deleted.error.message}`,
      );
    }
  });

  test("autosaves, resumes, submits, records history, retakes, and is visible cross-browser", async ({
    browser,
    page,
  }) => {
    test.setTimeout(120_000);

    await page.goto("/login?next=%2Flearn%2Fforex%2Flevel-1%2Fquiz");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/learn\/forex\/level-1\/quiz$/, {
      timeout: 15_000,
    });

    const firstAnswer = page.getByLabel("Exchanging one currency for another");
    await firstAnswer.check();
    await expect(
      page.getByText("Selections saved to your account."),
    ).toBeVisible({ timeout: 15_000 });

    await page.reload();
    await expect(firstAnswer).toBeChecked({ timeout: 15_000 });

    await page.getByLabel("EUR", { exact: true }).check();
    await page.getByLabel("A pip measures a small price movement").check();
    await page.getByLabel("A lot describes the size of a trade").check();
    await page.getByLabel("True", { exact: true }).check();
    await page
      .getByLabel(
        "Market activity can vary as different financial centres open and close",
      )
      .check();
    await page.getByLabel("Banks", { exact: true }).check();
    await page.getByLabel("Businesses", { exact: true }).check();
    await page.getByLabel("Individual traders", { exact: true }).check();

    await expect(
      page.getByText("Selections saved to your account."),
    ).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "Submit quiz" }).click();
    await expect(
      page.getByRole("heading", { name: /6 of 6 correct/ }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Passed", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Attempt history" }),
    ).toBeVisible();
    await expect(page.getByText(/Attempt 1/)).toBeVisible();
    await expect(page.getByText(/6\/6.*Passed/)).toBeVisible();

    const secondContext = await browser.newContext();
    try {
      const secondPage = await secondContext.newPage();
      await secondPage.goto("/login?next=%2Flearn%2Fforex%2Flevel-1%2Fquiz");
      await secondPage.getByLabel("Email address").fill(email);
      await secondPage.getByLabel("Password").fill(password);
      await secondPage.getByRole("button", { name: "Log in" }).click();
      await expect(secondPage).toHaveURL(/\/learn\/forex\/level-1\/quiz$/, {
        timeout: 15_000,
      });
      await expect(
        secondPage.getByRole("heading", { name: "Attempt history" }),
      ).toBeVisible({ timeout: 15_000 });
      await expect(secondPage.getByText(/Attempt 1/)).toBeVisible();
      await expect(secondPage.getByText(/6\/6.*Passed/)).toBeVisible();
    } finally {
      await secondContext.close();
    }

    await page.waitForTimeout(3_100);
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(
      page.getByRole("button", { name: "Submit quiz" }),
    ).toBeVisible();
  });
});
