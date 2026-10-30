import "server-only";

// M22 MP04b code adapter: today's code-held content behind the public repository contract.
// It returns exactly what the existing registries publish (parity-tested), through the
// public allowlists. No public route is switched to it in MP04b.
import { analysisPosts } from "../../app/analysis/posts";
import {
  getPublishedLesson,
  getPublishedLessons,
} from "../../content/lesson-registry";
import { getCurrentPublishedAssessment } from "../assessment-registry";
import {
  type PublicContentRepository,
  toPublicAnalysisPost,
  toPublicLesson,
  toPublicQuiz,
} from "./public";

export const codeContentRepository: PublicContentRepository = {
  lessons: (learningPath, level) =>
    getPublishedLessons({ learningPath, level }).map(toPublicLesson),
  lesson: (learningPath, slug) => {
    const lesson = getPublishedLesson(learningPath, slug);
    return lesson && toPublicLesson(lesson);
  },
  currentQuiz: (id) => {
    const quiz = getCurrentPublishedAssessment(id);
    return quiz && toPublicQuiz(quiz);
  },
  analysisPosts: (category) =>
    analysisPosts
      .filter((post) => category === undefined || post.category === category)
      .map(toPublicAnalysisPost),
  analysisPost: (slug) => {
    const post = analysisPosts.find((entry) => entry.slug === slug);
    return post && toPublicAnalysisPost(post);
  },
};
