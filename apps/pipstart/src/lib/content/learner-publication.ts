import {
  validateLessonForPublication,
  type LessonDocument,
} from "../../content/lesson-content";
import { object } from "./curriculum-draft-contract";
import type { StoreRow } from "./import/shadow";

export function lessonPublicationView(body: Record<string, unknown>) {
  const request = body.learnerPublicationRequest;
  if (
    !object(request) ||
    !object(body.metadata) ||
    body.metadata.status !== "draft" ||
    body.metadata.approved !== false
  )
    throw Error("Invalid lesson publication request");
  const { author, reviewer, publishedDate, reviewDate } = request;
  for (const credit of [author, reviewer]) {
    if (
      typeof credit !== "string" ||
      !credit.trim() ||
      credit.length > 120 ||
      ["Review pending", "Editorial draft"].includes(credit.trim())
    )
      throw Error("Public editorial credit required");
  }
  const candidate = {
    ...body,
    metadata: {
      ...body.metadata,
      author,
      reviewer,
      publishedDate,
      reviewDate,
      status: "published",
      approved: true,
    },
  };
  validateLessonForPublication(candidate as unknown as LessonDocument);
  return candidate;
}

// Called only for current entries of a delivered generation, after its snapshot has been verified.
export function deliveredLearnerRow(row: StoreRow): StoreRow {
  if (!Object.hasOwn(row.body, "learnerPublicationRequest")) return row;
  if (row.family === "lesson")
    return { ...row, body: lessonPublicationView(row.body) };
  if (
    row.family === "quiz" &&
    row.body.learnerPublicationRequest === true &&
    object(row.body.metadata) &&
    row.body.metadata.status === "draft"
  ) {
    return {
      ...row,
      body: {
        ...row.body,
        metadata: { ...row.body.metadata, status: "published" },
      },
    };
  }
  throw Error("Invalid learner publication request in delivered generation");
}
