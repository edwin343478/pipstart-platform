import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { localCiEnvironment } from "../../scripts/configure-m16-ci-supabase.mjs";
import { loadAssessmentFixture } from "../../e2e/helpers/assessment-fixture";

describe("M16 production release gate preflight", () => {
  const script = resolve("scripts/run-m16-authenticated-gate.mjs");
  for (const url of [
    "",
    "http://127.0.0.1:54321",
    "https://example.supabase.co/rest/v1/",
    "https://example.supabase.co/auth/v1",
    "https://example.supabase.co/?key=value",
    "https://user:password@example.supabase.co",
  ]) {
    it(`refuses missing or invalid remote configuration before launching a build: ${url || "missing"}`, () => {
      const result = spawnSync(process.execPath, [script], {
        env: {
          ...process.env,
          PIPSTART_M13_SUPABASE_URL: url,
          PIPSTART_M13_SUPABASE_PUBLISHABLE_KEY: "test-publishable",
          PIPSTART_M13_SUPABASE_SECRET_KEY: "test-secret",
        },
        encoding: "utf8",
      });
      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(/requires all three|base project URL/);
      expect(result.stdout).toBe("");
    });
  }
  it("refuses a partial key configuration instead of skipping the gate", () => {
    const result = spawnSync(process.execPath, [script], {
      env: {
        ...process.env,
        PIPSTART_M13_SUPABASE_URL: "https://example.supabase.co",
        PIPSTART_M13_SUPABASE_PUBLISHABLE_KEY: "test-publishable",
        PIPSTART_M13_SUPABASE_SECRET_KEY: "",
      },
      encoding: "utf8",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/requires all three/);
    expect(result.stdout).toBe("");
  });
});

describe("M16 private browser assessment fixtures", () => {
  for (const [file, exportName] of [
    ["crypto-orientation-assessment.ts", "cryptoOrientationQuizV1"],
    [
      "crypto-advanced-and-graduation-assessment.ts",
      "cryptoAdvancedGraduationQuizV1",
    ],
  ]) {
    it(`loads current choice IDs for ${exportName} without duplicating answer letters`, () => {
      const quiz = loadAssessmentFixture(file, exportName);
      expect(quiz.questions.length).toBeGreaterThan(0);
      for (const question of quiz.questions) {
        expect(question.correctChoiceIds.length).toBeGreaterThan(0);
        for (const id of question.correctChoiceIds) {
          expect(question.choices.some((choice) => choice.id === id)).toBe(
            true,
          );
        }
      }
    });
  }
});

describe("M16 isolated CI database configuration", () => {
  it("maps current local CLI credentials without exposing a remote project", () => {
    expect(
      localCiEnvironment({
        API_URL: "http://127.0.0.1:54321",
        PUBLISHABLE_KEY: "public-fixture",
        SECRET_KEY: "secret-fixture",
      }),
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "public-fixture",
      SUPABASE_SECRET_KEY: "secret-fixture",
    });
  });
  it("supports legacy local CLI key names", () => {
    expect(
      localCiEnvironment({
        API_URL: "http://127.0.0.1:54321",
        ANON_KEY: "public-fixture",
        SERVICE_ROLE_KEY: "secret-fixture",
      }).SUPABASE_SECRET_KEY,
    ).toBe("secret-fixture");
  });
  for (const API_URL of [
    "https://example.supabase.co",
    "http://127.0.0.1:54321/rest/v1/",
    "http://127.0.0.1:54321/?key=value",
  ]) {
    it(`refuses a remote or invalid CI endpoint: ${API_URL}`, () => {
      expect(() =>
        localCiEnvironment({
          API_URL,
          ANON_KEY: "public-fixture",
          SERVICE_ROLE_KEY: "secret-fixture",
        }),
      ).toThrow(/isolated loopback/);
    });
  }
  it("refuses missing credentials", () => {
    expect(() =>
      localCiEnvironment({
        API_URL: "http://127.0.0.1:54321",
        ANON_KEY: "public-fixture",
      }),
    ).toThrow(/missing safe/);
  });
  it("refuses line breaks that could inject additional CI variables", () => {
    expect(() =>
      localCiEnvironment({
        API_URL: "http://127.0.0.1:54321",
        ANON_KEY: "public-fixture",
        SERVICE_ROLE_KEY: "secret\nEXTRA=value",
      }),
    ).toThrow(/missing safe/);
  });
});
