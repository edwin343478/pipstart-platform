import { describe, expect, it } from "vitest";

import {
  composeConfirmationEmail,
  type ConfirmationEmailInput,
} from "./confirmation-email";

const token = "a".repeat(64);

const baseInput: ConfirmationEmailInput = {
  publicOrigin: "https://skillcima.com",
  firstName: "Amina",
  courseSlug: "forex-foundations",
  confirmationToken: token,
  confirmationExpiresAt: "2026-08-21T12:00:00.000Z",
};

describe("Skillcima confirmation email composition", () => {
  it("builds the expected Skillcima confirmation URL and content", () => {
    const result = composeConfirmationEmail(baseInput);

    expect(result.status).toBe("ready");

    if (result.status !== "ready") {
      throw new Error("Expected ready confirmation email");
    }

    expect(result.confirmationUrl).toBe(
      `https://skillcima.com/confirm?token=${token}`,
    );

    expect(result.subject).toBe(
      "Confirm your free Skillcima Forex Foundations course",
    );

    expect(result.text).toContain("free five-day Forex Foundations course");

    expect(result.html).toContain("Confirm my course");
  });

  it("uses the learner first name when available", () => {
    const result = composeConfirmationEmail(baseInput);

    expect(result.status).toBe("ready");

    if (result.status !== "ready") {
      throw new Error("Expected ready confirmation email");
    }

    expect(result.text).toContain("Hi Amina,");

    expect(result.html).toContain("Hi Amina,");
  });

  it("uses a generic greeting when no first name is available", () => {
    const result = composeConfirmationEmail({
      ...baseInput,
      firstName: null,
    });

    expect(result.status).toBe("ready");

    if (result.status !== "ready") {
      throw new Error("Expected ready confirmation email");
    }

    expect(result.text).toContain("Hello,");

    expect(result.html).toContain("Hello,");
  });

  it("escapes learner-controlled text in HTML", () => {
    const result = composeConfirmationEmail({
      ...baseInput,
      firstName: '<script>alert("x")</script>',
    });

    expect(result.status).toBe("ready");

    if (result.status !== "ready") {
      throw new Error("Expected ready confirmation email");
    }

    expect(result.html).not.toContain("<script>");

    expect(result.html).toContain("&lt;script&gt;");
  });

  it("rejects malformed confirmation tokens", () => {
    expect(
      composeConfirmationEmail({
        ...baseInput,
        confirmationToken: "not-a-token",
      }),
    ).toEqual({
      status: "invalid_input",
    });
  });

  it("rejects unsupported course slugs and invalid expiry values", () => {
    expect(
      composeConfirmationEmail({
        ...baseInput,
        courseSlug: "unknown-course",
      }),
    ).toEqual({
      status: "invalid_input",
    });

    expect(
      composeConfirmationEmail({
        ...baseInput,
        confirmationExpiresAt: "not-a-date",
      }),
    ).toEqual({
      status: "invalid_input",
    });
  });

  it("requires HTTPS except for explicit localhost development origins", () => {
    expect(
      composeConfirmationEmail({
        ...baseInput,
        publicOrigin: "http://skillcima.com",
      }),
    ).toEqual({
      status: "invalid_input",
    });

    expect(
      composeConfirmationEmail({
        ...baseInput,
        publicOrigin: "http://127.0.0.1:3000",
      }).status,
    ).toBe("ready");
  });
});
