import "server-only";

import { createSupabaseAdminClient } from "../supabase/admin";
import { CHART_MAX_BYTES } from "./chart-image";
import {
  PRIVATE_TRADE_CHART_BUCKET,
  PRIVATE_TRADE_CHART_PATH,
} from "./trade-idea";

const headers = {
  "cache-control": "private, no-store",
  "x-content-type-options": "nosniff",
};

export function privateChartPath(request: Request): string | null {
  const paths = new URL(request.url).searchParams.getAll("path");
  return paths.length === 1 && PRIVATE_TRADE_CHART_PATH.test(paths[0])
    ? paths[0]
    : null;
}

export function chartNotFound(): Response {
  return new Response(null, { status: 404, headers });
}

export async function readPrivateTradeChart(path: string): Promise<Response> {
  if (!PRIVATE_TRADE_CHART_PATH.test(path)) return chartNotFound();
  try {
    const client = createSupabaseAdminClient({
      fetch: (input, init) => {
        const timeout = AbortSignal.timeout(8000);
        const signal =
          init?.signal ?? (input instanceof Request ? input.signal : null);
        return fetch(input, {
          ...init,
          cache: "no-store",
          signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
        });
      },
    });
    if (!client) return chartNotFound();
    const { data, error } = await client.storage
      .from(PRIVATE_TRADE_CHART_BUCKET)
      .download(path);
    if (error || !data || data.size === 0 || data.size > CHART_MAX_BYTES)
      return chartNotFound();
    const mime = path.endsWith(".png")
      ? "image/png"
      : path.endsWith(".jpg")
        ? "image/jpeg"
        : "image/webp";
    return new Response(data, {
      headers: { ...headers, "content-type": mime },
    });
  } catch {
    return chartNotFound();
  }
}
