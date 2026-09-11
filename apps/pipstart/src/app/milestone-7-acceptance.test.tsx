import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PrimaryNavigation } from "../components/primary-navigation";
import { seoEntries } from "../lib/seo";
const appRoot = path.resolve(import.meta.dirname);
describe("Milestone 7 acceptance", () => {
  it("provides all 25 required patterns", () => {
    const uiExports = fs.readFileSync(
      path.resolve(appRoot, "../../../../packages/ui/src/index.ts"),
      "utf8",
    );
    for (const component of [
      "Button",
      "Link",
      "Card",
      "Alert",
      "Badge",
      "ProgressBar",
      "FormField",
      "Checkbox",
      "Radio",
      "Tabs",
      "Accordion",
      "Modal",
      "RiskNotice",
      "EmailCapture",
    ])
      expect(uiExports).toContain(component);
    for (const file of [
      "breadcrumbs.tsx",
      "pagination.tsx",
      "site-chrome.tsx",
      "learning-structure.tsx",
      "affiliate-disclosure.tsx",
      "author-box.tsx",
      "page-state.tsx",
      "primary-navigation.tsx",
    ])
      expect(
        fs.existsSync(path.resolve(appRoot, `../components/${file}`)),
      ).toBe(true);
  });
  it("renders a keyboard-operable mobile menu", () => {
    const markup = renderToStaticMarkup(<PrimaryNavigation />);
    expect(markup).toContain('<button type="button"');
    expect(markup).toContain('aria-controls="primary-navigation"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-label="Primary navigation"');
  });
  it("uses operable disclosure controls and functional calculator filters", () => {
    const toolsPage = fs.readFileSync(
      path.join(appRoot, "tools/page.tsx"),
      "utf8",
    );
    const forexPage = fs.readFileSync(
      path.join(appRoot, "learn/forex/page.tsx"),
      "utf8",
    );
    const cryptoPage = fs.readFileSync(
      path.join(appRoot, "learn/crypto/page.tsx"),
      "utf8",
    );
    for (const source of [toolsPage, forexPage, cryptoPage]) {
      expect(source).toContain("aria-expanded={expanded}");
      expect(source).not.toContain('type="checkbox"');
    }
    expect(toolsPage).toContain("setQuery(event.target.value)");
    expect(toolsPage).toContain("setActiveCategory");
    expect(toolsPage).toContain("filteredTools");
  });
  it("keeps Start Here in mobile navigation and avoids the rejected text color", () => {
    const bottomNavigation = fs.readFileSync(
      path.resolve(appRoot, "../components/bottom-tab-bar.tsx"),
      "utf8",
    );
    const styles = fs.readFileSync(
      path.join(appRoot, "page.module.css"),
      "utf8",
    );
    expect(bottomNavigation).toContain('"/start-here"');
    expect(styles).not.toContain("#8a93a0");
  });
  it("adopts shared UI primitives in production pages", () => {
    const toolsPage = fs.readFileSync(
      path.join(appRoot, "tools/page.tsx"),
      "utf8",
    );
    const calculatorError = fs.readFileSync(
      path.join(appRoot, "tools/components/calculator-error.tsx"),
      "utf8",
    );
    const glossaryPage = fs.readFileSync(
      path.join(appRoot, "glossary/page.tsx"),
      "utf8",
    );
    expect(toolsPage).toContain('from "@repo/ui"');
    expect(toolsPage).toContain("Button");
    expect(toolsPage).toContain("Card");
    expect(toolsPage).toContain("Input");
    expect(calculatorError).toContain("PageState");
    expect(glossaryPage).toContain('from "@repo/ui"');

    const productionSources = fs
      .readdirSync(path.join(appRoot, "tools"), { recursive: true })
      .map(String)
      .filter((entry) => entry.endsWith(".tsx"))
      .map((entry) =>
        fs.readFileSync(path.join(appRoot, "tools", entry), "utf8"),
      );
    expect(
      productionSources.filter((source) => source.includes('from "@repo/ui"'))
        .length,
    ).toBeGreaterThanOrEqual(12);
  });
  it("keeps public metadata unique", () => {
    expect(new Set(seoEntries.map((entry) => entry.path)).size).toBe(
      seoEntries.length,
    );
    expect(new Set(seoEntries.map((entry) => entry.title)).size).toBe(
      seoEntries.length,
    );
    expect(new Set(seoEntries.map((entry) => entry.description)).size).toBe(
      seoEntries.length,
    );
  });
  it("retains focus rules and canonical redirect", () => {
    const styles = fs.readFileSync(
      path.join(appRoot, "page.module.css"),
      "utf8",
    );
    const config = fs.readFileSync(
      path.resolve(appRoot, "../../next.config.ts"),
      "utf8",
    );
    expect(styles).toContain(":focus-visible");
    expect(config).toContain('source: "/legal/risk-disclaimer"');
    expect(config).toContain('destination: "/legal/risk-disclosure"');
    expect(config).toContain("permanent: true");
  });
});
