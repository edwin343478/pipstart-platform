export function configuredPublicationUrl(
  value: string | undefined,
  hook: boolean,
): URL | null {
  try {
    if (!value || value !== value.trim()) return null;
    const u = new URL(value);
    if (u.username || u.password || u.hash) return null;
    const local =
      process.env.NODE_ENV === "development" &&
      process.env.VERCEL_ENV !== "production" &&
      u.protocol === "http:" &&
      u.hostname === "127.0.0.1";
    if (!local && (u.protocol !== "https:" || u.port)) return null;
    if (hook) {
      if (
        !local &&
        (u.hostname !== "api.vercel.com" ||
          !/^\/v1\/integrations\/deploy\/[A-Za-z0-9_/-]+$/.test(u.pathname))
      )
        return null;
      if (u.search) return null;
    } else if (
      u.pathname !== "/" ||
      u.search ||
      (!local &&
        (!u.hostname.includes(".") ||
          /^[\d.]+$/.test(u.hostname) ||
          /(?:^|\.)(localhost|local|internal)$/.test(u.hostname)))
    )
      return null;
    return u;
  } catch {
    return null;
  }
}
