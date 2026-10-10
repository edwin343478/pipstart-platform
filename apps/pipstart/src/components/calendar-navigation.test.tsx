import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { calendarExplainers } from "../content/calendar-explainers";
import { officialCalendarSources } from "../lib/economic-calendar";
import { PrimaryNavigation } from "./primary-navigation";

const componentsRoot = path.resolve(import.meta.dirname);

describe("M20 calendar navigation and design data", () => {
  it("lists Calendar directly after Analysis as a full-page link", () => {
    const markup = renderToStaticMarkup(<PrimaryNavigation />);
    const labels = [...markup.matchAll(/<a [^>]*>([^<]+)/g)].map(
      (match) => match[1],
    );
    expect(labels.indexOf("Calendar")).toBe(labels.indexOf("Analysis") + 1);
    expect(markup).toContain('href="/economic-calendar"');
  });

  it("shows the mobile tab bar on the calendar with Analysis active", () => {
    const source = fs.readFileSync(
      path.join(componentsRoot, "bottom-tab-bar.tsx"),
      "utf8",
    );
    expect(source).toContain('"/economic-calendar",');
    expect(source).toMatch(/pathname === "\/economic-calendar"/);
  });

  it("gives every explainer a category, icon and calendar wording", () => {
    for (const event of calendarExplainers) {
      expect(event.category.length).toBeGreaterThan(3);
      expect(event.listedAs.length).toBeGreaterThan(3);
      expect([
        "bank",
        "price",
        "jobs",
        "growth",
        "survey",
        "spending",
      ]).toContain(event.icon);
    }
    for (const source of officialCalendarSources)
      expect(source.shortName.length).toBeLessThan(source.name.length + 1);
  });
});
