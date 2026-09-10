export const pipStartBrand = {
  name: "PipStart",
  domain: "pipstart.net",
  description:
    "Structured, risk-conscious Forex and cryptocurrency education for beginners and developing learners.",
  colors: {
    primary: "#0B1220",
    accent: "#0F766E",
    accentBright: "#14B8A6",
    background: "#F5F7F8",
    surface: "#FFFFFF",
    text: "#111827",
    muted: "#667085",
    border: "#D9E0E5",
  },
  fonts: {
    heading: "Manrope",
    body: "Inter",
  },
} as const;

export const skillcimaBrand = {
  name: "Skillcima",
  domain: "skillcima.com",
  description:
    "Beginner-friendly, structured and risk-conscious Forex education through a free five-day foundations course.",
  colors: {
    primary: "#BFDD6E",
    text: "#241F19",
    background: "#F7F3E8",
    soft: "#EAF0DC",
    border: "#E8E0D0",
    accent: "#A8502C",
    muted: "#6F6555",
  },
  fonts: {
    heading: "Space Grotesk",
    body: "Inter",
  },
} as const;

export type BrandTokens = typeof pipStartBrand | typeof skillcimaBrand;

export const interfaceTokens = {
  radius: {
    small: "0.5rem",
    medium: "0.75rem",
    large: "1rem",
    pill: "999px",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  control: {
    minimumTargetSize: "2.75rem",
    focusRingWidth: "2px",
    focusRingOffset: "2px",
  },
  motion: {
    fast: "160ms",
    normal: "200ms",
  },
} as const;

export type InterfaceTokens = typeof interfaceTokens;
