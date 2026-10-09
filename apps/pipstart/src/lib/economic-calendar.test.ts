import { describe, expect, it } from "vitest";
import { calendarExplainers } from "../content/calendar-explainers";
import {
  calendarFallbackText,
  calendarLoadTimeoutMs,
  calendarLessonUrl,
  calendarWidgetSettings,
  officialCalendarSources,
} from "./economic-calendar";
import { seoEntries } from "./seo";
import { publishedLessons } from "../content/lesson-registry";

describe("M20 embed-first contract", () => {
  it("uses medium/high importance and confirmed local country choices", () => {
    expect(calendarWidgetSettings.importanceFilter).toBe("0,1");
    expect(calendarWidgetSettings.countryFilter.split(",")).toEqual(
      expect.arrayContaining(["ke", "tz"]),
    );
    expect(calendarWidgetSettings.width).toBe("100%");
    expect(calendarLoadTimeoutMs).toBe(8000);
    expect(calendarFallbackText).toContain("official release schedules");
  });
  it("has ten substantive original explainers with unique IDs", () => {
    expect(calendarExplainers).toHaveLength(10);
    expect(new Set(calendarExplainers.map((e) => e.id)).size).toBe(10);
    for (const event of calendarExplainers) {
      expect(event.measures.length).toBeGreaterThan(70);
      expect(event.reaction.length).toBeGreaterThan(60);
      expect(event.example.length).toBeGreaterThan(100);
      expect(new URL(event.href).protocol).toBe("https:");
    }
  });
  it("links the unchanged published lesson and registers the calendar for SEO", () => {
    expect(
      publishedLessons.some((lesson) => lesson.href === calendarLessonUrl),
    ).toBe(true);
    expect(
      seoEntries.filter((e) => e.path === "/economic-calendar"),
    ).toHaveLength(1);
    expect(officialCalendarSources).toHaveLength(5);
  });
});
