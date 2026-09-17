import { describe, expect, it } from "vitest";

import { getCurriculumCourse, getCurriculumModule } from "./curriculum";
import {
  calculateCourseCompletion,
  calculateModuleCompletion,
  calculateProgress,
  getCourseLessonIds,
  getCourseRequiredAssessmentIds,
  type ProgressSnapshot,
} from "./permanent-progress";

function completedSnapshot(
  lessonIds: readonly string[],
  assessmentIds: readonly string[] = [],
): ProgressSnapshot {
  return {
    assessments: assessmentIds.map((assessmentId) => ({
      assessmentId,
      earnedAt: "2026-09-16T20:00:00Z",
      highestPassedVersion: 1,
      lastPassedAt: "2026-09-16T20:00:00Z",
    })),
    authenticated: true,
    lessons: lessonIds.map((lessonId) => ({
      completedAt: "2026-09-16T19:00:00Z",
      isComplete: true,
      lastVisitedAt: "2026-09-16T19:00:00Z",
      lessonId,
      revision: 1,
    })),
  };
}

describe("Milestone 13 assessment progress integration", () => {
  const course = getCurriculumCourse("forex", "forex-kindergarten")!;
  const curriculumModule = getCurriculumModule("forex", "forex-foundations")!;
  const lessonIds = getCourseLessonIds(course);

  it("declares the Forex module assessment requirement in curriculum metadata", () => {
    expect(curriculumModule.assessmentRequirements).toEqual([
      {
        assessmentId: "forex-foundations-quiz",
        completionPolicy: "any-passed-version",
      },
    ]);
    expect(getCourseRequiredAssessmentIds(course)).toEqual([
      "forex-foundations-quiz",
    ]);
  });

  it("keeps quiz requirements out of the lesson progress denominator", () => {
    const quiz = {
      ...curriculumModule.lessons[0]!,
      id: "synthetic-quiz",
      type: "quiz" as const,
    };
    expect(
      calculateProgress([...curriculumModule.lessons, quiz], lessonIds),
    ).toEqual({ completed: 6, percentage: 100, total: 6 });
  });

  it("requires both lessons and the durable assessment pass for module completion", () => {
    const lessonsOnly = calculateModuleCompletion(
      curriculumModule,
      completedSnapshot(lessonIds),
    );
    expect(lessonsOnly.lessons.percentage).toBe(100);
    expect(lessonsOnly.assessments).toEqual({
      complete: false,
      completed: 0,
      total: 1,
    });
    expect(lessonsOnly.complete).toBe(false);

    const passed = calculateModuleCompletion(
      curriculumModule,
      completedSnapshot(lessonIds, ["forex-foundations-quiz"]),
    );
    expect(passed.complete).toBe(true);
  });

  it("keeps an earned pass valid independently of later assessment versions", () => {
    const snapshot = completedSnapshot(lessonIds, ["forex-foundations-quiz"]);
    snapshot.assessments![0]!.highestPassedVersion = 9;

    expect(calculateModuleCompletion(curriculumModule, snapshot).complete).toBe(
      true,
    );
    expect(calculateCourseCompletion(course, snapshot).complete).toBe(true);
  });
});
