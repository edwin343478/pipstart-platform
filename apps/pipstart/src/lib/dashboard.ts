import type { CurriculumCourse, CurriculumLesson } from "./curriculum";
import { learningPaths } from "./curriculum";
import {
  calculateCourseProgress,
  getPublishedCourse,
  selectContinueTarget,
  type ProgressSnapshot,
} from "./permanent-progress";

export type DashboardEnrollmentRecord = {
  completedAt: string | null;
  courseId: string;
  lastActivityAt: string;
  startedAt: string;
  status: "active" | "completed";
};

export type DashboardAssessmentAttemptRecord = {
  attemptNumber: number;
  maxScore: number;
  passed: boolean;
  quizId: string;
  quizVersion: number;
  score: number;
  submittedAt: string;
};

export type DashboardBookmarkRecord = {
  createdAt: string;
  resourceId: string;
};

export type DashboardEmailPreferences = {
  educationalEmails: boolean;
  marketingEmails: boolean;
};

export type DashboardInput = {
  assessmentAttempts: DashboardAssessmentAttemptRecord[];
  bookmarks: DashboardBookmarkRecord[];
  displayName: string;
  emailPreferences: DashboardEmailPreferences;
  enrollments: DashboardEnrollmentRecord[];
  progress: ProgressSnapshot;
};

type DashboardResource = {
  href: `/${string}`;
  id: string;
  title: string;
};

export type DashboardContinueTarget = DashboardResource & {
  type: "lesson" | "quiz";
};

export type DashboardCourseSummary = DashboardResource & {
  completedAt: string | null;
  continueTarget: DashboardContinueTarget | null;
  lastActivityAt: string;
  progress: ReturnType<typeof calculateCourseProgress>;
  startedAt: string;
  status: DashboardEnrollmentRecord["status"];
};

export type DashboardRecentLesson = DashboardResource & {
  completed: boolean;
  lastVisitedAt: string;
};

export type DashboardQuizResult = DashboardResource & {
  attemptNumber: number;
  maxScore: number;
  passed: boolean;
  quizVersion: number;
  score: number;
  submittedAt: string;
};

export type DashboardBookmark = DashboardResource & {
  createdAt: string;
};

export type DashboardData = {
  activeCourses: DashboardCourseSummary[];
  bookmarks: DashboardBookmark[];
  completedCourses: DashboardCourseSummary[];
  displayName: string;
  emailPreferences: DashboardEmailPreferences;
  quizResults: DashboardQuizResult[];
  recentLessons: DashboardRecentLesson[];
};

function publishedCurriculumItems() {
  return learningPaths.flatMap((path) =>
    path.levels.flatMap((level) =>
      level.courses.flatMap((course) =>
        course.modules.flatMap((curriculumModule) => curriculumModule.lessons),
      ),
    ),
  );
}

export function getPublishedLesson(lessonId: string) {
  return publishedCurriculumItems().find(
    (item) => item.type === "lesson" && item.id === lessonId,
  );
}

function getPublishedQuiz(quizId: string) {
  return publishedCurriculumItems().find(
    (item) => item.type === "quiz" && item.id === quizId,
  );
}

function resource(item: CurriculumLesson): DashboardResource {
  return { href: item.href, id: item.id, title: item.title };
}

function continueTarget(
  course: CurriculumCourse,
  progress: ProgressSnapshot,
): DashboardContinueTarget | null {
  const target = selectContinueTarget(course, progress);
  return target ? { ...resource(target), type: target.type } : null;
}

function courseSummary(
  enrollment: DashboardEnrollmentRecord,
  progress: ProgressSnapshot,
): DashboardCourseSummary | null {
  const course = getPublishedCourse(enrollment.courseId);
  if (!course) return null;
  return {
    completedAt: enrollment.completedAt,
    continueTarget:
      enrollment.status === "active" ? continueTarget(course, progress) : null,
    href: course.href,
    id: course.id,
    lastActivityAt: enrollment.lastActivityAt,
    progress: calculateCourseProgress(course, progress),
    startedAt: enrollment.startedAt,
    status: enrollment.status,
    title: course.title,
  };
}

export function resolveRecentLessons(
  progress: ProgressSnapshot,
  limit = 5,
): DashboardRecentLesson[] {
  return [...progress.lessons]
    .sort((a, b) => b.lastVisitedAt.localeCompare(a.lastVisitedAt))
    .flatMap((record) => {
      const lesson = getPublishedLesson(record.lessonId);
      return lesson
        ? [
            {
              ...resource(lesson),
              completed: record.isComplete,
              lastVisitedAt: record.lastVisitedAt,
            },
          ]
        : [];
    })
    .slice(0, Math.max(0, limit));
}

export function resolveBookmarks(
  bookmarks: readonly DashboardBookmarkRecord[],
): DashboardBookmark[] {
  return [...bookmarks]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .flatMap((bookmark) => {
      const lesson = getPublishedLesson(bookmark.resourceId);
      return lesson
        ? [{ ...resource(lesson), createdAt: bookmark.createdAt }]
        : [];
    });
}

export function resolveLatestQuizResults(
  attempts: readonly DashboardAssessmentAttemptRecord[],
): DashboardQuizResult[] {
  const seen = new Set<string>();
  return [...attempts]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .flatMap((attempt) => {
      if (seen.has(attempt.quizId)) return [];
      seen.add(attempt.quizId);
      const quiz = getPublishedQuiz(attempt.quizId);
      return quiz
        ? [
            {
              ...resource(quiz),
              attemptNumber: attempt.attemptNumber,
              maxScore: attempt.maxScore,
              passed: attempt.passed,
              quizVersion: attempt.quizVersion,
              score: attempt.score,
              submittedAt: attempt.submittedAt,
            },
          ]
        : [];
    });
}

export function buildDashboardData(input: DashboardInput): DashboardData {
  const courses = input.enrollments.flatMap((enrollment) => {
    const summary = courseSummary(enrollment, input.progress);
    return summary ? [summary] : [];
  });
  return {
    activeCourses: courses.filter((course) => course.status === "active"),
    bookmarks: resolveBookmarks(input.bookmarks),
    completedCourses: courses.filter((course) => course.status === "completed"),
    displayName: input.displayName,
    emailPreferences: input.emailPreferences,
    quizResults: resolveLatestQuizResults(input.assessmentAttempts),
    recentLessons: resolveRecentLessons(input.progress),
  };
}
