import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { forexFoundationsCourse } from "@repo/content";

import sitemap from "../src/app/sitemap";
import { skillcimaFaqs } from "../src/content/faqs";
import { supportEmail } from "../src/lib/contact";
import { pageMetadata, socialImage } from "../src/lib/page-metadata";
import {
  courseJsonLd,
  faqJsonLd,
  organizationJsonLd,
} from "../src/lib/structured-data";

describe("Skillcima structured data", () => {
  it("describes the free course only with facts the page shows", () => {
    const ld = courseJsonLd(forexFoundationsCourse);
    expect(ld).toMatchObject({
      "@type": "Course",
      name: forexFoundationsCourse.title,
      description: forexFoundationsCourse.description,
      isAccessibleForFree: true,
      url: "https://skillcima.com",
    });
    expect(ld.offers).toEqual([
      { "@type": "Offer", category: "Free", url: "https://skillcima.com" },
    ]);
    expect(ld.hasCourseInstance[0]).toMatchObject({
      courseMode: "Online",
      courseSchedule: {
        repeatFrequency: "Daily",
        repeatCount: forexFoundationsCourse.lessons.length,
      },
    });
    expect(ld.syllabusSections.map((s) => s.name)).toEqual(
      forexFoundationsCourse.lessons.map((l) => `Day ${l.day}: ${l.title}`),
    );
    expect(JSON.stringify(ld)).not.toMatch(
      /price"|courseWorkload|rating|review/i,
    );
    expect(organizationJsonLd()).toMatchObject({
      "@type": "EducationalOrganization",
      name: "Skillcima",
      url: "https://skillcima.com",
    });
  });

  it("FAQ structured data matches the visible FAQ word for word", () => {
    const ld = faqJsonLd(skillcimaFaqs);
    expect(ld.mainEntity).toHaveLength(skillcimaFaqs.length);
    ld.mainEntity.forEach((q, i) => {
      expect(q.name).toBe(skillcimaFaqs[i].question);
      expect(q.acceptedAnswer.text).toBe(skillcimaFaqs[i].answer);
    });
    const accordion = readFileSync(
      new URL("../src/components/faq-accordion.tsx", import.meta.url),
      "utf8",
    );
    expect(accordion).toContain('from "@/content/faqs"');
    expect(accordion).not.toMatch(/question: "/);
  });

  it("each page gets a complete social preview of its own", () => {
    const m = pageMetadata({
      title: "About",
      description: "D",
      path: "/about",
    });
    expect(m.alternates).toEqual({ canonical: "/about" });
    expect(m.openGraph).toMatchObject({
      title: "About | Skillcima",
      description: "D",
      url: "/about",
      siteName: "Skillcima",
      type: "website",
    });
    expect(m.twitter).toMatchObject({
      title: "About | Skillcima",
      description: "D",
    });
  });

  it("brand assets and the support email are published and referenced", () => {
    const publicFile = (name: string) =>
      readFileSync(new URL(`../public/${name}`, import.meta.url));
    // og-image.png is 1200x630: PNG width and height sit at bytes 16-23.
    const og = publicFile("og-image.png");
    expect([og.readUInt32BE(16), og.readUInt32BE(20)]).toEqual([1200, 630]);
    expect(socialImage).toMatchObject({ url: "/og-image.png", width: 1200 });
    const logo = publicFile("skillcima-logo.png");
    expect([logo.readUInt32BE(16), logo.readUInt32BE(20)]).toEqual([2400, 645]);
    const svg = publicFile("skillcima-logo.svg").toString("utf8");
    expect(svg).not.toMatch(/<script|href=|on[a-z]+=/i);

    const m = pageMetadata({
      title: "About",
      description: "D",
      path: "/about",
    });
    expect(m.openGraph).toMatchObject({ images: [socialImage] });
    expect(m.twitter).toMatchObject({
      card: "summary_large_image",
      images: ["/og-image.png"],
    });

    expect(supportEmail).toBe("support@skillcima.com");
    expect(organizationJsonLd()).toMatchObject({
      logo: { url: "https://skillcima.com/skillcima-logo.png" },
      contactPoint: { email: supportEmail },
    });
    const contact = readFileSync(
      new URL("../src/app/contact/page.tsx", import.meta.url),
      "utf8",
    );
    expect(contact).toContain("mailto:${supportEmail}");
    expect(contact).not.toMatch(
      /being prepared|will be added after|dedicated contact method/,
    );
    expect(contact.match(/mailto:\$\{supportEmail\}/g)).toHaveLength(2);
  });

  it("llms.txt links only to pages in the sitemap", () => {
    const text = readFileSync(
      new URL("../public/llms.txt", import.meta.url),
      "utf8",
    );
    expect(text.startsWith("# Skillcima\n")).toBe(true);
    const listed = new Set(sitemap().map(({ url }) => url.replace(/\/$/, "")));
    const links = [...text.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((m) =>
      m[1].replace(/\/$/, ""),
    );
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(listed.has(link), link).toBe(true);
  });
});
