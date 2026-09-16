import { DeleteAccountForm } from "@/components/account-forms";
import { AccountShell } from "@/components/account-shell";
import { requireUser } from "@/lib/auth/session";

export default async function DeleteAccountPage() {
  await requireUser("/account/delete");
  return (
    <AccountShell
      description="This permanently removes your account profile and preferences. This action cannot be undone."
      navigation
      title="Delete account"
    >
      <DeleteAccountForm />
    </AccountShell>
  );
}
