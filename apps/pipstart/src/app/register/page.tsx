import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/account-forms";
import { AccountShell } from "@/components/account-shell";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create account",
  robots: { follow: false, index: false },
};

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/account/settings");
  return (
    <AccountShell
      description="Create a free learner account."
      title="Create your account"
    >
      <RegisterForm />
    </AccountShell>
  );
}
