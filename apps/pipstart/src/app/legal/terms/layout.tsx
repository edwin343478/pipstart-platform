import type { ReactNode } from "react";

import { createPageMetadata } from "../../../lib/seo";

export const metadata = createPageMetadata("/legal/terms");

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
