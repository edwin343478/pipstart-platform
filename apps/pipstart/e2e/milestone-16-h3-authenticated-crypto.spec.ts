import { expect, test as base, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { loadAssessmentFixture } from "./helpers/assessment-fixture";

const cases = [
  {
    level: 0,
    width: 390,
    file: "crypto-orientation-assessment.ts",
    exportName: "cryptoOrientationQuizV1",
  },
  {
    level: 10,
    width: 1440,
    file: "crypto-advanced-and-graduation-assessment.ts",
    exportName: "cryptoAdvancedGraduationQuizV1",
  },
];
function createVerificationAdmin(url: string, secret: string) {
  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

type Learner = {
  admin: ReturnType<typeof createVerificationAdmin>;
  id: string;
  email: string;
  password: string;
};
const test = base.extend<{ learner: Learner }>({
  learner: async ({ baseURL }, provideLearner) => {
    if (baseURL !== "http://127.0.0.1:3102") {
      throw new Error(
        "Run this gate through test:e2e:m16-authenticated against its production server.",
      );
    }
    const url = process.env.PIPSTART_M13_SUPABASE_URL?.trim();
    const secret = process.env.PIPSTART_M13_SUPABASE_SECRET_KEY?.trim();
    const publishable =
      process.env.PIPSTART_M13_SUPABASE_PUBLISHABLE_KEY?.trim();
    if (!url || !secret || !publishable)
      throw new Error(
        "Remote assessment environment is required; this gate cannot skip.",
      );
    const admin = createVerificationAdmin(url, secret);
    const email = `pipstart-m16-h3-${randomUUID()}@example.com`;
    const password = `M16-${randomUUID()}-Aa1!`;
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: "Crypto release verification learner" },
    });
    if (created.error || !created.data.user) {
      throw new Error(
        `Disposable learner creation failed: ${created.error?.message ?? "unknown error"}`,
      );
    }
    const id = created.data.user.id;
    try {
      await provideLearner({ admin, id, email, password });
    } finally {
      const deleted = await admin.auth.admin.deleteUser(id, false);
      if (deleted.error)
        throw new Error(
          `Disposable learner cleanup failed: ${deleted.error.message}`,
        );
      for (const table of [
        "pipstart_assessment_attempts",
        "pipstart_assessment_completions",
        "pipstart_learning_events",
      ]) {
        const remaining = await admin
          .from(table)
          .select("user_id", { count: "exact", head: true })
          .eq("user_id", id);
        expect(remaining.error).toBeNull();
        expect(remaining.count, `${table} was not cleaned up`).toBe(0);
      }
    }
  },
});

async function login(page: Page, learner: Learner, route: string) {
  await page.goto(`/login?next=${encodeURIComponent(route)}`);
  await page.getByLabel("Email address").fill(learner.email);
  await page.getByLabel("Password").fill(learner.password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${route}$`), { timeout: 20_000 });
  await expect(page.locator("fieldset").first()).toBeVisible({
    timeout: 45_000,
  });
}

async function snapshot(learner: Learner) {
  const result: Record<string, unknown> = {};
  for (const table of [
    "pipstart_assessment_attempts",
    "pipstart_assessment_completions",
    "pipstart_learning_events",
  ]) {
    const rows = await learner.admin
      .from(table)
      .select("*")
      .eq("user_id", learner.id);
    expect(rows.error).toBeNull();
    result[table] = [...(rows.data ?? [])].sort((a, b) =>
      JSON.stringify(a).localeCompare(JSON.stringify(b)),
    );
  }
  return result;
}

for (const scenario of cases) {
  test(`Crypto Level ${scenario.level} persists drafts, results and history at ${scenario.width}px`, async ({
    page,
    browser,
    learner,
  }) => {
    const quiz = loadAssessmentFixture(scenario.file, scenario.exportName);
    const route = `/learn/crypto/level-${scenario.level}/quiz`;
    await page.setViewportSize({ width: scenario.width, height: 900 });
    await login(page, learner, route);
    await expect(page.locator("fieldset")).toHaveCount(quiz.questions.length);
    const firstQuestions = quiz.questions.slice(0, 2);
    for (const question of firstQuestions) {
      for (const choice of question.correctChoiceIds) {
        await page
          .locator(`input[name="${question.id}"][value="${choice}"]`)
          .check();
      }
    }
    const savedAnswers = Object.fromEntries(
      firstQuestions.map((q) => [q.id, q.correctChoiceIds]),
    );
    await expect
      .poll(
        async () => {
          const row = await learner.admin
            .from("pipstart_assessment_attempts")
            .select("draft_answers")
            .eq("user_id", learner.id)
            .eq("quiz_id", quiz.id)
            .eq("status", "in_progress")
            .single();
          if (row.error || !row.data) return null;
          return row.data.draft_answers;
        },
        { timeout: 20_000 },
      )
      .toEqual(savedAnswers);
    await page.reload();
    for (const question of firstQuestions) {
      for (const choice of question.correctChoiceIds) {
        await expect(
          page.locator(`input[name="${question.id}"][value="${choice}"]`),
        ).toBeChecked();
      }
    }
    // A new browser context has no local draft backup to mask a server failure.
    const secondContext = await browser.newContext();
    try {
      const second = await secondContext.newPage();
      await login(second, learner, route);
      for (const question of firstQuestions) {
        for (const choice of question.correctChoiceIds) {
          await expect(
            second.locator(`input[name="${question.id}"][value="${choice}"]`),
          ).toBeChecked();
        }
      }
      await secondContext.close();
      for (const question of quiz.questions) {
        for (const choice of question.correctChoiceIds) {
          await page
            .locator(`input[name="${question.id}"][value="${choice}"]`)
            .check();
        }
      }
      await page
        .getByRole("button", { name: "Submit quiz", exact: true })
        .click();
      const passedHeading = new RegExp(
        `${quiz.questions.length} of ${quiz.questions.length} correct`,
      );
      await expect(
        page.getByRole("heading", { name: passedHeading }),
      ).toBeVisible({ timeout: 20_000 });
      const history = page.locator(
        'section[aria-labelledby="attempt-history"]',
      );
      await expect(history.getByRole("listitem")).toHaveCount(1);
      await expect(history.getByRole("listitem").first()).toContainText(
        "Passed",
      );
      await page.reload();
      await expect(
        page.getByRole("heading", { name: passedHeading }),
      ).toBeVisible({ timeout: 20_000 });
      await expect(history.getByRole("listitem")).toHaveCount(1);
      const openAfterReload = await learner.admin
        .from("pipstart_assessment_attempts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", learner.id)
        .eq("quiz_id", quiz.id)
        .eq("status", "in_progress");
      expect(openAfterReload.error).toBeNull();
      expect(openAfterReload.count).toBe(0);
      const completed = await learner.admin
        .from("pipstart_assessment_completions")
        .select("*")
        .eq("user_id", learner.id)
        .eq("quiz_id", quiz.id)
        .single();
      if (completed.error || !completed.data)
        throw new Error("Passed completion was not persisted.");
      expect(completed.data.highest_passed_version).toBe(quiz.version);
      // Wait for the existing server-enforced cooldown, not a fixed sleep.
      await expect
        .poll(
          () => Date.now() - new Date(completed.data!.last_passed_at).getTime(),
          {
            timeout: 30_000,
          },
        )
        .toBeGreaterThanOrEqual(quiz.retakeCooldownSeconds * 1000);
      await expect(
        page.getByRole("button", { name: "Try again", exact: true }),
      ).toBeEnabled({ timeout: 20_000 });
      await page
        .getByRole("button", { name: "Try again", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Submit quiz", exact: true }),
      ).toBeEnabled();
      await expect(history.getByRole("listitem")).toHaveCount(1);
      await expect(page.locator("fieldset input:checked")).toHaveCount(0);
      await page.goto("/about");
      const retake = await learner.admin
        .from("pipstart_assessment_attempts")
        .select("*")
        .eq("user_id", learner.id)
        .eq("quiz_id", quiz.id)
        .eq("status", "in_progress")
        .single();
      if (retake.error || !retake.data)
        throw new Error("Retake attempt was not persisted.");
      const before = await snapshot(learner);
      const badDraft = await learner.admin.rpc(
        "pipstart_save_assessment_draft",
        {
          requested_user_id: learner.id,
          requested_attempt_id: retake.data.id,
          requested_answers: {},
          requested_quiz_id: "forex-foundations-quiz",
          requested_quiz_version: quiz.version,
          requested_public_snapshot: retake.data.public_snapshot,
        },
      );
      expect(badDraft.error?.code).toBe("22023");
      expect(badDraft.error?.message).toMatch(/identity.*mismatch/i);
      expect(await snapshot(learner)).toEqual(before);
      const badScope = await learner.admin.rpc(
        "pipstart_submit_assessment_attempt",
        {
          requested_user_id: learner.id,
          requested_attempt_id: retake.data.id,
          requested_submission_token: randomUUID(),
          requested_answers: {},
          requested_score: 0,
          requested_max_score: quiz.questions.length,
          requested_passed: false,
          requested_review_snapshot: {},
          requested_course_id: "forex-kindergarten",
          requested_module_id: quiz.moduleId,
          requested_quiz_id: quiz.id,
          requested_quiz_version: quiz.version,
          requested_public_snapshot: retake.data.public_snapshot,
        },
      );
      expect(badScope.error?.code).toBe("22023");
      expect(badScope.error?.message).toMatch(/course or module mismatch/i);
      expect(await snapshot(learner)).toEqual(before);
      await page.goto(route);
      await page
        .getByRole("button", { name: "Submit quiz", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Submit anyway", exact: true })
        .click();
      await expect(
        page.getByRole("heading", {
          name: new RegExp(`0 of ${quiz.questions.length} correct`),
        }),
      ).toBeVisible({ timeout: 20_000 });
      await expect(history.getByRole("listitem")).toHaveCount(2);
      await expect(
        history.getByRole("listitem").filter({ hasText: "Attempt 1" }),
      ).toContainText("Passed");
      await expect(
        history.getByRole("listitem").filter({ hasText: "Attempt 2" }),
      ).toContainText("Not passed");
      await page.reload();
      await expect(history.getByRole("listitem")).toHaveCount(2, {
        timeout: 20_000,
      });
      const completionAfterFailure = await learner.admin
        .from("pipstart_assessment_completions")
        .select("*")
        .eq("user_id", learner.id)
        .eq("quiz_id", quiz.id)
        .single();
      expect(completionAfterFailure.error).toBeNull();
      expect(completionAfterFailure.data).toEqual(completed.data);
      const finalContext = await browser.newContext();
      try {
        const finalPage = await finalContext.newPage();
        await login(finalPage, learner, route);
        await expect(
          finalPage
            .locator('section[aria-labelledby="attempt-history"]')
            .getByRole("listitem"),
        ).toHaveCount(2, { timeout: 20_000 });
      } finally {
        await finalContext.close();
      }
    } finally {
      // Closing an already closed context is safe; cleanup also runs on failures.
      await secondContext.close();
    }
  });
}
