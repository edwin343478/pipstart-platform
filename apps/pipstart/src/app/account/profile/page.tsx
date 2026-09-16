import { ProfileForm } from "@/components/account-forms";
import { AccountShell } from "@/components/account-shell";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const user = await requireUser("/account/profile");
  const supabase = await createSupabaseServerClient();
  const { data } = supabase
    ? await supabase
        .from("pipstart_profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single()
    : { data: null };
  return (
    <AccountShell
      description="Manage the name connected with your learning account."
      navigation
      title="Profile"
    >
      <ProfileForm
        displayName={
          data?.display_name ??
          String(user.user_metadata.display_name ?? "Learner")
        }
        email={user.email ?? ""}
      />
    </AccountShell>
  );
}
