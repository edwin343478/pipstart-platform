import type { GlossaryCourse } from "./glossary-search";
export type GlossaryRouteParams = {
  q?: string | string[];
  course?: string | string[];
  limit?: string | string[];
  letter?: string | string[];
  category?: string | string[];
};
export function glossaryFilterHref(
  course: GlossaryCourse,
  letter: string,
  category: string,
) {
  const pathname = course === "forex" ? "/glossary" : "/glossary/crypto";
  const params = new URLSearchParams();
  if (course === "forex") params.set("course", "forex");
  if (/^[A-Z]$/.test(letter)) params.set("letter", letter);
  if (category) params.set("category", category);
  return pathname + (params.size ? "?" + params.toString() : "");
}
