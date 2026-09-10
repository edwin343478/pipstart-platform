import type { ReactNode } from "react";

import { createPageMetadata } from "../../../lib/seo";

export const metadata = createPageMetadata("/authors/pipstart-editorial-team");

export default function AuthorLayout({ children }: { children: ReactNode }) {
  return children;
}
