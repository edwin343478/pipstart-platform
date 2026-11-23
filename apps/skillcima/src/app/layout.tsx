import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";

import { skillcimaBrand } from "@repo/brand";

import { socialImage } from "@/lib/page-metadata";

import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-skillcima-body",
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-skillcima-heading",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://skillcima.com"),

  title: {
    default: `${skillcimaBrand.name} | Free Forex Foundations Course`,
    template: `%s | ${skillcimaBrand.name}`,
  },

  description: skillcimaBrand.description,

  openGraph: {
    title: `${skillcimaBrand.name} | Free Forex Foundations Course`,
    description: skillcimaBrand.description,
    siteName: skillcimaBrand.name,
    locale: "en_US",
    type: "website",
    images: [socialImage],
  },

  twitter: {
    card: "summary_large_image",
    title: `${skillcimaBrand.name} | Free Forex Foundations Course`,
    description: skillcimaBrand.description,
    images: [socialImage.url],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: skillcimaBrand.colors.background,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${bodyFont.variable} ${headingFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
