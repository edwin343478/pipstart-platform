import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Manrope } from "next/font/google";

import { pipStartBrand } from "@repo/brand";

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
  title: {
    default: `${pipStartBrand.name} | Forex and Crypto Education`,
    template: `%s | ${pipStartBrand.name}`,
  },
  description: pipStartBrand.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}