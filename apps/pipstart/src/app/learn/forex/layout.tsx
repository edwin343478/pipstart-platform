import type { ReactNode } from "react";

import { AuthenticatedNavigationProvider } from "../../../components/authenticated-navigation-provider";
import { createPageMetadata } from "../../../lib/seo";

export const metadata = createPageMetadata("/learn/forex");

export default function SeoLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedNavigationProvider>
      {children}
    </AuthenticatedNavigationProvider>
  );
}
