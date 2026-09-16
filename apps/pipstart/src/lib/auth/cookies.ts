const SUPABASE_AUTH_COOKIE = /^sb-[a-zA-Z0-9_-]+-auth-token(?:\.\d+)?$/;

export function hasSupabaseAuthCookie(cookieNames: readonly string[]) {
  return cookieNames.some((name) => SUPABASE_AUTH_COOKIE.test(name));
}
