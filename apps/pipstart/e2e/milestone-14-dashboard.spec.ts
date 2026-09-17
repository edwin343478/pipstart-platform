import AxeBuilder from "@axe-core/playwright";
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

const quizId = "forex-foundations-quiz";
const quizVersion = 1;
const questionOrder = [
  "forex-market-purpose",
  "currency-pair-order",
  "pip-and-lot",
  "spread-meaning",
  "trading-sessions",
  "market-participants",
];
const choiceOrder = Object.fromEntries(questionOrder.map((id) => [id, []]));
const publicSnapshot = {
  id: quizId,
  passingPercentage: 70,
  questions: questionOrder.map((id) => ({ choices: [], id })),
  title: "Milestone 14 dashboard verification",
  version: quizVersion,
};

let admin: ReturnType<typeof createClient> | null = null;
let userId: string | null = null;
let email = "";
let password = "";

type AssessmentRpcRow = { id: string };
type AssessmentRpcResult = {
  data: AssessmentRpcRow | AssessmentRpcRow[] | null;
  error: { message: string } | null;
};
type AssessmentRpcClient = {
  rpc: (
    functionName: string,
    args: Record<string, unknown>,
  ) => Promise<AssessmentRpcResult>;
};

async function callAssessmentRpc(
  functionName: string,
  args: Record<string, unknown>,
) {
  if (!admin) throw new Error("Disposable learner is unavailable.");
  return (admin as unknown as AssessmentRpcClient).rpc(functionName, args);
}

async function addFailedQuizAttempt() {
  if (!admin || !userId) throw new Error("Disposable learner is unavailable.");
  const started = await callAssessmentRpc("pipstart_start_assessment_attempt", {
    requested_choice_order: choiceOrder,
    requested_passing_percentage: 70,
    requested_public_snapshot: publicSnapshot,
    requested_question_order: questionOrder,
    requested_quiz_id: quizId,
    requested_quiz_version: quizVersion,
    requested_user_id: userId,
  });
  if (started.error) {
    throw new Error(
      `Could not start dashboard quiz attempt: ${started.error.message}`,
    );
  }
  const attempt = Array.isArray(started.data) ? started.data[0] : started.data;
  if (!attempt?.id) throw new Error("Dashboard quiz attempt returned no id.");

  const submitted = await callAssessmentRpc(
    "pipstart_submit_assessment_attempt",
    {
      requested_answers: { verification: ["milestone-14-dashboard"] },
      requested_attempt_id: attempt.id,
      requested_course_id: "forex-kindergarten",
      requested_max_score: questionOrder.length,
      requested_module_id: "forex-foundations",
      requested_passed: false,
      requested_review_snapshot: { marker: "milestone-14-dashboard" },
      requested_score: 4,
      requested_submission_token: randomUUID(),
      requested_user_id: userId,
    },
  );
  if (submitted.error) {
    throw new Error(
      `Could not submit dashboard quiz attempt: ${submitted.error.message}`,
    );
  }
}

test.describe("Milestone 14 authenticated learner dashboard", () => {
  test.skip(
    !remoteEnvironmentReady,
    "Run the dashboard gate with the Milestone 13 remote Supabase environment.",
  );

  test.beforeAll(async () => {
    admin = createClient(remoteUrl, remoteSecretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    email = `pipstart-m14-e2e-${Date.now()}-${randomUUID().slice(0, 8)}@example.com`;
    password = `M14-${randomUUID()}-Aa1!`;

    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
      user_metadata: { display_name: "Milestone 14 E2E learner" },
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

  test("protects, guides, tracks, bookmarks and renders without mobile overflow", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ height: 844, width: 390 });

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15_000 });

    await expect(
      page.getByRole("heading", { name: "Choose your first learning path" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    const dashboardResponse = await page.goto("/dashboard");
    expect(
      (dashboardResponse?.headers()["cache-control"] ?? "").toLowerCase(),
    ).not.toContain("public");

    await page.goto("/learn/forex/level-1");
    const lessonTitle = (await page
      .getByRole("heading", { level: 1 })
      .textContent())!;
    await expect(
      page.getByText("Progress is synchronized with your account."),
    ).toBeVisible({ timeout: 15_000 });
    const bookmarkButton = page.getByRole("button", {
      name: "Bookmark",
      exact: true,
    });
    await expect(bookmarkButton).toBeVisible({ timeout: 15_000 });
    await bookmarkButton.click();
    await expect(
      page.getByRole("button", { name: "Bookmarked", exact: true }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Lesson bookmarked.")).toBeVisible({
      timeout: 15_000,
    });

    const savedRows = await admin!
      .from("pipstart_bookmarks")
      .select("resource_id")
      .eq("user_id", userId!)
      .eq("resource_type", "lesson");
    if (savedRows.error) throw new Error(savedRows.error.message);
    expect(savedRows.data).toEqual([{ resource_id: "what-is-forex" }]);

    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: "Continue learning" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Continue lesson" }),
    ).toBeVisible();
    await expect(
      page.getByRole("progressbar", { name: "Forex Kindergarten completion" }),
    ).toHaveAttribute("value", "0");

    const bookmarksSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Bookmarks" }),
    });
    await expect(
      bookmarksSection.getByRole("link", { name: lessonTitle }),
    ).toBeVisible();

    const recentSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Recent lessons" }),
    });
    await expect(
      recentSection.getByRole("link", { name: lessonTitle }),
    ).toBeVisible();

    await addFailedQuizAttempt();
    await page.reload();
    const quizSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Quiz scores" }),
    });
    await expect(quizSection.getByText(/4\/6.*Not passed/)).toBeVisible();

    await page.goto("/learn/forex/level-1");
    await expect(
      page.getByRole("button", { name: "Bookmarked", exact: true }),
    ).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: "Bookmarked", exact: true }).click();
    await expect(page.getByText("Bookmark removed.")).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/dashboard");
    const emptyBookmarksSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Bookmarks" }),
    });
    await expect(
      emptyBookmarksSection.getByText(
        "No saved lessons yet. Bookmark useful lessons while you learn.",
      ),
    ).toBeVisible();

    const remainingRows = await admin!
      .from("pipstart_bookmarks")
      .select("resource_id")
      .eq("user_id", userId!)
      .eq("resource_type", "lesson");
    if (remainingRows.error) throw new Error(remainingRows.error.message);
    expect(remainingRows.data).toEqual([]);
  });
});
