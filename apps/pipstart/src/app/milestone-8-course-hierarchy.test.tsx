import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import BitcoinCoursePage from "./learn/crypto/level-1/bitcoin/page";
import BitcoinFoundationsPage from "./learn/crypto/level-1/bitcoin/bitcoin-foundations/page";
import ForexKindergartenPage from "./learn/forex/level-1/forex-kindergarten/page";
import ForexFoundationsPage from "./learn/forex/level-1/forex-kindergarten/forex-foundations/page";

describe("Milestone 8 course and module pages", () => {
  it.each([
    ["Forex Kindergarten", ForexKindergartenPage, "Forex Foundations"],
    ["Bitcoin", BitcoinCoursePage, "Bitcoin Foundations"],
  ])("renders the %s course and its module", (_, Page, moduleTitle) => {
    const markup = renderToStaticMarkup(<Page />);

    expect(markup).toContain("Course");
    expect(markup).toContain(moduleTitle);
    expect(markup).toContain('aria-label="Breadcrumb"');
    expect(markup).toContain('"@type":"BreadcrumbList"');
  });

  it.each([
    ["Forex Foundations", ForexFoundationsPage, "What is Forex?"],
    ["Bitcoin Foundations", BitcoinFoundationsPage, "What is Bitcoin?"],
  ])("renders the %s module and its published lessons", (_, Page, lesson) => {
    const markup = renderToStaticMarkup(<Page />);

    expect(markup).toContain("Module");
    expect(markup).toContain(lesson);
    expect(markup).not.toContain("Coming soon");
    expect(markup).not.toContain("Level 1 quiz");
  });
});
