export function reportClientError(
  kind: "boundary" | "global",
  send: typeof fetch = fetch,
): void {
  try {
    void send("/api/client-error", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind }),
      keepalive: true,
      credentials: "same-origin",
      cache: "no-store",
    }).catch(() => {});
  } catch {
    /* Reporting must never break the fallback page. */
  }
}
