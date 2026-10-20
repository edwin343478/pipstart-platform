import { NextResponse, type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // Bearer-token unsubscribe is independent of browser Auth/cookies. Do not
  // refresh a session, redirect to login, or set cookies on this exact route.
  if (request.nextUrl.pathname === "/unsubscribe") return NextResponse.next();
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
