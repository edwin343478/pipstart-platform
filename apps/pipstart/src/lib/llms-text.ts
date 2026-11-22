import { pipStartBrand } from "@repo/brand";

import { publishedLessons } from "../content/lesson-registry";
import { seoEntries, siteUrl } from "./seo";

// M24-06: a plain-text guide to the site for AI tools (the llms.txt convention).
// Titles and descriptions come from the same seoEntries the pages use.
export const llmsSections: ReadonlyArray<{
  heading: string;
  paths: readonly string[];
}> = [
  {
    heading: "Start learning",
    paths: ["/start-here", "/learn/forex", "/learn/crypto"],
  },
  {
    heading: "Calculators",
    paths: [
      "/tools",
      "/tools/position-size-calculator",
      "/tools/pip-value-calculator",
      "/tools/risk-reward-calculator",
      "/tools/profit-loss-calculator",
      "/tools/margin-calculator",
      "/tools/drawdown-calculator",
      "/tools/gain-recovery-calculator",
      "/tools/crypto-position-size-calculator",
      "/tools/dollar-cost-averaging-calculator",
      "/tools/compound-growth-illustration",
    ],
  },
  {
    heading: "Reference",
    paths: ["/glossary", "/glossary/crypto", "/analysis", "/economic-calendar"],
  },
  {
    heading: "About and trust",
    paths: [
      "/about",
      "/authors/pipstart-editorial-team",
      "/faq",
      "/legal/risk-disclosure",
      "/contact",
    ],
  },
  { heading: "Provider directory", paths: ["/brokers"] },
  {
    heading: "Policies",
    paths: ["/legal/privacy-policy", "/legal/terms", "/legal/cookie-policy"],
  },
];

export function buildLlmsText(): string {
  const byPath = new Map(
    seoEntries.map((entry) => [entry.path as string, entry]),
  );
  const lines = [
    `# ${pipStartBrand.name}`,
    "",
    `> ${pipStartBrand.description} ${publishedLessons.length} published lessons across structured Forex and crypto learning paths, with practical calculators, a glossary and market analysis. Education only: trading Forex and crypto involves financial risk.`,
    "",
  ];
  for (const section of llmsSections) {
    lines.push(`## ${section.heading}`, "");
    for (const path of section.paths) {
      const entry = byPath.get(path);
      if (!entry)
        throw new Error(
          `llms.txt lists a page that is not in seoEntries: ${path}`,
        );
      lines.push(
        `- [${entry.title}](${new URL(path, siteUrl).href}): ${entry.description}`,
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}
