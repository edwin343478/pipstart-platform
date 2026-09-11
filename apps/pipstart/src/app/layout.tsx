import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Manrope } from "next/font/google";

import { pipStartBrand } from "@repo/brand";

import { JsonLd } from "../components/json-ld";
import { BottomTabBar } from "../components/bottom-tab-bar";
import { siteUrl } from "../lib/seo";

import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pipstart-body",
});

const headingFont = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pipstart-heading",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${pipStartBrand.name} | Forex and Crypto Education`,
    template: `%s | ${pipStartBrand.name}`,
  },
  description: pipStartBrand.description,
  applicationName: pipStartBrand.name,
  authors: [{ name: "PipStart", url: siteUrl }],
  creator: "PipStart",
  publisher: "PipStart",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: pipStartBrand.name,
    title: `${pipStartBrand.name} | Forex and Crypto Education`,
    description: pipStartBrand.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PipStart structured Forex and cryptocurrency education",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${pipStartBrand.name} | Forex and Crypto Education`,
    description: pipStartBrand.description,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: pipStartBrand.name,
            url: siteUrl,
            description: pipStartBrand.description,
          }}
        />
        {children}
        <BottomTabBar />
      </body>
    </html>
  );
}
