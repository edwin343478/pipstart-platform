import { describe, expect, it } from "vitest";

import {
  deriveConfirmationToken,
  type ConfirmationTokenEnv,
} from "./confirmation-token";

const jobA = "11111111-1111-4111-8111-111111111111";

const jobB = "22222222-2222-4222-8222-222222222222";

const envA: ConfirmationTokenEnv = {
  SKILLCIMA_CONFIRMATION_TOKEN_SECRET:
    "test-confirmation-secret-aaaaaaaaaaaaaaaa",
};

const envB: ConfirmationTokenEnv = {
  SKILLCIMA_CONFIRMATION_TOKEN_SECRET:
    "test-confirmation-secret-bbbbbbbbbbbbbbbb",
};

describe("Skillcima confirmation tokens", () => {
  it("derives the same token for the same durable job and secret", async () => {
    const first = await deriveConfirmationToken(envA, jobA);

    const second = await deriveConfirmationToken(envA, jobA);

    expect(first).toEqual(second);

    expect(first.status).toBe("ready");
  });

  it("derives different tokens for different email jobs", async () => {
    const first = await deriveConfirmationToken(envA, jobA);

    const second = await deriveConfirmationToken(envA, jobB);

    expect(first.status).toBe("ready");
    expect(second.status).toBe("ready");

    if (first.status !== "ready" || second.status !== "ready") {
      throw new Error("Expected ready confirmation tokens");
    }

    expect(first.token).not.toBe(second.token);

    expect(first.tokenHash).not.toBe(second.tokenHash);
  });

  it("derives different tokens when the server secret changes", async () => {
    const first = await deriveConfirmationToken(envA, jobA);

    const second = await deriveConfirmationToken(envB, jobA);

    expect(first.status).toBe("ready");
    expect(second.status).toBe("ready");

    if (first.status !== "ready" || second.status !== "ready") {
      throw new Error("Expected ready confirmation tokens");
    }

    expect(first.token).not.toBe(second.token);

    expect(first.tokenHash).not.toBe(second.tokenHash);
  });

  it("produces lowercase 256-bit tokens and hashes the raw token with SHA-256", async () => {
    const result = await deriveConfirmationToken(envA, jobA);

    expect(result.status).toBe("ready");

    if (result.status !== "ready") {
      throw new Error("Expected ready confirmation token");
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

  it("rejects malformed email job IDs", async () => {
    await expect(
      deriveConfirmationToken(envA, "not-a-job-id"),
    ).resolves.toEqual({
      status: "invalid_job_id",
    });
  });

  it("rejects missing or weak confirmation secrets", async () => {
    await expect(
      deriveConfirmationToken(
        {
          SKILLCIMA_CONFIRMATION_TOKEN_SECRET: "",
        },
        jobA,
      ),
    ).resolves.toEqual({
      status: "misconfigured",
    });

    await expect(
      deriveConfirmationToken(
        {
          SKILLCIMA_CONFIRMATION_TOKEN_SECRET: "too-short",
        },
        jobA,
      ),
    ).resolves.toEqual({
      status: "misconfigured",
    });
  });
});
