import { skillcimaBrand } from "@repo/brand";
import { forexFoundationsCourse } from "@repo/content";

import type { FAQItem } from "@/content/faqs";
import { supportEmail } from "./contact";

// M24-06: schema.org data for search engines and AI tools. Every value comes
// from content already shown on the page; nothing here makes a new claim.
export const siteUrl = "https://skillcima.com";

const organization = {
  "@type": "EducationalOrganization",
  "@id": `${siteUrl}/#organization`,
  name: skillcimaBrand.name,
  url: siteUrl,
  description: skillcimaBrand.description,
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/skillcima-logo.png`,
    width: 2400,
    height: 645,
  },
  image: `${siteUrl}/og-image.png`,
  email: supportEmail,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: supportEmail,
    availableLanguage: "English",
  },
};

export function organizationJsonLd() {
  return { "@context": "https://schema.org", ...organization };
}

export function courseJsonLd(
  course: typeof forexFoundationsCourse = forexFoundationsCourse,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${siteUrl}/#course`,
    name: course.title,
    description: course.description,
    url: siteUrl,
    inLanguage: "en",
    isAccessibleForFree: true,
    educationalLevel: "Beginner",
    about: ["Forex", "Foreign exchange market", "Trading risk awareness"],
    audience: {
      "@type": "EducationalAudience",
      audienceType: "Complete beginners",
    },
    provider: {
      "@id": organization["@id"],
      "@type": organization["@type"],
      name: organization.name,
      url: siteUrl,
    },
    offers: [{ "@type": "Offer", category: "Free", url: siteUrl }],
    hasCourseInstance: [
      {
        "@type": "CourseInstance",
        courseMode: "Online",
        // As stated on the page: one lesson by email each day for five days.
        courseSchedule: {
          "@type": "Schedule",
          repeatFrequency: "Daily",
          repeatCount: course.lessons.length,
        },
      },
    ],
    syllabusSections: course.lessons.map((lesson) => ({
      "@type": "Syllabus",
      name: `Day ${lesson.day}: ${lesson.title}`,
      description: lesson.summary,
    })),
  };
}

export function faqJsonLd(faqs: readonly FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
