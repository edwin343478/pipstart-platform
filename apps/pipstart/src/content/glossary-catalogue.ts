import "server-only";
import { createHash } from "node:crypto";
import draft from "./glossary-catalogue.draft.json";
import review from "./glossary-review-status.json";
import release from "./glossary-release-status.json";
import { releaseGlossaryEntries } from "../lib/glossary-release";
import type { GlossaryEntry } from "../lib/glossary-search";
import {
  canonicalGlossaryJson as canonical,
  assertGlossaryEntries,
} from "../lib/glossary-contract";
assertGlossaryEntries(draft.entries);
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
