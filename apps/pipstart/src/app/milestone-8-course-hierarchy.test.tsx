import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import CryptoSegmentPage from "./learn/crypto/level-1/[lesson]/page";
import CryptoModulePage from "./learn/crypto/level-1/[lesson]/[module]/page";
import ForexKindergartenPage from "./learn/forex/level-1/forex-kindergarten/page";
import ForexFoundationsPage from "./learn/forex/level-1/forex-kindergarten/forex-foundations/page";

// MP05c: the Bitcoin course and module pages are served by the generic data-driven routes.
const bitcoinCourse = await CryptoSegmentPage({
  params: Promise.resolve({ lesson: "bitcoin" }),
});
const BitcoinCoursePage = () => bitcoinCourse;
const bitcoinFoundations = await CryptoModulePage({
  params: Promise.resolve({ lesson: "bitcoin", module: "bitcoin-foundations" }),
});
const BitcoinFoundationsPage = () => bitcoinFoundations;

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
    ["Bitcoin Foundations", BitcoinFoundationsPage, "What Is Bitcoin"],
  ])("renders the %s module and its published lessons", (_, Page, lesson) => {
    const markup = renderToStaticMarkup(<Page />);

    expect(markup).toContain("Module");
    expect(markup).toContain(lesson);
    expect(markup).not.toContain("Coming soon");
    expect(markup).not.toContain("Level 1 quiz");
  });
});
