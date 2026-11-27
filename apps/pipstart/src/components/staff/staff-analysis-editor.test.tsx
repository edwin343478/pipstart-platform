import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/admin/staff/content/analysis-actions", () => ({
  runAnalysisDraftAction: vi.fn(),
}));

import {
  addressFromTitle,
  priceProblem,
  StaffAnalysisEditor,
} from "./staff-analysis-editor";
import {
  emptyAnalysisForm,
  fieldsFromForm,
  formFromView,
  paragraphsFrom,
} from "@/lib/content/analysis-editor-state";
import type { AnalysisDraftView } from "@/lib/content/analysis-draft-contract";

const view: AnalysisDraftView = {
  id: "usdjpy-fade",
  revision: 2,
  bodySha256: "a".repeat(64),
  statusUpdatedAt: "2026-11-15T08:00:00.000Z",
  fields: {
    title: "USD/JPY: fading the move into 156.20",
    tag: "Resistance",
    excerpt: "Closed without a trade.",
    category: "technical",
    paragraphs: ["One.", "Two."],
    trade: {
      instrument: "USD/JPY",
      timeframe: "h1",
      direction: "sell-limit",
      entry: "156.20",
      stopLoss: "156.90",
      takeProfit: "154.80",
      chart: {
        path: "2026/11/abc.png",
        alt: "USD/JPY 1H chart",
        width: 1600,
        height: 900,
      },
      status: {
        state: "inactive",
        reason: "inactive-other",
        note: "Central bank comments moved price first",
        outcome: "void",
      },
    },
  },
};
const count = (html: string, needle: string) => html.split(needle).length - 1;

describe("analysis editor (TA-b)", () => {
  it("offers the owner's instrument, timeframe and direction lists", () => {
    const html = renderToStaticMarkup(<StaffAnalysisEditor item={null} />);
    expect(html).toContain("New analysis post");
    for (const group of [
      "Forex majors",
      "Forex minors",
      "Metals",
      "Index CFDs",
    ])
      expect(html).toContain(`label="${group}"`);
    expect(html).not.toContain("USD/ZAR");
    expect(html).toContain("XAU/USD · Gold");
    expect(html).toContain("US30 · Dow Jones 30");
    const timeframes = html.slice(
      html.indexOf('id="trade-timeframe"'),
      html.indexOf("</select>", html.indexOf('id="trade-timeframe"')),
    );
    expect(
      [...timeframes.matchAll(/<option[^>]*>([^<]*)</g)].map((x) => x[1]),
    ).toEqual(["1D", "4H", "1H", "30M", "15M"]);
    const directions = html.slice(
      html.indexOf('id="trade-direction"'),
      html.indexOf("</select>", html.indexOf('id="trade-direction"')),
    );
    expect(count(directions, "<option")).toBe(6);
    expect(directions).toContain("Buy (market)");
    expect(directions).toContain("Sell stop");
    const instruments = html.slice(
      html.indexOf('id="trade-instrument"'),
      html.indexOf("</select>", html.indexOf('id="trade-instrument"')),
    );
    expect(count(instruments, "<option")).toBe(41);
  });

  it("groups the status reasons and offers write-your-own under each", () => {
    const html = renderToStaticMarkup(<StaffAnalysisEditor item={null} />);
    expect(html).toContain('label="Active: the idea is still valid"');
    expect(html).toContain('label="Inactive: closed or no longer tradable"');
    expect(count(html, "(write my own)…")).toBe(2);
    expect(html).toContain("Readers will see");
  });

  it("loads a saved trade with its note, outcome and status time", () => {
    const html = renderToStaticMarkup(<StaffAnalysisEditor item={view} />);
    expect(html).toContain("Edit analysis post");
    expect(html).toContain("/analysis/usdjpy-fade");
    expect(html).toContain("Central bank comments moved price first");
    expect(html).toContain('id="trade-outcome"');
    expect(html).toContain("No longer valid");
    expect(html).toContain("Status last set");
  });
});

describe("analysis editor state (TA-b)", () => {
  it("splits paragraphs on blank lines and joins wrapped lines", () => {
    expect(paragraphsFrom("One\nstill one.\n\n\nTwo.\n \nThree.")).toEqual([
      "One still one.",
      "Two.",
      "Three.",
    ]);
  });

  it("round-trips a saved view and sends a note and outcome only for Other", () => {
    expect(fieldsFromForm(formFromView(view))).toEqual(view.fields);
    const pending = fieldsFromForm({
      ...emptyAnalysisForm,
      trade: { ...emptyAnalysisForm.trade, note: "left over", outcome: "loss" },
    });
    expect(pending.trade?.status).toEqual({
      state: "active",
      reason: "pending",
    });
    expect(
      fieldsFromForm({ ...emptyAnalysisForm, category: "fundamental" }).trade,
    ).toBeNull();
  });

  it("suggests an address and explains price order problems", () => {
    expect(addressFromTitle("EUR/USD: buying the retest of 1.0845!")).toBe(
      "eur-usd-buying-the-retest-of-1-0845",
    );
    expect(
      priceProblem({
        direction: "buy",
        entry: "1.0845",
        stopLoss: "1.0850",
        takeProfit: "1.0920",
      }),
    ).toMatch(/below the entry/);
    expect(
      priceProblem({
        direction: "sell",
        entry: "156.20",
        stopLoss: "156.90",
        takeProfit: "154.80",
      }),
    ).toBeNull();
    expect(
      priceProblem({
        direction: "buy",
        entry: "1,08",
        stopLoss: "1",
        takeProfit: "2",
      }),
    ).toMatch(/digits/);
  });
});
