import {
  getCourseLessonIds,
  getCourseRequiredAssessmentIds,
  getPublishedCourse,
} from "./permanent-progress";

export async function reconcileCourseEnrollmentForUser(
  userId: string,
  courseId: string,
) {
  const course = getPublishedCourse(courseId);
  if (!course) throw new Error("Course progress could not be reconciled.");

  // Keep the service-role client behind the server-action call boundary.
  // A dynamic import also prevents Vitest from evaluating Next's `server-only`
  // sentinel when older component suites import progress-actions transitively.
  const { createSupabaseAdminClient } = await import("./supabase/admin");
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Course progress persistence is unavailable.");

  const { error } = await admin.rpc("pipstart_reconcile_course_completion", {
    requested_assessment_ids: getCourseRequiredAssessmentIds(course),
    requested_course_id: course.id,
    requested_lesson_ids: getCourseLessonIds(course),
    requested_user_id: userId,
  });
  if (error) throw new Error("Course progress could not be reconciled.");
}
