// Browser side of M24 X01. Sends only the path and Next's digest; the server
// reduces the path to a template before anything leaves the site.
export function reportClientError(
  error: { digest?: string } | undefined,
  kind: "boundary" | "global",
  send: typeof fetch = fetch,
): void {
  try {
    void send("/api/client-error", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        route: window.location.pathname,
        digest: typeof error?.digest === "string" ? error.digest : undefined,
        kind,
      }),
      keepalive: true,
      credentials: "same-origin",
      cache: "no-store",
    }).catch(() => {});
  } catch {
    /* Reporting must never break the fallback page. */
  }
}
