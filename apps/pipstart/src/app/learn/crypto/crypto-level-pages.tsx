import "server-only";

// M22 MP05c shared Crypto level pages (levels 1-10). Each level's route files pass their level
// ID here; courses, modules and quizzes are resolved from data, never named in a route file.
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import type { PublishedLesson } from "../../../content/lesson-registry";
import { CurriculumPage } from "../../../components/curriculum-page";
import { toPublicAssessment } from "../../../lib/assessment";
import { getCurrentPublishedAssessment } from "../../../lib/assessment-registry";
import { getCryptoOrientationQuizClientContext } from "../../../lib/crypto-orientation-quiz-context";
import {
  cryptoCourseMetadata,
  cryptoLessonMetadata,
  cryptoLevel,
  cryptoLevelQuiz,
  cryptoModuleMetadata,
  cryptoModuleParams,
  cryptoModuleQuizParams,
  cryptoQuizMetadata,
  cryptoSegmentParams,
  resolveCryptoModule,
  resolveCryptoModuleQuiz,
  resolveCryptoSegment,
} from "../../../lib/crypto-level-routing";
import { ForexFoundationsQuiz } from "../forex/level-1/quiz/quiz-client";

type SegmentProps = { params: Promise<{ lesson: string }> };
type ModuleProps = { params: Promise<{ lesson: string; module: string }> };

/** Builds the [lesson] route of one level: a course page or a later lesson page. */
export function cryptoSegmentRoute(
  levelId: string,
  LessonView: (props: { lesson: PublishedLesson }) => ReactNode,
) {
  return {
    generateStaticParams: () => cryptoSegmentParams(levelId),
    async generateMetadata({ params }: SegmentProps) {
      const found = resolveCryptoSegment(levelId, (await params).lesson);
      if (!found) return {};
      return found.kind === "course"
        ? cryptoCourseMetadata(found.course)
        : cryptoLessonMetadata(found.lesson);
    },
    async Page({ params }: SegmentProps) {
      const found = resolveCryptoSegment(levelId, (await params).lesson);
      const context = cryptoLevel(levelId);
      if (!found || !context) notFound();
      if (found.kind === "lesson") return <LessonView lesson={found.lesson} />;
      return (
        <CurriculumPage
          course={found.course}
          kind="course"
          learningPath={context.learningPath}
          level={context.level}
        />
      );
    },
  };
}

/** Builds the [lesson]/[module] route of one level. */
export function cryptoModuleRoute(levelId: string) {
  return {
    generateStaticParams: () => cryptoModuleParams(levelId),
    async generateMetadata({ params }: ModuleProps) {
      const { lesson, module } = await params;
      const found = resolveCryptoModule(levelId, lesson, module);
      return found ? cryptoModuleMetadata(found.module) : {};
    },
    async Page({ params }: ModuleProps) {
      const { lesson, module } = await params;
      const found = resolveCryptoModule(levelId, lesson, module);
      const context = cryptoLevel(levelId);
      if (!found || !context) notFound();
      return (
        <CurriculumPage
          course={found.course}
          kind="module"
          learningPath={context.learningPath}
          level={context.level}
          module={found.module}
        />
      );
    },
  };
}

function CryptoQuiz({ assessmentId }: { assessmentId: string }) {
  const assessment = getCurrentPublishedAssessment(assessmentId);
  const context =
    assessment &&
    getCryptoOrientationQuizClientContext(
      assessment.courseId,
      assessment.moduleId,
    );
  if (!assessment || !context) notFound();
  return (
    <ForexFoundationsQuiz
      assessment={toPublicAssessment(assessment)}
      context={context}
    />
  );
}

/** The existing level quiz at /learn/crypto/<level>/quiz. */
export function cryptoLevelQuizRoute(levelId: string) {
  const found = cryptoLevelQuiz(levelId);
  return {
    metadata: found ? cryptoQuizMetadata(found.quiz, found.module) : {},
    Page() {
      if (!found) notFound();
      return <CryptoQuiz assessmentId={found.quiz.id} />;
    },
  };
}

/** A module-scoped quiz at /learn/crypto/<level>/<course>/<module>/quiz. */
export function cryptoModuleQuizRoute(levelId: string) {
  return {
    generateStaticParams: () => cryptoModuleQuizParams(levelId),
    async generateMetadata({ params }: ModuleProps) {
      const { lesson, module } = await params;
      const found = resolveCryptoModuleQuiz(levelId, lesson, module);
      return found ? cryptoQuizMetadata(found.quiz, found.module) : {};
    },
    async Page({ params }: ModuleProps) {
      const { lesson, module } = await params;
      const found = resolveCryptoModuleQuiz(levelId, lesson, module);
      if (!found) notFound();
      return <CryptoQuiz assessmentId={found.quiz.id} />;
    },
  };
}
