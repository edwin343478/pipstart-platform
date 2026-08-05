import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";

import { skillcimaBrand } from "@repo/brand";

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
  title: {
    default: `${skillcimaBrand.name} | Free Forex Foundations Course`,
    template: `%s | ${skillcimaBrand.name}`,
  },
  description: skillcimaBrand.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
