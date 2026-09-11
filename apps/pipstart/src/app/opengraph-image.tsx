import { ImageResponse } from "next/og";

export const alt = "PipStart structured Forex and cryptocurrency education";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#0b1220",
        color: "white",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "72px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "26px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#2dd4bf",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          PIPSTART
        </div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.08 }}>
          Learn markets with structure, not shortcuts.
        </div>
        <div style={{ color: "#cbd5e1", fontSize: 28 }}>
          Free Forex and cryptocurrency education · Practical calculators ·
          Risk-first learning
        </div>
      </div>
    </div>,
    size,
  );
}
