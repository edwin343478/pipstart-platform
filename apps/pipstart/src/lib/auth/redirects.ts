import { safeInternalRedirect } from "./validation";

export const DEFAULT_ACCOUNT_ROUTE = "/dashboard";

export function isProtectedAuthPath(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/reset-password"
  );
}

export function getLoginRedirect(next = DEFAULT_ACCOUNT_ROUTE) {
  const safeNext = safeInternalRedirect(next, DEFAULT_ACCOUNT_ROUTE);
  return `/login?next=${encodeURIComponent(safeNext)}`;
}
