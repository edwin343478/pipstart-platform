import { describe, expect, it } from "vitest";

import { readLeadAttributionFromSearch } from "../src/lib/lead-attribution";

describe("readLeadAttributionFromSearch", () => {
  it("reads and normalizes the approved campaign parameters", () => {
    expect(
      readLeadAttributionFromSearch(
        "?utm_source=meta&utm_medium=paid_social&utm_campaign=skillcima_gh_forex_foundations_m5_202609&utm_content=problem_led&utm_term=ghana_broad_18_40",
      ),
    ).toEqual({
      utmSource: "meta",
      utmMedium: "paid_social",
      utmCampaign: "skillcima_gh_forex_foundations_m5_202609",
      utmContent: "problem_led",
      utmTerm: "ghana_broad_18_40",
    });
  });

  it("returns undefined when no attribution is present", () => {
    expect(readLeadAttributionFromSearch("?unrelated=value")).toBeUndefined();
  });

  it("drops malformed attribution instead of blocking enrolment", () => {
    expect(
      readLeadAttributionFromSearch("?utm_source=%3Dspreadsheet"),
    ).toBeUndefined();
  });
});
