import { describe, expect, it } from "vitest";

import { leadRequestSchema } from "./lead-request";

const validRequest = {
  submissionId: "123e4567-e89b-42d3-a456-426614174000",
  turnstileToken: "XXXX.DUMMY.TOKEN.XXXX",
  lead: {
    firstName: "David",
    email: "test@example.com",
    privacyAcknowledged: true,
    newsletterConsent: false,
  },
};

describe("leadRequestSchema", () => {
  it("accepts a valid lead request", () => {
    const result = leadRequestSchema.safeParse(validRequest);

    expect(result.success).toBe(true);
  });

  it("normalizes nested lead data", () => {
    const result = leadRequestSchema.parse({
      ...validRequest,
      lead: {
        ...validRequest.lead,
        firstName: "  David  ",
        email: "  TEST@EXAMPLE.COM  ",
      },
    });

    expect(result.lead.firstName).toBe("David");
    expect(result.lead.email).toBe("test@example.com");
  });

  it("rejects an invalid submission ID", () => {
    const result = leadRequestSchema.safeParse({
      ...validRequest,
      submissionId: "abc123",
    });

    expect(result.success).toBe(false);
  });

  it("requires a Turnstile token", () => {
    const result = leadRequestSchema.safeParse({
      ...validRequest,
      turnstileToken: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["turnstileToken"]);
    }
  });

  it("rejects an oversized Turnstile token", () => {
    const result = leadRequestSchema.safeParse({
      ...validRequest,
      turnstileToken: "A".repeat(2049),
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid nested lead data", () => {
    const result = leadRequestSchema.safeParse({
      ...validRequest,
      lead: {
        ...validRequest.lead,
        email: "not-an-email",
      },
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["lead", "email"]);
    }
  });

  it("rejects unexpected top-level fields", () => {
    const result = leadRequestSchema.safeParse({
      ...validRequest,
      unexpected: "not allowed",
    });

    expect(result.success).toBe(false);
  });
});
