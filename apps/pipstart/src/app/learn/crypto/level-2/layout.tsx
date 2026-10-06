import type { ReactNode } from "react";

import { createDynamicMetadata } from "../../../../lib/seo";
import { cryptoLessons } from "./lessons";

const lesson = cryptoLessons[0]!;
export const metadata = createDynamicMetadata({
  path: lesson.href,
  title: lesson.seoTitle,
  description: lesson.seoDescription,
});

export default function SeoLayout({ children }: { children: ReactNode }) {
  return children;
}
