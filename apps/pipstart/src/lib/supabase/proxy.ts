import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseAuthCookie } from "@/lib/auth/cookies";
import { getLoginRedirect, isProtectedAuthPath } from "@/lib/auth/redirects";

import { getSupabasePublicConfiguration } from "./config";

function redirectToLogin(request: NextRequest) {
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  return NextResponse.redirect(
    new URL(getLoginRedirect(nextPath), request.url),
  );
}

export async function updateSupabaseSession(request: NextRequest) {
  const protectedPath = isProtectedAuthPath(request.nextUrl.pathname);
  const authCookiePresent = hasSupabaseAuthCookie(
    request.cookies.getAll().map(({ name }) => name),
  );
  if (protectedPath && !authCookiePresent) return redirectToLogin(request);

  const configuration = getSupabasePublicConfiguration();
  if (!configuration) {
    return protectedPath
      ? redirectToLogin(request)
      : NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    configuration.url,
    configuration.publishableKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();
  if (protectedPath && (error || !data?.claims?.sub)) {
    return redirectToLogin(request);
  }
  return response;
}
