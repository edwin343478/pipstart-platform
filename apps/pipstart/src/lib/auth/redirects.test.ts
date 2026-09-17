import { describe, expect, it } from "vitest";

import { getLoginRedirect, isProtectedAuthPath } from "./redirects";

describe("Milestone 11 protected-route redirects", () => {
  it.each([
    [undefined, "/login?next=%2Fdashboard"],
    ["/account/profile", "/login?next=%2Faccount%2Fprofile"],
    [
      "/account/email-preferences",
      "/login?next=%2Faccount%2Femail-preferences",
    ],
    [
      "/account/security?notice=review",
      "/login?next=%2Faccount%2Fsecurity%3Fnotice%3Dreview",
    ],
    ["/admin", "/login?next=%2Fadmin"],
  ])("keeps the requested internal destination %j", (next, expected) => {
    expect(getLoginRedirect(next)).toBe(expected);
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example"])(
    "rejects unsafe destination %j",
    (next) => {
      expect(getLoginRedirect(next)).toBe("/login?next=%2Fdashboard");
    },
  );

  it.each([
    ["/account", true],
    ["/account/profile", true],
    ["/dashboard", true],
    ["/account-deleted", false],
    ["/admin", true],
    ["/admin/reports", true],
    ["/reset-password", true],
    ["/login", false],
  ])("classifies protected route %j", (pathname, expected) => {
    expect(isProtectedAuthPath(pathname)).toBe(expected);
  });
});
