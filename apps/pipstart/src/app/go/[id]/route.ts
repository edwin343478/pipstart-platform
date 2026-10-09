import { providers } from "../../../content/providers";
import { providerLinks } from "../../../content/provider-links";
import {
  resolveProviderLink,
  validateProviderDirectory,
} from "../../../lib/provider-directory";

export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  validateProviderDirectory(providers, providerLinks);
  const { id } = await params;
  const link = resolveProviderLink(id, providers, providerLinks);
  const headers = {
    "Cache-Control": "no-store, max-age=0",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
  if (!link)
    return new Response(
      '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Provider link unavailable | PipStart</title></head><body><main><h1>Provider link unavailable</h1><p>This link is unknown, disabled, expired or awaiting an overdue review. No external redirect was made.</p><a href="/brokers">Return to the broker directory</a></main></body></html>',
      {
        status: 404,
        headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
      },
    );
  // Destination comes ONLY from the server register, never query/body/referrer input.
  // No click tracking, cookies or personal data collection in Phase 1.
  return new Response(null, {
    status: 302,
    headers: { ...headers, Location: link.url },
  });
}
