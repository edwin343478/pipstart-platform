import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/account-forms";
import { AccountShell } from "@/components/account-shell";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { follow: false, index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AccountShell
      description="Enter your email address. If it matches an account, we will send a secure reset link."
      title="Forgot password?"
    >
      <ForgotPasswordForm />
    </AccountShell>
  );
}
