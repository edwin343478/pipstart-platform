import { describe, expect, expectTypeOf, it } from "vitest";
import { analysisPosts } from "../../app/analysis/posts";
import type { LessonBlock } from "../../content/lesson-content";
import { publishedLessons } from "../../content/lesson-registry";
import { assessmentRegistry } from "../assessment-registry";
import fixtures from "./content-shape-fixtures.json";
import { lessonBlockTypes } from "./contract";
import { checkContentBody, jsonbTextBytes } from "./validate";

describe("M22 MP04b structural validation mirrors the MP04a store", () => {
  it.each(fixtures.cases)("$name", ({ family, body, valid }) => {
    expect(checkContentBody(family, body).ok).toBe(valid);
  });

  it("accepts exactly the 22 lesson block types the code renders", () => {
    expect(lessonBlockTypes).toHaveLength(22);
    expect(new Set(lessonBlockTypes).size).toBe(22);
    type Missing = Exclude<
      LessonBlock["type"],
      (typeof lessonBlockTypes)[number]
    >;
    expectTypeOf<Missing>().toEqualTypeOf<never>();
  });

  it("measures size as PostgreSQL prints jsonb, with a space after every separator", () => {
    expect(jsonbTextBytes({})).toBe(2);
    expect(jsonbTextBytes([])).toBe(2);
    // {"a": 1, "b": [1, 2]} is 21 bytes; JSON.stringify gives 17.
    expect(jsonbTextBytes({ a: 1, b: [1, 2] })).toBe(21);
    expect(jsonbTextBytes({ t: "é" })).toBe('{"t": "é"}'.length + 1);
    const limit = 262144,
      base = { metadata: { title: "Lesson" }, blocks: [] as LessonBlock[] };
    const filler = (n: number) => ({
      ...base,
      blocks: [{ type: "paragraph" as const, children: "x".repeat(n) }],
    });
    const fit = limit - jsonbTextBytes(filler(0));
    expect(jsonbTextBytes(filler(fit))).toBe(limit);
    expect(checkContentBody("lesson", filler(fit)).ok).toBe(true);
    expect(checkContentBody("lesson", filler(fit + 1)).ok).toBe(false);
  });

  it("accepts every published lesson, quiz and analysis post in code as a store body", () => {
    for (const lesson of publishedLessons)
      expect(
        checkContentBody("lesson", {
          metadata: { title: lesson.title },
          blocks: lesson.blocks,
          ...(lesson.sections ? { sections: lesson.sections } : {}),
        }),
        lesson.slug,
      ).toEqual({ ok: true });
    for (const quiz of assessmentRegistry)
      expect(
        checkContentBody("quiz", {
          metadata: { title: quiz.title },
          questions: quiz.questions,
        }),
        quiz.id,
      ).toEqual({ ok: true });
    for (const post of analysisPosts)
      expect(
        checkContentBody("analysis", {
          metadata: {
            title: post.title,
            category: post.category,
            excerpt: post.excerpt,
          },
          paragraphs: post.body,
        }),
        post.slug,
      ).toEqual({ ok: true });
  });
});
