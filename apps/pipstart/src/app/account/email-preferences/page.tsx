import { EmailPreferencesForm } from "@/components/account-forms";
import { AccountShell } from "@/components/account-shell";
import { requireUser } from "@/lib/auth/session";
import { readStoredEmailPreferences } from "@/lib/email-preferences";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function EmailPreferencesPage() {
  const user = await requireUser("/account/email-preferences");
  const supabase = await createSupabaseServerClient();
  const result = supabase
    ? await supabase.from("pipstart_email_preferences")
        .select("educational_emails, marketing_emails, learning_frequency")
        .eq("user_id", user.id).single()
    : null;
  const preferences = result && !result.error
    ? readStoredEmailPreferences(result.data) : null;
  return (
    <AccountShell description="Choose which optional messages you want to receive."
      navigation title="Email preferences">
      {preferences ? (
        <EmailPreferencesForm educational={preferences.educationalEmails}
          marketing={preferences.marketingEmails} frequency={preferences.learningFrequency} />
      ) : (
        <p role="alert">Your saved email preferences are temporarily unavailable. Please refresh or try again later. No settings have been changed.</p>
      )}
    </AccountShell>
  );
}
