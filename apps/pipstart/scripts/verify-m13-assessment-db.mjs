import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDirectory, "..");
const envPath = path.join(appRoot, ".env.local");

function loadLocalEnvironment() {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const name = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[name]) process.env[name] = value;
  }
}

function requireValue(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Milestone 13 DB gate requires ${name}.`);
  return value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function firstRow(data, label) {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") throw new Error(`${label} returned no row.`);
  return row;
}

async function requireNoError(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result;
}

loadLocalEnvironment();

const remoteOverrides = {
  publishableKey: process.env.PIPSTART_M13_SUPABASE_PUBLISHABLE_KEY?.trim(),
  secretKey: process.env.PIPSTART_M13_SUPABASE_SECRET_KEY?.trim(),
  url: process.env.PIPSTART_M13_SUPABASE_URL?.trim(),
};
const suppliedRemoteOverrideCount = Object.values(remoteOverrides).filter(
  Boolean,
).length;
if (suppliedRemoteOverrideCount > 0 && suppliedRemoteOverrideCount < 3) {
  throw new Error(
    "Set all three PIPSTART_M13_SUPABASE_URL, PIPSTART_M13_SUPABASE_PUBLISHABLE_KEY and PIPSTART_M13_SUPABASE_SECRET_KEY values together.",
  );
}

const url = remoteOverrides.url ?? requireValue("NEXT_PUBLIC_SUPABASE_URL");
const publishableKey =
  remoteOverrides.publishableKey ??
  requireValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const secretKey =
  remoteOverrides.secretKey ?? requireValue("SUPABASE_SECRET_KEY");

const targetUrl = new URL(url);
if (targetUrl.hostname === "127.0.0.1" || targetUrl.hostname === "localhost") {
  throw new Error(
    "Milestone 13 remote DB gate is pointed at local Supabase. Set the three PIPSTART_M13_SUPABASE_* environment variables to the linked remote project before running this verifier.",
  );
}

const clientOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
};
const admin = createClient(url, secretKey, clientOptions);
const learner = createClient(url, publishableKey, clientOptions);
const anonymous = createClient(url, publishableKey, clientOptions);

const email = `pipstart-m13-${Date.now()}-${randomUUID().slice(0, 8)}@example.com`;
const password = `M13-${randomUUID()}-Aa1!`;
const quizId = "forex-foundations-quiz";
const quizVersion = 1;
const courseId = "forex-kindergarten";
const moduleId = "forex-foundations";
const lessonIds = [
  "what-is-forex",
  "currency-pairs",
  "pips-and-lots",
  "bid-ask-spread",
  "trading-sessions",
  "market-participants",
];
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
  version: quizVersion,
  title: "Milestone 13 verification snapshot",
  passingPercentage: 70,
  questions: questionOrder.map((id) => ({ id, choices: [] })),
};

let userId = null;

async function startAttempt() {
  const result = await requireNoError(
    await admin.rpc("pipstart_start_assessment_attempt", {
      requested_choice_order: choiceOrder,
      requested_passing_percentage: 70,
      requested_public_snapshot: publicSnapshot,
      requested_question_order: questionOrder,
      requested_quiz_id: quizId,
      requested_quiz_version: quizVersion,
      requested_user_id: userId,
    }),
    "start attempt",
  );
  return firstRow(result.data, "start attempt");
}

async function submitAttempt({ attemptId, passed, score, token, marker }) {
  const result = await requireNoError(
    await admin.rpc("pipstart_submit_assessment_attempt", {
      requested_answers: { verification: [marker] },
      requested_attempt_id: attemptId,
      requested_max_score: questionOrder.length,
      requested_passed: passed,
      requested_review_snapshot: { marker },
      requested_score: score,
      requested_submission_token: token,
      requested_user_id: userId,
    }),
    `submit attempt ${marker}`,
  );
  return firstRow(result.data, `submit attempt ${marker}`);
}

try {
  const created = await requireNoError(
    await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
      user_metadata: { display_name: "Milestone 13 verifier" },
    }),
    "create verification learner",
  );
  userId = created.data.user?.id ?? null;
  assert(userId, "Verification learner has no user id.");

  await requireNoError(
    await learner.auth.signInWithPassword({ email, password }),
    "sign in verification learner",
  );

  const [firstStart, concurrentStart] = await Promise.all([
    startAttempt(),
    startAttempt(),
  ]);
  assert(firstStart.id === concurrentStart.id, "Concurrent starts created two attempts.");
  assert(firstStart.attempt_number === 1, "First attempt number is not 1.");

  const activeCount = await requireNoError(
    await admin
      .from("pipstart_assessment_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("quiz_id", quizId)
      .eq("status", "in_progress"),
    "count active attempts",
  );
  assert(activeCount.count === 1, "More than one active attempt exists.");

  const ownRead = await requireNoError(
    await learner
      .from("pipstart_assessment_attempts")
      .select("id,status,review_snapshot")
      .eq("id", firstStart.id)
      .single(),
    "learner RLS read",
  );
  assert(ownRead.data.review_snapshot === null, "Pre-submit review snapshot leaked.");

  const anonymousRead = await anonymous
    .from("pipstart_assessment_attempts")
    .select("id")
    .eq("id", firstStart.id)
    .maybeSingle();
  assert(Boolean(anonymousRead.error), "Anonymous user unexpectedly read an attempt.");

  const directMutation = await learner
    .from("pipstart_assessment_attempts")
    .update({ draft_answers: { direct: ["blocked"] } })
    .eq("id", firstStart.id);
  assert(Boolean(directMutation.error), "Learner unexpectedly mutated an attempt directly.");

  await requireNoError(
    await admin.rpc("pipstart_save_assessment_draft", {
      requested_answers: { verification: ["draft"] },
      requested_attempt_id: firstStart.id,
      requested_user_id: userId,
    }),
    "save assessment draft",
  );
  const restoredDraft = await requireNoError(
    await learner
      .from("pipstart_assessment_attempts")
      .select("draft_answers")
      .eq("id", firstStart.id)
      .single(),
    "read saved draft",
  );
  assert(
    restoredDraft.data.draft_answers?.verification?.[0] === "draft",
    "Saved draft did not round-trip.",
  );

  const firstToken = randomUUID();
  const failed = await submitAttempt({
    attemptId: firstStart.id,
    marker: "first-fail",
    passed: false,
    score: 4,
    token: firstToken,
  });
  const staleRetry = await submitAttempt({
    attemptId: firstStart.id,
    marker: "stale-pass",
    passed: true,
    score: 6,
    token: randomUUID(),
  });
  assert(failed.id === staleRetry.id, "Repeat submit returned a different attempt.");
  assert(staleRetry.score === 4 && staleRetry.passed === false, "Stale submit changed the persisted result.");
  assert(staleRetry.submission_token === firstToken, "Stale submit replaced the first submission token.");

  const completionAfterFailure = await requireNoError(
    await admin
      .from("pipstart_assessment_completions")
      .select("quiz_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("quiz_id", quizId),
    "check failed-attempt completion",
  );
  assert(completionAfterFailure.count === 0, "Failed attempt created durable completion.");

  const immutableDraft = await admin.rpc("pipstart_save_assessment_draft", {
    requested_answers: { verification: ["too-late"] },
    requested_attempt_id: firstStart.id,
    requested_user_id: userId,
  });
  assert(Boolean(immutableDraft.error), "Submitted attempt accepted a later draft save.");

  const [retake, concurrentRetake] = await Promise.all([
    startAttempt(),
    startAttempt(),
  ]);
  assert(retake.id === concurrentRetake.id, "Concurrent retake starts created two attempts.");
  assert(retake.attempt_number === 2, "Second attempt number is not 2.");

  const passed = await submitAttempt({
    attemptId: retake.id,
    marker: "passing-attempt",
    passed: true,
    score: 5,
    token: randomUUID(),
  });
  assert(passed.passed === true && passed.score === 5, "Passing retake was not persisted.");

  const completion = await requireNoError(
    await admin
      .from("pipstart_assessment_completions")
      .select("quiz_id,highest_passed_version")
      .eq("user_id", userId)
      .eq("quiz_id", quizId)
      .single(),
    "read durable assessment completion",
  );
  assert(completion.data.highest_passed_version === 1, "Durable pass version is incorrect.");

  for (const lessonId of lessonIds) {
    await requireNoError(
      await learner.rpc("pipstart_set_lesson_completion", {
        expected_revision: null,
        requested_complete: true,
        requested_course_id: courseId,
        requested_lesson_id: lessonId,
        requested_module_id: moduleId,
      }),
      `complete lesson ${lessonId}`,
    );
  }

  const reconciled = await requireNoError(
    await admin.rpc("pipstart_reconcile_course_completion", {
      requested_assessment_ids: [quizId],
      requested_course_id: courseId,
      requested_lesson_ids: lessonIds,
      requested_user_id: userId,
    }),
    "reconcile completed course",
  );
  assert(reconciled.data === true, "Course did not complete after lessons plus passing quiz.");

  const enrollment = await requireNoError(
    await admin
      .from("pipstart_enrollments")
      .select("status,completed_at")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single(),
    "read completed enrollment",
  );
  assert(enrollment.data.status === "completed", "Enrollment was not marked completed.");
  assert(Boolean(enrollment.data.completed_at), "Completed enrollment has no completion timestamp.");

  const laterRetake = await startAttempt();
  assert(laterRetake.attempt_number === 3, "Third attempt number is not 3.");
  await submitAttempt({
    attemptId: laterRetake.id,
    marker: "later-failure",
    passed: false,
    score: 0,
    token: randomUUID(),
  });

  const completionAfterLaterFailure = await requireNoError(
    await admin
      .from("pipstart_assessment_completions")
      .select("quiz_id,highest_passed_version")
      .eq("user_id", userId)
      .eq("quiz_id", quizId)
      .single(),
    "read completion after later failure",
  );
  assert(
    completionAfterLaterFailure.data.highest_passed_version === 1,
    "Later failure erased the earned pass.",
  );

  const stillComplete = await requireNoError(
    await admin.rpc("pipstart_reconcile_course_completion", {
      requested_assessment_ids: [quizId],
      requested_course_id: courseId,
      requested_lesson_ids: lessonIds,
      requested_user_id: userId,
    }),
    "reconcile after later failure",
  );
  assert(stillComplete.data === true, "Later failure reduced earned course completion.");

  const immutableSubmittedRow = await admin
    .from("pipstart_assessment_attempts")
    .update({ score: 0 })
    .eq("id", retake.id);
  assert(Boolean(immutableSubmittedRow.error), "Submitted attempt was mutable through direct update.");

  console.log("Milestone 13 remote assessment lifecycle passed.");
} finally {
  await learner.auth.signOut().catch(() => undefined);
  if (userId) {
    const deletion = await admin.auth.admin.deleteUser(userId, false);
    if (deletion.error) throw new Error(`cleanup verification learner: ${deletion.error.message}`);

    const deletedUser = await admin.auth.admin.getUserById(userId);
    assert(
      !deletedUser.data.user,
      "Verification learner still exists after hard delete.",
    );

    for (const [table, label] of [
      ["pipstart_assessment_attempts", "attempts"],
      ["pipstart_assessment_completions", "assessment completions"],
      ["pipstart_lesson_progress", "lesson progress"],
      ["pipstart_enrollments", "enrollments"],
    ]) {
      const remaining = await requireNoError(
        await admin.from(table).select("user_id").eq("user_id", userId).limit(1),
        `verify ${label} cascade cleanup`,
      );
      assert(
        remaining.data.length === 0,
        `${label} did not cascade-delete with the learner.`,
      );
    }
  }
}
