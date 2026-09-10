import type { ReactNode } from "react";

import { createPageMetadata } from "../../lib/seo";

export const metadata = createPageMetadata("/about");

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
