import type { PublicationStatus } from "../lib/public-content";

export type LessonSource = {
  title: string;
  url: `https://${string}`;
};

export type LessonMetadata = {
  affiliateDisclosureRequired: boolean;
  approved: boolean;
  author: string;
  course: string;
  description: string;
  estimatedMinutes: number;
  learningPath: "crypto" | "forex";
  level: string;
  module: string;
  objectives: string[];
  position: number;
  prerequisites: string[];
  publishedDate: string;
  relatedLessonIds: string[];
  relatedTermSlugs: string[];
  reviewer: string;
  reviewDate: string;
  riskWarningRequired: boolean;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  sources: LessonSource[];
  status: PublicationStatus;
  title: string;
};

export type LessonBlock =
  | { type: "definition"; term: string; children: string }
  | { type: "example"; title?: string; children: string }
  | { type: "warning"; title?: string; children: string }
  | { type: "keyPoint"; title?: string; points: string[] }
  | { type: "formula"; expression: string; explanation: string }
  | { type: "exercise"; prompt: string }
  | {
      type: "diagram";
      alt: string;
      caption?: string;
      height: number;
      src: `/${string}`;
      width: number;
    }
  | {
      type: "comparisonTable";
      caption: string;
      columns: string[];
      rows: string[][];
    }
  | { type: "riskNotice"; children: string }
  | { type: "affiliateDisclosure"; children: string }
  | { type: "quizPreview"; title: string; questionCount: number };

export type LessonDocument = {
  blocks: LessonBlock[];
  metadata: LessonMetadata;
};

const requiredTextFields = [
  "title",
  "slug",
  "description",
  "learningPath",
  "level",
  "course",
  "module",
  "author",
  "reviewer",
  "publishedDate",
  "reviewDate",
  "status",
  "seoTitle",
  "seoDescription",
] as const;

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function validateLessonForPublication(document: LessonDocument) {
  const { blocks, metadata } = document;
  const errors: string[] = [];

  for (const field of requiredTextFields) {
    if (typeof metadata[field] !== "string" || !metadata[field].trim()) {
      errors.push(`${field} is required`);
    }
  }

  if (!Number.isInteger(metadata.position) || metadata.position < 1) {
    errors.push("position must be a positive integer");
  }
  if (
    !Number.isInteger(metadata.estimatedMinutes) ||
    metadata.estimatedMinutes < 1
  ) {
    errors.push("estimatedMinutes must be a positive integer");
  }
  if (!Array.isArray(metadata.objectives) || !metadata.objectives.length) {
    errors.push("objectives are required");
  }
  if (!Array.isArray(metadata.prerequisites)) {
    errors.push("prerequisites are required");
  }
  if (!Array.isArray(metadata.sources) || !metadata.sources.length) {
    errors.push("sources are required");
  }
  if (metadata.status !== "draft" && metadata.status !== "published") {
    errors.push("status is invalid");
  }
  if (metadata.approved !== true) errors.push("approval is required");
  if (typeof metadata.riskWarningRequired !== "boolean") {
    errors.push("riskWarningRequired is required");
  }
  if (typeof metadata.affiliateDisclosureRequired !== "boolean") {
    errors.push("affiliateDisclosureRequired is required");
  }
  if (metadata.author === metadata.reviewer) {
    errors.push("author and reviewer must be different");
  }
  if (!isIsoDate(metadata.publishedDate))
    errors.push("publishedDate is invalid");
  if (!isIsoDate(metadata.reviewDate)) errors.push("reviewDate is invalid");
  if (
    isIsoDate(metadata.publishedDate) &&
    isIsoDate(metadata.reviewDate) &&
    metadata.reviewDate < metadata.publishedDate
  ) {
    errors.push("reviewDate cannot precede publishedDate");
  }

  for (const source of Array.isArray(metadata.sources)
    ? metadata.sources
    : []) {
    if (!source.title.trim() || !source.url.startsWith("https://")) {
      errors.push("each source requires a title and HTTPS URL");
    }
  }

  for (const block of Array.isArray(blocks) ? blocks : []) {
    if (block.type === "diagram" && !block.alt.trim()) {
      errors.push("diagram alternative text is required");
    }
    if (
      block.type === "comparisonTable" &&
      block.rows.some((row) => row.length !== block.columns.length)
    ) {
      errors.push("comparison table rows must match the column count");
    }
  }

  if (
    metadata.riskWarningRequired &&
    (!Array.isArray(blocks) ||
      !blocks.some((block) => block.type === "riskNotice"))
  ) {
    errors.push("risk notice block is required");
  }
  if (
    metadata.affiliateDisclosureRequired &&
    (!Array.isArray(blocks) ||
      !blocks.some((block) => block.type === "affiliateDisclosure"))
  ) {
    errors.push("affiliate disclosure block is required");
  }

  if (errors.length) {
    throw new Error(
      `Cannot publish ${metadata.slug || "lesson"}: ${errors.join("; ")}`,
    );
  }

  return document;
}

export function selectPublishableLessons(documents: readonly LessonDocument[]) {
  const published = documents.filter(
    ({ metadata }) => metadata.status === "published",
  );
  published.forEach(validateLessonForPublication);

  const routeKeys = new Set<string>();
  const positionKeys = new Set<string>();
  for (const { metadata } of published) {
    const routeKey = `${metadata.learningPath}:${metadata.slug}`;
    const positionKey = `${metadata.learningPath}:${metadata.level}:${metadata.course}:${metadata.module}:${metadata.position}`;
    if (routeKeys.has(routeKey))
      throw new Error(`Duplicate lesson slug: ${routeKey}`);
    if (positionKeys.has(positionKey)) {
      throw new Error(`Duplicate lesson position: ${positionKey}`);
    }
    routeKeys.add(routeKey);
    positionKeys.add(positionKey);
  }

  return published.sort((a, b) => a.metadata.position - b.metadata.position);
}
