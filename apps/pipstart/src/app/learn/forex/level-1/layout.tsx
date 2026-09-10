import type { ReactNode } from "react";

import { createPageMetadata } from "../../../../lib/seo";

export const metadata = createPageMetadata("/learn/forex/level-1");

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
