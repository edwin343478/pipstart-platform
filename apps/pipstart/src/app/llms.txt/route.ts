import { buildLlmsText } from "../../lib/llms-text";

// M24-06: https://pipstart.net/llms.txt, built once at build time.
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildLlmsText(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
