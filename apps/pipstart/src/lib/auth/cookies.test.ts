import { describe, expect, it } from "vitest";

import { hasSupabaseAuthCookie } from "./cookies";

describe("Milestone 11 Supabase session-cookie boundary", () => {
  it.each([
    [[], false],
    [["theme"], false],
    [["sb-project-auth-token-code-verifier"], false],
    [["sb-project-auth-token"], true],
    [["sb-project-auth-token.0"], true],
    [["theme", "sb-project_auth-auth-token.12"], true],
  ] as const)("recognizes session cookies in %j", (names, expected) => {
    expect(hasSupabaseAuthCookie(names)).toBe(expected);
  });
});
