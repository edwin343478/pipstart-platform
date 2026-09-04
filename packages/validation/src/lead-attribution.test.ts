import { describe, expect, it } from "vitest";

import { leadAttributionSchema } from "./lead-attribution";

describe("leadAttributionSchema", () => {
  it("accepts the approved Meta attribution", () => {
    expect(
      leadAttributionSchema.parse({
        utmSource: "meta",
        utmMedium: "paid_social",
        utmCampaign: "skillcima_gh_forex_foundations_m5_202609",
        utmContent: "problem_led",
        utmTerm: "ghana_broad_18_40",
      }),
    ).toEqual({
      utmSource: "meta",
      utmMedium: "paid_social",
      utmCampaign: "skillcima_gh_forex_foundations_m5_202609",
      utmContent: "problem_led",
      utmTerm: "ghana_broad_18_40",
    });
  });

  it("rejects an empty attribution object", () => {
    expect(leadAttributionSchema.safeParse({}).success).toBe(false);
  });

  it("rejects oversized or unsafe values", () => {
    expect(
      leadAttributionSchema.safeParse({ utmSource: "a".repeat(101) }).success,
    ).toBe(false);
    expect(
      leadAttributionSchema.safeParse({ utmSource: "=spreadsheet" }).success,
    ).toBe(false);
  });
});
