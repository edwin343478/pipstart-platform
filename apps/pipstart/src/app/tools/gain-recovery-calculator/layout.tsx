import type { ReactNode } from "react";

import { createPageMetadata } from "../../../lib/seo";

export const metadata = createPageMetadata("/tools/gain-recovery-calculator");

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
