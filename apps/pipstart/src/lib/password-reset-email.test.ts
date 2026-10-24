import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const supabaseRoot = path.resolve(import.meta.dirname, "../../../../supabase");
const template = fs
  .readFileSync(path.join(supabaseRoot, "templates/recovery.html"), "utf8")
  .replace(/\s+/g, " ");
const config = fs.readFileSync(path.join(supabaseRoot, "config.toml"), "utf8");

describe("PipStart password-reset email", () => {
  it("is wired as the Supabase recovery template with the approved subject", () => {
    expect(config).toMatch(
      /\[auth\.email\.template\.recovery\]\s*\nsubject = "Reset your PipStart password"\s*\ncontent_path = "\.\/supabase\/templates\/recovery\.html"/,
    );
  });

  it("uses only Supabase recovery variables, with the link in button and fallback", () => {
    const variables = new Set(template.match(/{{[^}]*}}/g));
    expect([...variables].sort()).toEqual([
      "{{ .ConfirmationURL }}",
      "{{ .Email }}",
      "{{ .SiteURL }}",
    ]);
    expect(
      template.match(/href="{{ \.ConfirmationURL }}"/g) ?? [],
    ).toHaveLength(2);
    expect(template).toMatch(/>{{ \.ConfirmationURL }}<\/a\s*>/);
  });

  it("keeps the approved copy, preview text and safety notice", () => {
    for (const text of [
      "Reset your password",
      "Choose a new password &rarr;",
      "This link expires in",
      "1 hour",
      "Button not working? Copy this link into your browser:",
      "Didn&rsquo;t ask for this?",
      "PipStart will never ask for your password by email.",
      "Use this secure link within 1 hour to choose a new PipStart password.",
      "Educational content only &mdash; not financial advice.",
    ])
      expect(template).toContain(text);
  });

  it("uses PipStart brand tokens and email-safe structure", () => {
    for (const colour of [
      "#0b1220",
      "#0f766e",
      "#14b8a6",
      "#e6f4f1",
      "#fffbeb",
      "#fde68a",
      "#92400e",
    ])
      expect(template).toContain(colour);
    expect(template).toMatch(/max-width:\s*560px/);
    expect(template).toContain('role="presentation"');
    expect(template).toMatch(/Manrope,\s*Arial,\s*Helvetica,\s*sans-serif/);
    expect(template).toMatch(/Inter,\s*Arial,\s*Helvetica,\s*sans-serif/);
    // No image/script payload. The approved design separately requests web fonts.
    expect(template).not.toMatch(/<img|<script|<svg/i);
  });

  it("matches the configured link lifetime", () => {
    expect(config).toMatch(/^otp_expiry = 3600$/m);
  });
});
