import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { analysisPosts } from "../../app/analysis/posts";
import {
  cryptoGlossaryEntries,
  publishedLessons,
} from "../../content/lesson-registry";
import { assessmentRegistry } from "../assessment-registry";
import { learningPaths } from "../curriculum";
import {
  codeCurriculumPresentation,
  curriculumPresentation,
} from "../curriculum-presentation";
import { buildImportManifest, type ManifestItem } from "./import/manifest";
import { buildContentSnapshot, type SnapshotItem } from "./source";

type Item = Omit<SnapshotItem, "state" | "bodySha256">;

const asItems = (manifest: ManifestItem[]): Item[] =>
  manifest.map(({ id, family, learningPath, parentId, body }) => ({
    id,
    family,
    learningPath,
    parentId,
    revisionNo: 1,
    body,
  }));

// Loads the switched modules in a fresh module graph with the snapshot source on.
async function underSnapshot(items: Item[]) {
  const file = join(
    mkdtempSync(join(tmpdir(), "pipstart-snapshot-")),
    "s.json",
  );
  writeFileSync(
    file,
    JSON.stringify(buildContentSnapshot(items, "2026-10-30T00:00:00.000Z")),
  );
  vi.resetModules();
  vi.stubEnv("PIPSTART_CONTENT_SOURCE", "snapshot");
  vi.stubEnv("PIPSTART_CONTENT_SNAPSHOT", file);
  vi.stubEnv("VERCEL_ENV", "");
  return {
    registry: await import("../../content/lesson-registry"),
    curriculum: await import("../curriculum"),
    assessments: await import("../assessment-registry"),
    posts: await import("../../app/analysis/posts"),
    presentation: await import("../curriculum-presentation"),
    crypto: await import("../crypto-level-routing"),
    forex: await import("../forex-level-routing"),
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** A new course, module, later lesson and module quiz in one level, cloned from real items. */
function newItems(
  manifest: ManifestItem[],
  path: "crypto" | "forex",
  level: string,
): Item[] {
  const lesson = manifest.find(
    (item) =>
      item.family === "lesson" &&
      item.learningPath === path &&
      (item.body.metadata as { level: string }).level === level,
  )!;
  const quiz = manifest.find(
    (item) =>
      item.family === "quiz" &&
      item.learningPath === path &&
      (item.body.metadata as { placement: { route?: string } }).placement
        .route === "level" &&
      manifest.find((m) => m.id === item.parentId)!.parentId ===
        (lesson.body.metadata as { course: string }).course,
  )!;
  const course = `x-${path}-new-course`;
  const moduleId = `x-${path}-new-module`;
  const lessonBody = clone(lesson.body) as {
    metadata: Record<string, unknown>;
  };
  Object.assign(lessonBody.metadata, {
    slug: `x-${path}-new-lesson`,
    title: "A New Lesson From The Store",
    course,
    module: moduleId,
    position: 40,
    placement: { order: 1 },
  });
  const quizBody = clone(quiz.body) as { metadata: Record<string, unknown> };
  delete quizBody.metadata.presentation;
  Object.assign(quizBody.metadata, {
    assessmentId: `x-${path}-new-quiz`,
    title: "A New Module Quiz",
    courseId: course,
    moduleId,
    placement: { ...(quizBody.metadata.placement as object), order: 2 },
  });
  delete (quizBody.metadata.placement as { route?: string }).route;
  return [
    {
      id: course,
      family: "course",
      learningPath: path,
      parentId: null,
      revisionNo: 1,
      body: {
        metadata: {
          title: "A New Course",
          description: "A course created in the editorial store.",
          level,
          status: "published",
          placement: { order: 9 },
        },
      },
    },
    {
      id: moduleId,
      family: "module",
      learningPath: path,
      parentId: course,
      revisionNo: 1,
      body: {
        metadata: {
          title: "A New Module",
          description: "A module created in the editorial store.",
          status: "published",
          placement: { order: 1 },
        },
      },
    },
    {
      id: `x-${path}-new-lesson`,
      family: "lesson",
      learningPath: path,
      parentId: moduleId,
      revisionNo: 1,
      body: lessonBody,
    },
    {
      id: `x-${path}-new-quiz`,
      family: "quiz",
      learningPath: path,
      parentId: moduleId,
      revisionNo: 1,
      body: quizBody,
    },
  ];
}

describe("M22 MP05c-2 snapshot content source", () => {
  it("serves exactly today's content from a snapshot of today's manifest", async () => {
    const manifest = await buildImportManifest();
    const snap = await underSnapshot(asItems(manifest));
    expect(snap.registry.publishedLessons).toEqual(publishedLessons);
    expect(snap.registry.cryptoGlossaryEntries).toEqual(cryptoGlossaryEntries);
    expect(snap.curriculum.learningPaths).toEqual(learningPaths);
    expect(snap.assessments.assessmentRegistry).toEqual(assessmentRegistry);
    expect(snap.posts.analysisPosts).toEqual(analysisPosts);
    expect(snap.presentation.curriculumPresentation).toEqual(
      curriculumPresentation,
    );
    // The lesson order rule follows the curriculum's path order.
    expect(snap.registry.lessonPathOrder).toEqual(
      learningPaths.map((path) => path.id),
    );
    // Every presentation entry belongs to a real item, so none is lost in the store.
    const ids = new Set(manifest.map((item) => item.id));
    for (const id of Object.keys(codeCurriculumPresentation))
      expect(ids.has(id), id).toBe(true);
  });

  it("resolves a new Crypto course, module, lesson and module quiz without a code edit", async () => {
    const manifest = await buildImportManifest();
    const snap = await underSnapshot([
      ...asItems(manifest),
      ...newItems(manifest, "crypto", "level-2"),
    ]);
    const { crypto } = snap;
    expect(
      crypto.resolveCryptoSegment("level-2", "x-crypto-new-course"),
    ).toMatchObject({
      kind: "course",
      course: { href: "/learn/crypto/level-2/x-crypto-new-course" },
    });
    expect(
      crypto.resolveCryptoSegment("level-2", "x-crypto-new-lesson"),
    ).toMatchObject({
      kind: "lesson",
      lesson: { href: "/learn/crypto/level-2/x-crypto-new-lesson" },
    });
    expect(
      crypto.cryptoLessonContext("level-2", "x-crypto-new-course"),
    ).toMatchObject({
      contextTitle: "A New Course",
      contextHref: "/learn/crypto/level-2/x-crypto-new-course",
      progressKey: "pipstart:learn:crypto:level-2:x-crypto-new-course:progress",
    });
    expect(
      crypto.resolveCryptoModuleQuiz(
        "level-2",
        "x-crypto-new-course",
        "x-crypto-new-module",
      )?.quiz,
    ).toMatchObject({
      id: "x-crypto-new-quiz",
      href: "/learn/crypto/level-2/x-crypto-new-course/x-crypto-new-module/quiz",
    });
    expect(crypto.cryptoModuleQuizParams("level-2")).toEqual([
      { lesson: "x-crypto-new-course", module: "x-crypto-new-module" },
    ]);
    expect(
      snap.assessments.getCurrentPublishedAssessment("x-crypto-new-quiz"),
    ).toMatchObject({ courseId: "x-crypto-new-course" });
    // The existing level quiz keeps its URL.
    expect(crypto.cryptoLevelQuiz("level-2")?.quiz.href).toBe(
      "/learn/crypto/level-2/quiz",
    );
  });

  it("resolves a new Forex course, module, lesson and module quiz without a code edit", async () => {
    const manifest = await buildImportManifest();
    const snap = await underSnapshot([
      ...asItems(manifest),
      ...newItems(manifest, "forex", "level-2"),
    ]);
    const { forex } = snap;
    expect(
      forex.getGenericForexSecondSegment("level-2", "x-forex-new-course"),
    ).toMatchObject({ kind: "course" });
    expect(
      forex.getGenericForexSecondSegment("level-2", "x-forex-new-lesson"),
    ).toMatchObject({
      kind: "lesson",
      contextTitle: "X Forex New Module",
      progressKey: "pipstart:learn:forex:level-2:x-forex-new-course:progress",
      quizTarget: {
        href: "/learn/forex/level-2/x-forex-new-course/x-forex-new-module/quiz",
        label: "A New Module Quiz",
      },
    });
    expect(
      forex.getGenericForexModuleQuiz(
        "level-2",
        "x-forex-new-course",
        "x-forex-new-module",
      )?.quiz.id,
    ).toBe("x-forex-new-quiz");
    expect(forex.getGenericForexSecondSegmentParams()).toContainEqual({
      level: "level-2",
      segment: "x-forex-new-course",
    });
    // The existing level quiz keeps its URL and stays the level's quiz segment.
    expect(forex.forexLevelQuiz("level-2")?.quiz.id).toBe(
      "broker-foundations-quiz",
    );
  });
});
