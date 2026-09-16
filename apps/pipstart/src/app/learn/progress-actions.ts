"use server";

import { createHash } from "node:crypto";
import {
  getCourseLessonIds,
  getPublishedCourse,
  getPublishedLessonContext,
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
async function session() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  return error || !data.user ? null : supabase;
}
function snapshot(rows: Row[] = []): ProgressSnapshot {
  return {
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
  const supabase = await session();
  if (!supabase) return { authenticated: false, lessons: [] };
  const { data, error } = await supabase
    .from("pipstart_lesson_progress")
    .select("lesson_id,is_complete,completed_at,last_visited_at,revision")
    .order("last_visited_at", { ascending: false });
  if (error) throw new Error("Progress could not be loaded.");
  return snapshot((data ?? []) as Row[]);
}
export async function visitLessonAction(lessonId: string) {
  const context = getPublishedLessonContext(lessonId);
  const supabase = await session();
  if (!context || !supabase) return { authenticated: Boolean(supabase) };
  const { error } = await supabase.rpc("pipstart_record_lesson_visit", {
    requested_course_id: context.courseId,
    requested_module_id: context.moduleId,
    requested_lesson_id: context.lessonId,
  });
  if (error) throw new Error("Progress could not be synchronized.");
  return { authenticated: true };
}
export async function setLessonCompletionAction(input: {
  complete: boolean;
  expectedRevision: number | null;
  lessonId: string;
}) {
  const context = getPublishedLessonContext(input.lessonId);
  const supabase = await session();
  if (!context || !supabase)
    throw new Error("Sign in to synchronize progress.");
  const { error } = await supabase.rpc("pipstart_set_lesson_completion", {
    expected_revision: input.expectedRevision,
    requested_complete: input.complete,
    requested_course_id: context.courseId,
    requested_module_id: context.moduleId,
    requested_lesson_id: context.lessonId,
  });
  if (error)
    throw new Error(
      error.code === "40001"
        ? "Progress changed on another device. Refresh and try again."
        : "Progress was not saved. Try again.",
    );
  const result = await loadProgressAction();
  const course = getPublishedCourse(context.courseId);
  if (course) {
    const complete = new Set(
      result.lessons
        .filter((lesson) => lesson.isComplete)
        .map((lesson) => lesson.lessonId),
    );
    const { error: enrollmentError } = await supabase.rpc(
      "pipstart_set_enrollment_completion",
      {
        requested_complete: getCourseLessonIds(course).every((id) =>
          complete.has(id),
        ),
        requested_course_id: course.id,
      },
    );
    if (enrollmentError)
      throw new Error("Lesson saved, but course progress needs a refresh.");
  }
  return result;
}
export async function importAnonymousProgressAction(input: {
  courseId: string;
  lessonIds: string[];
}) {
  const course = getPublishedCourse(input.courseId);
  const supabase = await session();
  if (!course || !supabase)
    return { authenticated: Boolean(supabase), lessons: [] };
  const valid = new Set(getCourseLessonIds(course));
  const ids = [...new Set(input.lessonIds)].filter((id) => valid.has(id));
  const moduleId = course.modules[0]?.id;
  if (ids.length && moduleId) {
    const fingerprint = createHash("sha256")
      .update(`${course.id}:${[...ids].sort().join(",")}`)
      .digest("hex");
    const { error } = await supabase.rpc("pipstart_import_anonymous_progress", {
      requested_course_id: course.id,
      requested_fingerprint: fingerprint,
      requested_lesson_ids: ids,
      requested_module_id: moduleId,
    });
    if (error) throw new Error("Anonymous progress could not be imported.");
  }
  return loadProgressAction();
}
