import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { readConfirmationToken } from "../src/components/course-confirmation-token";

const componentSource = readFileSync(
  resolve(process.cwd(), "src", "components", "course-confirmation-card.tsx"),
  "utf8",
);

describe("explicit confirmation welcome page contract", () => {
  it("accepts exactly one well-formed confirmation token", () => {
    const token = "a".repeat(64);

    expect(readConfirmationToken(new URLSearchParams({ token }))).toBe(token);

    expect(readConfirmationToken(new URLSearchParams())).toBeNull();

    expect(
      readConfirmationToken(
        new URLSearchParams([
          ["token", token],
          ["token", "b".repeat(64)],
        ]),
      ),
    ).toBeNull();

    expect(
      readConfirmationToken(new URLSearchParams({ token: "A".repeat(64) })),
    ).toBeNull();
  });

  it("requires an explicit learner action before confirmation", () => {
    const sanitizePosition = componentSource.indexOf("sanitizeAddressBar();");
    const buttonPosition = componentSource.indexOf("Confirm my course");

    expect(sanitizePosition).toBeGreaterThanOrEqual(0);
    expect(buttonPosition).toBeGreaterThanOrEqual(0);
    expect(componentSource).toContain("onClick={onConfirm}");
    expect(componentSource).toContain(
      "Opening this page does not confirm your enrolment",
    );
    expect(componentSource).not.toContain("void confirmCourse(token);");
  });

  it("preserves the secure POST-only client confirmation contract", () => {
    expect(componentSource).toContain("CONFIRMATION_TOKEN_PATTERN.test(token)");

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
