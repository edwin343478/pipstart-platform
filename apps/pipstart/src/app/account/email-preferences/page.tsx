import { EmailPreferencesForm } from "@/components/account-forms";
import { AccountShell } from "@/components/account-shell";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function EmailPreferencesPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = supabase
    ? await supabase
        .from("pipstart_email_preferences")
        .select("educational_emails, marketing_emails")
        .eq("user_id", user.id)
        .single()
    : { data: null };
  return (
    <AccountShell
      description="Choose which optional messages you want to receive."
      navigation
      title="Email preferences"
    >
      <EmailPreferencesForm
        educational={data?.educational_emails ?? true}
        marketing={data?.marketing_emails ?? false}
      />
    </AccountShell>
  );
}
