import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getCurrentPublishedAssessment } from "./assessment-registry";
import {
  cryptoCourseLessons,
  cryptoLevelPageLessons,
} from "./crypto-level-lessons";
import {
  cryptoLessonContext,
  cryptoLevel,
  cryptoLevelQuiz,
  cryptoModuleParams,
  cryptoModuleQuizParams,
  cryptoSegmentParams,
  resolveCryptoModule,
  resolveCryptoModuleQuiz,
  resolveCryptoSegment,
} from "./crypto-level-routing";
import { curriculumPresentation } from "./curriculum-presentation";
import { getLearningProgressStorageKey } from "./learning-progress-storage";

const levels = Array.from({ length: 10 }, (_, index) => `level-${index + 1}`);
const appCrypto = resolve(import.meta.dirname, "../app/learn/crypto");

describe("M22 MP05c data-driven Crypto routing", () => {
  it.each(levels)(
    "resolves every course, module, lesson and quiz of %s from data",
    (levelId) => {
      const found = cryptoLevel(levelId);
      expect(found).toBeDefined();
      const courses = found!.level.courses;
      expect(courses.length).toBeGreaterThan(0);

      for (const course of courses) {
        expect(resolveCryptoSegment(levelId, course.id)).toEqual({
          kind: "course",
          course,
        });
        for (const curriculumModule of course.modules)
          expect(
            resolveCryptoModule(levelId, course.id, curriculumModule.id),
          ).toEqual({
            course,
            module: curriculumModule,
          });
        for (const lesson of cryptoCourseLessons(levelId, course.id).slice(1))
          expect(resolveCryptoSegment(levelId, lesson.slug)).toEqual({
            kind: "lesson",
            lesson,
          });
      }

      expect(cryptoSegmentParams(levelId)).toEqual([
        ...courses.map((course) => ({ lesson: course.id })),
        ...courses.flatMap((course) =>
          cryptoCourseLessons(levelId, course.id)
            .filter((lesson) => lesson.position !== 1)
            .map((lesson) => ({ lesson: lesson.slug })),
        ),
      ]);
      expect(cryptoModuleParams(levelId)).toEqual(
        courses.flatMap((course) =>
          course.modules.map((entry) => ({
            lesson: course.id,
            module: entry.id,
          })),
        ),
      );

      // The level quiz keeps /learn/crypto/<level>/quiz; its ID is the published assessment.
      const quiz = cryptoLevelQuiz(levelId);
      expect(quiz?.quiz.href).toBe(`/learn/crypto/${levelId}/quiz`);
      expect(getCurrentPublishedAssessment(quiz!.quiz.id)).toBeDefined();
      // No module-scoped quiz exists yet; those routes generate nothing today.
      expect(cryptoModuleQuizParams(levelId)).toEqual([]);
    },
  );

  it.each(levels)(
    "keeps the %s level page, context title and progress key",
    (levelId) => {
      const lessons = cryptoLevelPageLessons(levelId);
      expect(lessons[0]?.href).toBe(`/learn/crypto/${levelId}`);
      const context = cryptoLessonContext(levelId, lessons[0]!.course);
      expect(context?.lessons).toEqual(lessons);
      expect(context?.contextHref).toBe(
        `/learn/crypto/${levelId}/${lessons[0]!.course}`,
      );
      expect(context?.contextTitle).toBe(
        curriculumPresentation[lessons[0]!.course]?.lessonContextTitle,
      );
      expect(context?.progressKey).toBe(
        getLearningProgressStorageKey("crypto", levelId, lessons[0]!.course),
      );
    },
  );

  it("keeps the Level 1 legacy progress key", () => {
    expect(cryptoLessonContext("level-1", "bitcoin")?.progressKey).toBe(
      "pipstart:learn:crypto:level-1:progress",
    );
  });

  it("refuses unknown segments, modules and quizzes", () => {
    expect(resolveCryptoSegment("level-2", "missing")).toBeUndefined();
    expect(
      resolveCryptoSegment("level-2", "check-a-crypto-transfer")?.kind,
    ).toBe("lesson");
    // A level page lesson (position 1) is never a second segment.
    expect(
      resolveCryptoSegment(
        "level-2",
        cryptoLevelPageLessons("level-2")[0]!.slug,
      ),
    ).toBeUndefined();
    expect(
      resolveCryptoModule("level-2", "wallets-and-security", "missing"),
    ).toBeUndefined();
    expect(
      resolveCryptoModule(
        "level-3",
        "wallets-and-security",
        "wallet-and-personal-security",
      ),
    ).toBeUndefined();
    expect(
      resolveCryptoModuleQuiz(
        "level-2",
        "wallets-and-security",
        "wallet-and-personal-security",
      ),
    ).toBeUndefined();
    expect(cryptoLevel("level-99")).toBeUndefined();
  });

  it("names no course or module in any level route folder", () => {
    for (const levelId of levels) {
      const folders = readdirSync(resolve(appCrypto, levelId), {
        withFileTypes: true,
      })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
      expect(folders).toEqual(["[lesson]", "quiz"]);
      expect(
        existsSync(resolve(appCrypto, levelId, "[lesson]/[module]/page.tsx")),
      ).toBe(true);
      expect(
        existsSync(
          resolve(appCrypto, levelId, "[lesson]/[module]/quiz/page.tsx"),
        ),
      ).toBe(true);
    }
  });
});
