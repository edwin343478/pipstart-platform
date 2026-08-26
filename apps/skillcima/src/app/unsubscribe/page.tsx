import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";

import { UnsubscribeClient } from "./unsubscribe-client";

export const metadata: Metadata = {
  title: "Unsubscribe | Skillcima",
  description:
    "Manage optional Skillcima educational-email consent.",
  referrer: "no-referrer",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnsubscribePage() {
  return (
    <PageShell>
      <UnsubscribeClient />
    </PageShell>
  );
}
