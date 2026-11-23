import type { Metadata } from "next";

import { skillcimaBrand } from "@repo/brand";

// Shared social preview image (1200x630, the Skillcima logo on the brand background).
export const socialImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Skillcima",
} as const;

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
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
      images: [socialImage.url],
    },
  };
}
