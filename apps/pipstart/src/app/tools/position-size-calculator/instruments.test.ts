import { describe, expect, it } from "vitest";

import { instruments } from "./instruments";

describe("instrument specifications", () => {
  it("provides complete, positive metadata for every instrument", () => {
    expect(instruments.length).toBeGreaterThan(0);

    for (const instrument of instruments) {
      expect(instrument.baseCurrency).toMatch(/^[A-Z]{3}$/);
      expect(instrument.quoteCurrency).toMatch(/^[A-Z]{3}$/);
      expect(instrument.contractSize).toBeGreaterThan(0);
      expect(instrument.pipSize).toBeGreaterThan(0);
      expect(instrument.minimumVolume).toBeGreaterThan(0);
      expect(instrument.volumeStep).toBeGreaterThan(0);
      expect(instrument.specificationNote.length).toBeGreaterThan(0);
    }
  });

  it("models the approved gold and silver instruments explicitly", () => {
    expect(instruments.find((item) => item.label === "XAU/USD")).toMatchObject({
      contractSize: 100,
      pipSize: 0.01,
      quoteCurrency: "USD",
    });
    expect(instruments.find((item) => item.label === "XAG/USD")).toMatchObject({
      contractSize: 5_000,
      pipSize: 0.001,
      quoteCurrency: "USD",
    });
  });
});
