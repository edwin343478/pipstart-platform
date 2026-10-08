import "server-only";
import { createHash } from "node:crypto";
import draft from "./glossary-catalogue.draft.json";
import review from "./glossary-review-status.json";
import release from "./glossary-release-status.json";
import { releaseGlossaryEntries } from "../lib/glossary-release";
import type { GlossaryEntry } from "../lib/glossary-search";
const canonical = (v: unknown): string =>
  Array.isArray(v)
    ? "[" + v.map(canonical).join(",") + "]"
    : v && typeof v === "object"
      ? "{" +
        Object.keys(v)
          .sort()
          .map(
            (k) =>
              JSON.stringify(k) +
              ":" +
              canonical((v as Record<string, unknown>)[k]),
          )
          .join(",") +
        "}"
      : JSON.stringify(v);
export function getGlossaryReviewCatalogue(): readonly GlossaryEntry[] {
  return draft.entries as readonly GlossaryEntry[];
}
const published = releaseGlossaryEntries(
  {
    status: draft.status,
    approved: draft.approved,
    entries: getGlossaryReviewCatalogue(),
  },
  review,
  release,
  createHash("sha256").update(canonical(draft)).digest("hex"),
);
export function getPublicGlossaryCatalogue(): readonly GlossaryEntry[] {
  return published;
}
