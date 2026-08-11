import type { ReactNode } from "react";

import { DecorativeCornerShapes } from "@/components/decorative-corner-shapes";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main
        id="main-content"
        className="relative min-h-[70vh] overflow-hidden px-6 py-16 sm:py-20"
      >
        <DecorativeCornerShapes variant="accent-primary" />

        <div className="relative z-10 mx-auto max-w-3xl">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}
