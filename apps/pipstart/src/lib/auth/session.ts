import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/settings");
  return user;
}

export async function requireAdministrator() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");

  const { data } = await supabase
    .from("pipstart_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (data?.role !== "admin")
    redirect("/account/settings?notice=not-authorized");
  return user;
}
