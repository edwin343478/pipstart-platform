import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/account-forms";
import { AccountShell } from "@/components/account-shell";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { follow: false, index: false },
};

export default async function ResetPasswordPage() {
  await requireUser();
  return (
    <AccountShell
      description="Choose a strong password that you do not use on another website."
      title="Choose a new password"
    >
      <ResetPasswordForm />
    </AccountShell>
  );
}
