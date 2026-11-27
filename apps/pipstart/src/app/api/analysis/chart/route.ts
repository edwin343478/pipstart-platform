import { analysisPosts } from "@/app/analysis/posts";
import {
  chartNotFound,
  privateChartPath,
  readPrivateTradeChart,
} from "@/lib/content/private-trade-chart";
import { tradeIdeasEnabled } from "@/lib/content/trade-idea";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  if (!tradeIdeasEnabled()) return chartNotFound();
  const path = privateChartPath(request);
  if (!path) return chartNotFound();
  const published = analysisPosts.some(
    (post) =>
      post.status === "published" &&
      post.category === "technical" &&
      (post.trade?.chart.path === path ||
        post.trade?.chart.thumbnailPath === path),
  );
  return published ? readPrivateTradeChart(path) : chartNotFound();
}
