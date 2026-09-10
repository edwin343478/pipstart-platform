import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Alert } from "./alert";
import { Badge } from "./badge";
import { Link } from "./link";
import { ProgressBar } from "./progress-bar";
import { Radio } from "./radio";

describe("foundational UI primitives", () => {
  it("renders a keyboard-focusable native link", () => {
    const markup = renderToStaticMarkup(<Link href="/start-here">Start</Link>);

    expect(markup).toContain('href="/start-here"');
    expect(markup).toContain("focus-visible:ring-2");
  });

  it("uses an urgent live role only for error alerts", () => {
    expect(renderToStaticMarkup(<Alert>Saved</Alert>)).toContain(
      'role="status"',
    );
    expect(
      renderToStaticMarkup(<Alert variant="error">Failed</Alert>),
    ).toContain('role="alert"');
  });

  it("renders a semantic badge without inventing an interactive role", () => {
    const markup = renderToStaticMarkup(
      <Badge variant="accent">Available</Badge>,
    );

    expect(markup).toContain("Available");
    expect(markup).not.toContain("role=");
  });

  it("clamps progress to its valid range", () => {
    const markup = renderToStaticMarkup(
      <ProgressBar label="Course progress" max={6} value={8} />,
    );

    expect(markup).toContain("100%");
    expect(markup).toContain('max="6"');
    expect(markup).toContain('value="6"');
    expect(markup).toContain('aria-label="Course progress"');
  });

  it("connects radio descriptions and errors accessibly", () => {
    const markup = renderToStaticMarkup(
      <Radio
        id="experience"
        name="experience"
        label="Beginner"
        description="New to markets"
        error="Choose one option"
      />,
    );

    expect(markup).toContain('type="radio"');
    expect(markup).toContain('for="experience"');
    expect(markup).toContain(
      'aria-describedby="experience-description experience-error"',
    );
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('role="alert"');
  });
});
