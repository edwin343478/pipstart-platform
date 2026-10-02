import type { ReactNode } from "react";

import { PublicLearnerNavigationProvider } from "../../../components/public-learner-navigation-provider";
import { createPageMetadata } from "../../../lib/seo";

export const metadata = createPageMetadata("/learn/crypto");

export default function SeoLayout({ children }: { children: ReactNode }) {
  return (
    <PublicLearnerNavigationProvider>
      {children}
    </PublicLearnerNavigationProvider>
  );
}
