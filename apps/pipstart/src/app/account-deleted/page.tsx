import type { Metadata } from "next";
import Link from "next/link";

import { AccountShell } from "@/components/account-shell";

export const metadata: Metadata = {
  title: "Account deleted",
  robots: { follow: false, index: false },
};

export default function AccountDeletedPage() {
  return (
    <AccountShell
      description="Your PipStart learner account and account preferences have been removed."
      title="Account deleted"
    >
      <p>You can continue using the public lessons without an account.</p>
      <p>
        <Link href="/start-here">Return to learning</Link>
      </p>
    </AccountShell>
  );
}
