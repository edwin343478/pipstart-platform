import type { GlossaryCourse } from "./glossary-search";
export const GLOSSARY_BATCH_SIZE = 12;
export type GlossaryScope = GlossaryCourse | "";
export type GlossaryBrowseSelection = {
  query: string;
  course: GlossaryScope;
  category: string;
  letter: string;
};
export type GlossaryPathname =
  "/glossary" | "/glossary/crypto" | "/glossary/search";
export function glossaryVisibleCount(value: unknown, total: number) {
  const requested =
    typeof value === "string" && /^[0-9]{1,3}$/.test(value) ? Number(value) : 0;
  const count =
    requested >= 1 && requested <= 500
      ? Math.min(
          500,
          Math.ceil(requested / GLOSSARY_BATCH_SIZE) * GLOSSARY_BATCH_SIZE,
        )
      : GLOSSARY_BATCH_SIZE;
  return Math.min(Math.max(0, total), count);
}
export function glossaryTermAnchor(
  scope: GlossaryScope,
  term: { course: GlossaryCourse; slug: string },
) {
  return scope === "crypto"
    ? term.slug
    : term.course === "forex"
      ? term.slug
      : "crypto-" + term.slug;
}
export function glossaryBrowseHref(
  pathname: GlossaryPathname,
  selection: GlossaryBrowseSelection,
  count?: number,
  anchor?: string,
) {
  const params = new URLSearchParams();
  if (selection.query) params.set("q", selection.query);
  if (selection.course && pathname !== "/glossary/crypto")
    params.set("course", selection.course);
  if (selection.category) params.set("category", selection.category);
  if (selection.letter) params.set("letter", selection.letter);
  if (count !== undefined) params.set("limit", String(count));
  return (
    pathname +
    (params.size ? "?" + params.toString() : "") +
    (anchor ? "#" + encodeURIComponent(anchor) : "")
  );
}
export function glossaryGroupingHref(
  pathname: GlossaryPathname,
  course: GlossaryScope,
  selection: GlossaryBrowseSelection,
) {
  const route =
    pathname === "/glossary/search"
      ? pathname
      : course === "crypto"
        ? "/glossary/crypto"
        : "/glossary";
  // Keep search/letter intent, reset pagination and the previous grouping's category.
  return glossaryBrowseHref(route, { ...selection, course, category: "" });
}
export function glossaryFragmentCount(
  fragment: string,
  anchors: readonly string[],
  initial: number,
) {
  let target: string;
  try {
    target = decodeURIComponent(fragment.replace(/^#/, ""));
  } catch {
    return initial;
  }
  const index = anchors.indexOf(target);
  return index < 0
    ? initial
    : Math.max(
        initial,
        Math.ceil((index + 1) / GLOSSARY_BATCH_SIZE) * GLOSSARY_BATCH_SIZE,
      );
}
