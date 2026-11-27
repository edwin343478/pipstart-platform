import { randomBytes } from "node:crypto";
import { staffUiEnabled } from "@/lib/auth/staff-gate";
import { staffDeadline } from "@/lib/auth/staff-entry";
import { readLiveStaffAccess } from "@/lib/auth/staff-role-flow";
import {
  CHART_MAX_BYTES,
  readChartImage,
  type ChartUploadResult,
} from "@/lib/content/chart-image";
import { PRIVATE_TRADE_CHART_BUCKET } from "@/lib/content/trade-idea";
import {
  chartNotFound,
  privateChartPath,
  readPrivateTradeChart,
} from "@/lib/content/private-trade-chart";
import { readBoundedRequestBody } from "@/lib/http/request-body";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// TA-b: the Owner uploads a trade-idea chart. The browser sends the raw image bytes (same origin
// only). This route repeats the live Owner check, identifies the image from its bytes, and stores
// it under a random name in private Storage with the server's key. Nothing is
// written to the content store here: the editor puts the returned path into the draft it saves.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reply = (result: ChartUploadResult, status: number) =>
  Response.json(result, {
    status,
    headers: { "cache-control": "no-store" },
  });

async function ownerAccess(): Promise<"owner" | "denied" | "unavailable"> {
  const client = await createSupabaseServerClient();
  if (!client) return "unavailable";
  const identity = await staffDeadline(client.auth.getUser());
  if (identity.error || !identity.data.user) return "denied";
  const live = await readLiveStaffAccess(client, identity.data.user.id);
  if (live.kind !== "authorized")
    return live.kind === "unavailable" ? "unavailable" : "denied";
  return live.access.roles.includes("owner") ? "owner" : "denied";
}

export async function GET(request: Request): Promise<Response> {
  const path = privateChartPath(request);
  if (!staffUiEnabled() || !path) return chartNotFound();
  try {
    return (await ownerAccess()) === "owner"
      ? readPrivateTradeChart(path)
      : chartNotFound();
  } catch {
    return chartNotFound();
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!staffUiEnabled()) return new Response(null, { status: 404 });
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== new URL(request.url).origin ||
    (request.headers.get("sec-fetch-site") ?? "same-origin") !== "same-origin"
  )
    return reply({ kind: "denied" }, 403);
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(declared) || declared > CHART_MAX_BYTES)
    return reply(
      { kind: "invalid", reason: "Charts must be 4 MB or smaller" },
      413,
    );
  try {
    const access = await ownerAccess();
    if (access !== "owner")
      return reply({ kind: access }, access === "unavailable" ? 503 : 403);
    let bytes: Uint8Array;
    try {
      bytes = await readBoundedRequestBody(request, {
        maxBytes: CHART_MAX_BYTES,
        maxChunks: 8192,
        timeoutMs: 30_000,
      });
    } catch {
      return reply(
        { kind: "invalid", reason: "Charts must be 4 MB or smaller" },
        413,
      );
    }
    const read = readChartImage(bytes);
    if (!read.ok) return reply({ kind: "invalid", reason: read.reason }, 400);
    const admin = createSupabaseAdminClient();
    if (!admin) return reply({ kind: "unavailable" }, 503);
    const now = new Date();
    const path = `private/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomBytes(16).toString("hex")}.${read.image.extension}`;
    const stored = await admin.storage
      .from(PRIVATE_TRADE_CHART_BUCKET)
      .upload(path, bytes, {
        contentType: read.image.contentType,
        cacheControl: "0",
        upsert: false,
      });
    if (stored.error) return reply({ kind: "unavailable" }, 503);
    return reply(
      {
        kind: "uploaded",
        path,
        width: read.image.width,
        height: read.image.height,
      },
      200,
    );
  } catch {
    return reply({ kind: "unavailable" }, 503);
  }
}
