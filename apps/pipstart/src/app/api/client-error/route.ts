import { readBoundedRequestBody } from "@/lib/http/request-body";
import { buildReport, sendErrorReport } from "@/lib/ops/error-report";

// M24 X01: browser error boundaries report here (same origin, so the existing
// connect-src 'self' policy applies). The reply is always 204 and reveals nothing.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxBytes = 2048;
const done = () =>
  new Response(null, { status: 204, headers: { "cache-control": "no-store" } });

export async function POST(request: Request): Promise<Response> {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return done();
    if (
      !/^application\/json(?:\s*;|$)/i.test(
        request.headers.get("content-type") ?? "",
      )
    )
      return done();
    const declared = Number(request.headers.get("content-length") ?? "0");
    if (declared > maxBytes) return done();
    const bodyBytes = await readBoundedRequestBody(request, { maxBytes });
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bodyBytes);
    const body: unknown = JSON.parse(text);
    if (!body || typeof body !== "object") return done();
    const { route, digest, kind } = body as Record<string, unknown>;
    if (kind !== "boundary" && kind !== "global") return done();
    const code =
      typeof digest === "string" && /^[0-9A-Za-z@:_-]{1,64}$/.test(digest)
        ? digest
        : kind === "global"
          ? "GlobalError"
          : "BoundaryError";
    await sendErrorReport(buildReport("client", route, null, code));
  } catch {
    // Malformed input is ignored; nothing is logged about its content.
  }
  return done();
}
