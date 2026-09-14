import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Loading from "./loading";
import NotFound from "./not-found";

describe("Milestone 8 public content states", () => {
  it("renders a branded 404 with useful recovery routes", () => {
    const markup = renderToStaticMarkup(<NotFound />);

    expect(markup).toContain("Error 404");
    expect(markup).toContain("This page could not be found");
    expect(markup).toContain('href="/start-here"');
    expect(markup).toContain('href="/learn/forex"');
    expect(markup).toContain('href="/learn/crypto"');
    expect(markup).toContain('href="/tools"');
    expect(markup).toContain('id="main-content"');
    expect(markup).toContain('aria-label="Helpful pages"');
  });

  it("announces route loading without hiding the destination context", () => {
    const markup = renderToStaticMarkup(<Loading />);

    expect(markup).toContain("Loading your next page…");
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("PipStart");
  });
});
