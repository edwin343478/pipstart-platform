import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { calendarExplainers } from "../content/calendar-explainers";
import { officialCalendarSources } from "../lib/economic-calendar";
import { PrimaryNavigation } from "./primary-navigation";
import { BottomTabBar } from "./bottom-tab-bar";

const navigation = vi.hoisted(() => ({ pathname: "/economic-calendar" }));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

describe("M20 calendar navigation and design data", () => {
  beforeEach(() => {
    navigation.pathname = "/economic-calendar";
  });
  it("lists Calendar directly after Analysis as a full-page link", () => {
    const markup = renderToStaticMarkup(<PrimaryNavigation />);
    const labels = [...markup.matchAll(/<a [^>]*>([^<]+)/g)].map(
      (match) => match[1],
    );
    expect(labels.indexOf("Calendar")).toBe(labels.indexOf("Analysis") + 1);
    expect(markup).toContain('href="/economic-calendar"');
  });

  it("shows the mobile tab bar on the calendar with Analysis active", () => {
    const markup = renderToStaticMarkup(<BottomTabBar />);
    expect(markup).toContain('aria-label="Mobile primary navigation"');
    const links = [...markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
    expect(links).toHaveLength(4);
    const active = links.filter((link) =>
      link[1].includes('aria-current="page"'),
    );
    expect(active).toHaveLength(1);
    expect(active[0][1]).toContain('href="/analysis"');
    expect(active[0][2]).toContain("<span>Analysis</span>");
  });

  it.each([
    ["/", "/"],
    ["/start-here", "/start-here"],
    ["/tools", "/tools"],
    ["/analysis", "/analysis"],
  ])("preserves the active mobile tab on %s", (pathname, href) => {
    navigation.pathname = pathname;
    const markup = renderToStaticMarkup(<BottomTabBar />);
    const active = [...markup.matchAll(/<a\b([^>]*)>/g)].filter((link) =>
      link[1].includes('aria-current="page"'),
    );
    expect(active).toHaveLength(1);
    expect(active[0][1]).toContain('href="' + href + '"');
  });

  it.each(["/login", "/learn/forex/level-7/use-an-economic-calendar-safely"])(
    "does not introduce a tab bar on non-hub route %s",
    (pathname) => {
      navigation.pathname = pathname;
      expect(renderToStaticMarkup(<BottomTabBar />)).toBe("");
    },
  );

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
