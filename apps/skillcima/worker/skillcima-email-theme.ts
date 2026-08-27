import { skillcimaBrand } from "@repo/brand";

/*
 * Email-specific presentation tokens derived from
 * the approved Skillcima brand.
 *
 * Web fonts are not remotely loaded inside email.
 * Email clients fall back to safe system fonts when
 * Space Grotesk or Inter are unavailable.
 */
export const skillcimaEmailTheme = {
  brandName: skillcimaBrand.name,
  domain: skillcimaBrand.domain,

  colors: {
    primary: skillcimaBrand.colors.primary,
    text: skillcimaBrand.colors.text,
    background: skillcimaBrand.colors.background,
    surface: "#FFFFFF",
    soft: skillcimaBrand.colors.soft,
    border: skillcimaBrand.colors.border,
    accent: skillcimaBrand.colors.accent,
    muted: skillcimaBrand.colors.muted,
  },

  fonts: {
    heading: `"${skillcimaBrand.fonts.heading}", Arial, Helvetica, sans-serif`,
    body: `"${skillcimaBrand.fonts.body}", Arial, Helvetica, sans-serif`,
  },

  maxWidth: 600,
} as const;
