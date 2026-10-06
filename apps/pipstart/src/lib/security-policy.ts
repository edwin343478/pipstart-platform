export function createContentSecurityPolicy(
  development: boolean,
  siteUrl?: string,
): string {
  let upgrade = false;
  try {
    upgrade = !development && new URL(siteUrl ?? "").protocol === "https:";
  } catch {
    // Local production browser checks use HTTP; never upgrade their assets.
  }
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    // Inline hydration/JSON-LD preserve the approved static Next.js delivery.
    // Nonce-based inline-script protection would require a separate rendering change.
    `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${development ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    ...(upgrade ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
