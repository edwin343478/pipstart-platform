import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const supabaseRoot = path.resolve(import.meta.dirname, "../../../../supabase");
const template = fs
  .readFileSync(
    path.join(supabaseRoot, "templates/password_changed_notification.html"),
    "utf8",
  )
  .replace(/\s+/g, " ");
const config = fs.readFileSync(path.join(supabaseRoot, "config.toml"), "utf8");

describe("PipStart password-changed notice", () => {
  it("is enabled as the Supabase password_changed notification", () => {
    // Notification paths resolve from the supabase folder (CLI 2.113).
    expect(config).toMatch(
      /\[auth\.email\.notification\.password_changed\]\s*\nenabled = true\s*\nsubject = "Your PipStart password was changed"\s*\ncontent_path = "\.\/templates\/password_changed_notification\.html"/,
    );
  });

  it("uses only the account email variable and absolute PipStart links", () => {
    expect([...new Set(template.match(/{{[^}]*}}/g))]).toEqual([
      "{{ .Email }}",
    ]);
    const links = [...template.matchAll(/<a [^>]*href="([^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(links.sort()).toEqual([
      "https://pipstart.net/account/security",
      "https://pipstart.net/account/security",
      "https://pipstart.net/contact",
      "https://pipstart.net/faq",
      "https://pipstart.net/forgot-password",
      "https://pipstart.net/legal/privacy-policy",
    ]);
  });

  it("keeps the approved copy and preview text", () => {
    for (const text of [
      "SECURITY NOTICE",
      "Your password was changed",
      "This was you?",
      "No action needed.",
      "Didn&rsquo;t change it?",
      "Reset my password &rarr;",
      "Contact PipStart support &rarr;",
      "Keep your account safe",
      "PipStart will never ask for your password by email.",
      "Your PipStart password was just changed. If this wasn&rsquo;t you, reset it now.",
      "Security notices can&rsquo;t be switched off.",
    ])
      expect(template).toContain(text);
  });

  it("uses PipStart brand tokens and email-safe structure", () => {
    for (const colour of [
      "#0b1220",
      "#0f766e",
      "#14b8a6",
      "#e6f4f1",
      "#f0f9f7",
      "#fffbeb",
      "#fde68a",
      "#92400e",
    ])
      expect(template).toContain(colour);
    expect(template).toMatch(/max-width:\s*560px/);
    expect(template).toContain('role="presentation"');
    expect(template).not.toMatch(/<img|<script|<svg/i);
  });
});
