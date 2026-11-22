import type { PublishedLesson } from "../content/lesson-registry";
import { pipStartEditorialTeam } from "../app/analysis/authors";
import { siteUrl } from "./seo";

// M24-06: schema.org data for each published lesson, built only from the
// lesson's reviewed metadata (the same values the page shows or links to).
// Authors are teams, so they are described as organisations, never people.
export function createLessonJsonLd(lesson: PublishedLesson) {
  const url = new URL(lesson.href, siteUrl).href;
  const levelNumber = /^level-(\d+)$/.exec(lesson.level)?.[1];
  const authorUrl =
    lesson.author === pipStartEditorialTeam.name
      ? new URL(pipStartEditorialTeam.href, siteUrl).href
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": ["Article", "LearningResource"],
    "@id": `${url}#lesson`,
    headline: lesson.title.slice(0, 110),
    name: lesson.title,
    description: lesson.seoDescription || lesson.description,
    url,
    mainEntityOfPage: url,
    inLanguage: "en",
    isAccessibleForFree: true,
    learningResourceType: "Lesson",
    ...(levelNumber ? { educationalLevel: `Level ${levelNumber}` } : {}),
    about: lesson.learningPath === "forex" ? "Forex" : "Cryptocurrency",
    teaches: lesson.objectives,
    timeRequired: `PT${lesson.estimatedMinutes}M`,
    datePublished: lesson.publishedDate,
    dateModified: lesson.reviewDate,
    author: {
      "@type": "Organization",
      name: lesson.author,
      ...(authorUrl ? { url: authorUrl } : {}),
    },
    publisher: {
      "@type": "EducationalOrganization",
      name: "PipStart",
      url: siteUrl,
    },
    ...(lesson.sources.length
      ? {
          citation: lesson.sources.map((source) => ({
            "@type": "CreativeWork",
            name: source.title,
            url: source.url,
          })),
        }
      : {}),
  };
}
