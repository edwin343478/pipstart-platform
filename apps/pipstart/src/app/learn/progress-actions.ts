"use server";

import { createHash } from "node:crypto";
import { reconcileCourseEnrollmentForUser } from "../../lib/course-progress-server";
import {
  getCourseLessonIds,
  getPublishedCourse,
  getPublishedLessonContext,
  type AssessmentCompletionRecord,
  type ProgressSnapshot,
} from "../../lib/permanent-progress";
import { createSupabaseServerClient } from "../../lib/supabase/server";

type Row = {
  completed_at: string | null;
  is_complete: boolean;
  last_visited_at: string;
  lesson_id: string;
  revision: number;
};
type AssessmentCompletionRow = {
  earned_at: string;
  highest_passed_version: number;
  last_passed_at: string;
  quiz_id: string;
};
async function session() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  return error || !data.user ? null : { supabase, userId: data.user.id };
}
function assessmentCompletion(
  row: AssessmentCompletionRow,
): AssessmentCompletionRecord {
  return {
    assessmentId: row.quiz_id,
    earnedAt: row.earned_at,
    highestPassedVersion: row.highest_passed_version,
    lastPassedAt: row.last_passed_at,
  };
}
function snapshot(
  rows: Row[] = [],
  assessmentRows: AssessmentCompletionRow[] = [],
): ProgressSnapshot {
  return {
    assessments: assessmentRows.map(assessmentCompletion),
    authenticated: true,
    lessons: rows.map((row) => ({
      completedAt: row.completed_at,
      isComplete: row.is_complete,
      lastVisitedAt: row.last_visited_at,
      lessonId: row.lesson_id,
      revision: row.revision,
    })),
  };
}
export async function loadProgressAction(): Promise<ProgressSnapshot> {
  const currentSession = await session();
  if (!currentSession) return { authenticated: false, lessons: [] };
  const { data, error } = await currentSession.supabase
    .from("pipstart_lesson_progress")
    .select("lesson_id,is_complete,completed_at,last_visited_at,revision")
    .order("last_visited_at", { ascending: false });
  if (error) throw new Error("Progress could not be loaded.");

  const { data: assessmentData, error: assessmentError } =
    await currentSession.supabase
      .from("pipstart_assessment_completions")
      .select("quiz_id,earned_at,highest_passed_version,last_passed_at")
      .order("earned_at", { ascending: false });
  if (assessmentError) throw new Error("Progress could not be loaded.");

  return snapshot(
    (data ?? []) as Row[],
    (assessmentData ?? []) as AssessmentCompletionRow[],
  );
}
export async function visitLessonAction(lessonId: string) {
  const context = getPublishedLessonContext(lessonId);
  const currentSession = await session();
  if (!context || !currentSession)
    return { authenticated: Boolean(currentSession) };
  const { error } = await currentSession.supabase.rpc(
    "pipstart_record_lesson_visit",
    {
      requested_course_id: context.courseId,
      requested_module_id: context.moduleId,
      requested_lesson_id: context.lessonId,
    },
  );
  if (error) throw new Error("Progress could not be synchronized.");
  return { authenticated: true };
}
export async function setLessonCompletionAction(input: {
  complete: boolean;
  expectedRevision: number | null;
  lessonId: string;
}) {
  const context = getPublishedLessonContext(input.lessonId);
  const currentSession = await session();
  if (!context || !currentSession)
    throw new Error("Sign in to synchronize progress.");
  const { error } = await currentSession.supabase.rpc(
    "pipstart_set_lesson_completion",
    {
      expected_revision: input.expectedRevision,
      requested_complete: input.complete,
      requested_course_id: context.courseId,
      requested_module_id: context.moduleId,
      requested_lesson_id: context.lessonId,
    },
  );
  if (error)
    throw new Error(
      error.code === "40001"
        ? "Progress changed on another device. Refresh and try again."
        : "Progress was not saved. Try again.",
    );
  try {
    await reconcileCourseEnrollmentForUser(
      currentSession.userId,
      context.courseId,
    );
  } catch {
    throw new Error("Lesson saved, but course progress needs a refresh.");
  }
  return loadProgressAction();
}
export async function importAnonymousProgressAction(input: {
  courseId: string;
  lessonIds: string[];
}) {
  const course = getPublishedCourse(input.courseId);
  const currentSession = await session();
  if (!course || !currentSession)
    return { authenticated: Boolean(currentSession), lessons: [] };
  const valid = new Set(getCourseLessonIds(course));
  const ids = [...new Set(input.lessonIds)].filter((id) => valid.has(id));
  const moduleId = course.modules[0]?.id;
  if (ids.length && moduleId) {
    const fingerprint = createHash("sha256")
      .update(`${course.id}:${[...ids].sort().join(",")}`)
      .digest("hex");
    const { error } = await currentSession.supabase.rpc(
      "pipstart_import_anonymous_progress",
      {
        requested_course_id: course.id,
        requested_fingerprint: fingerprint,
        requested_lesson_ids: ids,
        requested_module_id: moduleId,
      },
    );
    if (error) throw new Error("Anonymous progress could not be imported.");
  }
  try {
    await reconcileCourseEnrollmentForUser(currentSession.userId, course.id);
  } catch {
    throw new Error("Imported progress needs a refresh.");
  }
  return loadProgressAction();
}
