import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AffiliateDisclosure } from "./affiliate-disclosure";
import { Breadcrumbs } from "./breadcrumbs";
import { LearningHeader, LessonNavigation } from "./learning-structure";
import { PageState } from "./page-state";
import { Pagination } from "./pagination";
import { CompactFooter, CompactHeader } from "./site-chrome";

describe("PipStart structural components", () => {
  it("provides a consistent home link and section label", () => {
    const markup = renderToStaticMarkup(<CompactHeader section="Analysis" />);

    expect(markup).toContain('aria-label="PipStart home"');
    expect(markup).toContain("Analysis");
  });

  it("labels breadcrumb navigation and marks only linked ancestors", () => {
    const markup = renderToStaticMarkup(
      <Breadcrumbs
        items={[
          { href: "/analysis", label: "Analysis" },
          { label: "Fundamental Analysis" },
        ]}
      />,
    );

    expect(markup).toContain('aria-label="Breadcrumb"');
    expect(markup).toContain("<ol>");
    expect(markup).toContain("<li>");
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('href="/analysis"');
    expect(markup).not.toContain('href="Fundamental Analysis"');
  });

  it("disables unavailable pagination directions without fake links", () => {
    const markup = renderToStaticMarkup(
      <Pagination
        ariaLabel="Archive pages"
        currentPage={1}
        nextHref="/analysis?page=2"
        totalPages={2}
      />,
    );

    expect(markup).toContain('aria-disabled="true"');
    expect(markup).toContain('href="/analysis?page=2"');
  });

  it("announces shared page states with suitable urgency", () => {
    expect(renderToStaticMarkup(<PageState>No results.</PageState>)).toContain(
      'role="status"',
    );
    expect(
      renderToStaticMarkup(<PageState kind="error">Try again.</PageState>),
    ).toContain('role="alert"');
  });

  it("identifies disclosures and preserves the compact footer", () => {
    const disclosure = renderToStaticMarkup(
      <AffiliateDisclosure>We may receive compensation.</AffiliateDisclosure>,
    );

    expect(disclosure).toContain('role="note"');
    expect(disclosure).toContain("Affiliate disclosure:");
    expect(renderToStaticMarkup(<CompactFooter />)).toContain(
      "PipStart · pipstart.net",
    );
  });

  it("keeps level exits and lesson navigation available", () => {
    const header = renderToStaticMarkup(
      <LearningHeader
        allLevelsHref="/learn/forex"
        allLevelsLabel="All Forex levels"
        levelLabel="Level 1 · Forex Kindergarten"
      />,
    );
    const navigation = renderToStaticMarkup(
      <LessonNavigation
        next={{ href: "/learn/forex", label: "Return to Forex path" }}
      />,
    );

    expect(header).toContain('href="/learn/forex"');
    expect(header).toContain("All Forex levels");
    expect(navigation).toContain('aria-label="Lesson navigation"');
    expect(navigation).toContain("Return to Forex path");
  });
});
