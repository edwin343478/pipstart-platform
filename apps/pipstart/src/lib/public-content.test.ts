import { describe, expect, it } from "vitest";

import { selectPublishedContent } from "./public-content";

describe("public content visibility", () => {
  it("returns published records and excludes drafts", () => {
    const entries = [
      { slug: "published-entry", status: "published" as const },
      { slug: "draft-entry", status: "draft" as const },
    ];

    expect(selectPublishedContent(entries)).toEqual([entries[0]]);
  });

  it("does not mutate the editorial source collection", () => {
    const entries = [
      { slug: "draft-entry", status: "draft" as const },
      { slug: "published-entry", status: "published" as const },
    ];

    selectPublishedContent(entries);

    expect(entries.map((entry) => entry.slug)).toEqual([
      "draft-entry",
      "published-entry",
    ]);
  });
});
