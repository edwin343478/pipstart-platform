import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const componentSource = readFileSync(
  resolve(process.cwd(), "src", "components", "course-confirmation-card.tsx"),
  "utf8",
);

describe("automatic confirmation welcome page contract", () => {
  it("submits the captured email token without requiring a second click", () => {
    const sanitizePosition = componentSource.indexOf("sanitizeAddressBar();");

    const automaticConfirmationPosition = componentSource.indexOf(
      "void confirmCourse(token);",
    );

    expect(sanitizePosition).toBeGreaterThanOrEqual(0);
    expect(automaticConfirmationPosition).toBeGreaterThan(sanitizePosition);

    expect(componentSource).not.toContain("Confirm my course");
    expect(componentSource).not.toContain(
      "Opening this page does not confirm your enrolment",
    );
  });

  it("preserves the secure POST-only client confirmation contract", () => {
    expect(componentSource).toContain(
      "const TOKEN_PATTERN = /^[0-9a-f]{64}$/;",
    );

    expect(componentSource).toContain('url.searchParams.delete("token");');

    expect(componentSource).toContain('fetch("/api/v1/confirm"');

    expect(componentSource).toContain('method: "POST"');
    expect(componentSource).toContain('cache: "no-store"');
    expect(componentSource).toContain('credentials: "same-origin"');
  });

  it("preserves the approved responsive six-email visual language", () => {
    expect(componentSource).toContain("max-w-[520px]");
    expect(componentSource).toContain("grid-cols-5");
    expect(componentSource).toContain("bg-[#bfdd6e]");
    expect(componentSource).toContain("bg-[#f7f3e8]");
    expect(componentSource).toContain("Course active");
    expect(componentSource).toContain("You’re officially in!");
    expect(componentSource).toContain("What happens next");
    expect(componentSource).toContain("A strong start");
    expect(componentSource).toContain("Friendly reminder");
  });
});
