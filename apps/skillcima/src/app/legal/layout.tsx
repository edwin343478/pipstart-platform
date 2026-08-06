import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type LegalLayoutProps = {
  children: ReactNode;
};

export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main id="main-content" className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}
