import { describe, expect, it } from "vitest";
import reference from "./milestone-16-h7-reference.json";
import {
  cryptoLessonDocuments,
  forexLessonDocuments,
} from "../content/lesson-registry";
import { getLearningPath } from "./curriculum";
import {
  getCryptoOrientationQuizClientContext,
  getCryptoOrientationQuizContext,
} from "./crypto-orientation-quiz-context";
import { getForexQuizClientContext } from "./forex-quiz-context";
import {
  getSecondaryLesson,
  getSecondaryLessonParams,
} from "./secondary-lesson-routing";
import {
  readingStorageKey,
  resolveReadingState,
  sectionIds,
} from "./lesson-reading-state";

describe("H7 preserves the approved H6 contracts", () => {
  it("keeps every quiz client context identical to the pre-cleanup reference", () => {
    for (const entry of reference.contexts) {
      const actual =
        entry.path === "crypto"
          ? getCryptoOrientationQuizClientContext(entry.course, entry.module)
          : getForexQuizClientContext(entry.course, entry.module);
      expect(actual, `${entry.path}/${entry.course}/${entry.module}`).toEqual(
        entry.context,
      );
      if (actual)
        expect(
          actual.lessons.every(
            (lesson) => Object.keys(lesson).sort().join() === "href,id,title",
          ),
        ).toBe(true);
    }
  });
  it("rejects missing and cross-course quiz contexts", () => {
    expect(
      getCryptoOrientationQuizContext("unknown", "unknown"),
    ).toBeUndefined();
    expect(getCryptoOrientationQuizContext("bitcoin")).toBeUndefined();
    expect(
      getCryptoOrientationQuizContext(
        "bitcoin",
        "crypto-orientation-and-safety",
      ),
    ).toBeUndefined();
  });
  it("keeps all ten secondary route parameter lists unchanged", () => {
    for (let level = 1; level <= 10; level++) {
      const lessons = cryptoLessonDocuments.filter(
        (lesson) => lesson.level === `level-${level}`,
      );
      expect(getSecondaryLessonParams(lessons)).toEqual(
        reference.routes[level - 1],
      );
      expect(getSecondaryLesson(lessons, lessons[0].slug)).toBeUndefined();
      expect(getSecondaryLesson(lessons, "unknown-lesson")).toBeUndefined();
      for (const lesson of lessons.slice(1))
        expect(getSecondaryLesson(lessons, lesson.slug)).toBe(lesson);
    }
  });
  it("does not resolve a published lesson through a different level", () => {
    const one = cryptoLessonDocuments.filter(
      (lesson) => lesson.level === "level-1",
    );
    const other = cryptoLessonDocuments.find(
      (lesson) => lesson.level === "level-2" && lesson.position > 1,
    )!;
    expect(getSecondaryLesson(one, other.slug)).toBeUndefined();
    expect(getSecondaryLesson([], "missing")).toBeUndefined();
    expect(getSecondaryLessonParams([])).toEqual([]);
  });
  it("keeps all 89 reading storage keys identical to the approved checkpoint", () => {
    expect(
      [...cryptoLessonDocuments, ...forexLessonDocuments].map((lesson) => ({
        id: lesson.id,
        key: readingStorageKey(lesson.id, lesson.sections ?? []),
      })),
    ).toEqual(reference.keys);
    expect(reference.keys).toHaveLength(89);
  });
  it("lesson-card URLs reset section and show-all while retaining that lesson's ticks", () => {
    for (const lesson of cryptoLessonDocuments) {
      const ids = sectionIds(lesson.sections ?? []);
      const state = resolveReadingState(
        JSON.stringify({
          section: ids.at(-1),
          showAll: true,
          checked: ["saved-tick"],
        }),
        "?section=1&all=0",
        ids,
      );
      expect(state.activeIndex).toBe(0);
      expect(state.showAll).toBe(false);
      expect(state.checked).toEqual(["saved-tick"]);
    }
  });
  it("the roadmap includes all 50 published Crypto lessons exactly once and all 11 level quizzes", () => {
    const path = getLearningPath("crypto")!;
    expect(path.levels).toHaveLength(11);
    const listed = path.levels.flatMap((level) =>
      level.courses.flatMap((course) =>
        course.modules.flatMap((module) => module.lessons),
      ),
    );
    const lessons = listed.filter((lesson) => lesson.type === "lesson");
    const quizzes = listed.filter((lesson) => lesson.type === "quiz");
    expect(lessons).toHaveLength(50);
    expect(quizzes).toHaveLength(11);
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(50);
    expect(lessons.map((lesson) => lesson.href).sort()).toEqual(
      cryptoLessonDocuments.map((lesson) => lesson.href).sort(),
    );
    for (const level of path.levels) {
      const quizzesInLevel = level.courses.flatMap((course) =>
        course.modules.flatMap((module) =>
          module.lessons.filter((lesson) => lesson.type === "quiz"),
        ),
      );
      expect(quizzesInLevel).toHaveLength(1);
      expect(quizzesInLevel[0].href).toBe(`/learn/crypto/${level.id}/quiz`);
    }
  });
});
