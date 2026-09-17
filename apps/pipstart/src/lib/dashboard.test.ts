import { describe, expect, it } from "vitest";

import {
  buildDashboardData,
  resolveBookmarks,
  resolveLatestQuizResults,
} from "./dashboard";
import {
  calculateCourseProgress,
  getCourseLessonIds,
  getPublishedCourse,
  selectContinueTarget,
  type ProgressSnapshot,
} from "./permanent-progress";

const course = getPublishedCourse("forex-kindergarten")!;
const lessonIds = getCourseLessonIds(course);
const quizId = "forex-foundations-quiz";

function completedLessons(count: number): ProgressSnapshot["lessons"] {
  return lessonIds.slice(0, count).map((lessonId, index) => ({
    completedAt: `2026-09-17T10:0${index}:00Z`,
    isComplete: true,
    lastVisitedAt: `2026-09-17T10:0${index}:00Z`,
    lessonId,
    revision: 2,
  }));
}

function snapshot(
  completedCount: number,
  assessmentPassed = false,
): ProgressSnapshot {
  return {
    assessments: assessmentPassed
      ? [
          {
            assessmentId: quizId,
            earnedAt: "2026-09-17T11:00:00Z",
            highestPassedVersion: 1,
            lastPassedAt: "2026-09-17T11:00:00Z",
          },
        ]
      : [],
    authenticated: true,
    lessons: completedLessons(completedCount),
  };
}

describe("Milestone 14 dashboard data contract", () => {
  it("counts required lessons and assessments in the course percentage", () => {
    expect(calculateCourseProgress(course, snapshot(3))).toMatchObject({
      complete: false,
      completed: 3,
      percentage: 43,
      total: 7,
    });
    expect(calculateCourseProgress(course, snapshot(6))).toMatchObject({
      complete: false,
      completed: 6,
      percentage: 86,
      total: 7,
    });
    expect(calculateCourseProgress(course, snapshot(6, true))).toMatchObject({
      complete: true,
      completed: 7,
      percentage: 100,
      total: 7,
    });
  });

  it("continues with the first unfinished lesson, then the required quiz, then nothing", () => {
    const progress = snapshot(3);
    progress.lessons.push({
      completedAt: null,
      isComplete: false,
      lastVisitedAt: "2026-09-17T12:00:00Z",
      lessonId: lessonIds[5]!,
      revision: 1,
    });

    expect(selectContinueTarget(course, progress)?.id).toBe(lessonIds[3]);
    expect(selectContinueTarget(course, snapshot(6))?.id).toBe(quizId);
    expect(selectContinueTarget(course, snapshot(6, true))).toBeUndefined();
  });

  it("keeps the latest submitted quiz result even when it is a failure", () => {
    expect(
      resolveLatestQuizResults([
        {
          attemptNumber: 1,
          maxScore: 6,
          passed: true,
          quizId,
          quizVersion: 1,
          score: 6,
          submittedAt: "2026-09-17T10:00:00Z",
        },
        {
          attemptNumber: 2,
          maxScore: 6,
          passed: false,
          quizId,
          quizVersion: 1,
          score: 4,
          submittedAt: "2026-09-17T11:00:00Z",
        },
      ]),
    ).toEqual([
      expect.objectContaining({ attemptNumber: 2, passed: false, score: 4 }),
    ]);
  });

  it("silently drops bookmarks for lessons no longer in the curriculum", () => {
    expect(
      resolveBookmarks([
        {
          createdAt: "2026-09-17T11:00:00Z",
          resourceId: "removed-lesson",
        },
        {
          createdAt: "2026-09-17T10:00:00Z",
          resourceId: lessonIds[0]!,
        },
      ]),
    ).toEqual([expect.objectContaining({ id: lessonIds[0] })]);
  });

  it("separates active and completed published enrollments", () => {
    const data = buildDashboardData({
      assessmentAttempts: [],
      bookmarks: [],
      displayName: "Asha",
      emailPreferences: { educationalEmails: true, marketingEmails: false },
      enrollments: [
        {
          completedAt: null,
          courseId: course.id,
          lastActivityAt: "2026-09-17T11:00:00Z",
          startedAt: "2026-09-17T09:00:00Z",
          status: "active",
        },
        {
          completedAt: "2026-09-17T12:00:00Z",
          courseId: course.id,
          lastActivityAt: "2026-09-17T12:00:00Z",
          startedAt: "2026-09-17T08:00:00Z",
          status: "completed",
        },
        {
          completedAt: null,
          courseId: "removed-course",
          lastActivityAt: "2026-09-17T13:00:00Z",
          startedAt: "2026-09-17T07:00:00Z",
          status: "active",
        },
      ],
      progress: snapshot(3),
    });
    expect(data.activeCourses).toHaveLength(1);
    expect(data.completedCourses).toHaveLength(1);
    expect(data.activeCourses[0]?.continueTarget?.type).toBe("lesson");
  });
});
