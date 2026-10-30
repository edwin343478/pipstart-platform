// Structural validation at the trust boundary, rule for rule the same as the MP04a SQL
// `pipstart_editorial_private.body_ok`, so the server refuses exactly what the store refuses.
// Deeper publication checks (sources, references, curriculum) stay in the existing validators.
import {
  type ContentFamily,
  contentFamilies,
  contentLimits,
  lessonBlockTypes,
} from "./contract";

export type BodyCheck = { ok: true } | { ok: false; reason: string };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// PostgreSQL btrim(text) removes spaces only, and char_length counts code points.
const btrim = (value: string) => value.replace(/^ +| +$/g, "");
const charLength = (value: string) => [...value].length;

/** Byte length of the body as PostgreSQL prints it (`jsonb::text`), which the store limits. */
export function jsonbTextBytes(value: unknown): number {
  let separators = 0;
  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      separators += Math.max(node.length - 1, 0);
      node.forEach(visit);
    } else if (isObject(node)) {
      const values = Object.values(node).filter((v) => v !== undefined);
      separators += values.length * 2 - (values.length ? 1 : 0);
      values.forEach(visit);
    }
  };
  visit(value);
  return new TextEncoder().encode(JSON.stringify(value)).length + separators;
}

const refuse = (reason: string): BodyCheck => ({ ok: false, reason });

export function checkContentBody(family: string, body: unknown): BodyCheck {
  if (!(contentFamilies as readonly string[]).includes(family))
    return refuse("Unsupported content family");
  if (!isObject(body)) return refuse("Body must be an object");
  if (jsonbTextBytes(body) > contentLimits.bodyBytes)
    return refuse("Body is larger than 256 KB");
  const metadata = body.metadata;
  if (!isObject(metadata)) return refuse("Metadata is required");
  if (
    typeof metadata.title !== "string" ||
    charLength(btrim(metadata.title)) < 1 ||
    charLength(btrim(metadata.title)) > contentLimits.titleLength
  )
    return refuse("Title is required (1 to 200 characters)");

  switch (family as ContentFamily) {
    case "lesson": {
      const blocks = body.blocks;
      if (
        !Array.isArray(blocks) ||
        blocks.length < 1 ||
        blocks.length > contentLimits.lessonBlocks
      )
        return refuse("A lesson needs 1 to 500 blocks");
      for (const block of blocks)
        if (
          !isObject(block) ||
          typeof block.type !== "string" ||
          !(lessonBlockTypes as readonly string[]).includes(block.type)
        )
          return refuse("Unsupported lesson block");
      if ("sections" in body && !Array.isArray(body.sections))
        return refuse("Sections must be a list");
      return { ok: true };
    }
    case "analysis": {
      // Exactly one section per post: a single string, never a list or both.
      const { category, excerpt } = metadata;
      if (
        typeof category !== "string" ||
        !["fundamental", "technical"].includes(category)
      )
        return refuse("An analysis post belongs to exactly one section");
      if (
        typeof excerpt !== "string" ||
        charLength(btrim(excerpt)) < 1 ||
        charLength(btrim(excerpt)) > contentLimits.analysisExcerptLength
      )
        return refuse("Excerpt is required (1 to 300 characters)");
      const paragraphs = body.paragraphs;
      if (
        !Array.isArray(paragraphs) ||
        paragraphs.length < 1 ||
        paragraphs.length > contentLimits.analysisParagraphs
      )
        return refuse("An analysis post needs 1 to 200 paragraphs");
      for (const paragraph of paragraphs)
        if (typeof paragraph !== "string" || btrim(paragraph) === "")
          return refuse("Paragraphs cannot be blank");
      return { ok: true };
    }
    case "quiz": {
      const questions = body.questions;
      if (
        !Array.isArray(questions) ||
        questions.length < 1 ||
        questions.length > contentLimits.quizQuestions
      )
        return refuse("A quiz needs 1 to 100 questions");
      for (const question of questions)
        if (
          !isObject(question) ||
          !Array.isArray(question.choices) ||
          !Array.isArray(question.correctChoiceIds) ||
          question.choices.length < contentLimits.quizChoicesMin ||
          question.choices.length > contentLimits.quizChoicesMax ||
          question.correctChoiceIds.length < 1
        )
          return refuse(
            "Each question needs 2 to 10 choices and an answer key",
          );
      return { ok: true };
    }
    default:
      return { ok: true };
  }
}
