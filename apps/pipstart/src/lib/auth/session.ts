import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { hasSupabaseAuthCookie } from "@/lib/auth/cookies";
import { getLoginRedirect } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  if (!hasSupabaseAuthCookie(cookieStore.getAll().map(({ name }) => name))) {
    return null;
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}

export async function requireUser(next?: string) {
  const user = await getCurrentUser();
  if (!user) redirect(getLoginRedirect(next));
  return user;
}
