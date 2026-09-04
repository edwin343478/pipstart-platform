import { describe, expect, it } from "vitest";

import type { LeadRequestData } from "@repo/validation";

import {
  createFingerprintPayload,
  createLeadRequestFingerprint,
} from "./fingerprint";

const createRequest = (
  overrides: Partial<LeadRequestData> = {},
): LeadRequestData => ({
  submissionId: "123e4567-e89b-42d3-a456-426614174000",
  turnstileToken: "TURNSTILE-TOKEN-A",
  lead: {
    firstName: "Amina",
    email: "amina@example.com",
    privacyAcknowledged: true,
    newsletterConsent: false,
  },
  ...overrides,
});

describe("createFingerprintPayload", () => {
  it("contains only stable persistence-relevant lead data", () => {
    const payload = createFingerprintPayload(createRequest());

    expect(payload).toEqual({
      lead: {
        firstName: "Amina",
        email: "amina@example.com",
        privacyAcknowledged: true,
        newsletterConsent: false,
      },
    });

    expect(payload).not.toHaveProperty("submissionId");
    expect(payload).not.toHaveProperty("turnstileToken");
  });

  it("canonicalizes an absent first name as null", () => {
    const request = createRequest({
      lead: {
        email: "amina@example.com",
        privacyAcknowledged: true,
        newsletterConsent: false,
      },
    });

    expect(createFingerprintPayload(request).lead.firstName).toBeNull();
  });
});

describe("createLeadRequestFingerprint", () => {
  it("returns a lowercase 64-character SHA-256 fingerprint", async () => {
    const fingerprint = await createLeadRequestFingerprint(createRequest());

    expect(fingerprint).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same stable request", async () => {
    const request = createRequest();

    const first = await createLeadRequestFingerprint(request);
    const second = await createLeadRequestFingerprint(request);

    expect(second).toBe(first);
  });

  it("ignores Turnstile token changes", async () => {
    const first = await createLeadRequestFingerprint(
      createRequest({
        turnstileToken: "TURNSTILE-TOKEN-A",
      }),
    );

    const second = await createLeadRequestFingerprint(
      createRequest({
        turnstileToken: "TURNSTILE-TOKEN-B",
      }),
    );

    expect(second).toBe(first);
  });

  it("does not use submissionId as request content", async () => {
    const first = await createLeadRequestFingerprint(
      createRequest({
        submissionId: "123e4567-e89b-42d3-a456-426614174000",
      }),
    );

    const second = await createLeadRequestFingerprint(
      createRequest({
        submissionId: "223e4567-e89b-42d3-a456-426614174000",
      }),
    );

    expect(second).toBe(first);
  });

  it("changes when the normalized email changes", async () => {
    const first = await createLeadRequestFingerprint(createRequest());

    const second = await createLeadRequestFingerprint(
      createRequest({
        lead: {
          firstName: "Amina",
          email: "different@example.com",
          privacyAcknowledged: true,
          newsletterConsent: false,
        },
      }),
    );

    expect(second).not.toBe(first);
  });

  it("changes when newsletter consent changes", async () => {
    const first = await createLeadRequestFingerprint(createRequest());

    const second = await createLeadRequestFingerprint(
      createRequest({
        lead: {
          firstName: "Amina",
          email: "amina@example.com",
          privacyAcknowledged: true,
          newsletterConsent: true,
        },
      }),
    );

    expect(second).not.toBe(first);
  });

  it("changes when first name changes", async () => {
    const first = await createLeadRequestFingerprint(createRequest());

    const second = await createLeadRequestFingerprint(
      createRequest({
        lead: {
          firstName: "Neema",
          email: "amina@example.com",
          privacyAcknowledged: true,
          newsletterConsent: false,
        },
      }),
    );

    expect(second).not.toBe(first);
  });

  it("changes when campaign attribution changes", async () => {
    const first = await createLeadRequestFingerprint(
      createRequest({
        attribution: {
          utmSource: "meta",
          utmContent: "problem_led",
        },
      }),
    );

    const second = await createLeadRequestFingerprint(
      createRequest({
        attribution: {
          utmSource: "meta",
          utmContent: "learning_led",
        },
      }),
    );

    expect(second).not.toBe(first);
  });
});
