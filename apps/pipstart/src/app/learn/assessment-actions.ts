"use server";

import { headers } from "next/headers";

import {
  gradeAssessment,
  type AssessmentDefinition,
} from "../../lib/assessment";
import {
  createAssessmentAttemptPresentation,
  parseAssessmentAnswers,
} from "../../lib/assessment-attempt";
import {
  getContinuableAssessment,
  getCurrentPublishedAssessment,
} from "../../lib/assessment-registry";
import { reconcileCourseEnrollmentForUser } from "../../lib/course-progress-server";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ATTEMPT_SELECT =
  "id,quiz_id,quiz_version,attempt_number,status,question_order,choice_order,draft_answers,public_snapshot,submitted_answers,score,max_score,passed,started_at,submitted_at,review_snapshot";
const HISTORY_SELECT =
  "id,quiz_id,quiz_version,attempt_number,status,score,max_score,passed,started_at,submitted_at";

type AttemptRow = {
  choice_order: unknown;
  draft_answers: unknown;
  id: string;
  max_score: number | null;
  passed: boolean | null;
  public_snapshot: unknown;
  question_order: unknown;
  quiz_id: string;
  quiz_version: number;
  review_snapshot: unknown;
  score: number | null;
  started_at: string;
  status: "in_progress" | "submitted";
  submitted_answers: unknown;
  submitted_at: string | null;
  attempt_number: number;
};

type HistoryRow = Pick<
  AttemptRow,
  | "attempt_number"
  | "id"
  | "max_score"
  | "passed"
  | "quiz_id"
  | "quiz_version"
  | "score"
  | "started_at"
  | "status"
  | "submitted_at"
>;

type AssessmentGrade = ReturnType<typeof gradeAssessment>;

async function authenticatedSession() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return { supabase, user: data.user };
}

function requireAdminClient() {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Assessment persistence is unavailable.");
  return admin;
}

function requireAssessment(
  quizId: string,
  version: number,
  mode: "continue" | "start",
): AssessmentDefinition {
  if (!quizId || !Number.isInteger(version) || version <= 0) {
    throw new Error("Assessment reference is invalid.");
  }

  const assessment =
    mode === "start"
      ? getCurrentPublishedAssessment(quizId)
      : getContinuableAssessment(quizId, version);
  if (
    !assessment ||
    assessment.version !== version ||
    (mode === "start" && assessment.status !== "published")
  ) {
    throw new Error("Assessment is unavailable.");
  }
  return assessment;
}

function requireUuid(value: string, label: string) {
  if (!UUID_PATTERN.test(value)) throw new Error(`${label} is invalid.`);
}

function rpcRow(data: unknown): AttemptRow {
  const value = Array.isArray(data) ? data[0] : data;
  if (!value || typeof value !== "object") {
    throw new Error("Assessment attempt could not be loaded.");
  }
  return value as AttemptRow;
}

function safeAttempt(row: AttemptRow) {
  return {
    id: row.id,
    quizId: row.quiz_id,
    quizVersion: row.quiz_version,
    attemptNumber: row.attempt_number,
    status: row.status,
    questionOrder: row.question_order,
    choiceOrder: row.choice_order,
    draftAnswers: row.draft_answers,
    publicSnapshot: row.public_snapshot,
    submittedAnswers: row.submitted_answers,
    score: row.score,
    maxScore: row.max_score,
    passed: row.passed,
    startedAt: row.started_at,
    submittedAt: row.submitted_at,
    reviewSnapshot: row.status === "submitted" ? row.review_snapshot : null,
  };
}

function safeHistoryAttempt(row: HistoryRow) {
  return {
    id: row.id,
    quizId: row.quiz_id,
    quizVersion: row.quiz_version,
    attemptNumber: row.attempt_number,
    status: row.status,
    score: row.score,
    maxScore: row.max_score,
    passed: row.passed,
    startedAt: row.started_at,
    submittedAt: row.submitted_at,
  };
}

function persistedGrade(
  value: unknown,
  assessment: AssessmentDefinition,
): AssessmentGrade {
  if (!value || typeof value !== "object") {
    throw new Error("Submitted assessment result is unavailable.");
  }
  const grade = value as AssessmentGrade;
  if (
    grade.quizId !== assessment.id ||
    grade.quizVersion !== assessment.version ||
    !Array.isArray(grade.questions)
  ) {
    throw new Error("Submitted assessment result is invalid.");
  }
  return grade;
}

function gradeAndNormalize(assessment: AssessmentDefinition, input: unknown) {
  const grade = gradeAssessment(assessment, parseAssessmentAnswers(input));
  const answers = Object.fromEntries(
    grade.questions
      .filter((question) => question.answered)
      .map((question) => [
        question.questionId,
        [...question.submittedChoiceIds],
      ]),
  );
  return { answers, grade };
}

async function anonymousClientKey() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const address =
    forwarded || requestHeaders.get("x-real-ip")?.trim() || "unknown";
  const userAgent =
    requestHeaders.get("user-agent")?.slice(0, 256) ?? "unknown";
  return `${address}:${userAgent}`;
}

export async function gradeAnonymousAssessmentAction(input: {
  answers: unknown;
  quizId: string;
  version: number;
}) {
  const admin = requireAdminClient();
  const { data: allowed, error: limitError } = await admin.rpc(
    "pipstart_consume_assessment_rate_limit",
    {
      requested_client_key: await anonymousClientKey(),
      requested_limit: 20,
      requested_window_seconds: 60,
    },
  );
  if (limitError) {
    throw new Error("Quiz submission could not be checked. Try again shortly.");
  }
  if (!allowed) {
    throw new Error("Too many quiz submissions. Try again shortly.");
  }

  const assessment = requireAssessment(input.quizId, input.version, "start");
  const answers = parseAssessmentAnswers(input.answers);
  return {
    authenticated: false,
    grade: gradeAssessment(assessment, answers),
  };
}

export async function startAssessmentAttemptAction(input: {
  quizId: string;
  version: number;
}) {
  requireAssessment(input.quizId, input.version, "continue");
  const session = await authenticatedSession();

  if (session) {
    const { data: existing, error: existingError } = await session.supabase
      .from("pipstart_assessment_attempts")
      .select(ATTEMPT_SELECT)
      .eq("quiz_id", input.quizId)
      .eq("quiz_version", input.version)
      .eq("status", "in_progress")
      .maybeSingle();
    if (existingError) {
      throw new Error("Assessment attempt could not be resumed.");
    }
    if (existing) {
      return {
        authenticated: true,
        attempt: safeAttempt(existing as AttemptRow),
      };
    }
  }

  const assessment = requireAssessment(input.quizId, input.version, "start");
  if (session && assessment.retakeCooldownSeconds > 0) {
    const { data: latest, error: latestError } = await session.supabase
      .from("pipstart_assessment_attempts")
      .select("submitted_at")
      .eq("quiz_id", assessment.id)
      .eq("quiz_version", assessment.version)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestError)
      throw new Error("Assessment attempt could not be started.");
    if (
      latest?.submitted_at &&
      Date.now() - new Date(latest.submitted_at).getTime() <
        assessment.retakeCooldownSeconds * 1000
    ) {
      throw new Error(
        `Wait ${assessment.retakeCooldownSeconds} seconds before starting another attempt.`,
      );
    }
  }
  const presentation = createAssessmentAttemptPresentation(assessment);
  if (!session) {
    return { authenticated: false, attempt: null, presentation };
  }

  const admin = requireAdminClient();
  const { data, error } = await admin.rpc("pipstart_start_assessment_attempt", {
    requested_choice_order: presentation.choiceOrder,
    requested_passing_percentage: assessment.passingPercentage,
    requested_public_snapshot: presentation.publicSnapshot,
    requested_question_order: presentation.questionOrder,
    requested_quiz_id: assessment.id,
    requested_quiz_version: assessment.version,
    requested_user_id: session.user.id,
  });
  if (error) throw new Error("Assessment attempt could not be started.");

  return { authenticated: true, attempt: safeAttempt(rpcRow(data)) };
}

export async function saveAssessmentDraftAction(input: {
  answers: unknown;
  attemptId: string;
  quizId: string;
  version: number;
}) {
  requireUuid(input.attemptId, "Assessment attempt");
  const assessment = requireAssessment(input.quizId, input.version, "continue");
  const { answers } = gradeAndNormalize(assessment, input.answers);
  const session = await authenticatedSession();
  if (!session) throw new Error("Sign in to save quiz progress.");

  const admin = requireAdminClient();
  const { data, error } = await admin.rpc("pipstart_save_assessment_draft", {
    requested_answers: answers,
    requested_attempt_id: input.attemptId,
    requested_user_id: session.user.id,
  });
  if (error) throw new Error("Quiz progress was not saved. Try again.");

  return { authenticated: true, attempt: safeAttempt(rpcRow(data)) };
}

export async function submitAssessmentAttemptAction(input: {
  answers: unknown;
  attemptId: string;
  quizId: string;
  submissionToken: string;
  version: number;
}) {
  requireUuid(input.attemptId, "Assessment attempt");
  requireUuid(input.submissionToken, "Submission token");
  const assessment = requireAssessment(input.quizId, input.version, "continue");
  const { answers, grade } = gradeAndNormalize(assessment, input.answers);
  const session = await authenticatedSession();
  if (!session) throw new Error("Sign in to save this quiz attempt.");

  const admin = requireAdminClient();
  const { data, error } = await admin.rpc(
    "pipstart_submit_assessment_attempt",
    {
      requested_answers: answers,
      requested_attempt_id: input.attemptId,
      requested_course_id: assessment.courseId,
      requested_max_score: grade.maxScore,
      requested_module_id: assessment.moduleId ?? null,
      requested_passed: grade.passed,
      requested_review_snapshot: grade,
      requested_score: grade.score,
      requested_submission_token: input.submissionToken,
      requested_user_id: session.user.id,
    },
  );
  if (error) throw new Error("Quiz submission was not saved. Try again.");

  const row = rpcRow(data);
  let progressReconciliationPending = false;
  try {
    await reconcileCourseEnrollmentForUser(
      session.user.id,
      assessment.courseId,
    );
  } catch (cause) {
    progressReconciliationPending = true;
    console.error("Assessment progress reconciliation failed", {
      attemptId: row.id,
      courseId: assessment.courseId,
      userId: session.user.id,
      cause: cause instanceof Error ? cause.message : "unknown",
    });
  }
  return {
    authenticated: true,
    attempt: safeAttempt(row),
    grade: persistedGrade(row.review_snapshot, assessment),
    progressReconciliationPending,
  };
}

export async function retryAssessmentProgressAction(courseId: string) {
  const session = await authenticatedSession();
  if (!session) throw new Error("Sign in to refresh course progress.");
  await reconcileCourseEnrollmentForUser(session.user.id, courseId);
  return { refreshed: true };
}

export async function loadAssessmentHistoryAction(quizId?: string) {
  if (quizId && quizId.length > 128) {
    throw new Error("Assessment reference is invalid.");
  }
  const session = await authenticatedSession();
  if (!session) return { authenticated: false, attempts: [] };

  let query = session.supabase
    .from("pipstart_assessment_attempts")
    .select(HISTORY_SELECT)
    .order("started_at", { ascending: false })
    .limit(100);
  if (quizId) query = query.eq("quiz_id", quizId);

  const { data, error } = await query;
  if (error) throw new Error("Quiz history could not be loaded.");
  return {
    authenticated: true,
    attempts: ((data ?? []) as HistoryRow[]).map(safeHistoryAttempt),
  };
}
