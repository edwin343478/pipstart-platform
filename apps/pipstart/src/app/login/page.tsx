import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/account-forms";
import { AccountShell } from "@/components/account-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { safeInternalRedirect } from "@/lib/auth/validation";

export const metadata: Metadata = {
  title: "Log in",
  robots: { follow: false, index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; notice?: string }>;
}) {
  const { next, notice } = await searchParams;
  const destination = safeInternalRedirect(next, "/dashboard");
  if (await getCurrentUser()) redirect(destination);
  const description =
    notice === "invalid-link"
      ? "That authentication link is invalid or has expired. Log in or request a fresh link."
      : notice === "signed-out"
        ? "You have been signed out safely."
        : "Welcome back. Continue with your PipStart learner account.";
  return (
    <AccountShell description={description} title="Log in">
      <LoginForm next={destination} />
    </AccountShell>
  );
}
