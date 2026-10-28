// Bearer-token pages must not inherit the site's script/referrer allowances.
// Share these values between next.config's later exact-route rule and Response.
export const unsubscribePrivacyHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
] as const;

export function createContentSecurityPolicy(
  development: boolean,
  siteUrl?: string,
  economicCalendar = false,
  supabaseUrl?: string,
): string {
  let upgrade = false;
  try {
    upgrade = !development && new URL(siteUrl ?? "").protocol === "https:";
  } catch {
    // Local production browser checks use HTTP; never upgrade their assets.
  }
  // Browser Auth/RPC uses only the configured public API origin. Do not allow
  // wildcard hosts, credentials, path/query sources or arbitrary HTTP servers.
  let authSource = "";
  try {
    const raw = supabaseUrl?.trim() || "";
    const api = new URL(raw);
    const loopback =
      development &&
      api.protocol === "http:" &&
      ["127.0.0.1", "localhost"].includes(api.hostname);
    if (
      raw &&
      !/[\s;*]/.test(raw) &&
      !api.username &&
      !api.password &&
      api.pathname === "/" &&
      !api.search &&
      !api.hash &&
      (api.protocol === "https:" || loopback)
    )
      authSource = " " + api.origin;
  } catch {
    // Missing/malformed configuration adds no network permission.
  }
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    economicCalendar
      ? "frame-src https://www.tradingview-widget.com"
      : "frame-src 'none'",
    "object-src 'none'",
    // Inline hydration/JSON-LD preserve the approved static Next.js delivery.
    // Nonce-based inline-script protection would require a separate rendering change.
    `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}${economicCalendar ? " https://s3.tradingview.com/external-embedding/embed-widget-events.js" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${authSource}${development ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    ...(upgrade ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
