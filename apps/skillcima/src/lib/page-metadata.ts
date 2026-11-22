import type { Metadata } from "next";

import { skillcimaBrand } from "@repo/brand";

// M24-06: complete per-page metadata. In Next.js a page's openGraph and twitter
// objects REPLACE the layout's, so each page must set every field it needs.
export function pageMetadata(input: {
  title: string;
  description: string;
  path: `/${string}`;
}): Metadata {
  const fullTitle = `${input.title} | ${skillcimaBrand.name}`;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title: fullTitle,
      description: input.description,
      url: input.path,
      siteName: skillcimaBrand.name,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description: input.description,
    },
  };
}
