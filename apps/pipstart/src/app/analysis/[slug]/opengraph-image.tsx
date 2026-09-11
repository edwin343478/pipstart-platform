import { ImageResponse } from "next/og";

import { analysisPosts } from "../posts";

export const alt = "PipStart market analysis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function AnalysisOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = analysisPosts.find((candidate) => candidate.slug === slug);

  return new ImageResponse(
    <div
      style={{
        background: "#f5f7f8",
        color: "#0b1220",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "68px 76px",
        width: "100%",
      }}
    >
      <div
        style={{
          color: "#0f766e",
          fontSize: 27,
          fontWeight: 800,
          letterSpacing: 1.5,
        }}
      >
        PIPSTART ANALYSIS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>
          {post?.title ?? "Market analysis for learners"}
        </div>
        <div style={{ color: "#475467", fontSize: 25 }}>
          Educational commentary · Not financial advice
        </div>
      </div>
    </div>,
    size,
  );
}
