import { createHash, randomBytes } from "node:crypto";
import { unsubscribePrivacyHeaders } from "../security-policy";

export type UnsubscribeScope = "learning" | "partner" | "all";
export type ApplyResult = "unsubscribed" | "already_unsubscribed" | "invalid";
export interface UnsubscribeStore {
  lookup(hash: string): Promise<UnsubscribeScope | null>;
  apply(hash: string): Promise<ApplyResult>;
}
export function isUnsubscribeScope(value: unknown): value is UnsubscribeScope {
  return value === "learning" || value === "partner" || value === "all";
}
export function newUnsubscribeToken(): string { return randomBytes(32).toString("hex"); }
export function hashUnsubscribeToken(value: unknown): string | null {
  return typeof value === "string" && value.length === 64 && /^[a-f0-9]{64}$/.test(value)
    ? createHash("sha256").update(value, "utf8").digest("hex") : null;
}
const headers = {
  ...Object.fromEntries(unsubscribePrivacyHeaders.map(({ key, value }) => [key, value])),
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};
export const scopeLabel = (scope: UnsubscribeScope) => scope === "learning"
  ? "learning emails" : scope === "partner" ? "partner offers from PipStart" : "all optional emails";
function page(status: number, title: string, description: string, form = ""): Response {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | PipStart</title><style>body{margin:0;background:#f5f7f8;color:#17212b;font:17px/1.6 system-ui,sans-serif}main{max-width:560px;margin:10vh auto;padding:32px;background:white;border:1px solid #dbe5e7;border-radius:16px}a{color:#08756d}button{background:#08756d;color:white;border:0;border-radius:8px;min-height:44px;padding:12px 20px;font:inherit;cursor:pointer}button:focus-visible,a:focus-visible{outline:3px solid #111;outline-offset:4px}h1{line-height:1.2}small{display:block;margin-top:24px}@media(max-width:640px){main{margin:24px 16px;padding:24px}}</style></head><body><main><a href="/">PipStart</a><h1>${title}</h1><p>${description}</p>${form}<small>Password resets and essential account-security notices are separate. <a href="/account/email-preferences">Manage email preferences</a>.</small></main></body></html>`, {
    status, headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
  });
}
const invalid = () => page(400, "Unsubscribe link unavailable", "Use the full unsubscribe link from your email, or manage your email preferences in your account.");
const unavailable = () => page(503, "Please try again", "We could not confirm your unsubscribe request. Your preferences have not been reported as changed. Please try again shortly.");
class BodyTooLarge extends Error {}
async function formBody(request: Request): Promise<FormData | URLSearchParams> {
  const length = request.headers.get("content-length");
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > 2048)) throw new BodyTooLarge();
  const reader = request.body?.getReader();
  const parts: Uint8Array[] = [];
  let bytes = 0;
  if (reader) {
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        bytes += next.value.byteLength;
        if (bytes > 2048) { await reader.cancel(); throw new BodyTooLarge(); }
        parts.push(next.value);
      }
    } finally { reader.releaseLock(); }
  }
  const body = Buffer.concat(parts);
  const type = request.headers.get("content-type") ?? "";
  if (type.toLowerCase().startsWith("multipart/form-data;")) {
    return new Response(new Uint8Array(body), { headers: { "Content-Type": type } }).formData();
  }
  return new URLSearchParams(new TextDecoder("utf-8", { fatal: true }).decode(body));
}
export async function handleUnsubscribe(request: Request, store: UnsubscribeStore | null): Promise<Response> {
  if (!["GET", "HEAD", "POST"].includes(request.method)) return new Response(null, { status: 405, headers: { ...headers, Allow: "GET, HEAD, POST" } });
  const url = new URL(request.url);
  const tokens = url.searchParams.getAll("token");
  const hash = tokens.length === 1 && [...url.searchParams.keys()].every(key => key === "token") ? hashUnsubscribeToken(tokens[0]) : null;
  if (request.method === "HEAD") return new Response(null, { status: hash ? 200 : 400, headers });
  if (!hash) return invalid();
  if (request.method === "POST") {
    const type = (request.headers.get("content-type") ?? "").toLowerCase();
    if (!/^application\/x-www-form-urlencoded(?:\s*;|$)/.test(type) && !type.startsWith("multipart/form-data;")) return page(415, "Unsupported request", "Use the unsubscribe confirmation form or your email provider's unsubscribe control.");
    try {
      const body = await formBody(request);
      if ([...body.keys()].length !== 1 || body.get("List-Unsubscribe") !== "One-Click") return invalid();
    } catch (error) {
      return error instanceof BodyTooLarge ? page(413, "Request too large", "Please use the unsubscribe link from your email.") : invalid();
    }
  }
  if (!store) return unavailable();
  try {
    if (request.method === "GET") {
      const scope = await store.lookup(hash);
      if (!scope || !isUnsubscribeScope(scope)) return invalid();
      // All interpolated values below are fixed scope labels or validated hex.
      return page(200, "Unsubscribe", `Confirm that you want to stop receiving ${scopeLabel(scope)}. No login is needed.`, `<form method="post" action="/unsubscribe?token=${tokens[0]}"><button type="submit" name="List-Unsubscribe" value="One-Click">Unsubscribe from ${scopeLabel(scope)}</button></form>`);
    }
    const result = await store.apply(hash);
    if (result === "invalid") return invalid();
    if (result !== "unsubscribed" && result !== "already_unsubscribed") return unavailable();
    // POST is never redirected, including RFC 8058 calls without cookies/Auth.
    return page(200, "You are unsubscribed", "The optional email preferences covered by this link are now OFF. You can change your preferences in your account at any time.");
  } catch { return unavailable(); }
}
