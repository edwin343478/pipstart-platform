import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CalculatorHeader } from "../components/calculator-header";
import { faqEntries } from "./faq/content";
import FaqPage from "./faq/page";

const appRoot = path.resolve(import.meta.dirname);

const calculatorRoutes = [
  "compound-growth-illustration",
  "crypto-position-size-calculator",
  "dollar-cost-averaging-calculator",
  "drawdown-calculator",
  "gain-recovery-calculator",
  "margin-calculator",
  "pip-value-calculator",
  "position-size-calculator",
  "profit-loss-calculator",
  "risk-reward-calculator",
];

describe("Milestone 8 FAQ and breadcrumb architecture", () => {
  it("publishes production FAQ content through accessible disclosures", () => {
    const markup = renderToStaticMarkup(<FaqPage />);

    expect(faqEntries).toHaveLength(8);
    expect(faqEntries.every((entry) => entry.status === "published")).toBe(
      true,
    );
    expect(markup.match(/<details/g)).toHaveLength(faqEntries.length);
    expect(markup.match(/<summary/g)).toHaveLength(faqEntries.length);
    expect(markup).toContain('"@type":"FAQPage"');
    expect(markup).not.toContain("Skillcima");
  });

  it("renders calculator breadcrumbs through the shared component", () => {
    const markup = renderToStaticMarkup(
      <CalculatorHeader currentLabel="Position Size" />,
    );

    expect(markup).toContain('aria-label="PipStart home"');
    expect(markup).toContain('aria-label="Breadcrumb"');
    expect(markup).toContain('href="/tools"');
    expect(markup).toContain('aria-current="page"');
  });

  it.each(calculatorRoutes)("uses standardized breadcrumbs on %s", (route) => {
    const source = fs.readFileSync(
      path.join(appRoot, "tools", route, "page.tsx"),
      "utf8",
    );

    expect(source).toContain("<CalculatorHeader");
    expect(source).not.toContain('<nav aria-label="Breadcrumb">');
  });
});
