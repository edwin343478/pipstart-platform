import { describe, expect, it } from "vitest";

import {
  deriveNewsletterUnsubscribeToken,
  type NewsletterUnsubscribeTokenEnv,
} from "./newsletter-unsubscribe-token";

const grantA = "11111111-1111-4111-8111-111111111111";
const grantB = "22222222-2222-4222-8222-222222222222";

const envA: NewsletterUnsubscribeTokenEnv = {
  SKILLCIMA_UNSUBSCRIBE_TOKEN_SECRET:
    "test-unsubscribe-secret-aaaaaaaaaaaaaaaa",
};

const envB: NewsletterUnsubscribeTokenEnv = {
  SKILLCIMA_UNSUBSCRIBE_TOKEN_SECRET:
    "test-unsubscribe-secret-bbbbbbbbbbbbbbbb",
};

describe("Skillcima newsletter unsubscribe tokens", () => {
  it("derives the same token for the same durable grant and secret", async () => {
    const first = await deriveNewsletterUnsubscribeToken(envA, grantA);
    const second = await deriveNewsletterUnsubscribeToken(envA, grantA);

    expect(first).toEqual(second);
    expect(first.status).toBe("ready");
  });

  it("derives different tokens for different newsletter grant events", async () => {
    const first = await deriveNewsletterUnsubscribeToken(envA, grantA);
    const second = await deriveNewsletterUnsubscribeToken(envA, grantB);

    expect(first.status).toBe("ready");
    expect(second.status).toBe("ready");

    if (first.status !== "ready" || second.status !== "ready") {
      throw new Error("Expected ready unsubscribe tokens");
    }

    expect(first.token).not.toBe(second.token);
    expect(first.tokenHash).not.toBe(second.tokenHash);
  });

  it("derives different tokens when the unsubscribe secret changes", async () => {
    const first = await deriveNewsletterUnsubscribeToken(envA, grantA);
    const second = await deriveNewsletterUnsubscribeToken(envB, grantA);

    expect(first.status).toBe("ready");
    expect(second.status).toBe("ready");

    if (first.status !== "ready" || second.status !== "ready") {
      throw new Error("Expected ready unsubscribe tokens");
    }

    expect(first.token).not.toBe(second.token);
    expect(first.tokenHash).not.toBe(second.tokenHash);
  });

  it("produces lowercase 256-bit tokens and SHA-256 token hashes", async () => {
    const result = await deriveNewsletterUnsubscribeToken(envA, grantA);

    expect(result.status).toBe("ready");

    if (result.status !== "ready") {
      throw new Error("Expected ready unsubscribe token");
    }

    expect(result.token).toMatch(/^[0-9a-f]{64}$/);
    expect(result.tokenHash).toMatch(/^[0-9a-f]{64}$/);

    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(result.token),
    );

    const expectedHash = Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    expect(result.tokenHash).toBe(expectedHash);
  });

  it("does not expose the consent event id inside the raw token", async () => {
    const result = await deriveNewsletterUnsubscribeToken(envA, grantA);

    expect(result.status).toBe("ready");

    if (result.status !== "ready") {
      throw new Error("Expected ready unsubscribe token");
    }

    expect(result.token).not.toContain(grantA);
    expect(result.token).not.toContain(grantA.replaceAll("-", ""));
  });

  it("rejects malformed consent event IDs", async () => {
    await expect(
      deriveNewsletterUnsubscribeToken(envA, "not-a-consent-event-id"),
    ).resolves.toEqual({
      status: "invalid_consent_event_id",
    });
  });

  it("rejects missing or weak unsubscribe secrets", async () => {
    await expect(
      deriveNewsletterUnsubscribeToken(
        {
          SKILLCIMA_UNSUBSCRIBE_TOKEN_SECRET: "",
        },
        grantA,
      ),
    ).resolves.toEqual({
      status: "misconfigured",
    });

    await expect(
      deriveNewsletterUnsubscribeToken(
        {
          SKILLCIMA_UNSUBSCRIBE_TOKEN_SECRET: "too-short",
        },
        grantA,
      ),
    ).resolves.toEqual({
      status: "misconfigured",
    });
  });
});
