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
    primary: "#C8F04A",
    text: "#11130F",
    background: "#FAFAF5",
    soft: "#EDF8C9",
    border: "#ECEEE8",
    accent: "#7257E8",
    muted: "#60655A",
  },
  fonts: {
    heading: "Space Grotesk",
    body: "Inter",
  },
} as const;

export type BrandTokens = typeof pipStartBrand | typeof skillcimaBrand;
