import { handleUnsubscribe } from "@/lib/email-unsubscribe/core";
import { createUnsubscribeStore } from "@/lib/email-unsubscribe/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;
export async function GET(request: Request) {
  return handleUnsubscribe(request, createUnsubscribeStore());
}
export async function POST(request: Request) {
  return handleUnsubscribe(request, createUnsubscribeStore());
}
export async function HEAD(request: Request) {
  return handleUnsubscribe(request, null);
}
