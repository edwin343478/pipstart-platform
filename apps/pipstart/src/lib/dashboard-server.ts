import "server-only";

import { requireUser } from "@/lib/auth/session";
import {
  buildDashboardData,
  type DashboardAssessmentAttemptRecord,
  type DashboardBookmarkRecord,
  type DashboardEnrollmentRecord,
} from "@/lib/dashboard";
import type { ProgressSnapshot } from "@/lib/permanent-progress";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loadDashboardData() {
  const user = await requireUser("/dashboard");
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Dashboard is temporarily unavailable.");

  const [
    profileResult,
    preferenceResult,
    enrollmentResult,
    lessonResult,
    completionResult,
    attemptResult,
    bookmarkResult,
  ] = await Promise.all([
    supabase
      .from("pipstart_profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("pipstart_email_preferences")
      .select("educational_emails,marketing_emails")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("pipstart_enrollments")
      .select("course_id,status,started_at,last_activity_at,completed_at")
      .eq("user_id", user.id)
      .order("last_activity_at", { ascending: false }),
    supabase
      .from("pipstart_lesson_progress")
      .select("lesson_id,is_complete,completed_at,last_visited_at,revision")
      .eq("user_id", user.id)
      .order("last_visited_at", { ascending: false }),
    supabase
      .from("pipstart_assessment_completions")
      .select("quiz_id,earned_at,highest_passed_version,last_passed_at")
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false }),
    supabase
      .from("pipstart_assessment_attempts")
      .select(
        "quiz_id,quiz_version,attempt_number,score,max_score,passed,submitted_at",
      )
      .eq("user_id", user.id)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false }),
    supabase
      .from("pipstart_bookmarks")
      .select("resource_id,created_at")
      .eq("user_id", user.id)
      .eq("resource_type", "lesson")
      .order("created_at", { ascending: false }),
  ]);

  if (
    profileResult.error ||
    preferenceResult.error ||
    enrollmentResult.error ||
    lessonResult.error ||
    completionResult.error ||
    attemptResult.error ||
    bookmarkResult.error
  ) {
    throw new Error("Dashboard could not be loaded.");
  }

  const progress: ProgressSnapshot = {
    assessments: (completionResult.data ?? []).map((row) => ({
      assessmentId: row.quiz_id,
      earnedAt: row.earned_at,
      highestPassedVersion: row.highest_passed_version,
      lastPassedAt: row.last_passed_at,
    })),
    authenticated: true,
    lessons: (lessonResult.data ?? []).map((row) => ({
      completedAt: row.completed_at,
      isComplete: row.is_complete,
      lastVisitedAt: row.last_visited_at,
      lessonId: row.lesson_id,
      revision: row.revision,
    })),
  };

  const enrollments: DashboardEnrollmentRecord[] = (
    enrollmentResult.data ?? []
  ).map((row) => ({
    completedAt: row.completed_at,
    courseId: row.course_id,
    lastActivityAt: row.last_activity_at,
    startedAt: row.started_at,
    status: row.status === "completed" ? "completed" : "active",
  }));

  const assessmentAttempts: DashboardAssessmentAttemptRecord[] = (
    attemptResult.data ?? []
  ).flatMap((row) =>
    row.score === null ||
    row.max_score === null ||
    row.passed === null ||
    row.submitted_at === null
      ? []
      : [
          {
            attemptNumber: row.attempt_number,
            maxScore: row.max_score,
            passed: row.passed,
            quizId: row.quiz_id,
            quizVersion: row.quiz_version,
            score: row.score,
            submittedAt: row.submitted_at,
          },
        ],
  );

  const bookmarks: DashboardBookmarkRecord[] = (bookmarkResult.data ?? []).map(
    (row) => ({ createdAt: row.created_at, resourceId: row.resource_id }),
  );

  return buildDashboardData({
    assessmentAttempts,
    bookmarks,
    displayName:
      profileResult.data?.display_name ??
      (typeof user.user_metadata?.display_name === "string"
        ? user.user_metadata.display_name
        : "Learner"),
    emailPreferences: {
      educationalEmails: preferenceResult.data?.educational_emails ?? true,
      marketingEmails: preferenceResult.data?.marketing_emails ?? false,
    },
    enrollments,
    progress,
  });
}
