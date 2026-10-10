import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CalendarTimezone } from "./calendar-timezone";

describe("provider-owned calendar times", () => {
  it("identifies TradingView without inventing an offset or city", () => {
    const markup = renderToStaticMarkup(<CalendarTimezone />);
    expect(markup).toContain("Times shown by TradingView");
    expect(markup).not.toMatch(/Your time zone|GMT|Nairobi/);
  });

  it("renders the same complete badge without client JavaScript", () => {
    expect(renderToStaticMarkup(<CalendarTimezone />)).toBe(
      '<span data-calendar-timezone="true">Times shown by TradingView</span>',
    );
  });
});
