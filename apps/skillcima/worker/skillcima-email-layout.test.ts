import { skillcimaBrand } from "@repo/brand";
import { describe, expect, it } from "vitest";

import { renderSkillcimaEmailLayout } from "./skillcima-email-layout";
import { skillcimaEmailTheme } from "./skillcima-email-theme";

describe("Skillcima branded email layout", () => {
  it("derives its palette from the approved Skillcima brand", () => {
    expect(skillcimaEmailTheme.colors).toMatchObject({
      primary: skillcimaBrand.colors.primary,
      text: skillcimaBrand.colors.text,
      background: skillcimaBrand.colors.background,
      soft: skillcimaBrand.colors.soft,
      border: skillcimaBrand.colors.border,
      accent: skillcimaBrand.colors.accent,
      muted: skillcimaBrand.colors.muted,
    });
  });

  it("uses Skillcima typography with email-safe fallbacks", () => {
    expect(skillcimaEmailTheme.fonts.heading).toContain(
      skillcimaBrand.fonts.heading,
    );

    expect(skillcimaEmailTheme.fonts.body).toContain(skillcimaBrand.fonts.body);

    expect(skillcimaEmailTheme.fonts.heading).toContain("Arial");

    expect(skillcimaEmailTheme.fonts.body).toContain("Arial");
  });

  it("renders the complete Skillcima palette into the email shell", () => {
    const html = renderSkillcimaEmailLayout({
      previewText: "Preview",
      eyebrow: "Free Forex Foundations",
      heading: "Example lesson",
      trustedContentHtml: "<p>Internal composed lesson content.</p>",
    });

    expect(html).toContain("#BFDD6E");
    expect(html).toContain("#241F19");
    expect(html).toContain("#F7F3E8");
    expect(html).toContain("#EAF0DC");
    expect(html).toContain("#E8E0D0");
    expect(html).toContain("#A8502C");
    expect(html).toContain("#6F6555");
  });

  it("uses a mobile-safe 600px email container", () => {
    const html = renderSkillcimaEmailLayout({
      previewText: "Preview",
      eyebrow: "Course",
      heading: "Lesson",
      trustedContentHtml: "<p>Content</p>",
    });

    expect(html).toContain('name="viewport"');

    expect(html).toContain("max-width:600px");

    expect(html).toContain("@media only screen and (max-width: 620px)");
  });

  it("escapes layout text while preserving trusted internal content", () => {
    const html = renderSkillcimaEmailLayout({
      previewText: '<Preview & "test">',
      eyebrow: "<Course>",
      heading: "<Lesson>",
      trustedContentHtml: "<p><strong>Trusted content</strong></p>",
    });

    expect(html).toContain("&lt;Lesson&gt;");

    expect(html).toContain("&lt;Course&gt;");

    expect(html).toContain("&lt;Preview &amp; &quot;test&quot;&gt;");

    expect(html).toContain("<strong>Trusted content</strong>");
  });

  it("does not depend on remote fonts, scripts, or provider code", () => {
    const html = renderSkillcimaEmailLayout({
      previewText: "Preview",
      eyebrow: "Course",
      heading: "Lesson",
      trustedContentHtml: "<p>Content</p>",
    });

    expect(html).not.toContain("fonts.googleapis.com");

    expect(html).not.toContain("<script");

    expect(html).not.toContain("api.resend.com");
  });
});
