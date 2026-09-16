import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicConfiguration } from "./config";

export async function updateSupabaseSession(request: NextRequest) {
  const configuration = getSupabasePublicConfiguration();
  if (!configuration) return NextResponse.next({ request });

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

  await supabase.auth.getClaims();
  return response;
}
