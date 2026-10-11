import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { calendarExplainers } from "../content/calendar-explainers";
import { getPublishedCourseGlossary } from "../content/published-glossary";

describe("calendar learning destinations", () => {
  it("uses real public Forex glossary destinations with truthful labels", () => {
    const terms = getPublishedCourseGlossary("forex");
    for (const event of calendarExplainers) {
      const term = terms.find(
        (candidate) => candidate.href === event.glossary.href,
      );
      expect(
        term,
        event.id + " must resolve to a published term",
      ).toBeDefined();
      expect(term!.name.toLowerCase()).toBe(event.glossary.label.toLowerCase());
      expect(term!.approved).toBe(true);
      expect(term!.status).toBe("published");
    }
  });

  it("does not invent unpublished payroll, wage or survey glossary entries", () => {
    for (const id of [
      "us-jobs",
      "unemployment",
      "wages",
      "pmi",
      "retail-sales",
    ]) {
      expect(
        calendarExplainers.find((event) => event.id === id)?.glossary.href,
      ).toBe("/glossary#economic-calendar");
    }
  });
});
