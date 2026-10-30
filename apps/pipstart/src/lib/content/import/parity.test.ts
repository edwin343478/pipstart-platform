import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { analysisPosts } from "../../../app/analysis/posts";
import sitemap from "../../../app/sitemap";
import { publishedLessons } from "../../../content/lesson-registry";
import { toPublicAssessment } from "../../assessment";
import {
  assessmentRegistry,
  getCurrentPublishedAssessment,
} from "../../assessment-registry";
import { learningPaths } from "../../curriculum";
import { jsonbSha256 } from "../jsonb";
import { toPublicQuiz } from "../public";
import { hrefFor } from "../routes";
import { buildImportManifest } from "./manifest";
import {
  shadowAnalysisPost,
  shadowCurriculum,
  shadowLesson,
  shadowQuiz,
  type StoreRow,
} from "./shadow";

// Store rows as the hosted store holds them: the import refuses any body whose hash differs
// from the manifest, and the hosted acceptance checks every stored hash against it, so these
// JSON round-tripped manifest bodies are byte-for-byte the store's bodies.
async function storeRows(): Promise<StoreRow[]> {
  const items = await buildImportManifest();
  const rows: StoreRow[] = [];
  for (const item of items) {
    const body = JSON.parse(JSON.stringify(item.body));
    expect(await jsonbSha256(body), item.id).toBe(item.bodySha256);
    rows.push({
      id: item.id,
      family: item.family,
      learningPath: item.learningPath,
      parentId: item.parentId,
      body,
    });
  }
  return rows;
}

describe("M22 MP05b shadow-read parity with today's site", async () => {
  const rows = await storeRows();
  const of = (family: StoreRow["family"]) =>
    rows.filter((r) => r.family === family);

  it("rebuilds every published lesson page exactly, including SEO fields and derived links", () => {
    const shadow = of("lesson").map(shadowLesson);
    expect(shadow).toHaveLength(publishedLessons.length);
    for (const lesson of publishedLessons) {
      const match = shadow.find(
        (s) => s.learningPath === lesson.learningPath && s.slug === lesson.slug,
      );
      expect(match, lesson.slug).toEqual(lesson);
    }
  });

  it("rebuilds every quiz with its exact ID, version, questions and answer key, and the same public payload", () => {
    const shadow = of("quiz").map(shadowQuiz);
    expect(shadow).toHaveLength(assessmentRegistry.length);
    for (const quiz of shadow) {
      const code = getCurrentPublishedAssessment(quiz.id)!;
      expect(quiz, quiz.id).toEqual(code);
      expect(toPublicQuiz(quiz)).toEqual(toPublicAssessment(code));
    }
  });

  it("rebuilds every analysis post in its single section", () => {
    expect(of("analysis").map(shadowAnalysisPost)).toEqual(analysisPosts);
  });

  it("rebuilds the whole curriculum tree: order, hrefs, progress lesson IDs and quiz links", () => {
    expect(shadowCurriculum(learningPaths, rows)).toEqual(learningPaths);
  });

  it("reproduces every learning and analysis URL in the sitemap", () => {
    const tree = shadowCurriculum(learningPaths, rows);
    const urls = new Set<string>([
      ...of("analysis").map((r) => hrefFor({ kind: "analysis", slug: r.id })),
      ...of("lesson").map((r) => shadowLesson(r).href),
      ...tree.flatMap((path) =>
        path.levels.flatMap((level) =>
          level.courses.flatMap((course) => [
            course.href,
            ...course.modules.flatMap((m) => [
              m.href,
              ...m.lessons.filter((i) => i.type === "quiz").map((i) => i.href),
            ]),
          ]),
        ),
      ),
    ]);
    const site = sitemap()
      .map((entry) => new URL(entry.url).pathname.replace(/\/$/, ""))
      .filter((path) =>
        /^\/(learn\/(forex|crypto)\/level-|analysis\/)/.test(path),
      );
    expect(new Set(site)).toEqual(urls);
  });

  it("detects a single changed field in any family (the comparison is not vacuous)", () => {
    const edit = (
      family: StoreRow["family"],
      change: (body: Record<string, unknown>) => void,
    ) =>
      rows.map((row) => {
        if (row.family !== family || row !== of(family)[0]) return row;
        const body = JSON.parse(JSON.stringify(row.body));
        change(body);
        return { ...row, body };
      });
    const lessonRows = edit(
      "lesson",
      (b) => ((b.metadata as Record<string, unknown>).seoTitle = "Changed"),
    );
    const changed = shadowLesson(
      lessonRows.find((r) => r.family === "lesson")!,
    );
    const original = publishedLessons.find(
      (l) => l.learningPath === changed.learningPath && l.slug === changed.slug,
    );
    expect(changed).not.toEqual(original);
    expect({ ...changed, seoTitle: original!.seoTitle }).toEqual(original);
    const quizRows = edit(
      "quiz",
      (b) =>
        ((b.questions as { correctChoiceIds: string[] }[])[0].correctChoiceIds =
          ["changed"]),
    );
    expect(
      quizRows.filter((r) => r.family === "quiz").map(shadowQuiz),
    ).not.toEqual(of("quiz").map(shadowQuiz));
    const moduleRows = edit(
      "module",
      (b) =>
        ((
          (b.metadata as Record<string, unknown>).placement as { order: number }
        ).order = 99),
    );
    expect(shadowCurriculum(learningPaths, moduleRows)).not.toEqual(
      learningPaths,
    );
    const postRows = edit(
      "analysis",
      (b) =>
        ((b.metadata as Record<string, unknown>).category = "fundamental-x"),
    );
    expect(
      postRows.filter((r) => r.family === "analysis").map(shadowAnalysisPost),
    ).not.toEqual(analysisPosts);
  });

  it("keeps every image reference, and each one resolves to a file in public/", () => {
    const blocks = of("lesson")
      .map(shadowLesson)
      .flatMap((l) => [
        ...l.blocks,
        ...(l.sections ?? []).flatMap((s) => s.blocks),
      ]);
    const assets = new Set(
      blocks.flatMap((b) =>
        b.type === "diagram"
          ? [b.src, b.desktopSrc].filter((s): s is `/${string}` => Boolean(s))
          : [],
      ),
    );
    expect(assets.size).toBe(110);
    const publicDir = resolve(__dirname, "../../../../public");
    for (const src of assets)
      expect(existsSync(publicDir + src), src).toBe(true);
  });
});
