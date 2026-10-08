import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
export const m17Projects = ["desktop", "mobile", "small-mobile"];
export const m17ReviewMode = process.env.PIPSTART_M17_GLOSSARY_REVIEW === "1";
export const m17TestsPerProject = 10;
const sources = [
  "src/app/glossary/page.tsx",
  "src/app/glossary/crypto/page.tsx",
  "src/app/glossary/search/page.tsx",
  "src/components/glossary-results.tsx",
  "src/components/glossary-grouping.tsx",
  "src/components/glossary-teaching.tsx",
  "src/components/glossary-category.tsx",
  "src/components/glossary-controls.module.css",
  "src/app/glossary/page.module.css",
  "src/app/glossary/crypto/page.module.css",
  "src/content/published-glossary.ts",
  "src/content/glossary-display.ts",
  "src/content/glossary-review-status.json",
  "src/content/glossary-release-status.json",
  "src/lib/glossary-release.ts",
  "src/lib/glossary-reviewed-preview.ts",
  "src/content/glossary-catalogue.ts",
  "src/lib/glossary-search.ts",
  "src/lib/glossary-publication.ts",
  "src/lib/glossary-browse.ts",
  "src/lib/glossary-route-search.ts",
  "playwright.m17.config.ts",
  "e2e/milestone-17-glossary.spec.ts",
  "scripts/m17-browser-metadata.mjs",
];
const hash = (text) => createHash("sha256").update(text).digest("hex");
const normalized = (file) =>
  fs
    .readFileSync(file, "utf8")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n");
export function getM17BrowserMetadata(appRoot) {
  const catalogue = normalized(
    path.join(appRoot, "src/content/glossary-catalogue.draft.json"),
  );
  const archived = JSON.parse(catalogue);
  const release = JSON.parse(
    normalized(path.join(appRoot, "src/content/glossary-release-status.json")),
  );
  const build = path.join(appRoot, ".next/BUILD_ID");
  return {
    scope: m17ReviewMode
      ? "approved-catalogue-noindex-review"
      : "personally-approved-public-catalogue",
    reviewMode: m17ReviewMode,
    buildId: fs.existsSync(build)
      ? fs.readFileSync(build, "utf8").trim()
      : null,
    catalogueHash: hash(catalogue),
    sourceHash: hash(
      sources
        .map((file) => file + "\n" + hash(normalized(path.join(appRoot, file))))
        .join("\n"),
    ),
    releaseApproved:
      release.publicationApproved === true &&
      release.personalReviewApproved === true &&
      release.scope === "approved-public-release",
    archivePreserved:
      archived.status === "draft" &&
      archived.approved === false &&
      archived.entries.every(
        (entry) =>
          entry.status === "draft" &&
          entry.approved === false &&
          entry.sourceReview === "pending",
      ),
  };
}
