/** JSON API response policy. Static exports receive their policy from public/_headers. */
export const skillcimaApiHeaders = {
  "Content-Security-Policy":
    "default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Strict-Transport-Security": "max-age=86400",
} as const;

/** Keep route status/body and cache, CORS, retry and token-privacy headers intact. */
export function secureSkillcimaResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(skillcimaApiHeaders)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
