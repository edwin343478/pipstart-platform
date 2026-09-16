import { describe, expect, it } from "vitest";

import {
  safeInternalRedirect,
  validateDisplayName,
  validateEmail,
  validatePassword,
} from "./validation";

describe("Milestone 11 account validation", () => {
  it("normalizes valid email addresses", () => {
    expect(validateEmail("  Learner@Example.COM ")).toEqual({
      ok: true,
      value: "learner@example.com",
    });
  });

  it.each(["", "learner", "@example.com", "a b@example.com"])(
    "rejects invalid email %j",
    (email) => expect(validateEmail(email).ok).toBe(false),
  );

  it("accepts any character mix between 6 and 128 characters", () => {
    expect(validatePassword("a1!b").ok).toBe(false);
    expect(validatePassword("123456").ok).toBe(true);
    expect(validatePassword("abcdef").ok).toBe(true);
    expect(validatePassword("!@#$%^").ok).toBe(true);
    expect(validatePassword("x".repeat(129)).ok).toBe(false);
  });

  it("normalizes safe learner display names", () => {
    expect(validateDisplayName("  Asha   M.  ")).toEqual({
      ok: true,
      value: "Asha M.",
    });
  });

  it.each(["A", "<script>", "Asha_123", "x".repeat(61)])(
    "rejects invalid display name %j",
    (name) => expect(validateDisplayName(name).ok).toBe(false),
  );

  it.each([
    ["/account/profile", "/account/profile"],
    ["/start-here?from=login#lesson", "/start-here?from=login#lesson"],
    ["https://evil.example", "/account/settings"],
    ["//evil.example", "/account/settings"],
    ["/\\evil.example", "/account/settings"],
  ])("constrains redirect %j", (input, expected) => {
    expect(safeInternalRedirect(input)).toBe(expected);
  });
});
