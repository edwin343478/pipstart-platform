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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && Boolean(value.trim());
}

function isStrictIsoDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function utcDateStamp(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function isValidHttpsUrl(value: unknown) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function validateOptionalTitle(
  title: unknown,
  errors: string[],
  label: string,
) {
  if (title !== undefined && !isNonEmptyString(title)) {
    errors.push(`${label} title cannot be blank`);
  }
}

function validateLessonBlock(block: LessonBlock, errors: string[]) {
  switch (block.type) {
    case "definition":
      if (!isNonEmptyString(block.term))
        errors.push("definition term is required");
      if (!isNonEmptyString(block.children))
        errors.push("definition content is required");
      break;
    case "example":
    case "warning":
      validateOptionalTitle(block.title, errors, block.type);
      if (!isNonEmptyString(block.children))
        errors.push(`${block.type} content is required`);
      break;
    case "keyPoint":
      validateOptionalTitle(block.title, errors, "key point");
      if (
        !Array.isArray(block.points) ||
        !block.points.length ||
        block.points.some((point) => !isNonEmptyString(point))
      ) {
        errors.push("key point requires at least one nonempty point");
      }
      break;
    case "formula":
      if (!isNonEmptyString(block.expression))
        errors.push("formula expression is required");
      if (!isNonEmptyString(block.explanation))
        errors.push("formula explanation is required");
      break;
    case "exercise":
      if (!isNonEmptyString(block.prompt))
        errors.push("exercise prompt is required");
      break;
    case "diagram":
      if (!isNonEmptyString(block.alt))
        errors.push("diagram alternative text is required");
      if (
        !isNonEmptyString(block.src) ||
        !block.src.startsWith("/") ||
        block.src.startsWith("//")
      ) {
        errors.push("diagram source must be a root-relative path");
      }
      if (
        !Number.isInteger(block.width) ||
        block.width < 1 ||
        !Number.isInteger(block.height) ||
        block.height < 1
      ) {
        errors.push("diagram dimensions must be positive integers");
      }
      validateOptionalTitle(block.caption, errors, "diagram caption");
      break;
    case "comparisonTable": {
      if (!isNonEmptyString(block.caption))
        errors.push("comparison table caption is required");
      if (
        !Array.isArray(block.columns) ||
        !block.columns.length ||
        block.columns.some((column) => !isNonEmptyString(column))
      ) {
        errors.push("comparison table columns are required");
      } else if (
        new Set(block.columns.map((column) => column.trim())).size !==
        block.columns.length
      ) {
        errors.push("comparison table columns must be unique");
      }
      if (!Array.isArray(block.rows) || !block.rows.length) {
        errors.push("comparison table rows are required");
      } else {
        if (
          block.rows.some(
            (row) => !Array.isArray(row) || row.length !== block.columns.length,
          )
        ) {
          errors.push("comparison table rows must match the column count");
        }
        if (
          block.rows.some((row) => row.some((cell) => !isNonEmptyString(cell)))
        ) {
          errors.push("comparison table cells cannot be blank");
        }
      }
      break;
    }
    case "riskNotice":
      if (!isNonEmptyString(block.children))
        errors.push("risk notice content is required");
      break;
    case "affiliateDisclosure":
      if (!isNonEmptyString(block.children))
        errors.push("affiliate disclosure content is required");
      break;
    case "quizPreview":
      if (!isNonEmptyString(block.title))
        errors.push("quiz preview title is required");
      if (!Number.isInteger(block.questionCount) || block.questionCount < 1) {
        errors.push("quiz preview question count must be a positive integer");
      }
      break;
    default: {
      const exhaustiveBlock: never = block;
      errors.push(
        `unknown lesson block: ${String((exhaustiveBlock as { type?: unknown }).type)}`,
      );
    }
  }
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
  } else if (
    metadata.objectives.some((objective) => !isNonEmptyString(objective))
  ) {
    errors.push("objectives cannot contain blank values");
  }
  if (!Array.isArray(metadata.prerequisites)) {
    errors.push("prerequisites are required");
  } else if (
    metadata.prerequisites.some(
      (prerequisite) => !isNonEmptyString(prerequisite),
    )
  ) {
    errors.push("prerequisites cannot contain blank values");
  }
  if (!Array.isArray(metadata.relatedLessonIds)) {
    errors.push("relatedLessonIds are required");
  } else if (metadata.relatedLessonIds.some((id) => !isNonEmptyString(id))) {
    errors.push("relatedLessonIds cannot contain blank values");
  }
  if (!Array.isArray(metadata.relatedTermSlugs)) {
    errors.push("relatedTermSlugs are required");
  } else if (
    metadata.relatedTermSlugs.some((slug) => !isNonEmptyString(slug))
  ) {
    errors.push("relatedTermSlugs cannot contain blank values");
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
  if (!isStrictIsoDate(metadata.publishedDate))
    errors.push("publishedDate is invalid");
  if (!isStrictIsoDate(metadata.reviewDate))
    errors.push("reviewDate is invalid");
  if (
    isStrictIsoDate(metadata.publishedDate) &&
    isStrictIsoDate(metadata.reviewDate) &&
    metadata.reviewDate < metadata.publishedDate
  ) {
    errors.push("reviewDate cannot precede publishedDate");
  }
  const today = utcDateStamp(new Date());
  if (
    isStrictIsoDate(metadata.publishedDate) &&
    metadata.publishedDate > today
  ) {
    errors.push("publishedDate cannot be in the future");
  }
  if (isStrictIsoDate(metadata.reviewDate) && metadata.reviewDate > today) {
    errors.push("reviewDate cannot be in the future");
  }

  for (const source of Array.isArray(metadata.sources)
    ? metadata.sources
    : []) {
    if (!isNonEmptyString(source.title) || !isValidHttpsUrl(source.url)) {
      errors.push("each source requires a title and HTTPS URL");
    }
  }

  for (const block of Array.isArray(blocks) ? blocks : []) {
    validateLessonBlock(block, errors);
  }
  if (!Array.isArray(blocks) || !blocks.length) {
    errors.push("at least one lesson block is required");
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

export type LessonReferenceOptions = {
  validTermSlugs?: readonly string[];
};

export function validateLessonReferences(
  documents: readonly LessonDocument[],
  published: readonly LessonDocument[],
  options: LessonReferenceOptions = {},
) {
  const allByPathAndSlug = new Map(
    documents.map((document) => [
      `${document.metadata.learningPath}:${document.metadata.slug}`,
      document,
    ]),
  );
  const validTermSlugs = options.validTermSlugs
    ? new Set(options.validTermSlugs)
    : undefined;

  for (const document of published) {
    const { metadata } = document;
    for (const [field, references] of [
      ["prerequisite", metadata.prerequisites],
      ["related lesson", metadata.relatedLessonIds],
    ] as const) {
      for (const reference of references) {
        if (reference === metadata.slug) {
          throw new Error(
            `${metadata.slug} cannot reference itself as a ${field}`,
          );
        }
        const target = allByPathAndSlug.get(
          `${metadata.learningPath}:${reference}`,
        );
        if (!target) {
          throw new Error(
            `${metadata.slug} references missing ${field}: ${reference}`,
          );
        }
        if (
          target.metadata.status !== "published" ||
          target.metadata.approved !== true
        ) {
          throw new Error(
            `${metadata.slug} references unpublished ${field}: ${reference}`,
          );
        }
      }
    }

    if (validTermSlugs) {
      for (const slug of metadata.relatedTermSlugs) {
        if (!validTermSlugs.has(slug)) {
          throw new Error(
            `${metadata.slug} references missing glossary term: ${slug}`,
          );
        }
      }
    }
  }
}

export function selectPublishableLessons(
  documents: readonly LessonDocument[],
  options: LessonReferenceOptions = {},
) {
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

  validateLessonReferences(documents, published, options);

  return published.sort((a, b) => a.metadata.position - b.metadata.position);
}
