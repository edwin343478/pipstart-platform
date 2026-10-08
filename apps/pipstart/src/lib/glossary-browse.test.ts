import { describe, expect, it } from "vitest";
import {
  glossaryVisibleCount,
  glossaryBrowseHref,
  glossaryGroupingHref,
  glossaryFragmentCount,
  glossaryTermAnchor,
} from "./glossary-browse";
const selection = {
  query: "gas & fees",
  course: "crypto" as const,
  letter: "G",
  category: "Network costs",
};
describe("bounded glossary browsing", () => {
  it("shows a first group, expands in groups and stops at the available total", () => {
    expect(glossaryVisibleCount(undefined, 136)).toBe(12);
    expect(glossaryVisibleCount("24", 136)).toBe(24);
    expect(glossaryVisibleCount("25", 136)).toBe(36);
    expect(glossaryVisibleCount("144", 136)).toBe(136);
    expect(glossaryVisibleCount(undefined, 0)).toBe(0);
    expect(glossaryVisibleCount(undefined, 4)).toBe(4);
  });
  it("rejects malformed, repeated, negative and unbounded limit values", () => {
    for (const value of [
      ["24"],
      "-12",
      "0",
      "501",
      "999999999",
      "Infinity",
      "12px",
      "1e2",
      {},
    ])
      expect(glossaryVisibleCount(value, 136)).toBe(12);
  });
  it("preserves filters safely in native View more URLs", () => {
    const href = glossaryBrowseHref(
      "/glossary/search",
      selection,
      24,
      "crypto-gas",
    );
    const url = new URL(href, "https://example.test");
    expect(url.pathname).toBe("/glossary/search");
    expect(url.searchParams.get("q")).toBe("gas & fees");
    expect(url.searchParams.get("course")).toBe("crypto");
    expect(url.searchParams.get("category")).toBe("Network costs");
    expect(url.searchParams.get("limit")).toBe("24");
    expect(url.hash).toBe("#crypto-gas");
  });
  it("retains search intent but resets categories and pagination when switching groups", () => {
    for (const course of ["forex", "crypto", ""] as const) {
      const url = new URL(
        glossaryGroupingHref("/glossary", course, selection),
        "https://example.test",
      );
      expect(url.pathname).toBe(
        course === "crypto" ? "/glossary/crypto" : "/glossary",
      );
      expect(url.searchParams.get("course")).toBe(
        course === "forex" ? "forex" : null,
      );
      expect(url.searchParams.get("q")).toBe(selection.query);
      expect(url.searchParams.has("category")).toBe(false);
      expect(url.searchParams.has("limit")).toBe(false);
    }
  });
  it("preserves course-qualified identities and existing canonical course anchors", () => {
    expect(glossaryTermAnchor("", { course: "forex", slug: "spread" })).toBe(
      "spread",
    );
    expect(glossaryTermAnchor("", { course: "crypto", slug: "spread" })).toBe(
      "crypto-spread",
    );
    expect(
      glossaryTermAnchor("crypto", { course: "crypto", slug: "spread" }),
    ).toBe("spread");
  });
  it("reveals later canonical anchors without losing pagination bounds", () => {
    const anchors = Array.from({ length: 40 }, (_, i) => "term-" + i);
    expect(glossaryFragmentCount("#term-29", anchors, 12)).toBe(36);
    expect(glossaryFragmentCount("#term-0", anchors, 24)).toBe(24);
    expect(glossaryFragmentCount("#unknown", anchors, 12)).toBe(12);
    expect(glossaryFragmentCount("#%E0%A4%A", anchors, 12)).toBe(12);
  });
});
