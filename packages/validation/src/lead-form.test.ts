import { describe, expect, it } from "vitest";

import { leadFormSchema } from "./lead-form";

describe("leadFormSchema", () => {
  it("accepts a valid submission without a first name", () => {
    const result = leadFormSchema.safeParse({
      firstName: "",
      email: "  LEARNER@EXAMPLE.COM  ",
      privacyAcknowledged: true,
      newsletterConsent: false,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.firstName).toBeUndefined();
      expect(result.data.email).toBe("learner@example.com");
      expect(result.data.newsletterConsent).toBe(false);
    }
  });

  it("accepts and trims a valid first name", () => {
    const result = leadFormSchema.safeParse({
      firstName: "  Amina  ",
      email: "amina@example.com",
      privacyAcknowledged: true,
      newsletterConsent: true,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.firstName).toBe("Amina");
      expect(result.data.newsletterConsent).toBe(true);
    }
  });

  it("rejects a one-character first name", () => {
    const result = leadFormSchema.safeParse({
      firstName: "A",
      email: "learner@example.com",
      privacyAcknowledged: true,
      newsletterConsent: false,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email address", () => {
    const result = leadFormSchema.safeParse({
      firstName: "",
      email: "not-an-email",
      privacyAcknowledged: true,
      newsletterConsent: false,
    });

    expect(result.success).toBe(false);
  });

  it("requires Privacy Notice acknowledgement", () => {
    const result = leadFormSchema.safeParse({
      firstName: "",
      email: "learner@example.com",
      privacyAcknowledged: false,
      newsletterConsent: false,
    });

    expect(result.success).toBe(false);
  });

  it("rejects unexpected fields", () => {
    const result = leadFormSchema.safeParse({
      firstName: "",
      email: "learner@example.com",
      privacyAcknowledged: true,
      newsletterConsent: false,
      unexpectedField: "not allowed",
    });

    expect(result.success).toBe(false);
  });
});
