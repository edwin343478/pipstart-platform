import type { ReactNode } from "react";

import { createPageMetadata } from "../../lib/seo";

export const metadata = createPageMetadata("/faq");

export default function FaqLayout({ children }: { children: ReactNode }) {
  return children;
}
