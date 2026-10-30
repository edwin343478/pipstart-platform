import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createEditorialRepository,
  EditorialError,
  type EditorialRpcClient,
} from "./editorial-adapter";

// The parameter names of every public RPC, read from the MP04a migration itself.
const migration = readFileSync(
  resolve(
    __dirname,
    "../../../../../supabase/migrations/20261030090000_pipstart_m22_editorial_store.sql",
  ),
  "utf8",
);
const signatures = new Map(
  [
    ...migration.matchAll(
      /create function public\.(pipstart_editorial_[a-z_]+)\(([^)]*)\)/g,
    ),
  ].map((m) => [
    m[1],
    m[2]
      .split(",")
      .map((arg) => arg.trim().split(/\s+/)[0])
      .sort(),
  ]),
);

function recorder(result: { data?: unknown; error?: { code: string } } = {}) {
  const calls: { fn: string; args: Record<string, unknown> }[] = [];
  const client: EditorialRpcClient = {
    rpc: (fn, args = {}) => {
      calls.push({ fn, args });
      return Promise.resolve({
        data: result.data ?? { ok: true },
        error: result.error ?? null,
      });
    },
  };
  return { calls, repo: createEditorialRepository(client) };
}

const lesson = {
  metadata: { title: "Lesson" },
  blocks: [{ type: "paragraph" as const, children: "One" }],
};

describe("M22 MP04b editorial adapter", () => {
  it("sends every store RPC exactly the parameter names the migration declares", async () => {
    const { calls, repo } = recorder();
    await repo.list();
    await repo.item("x");
    await repo.create({
      id: "new-lesson",
      family: "lesson",
      learningPath: "forex",
      parentId: "forex-module",
      body: lesson,
      reason: "first",
    });
    await repo.save("new-lesson", "lesson", 1, lesson, "second");
    await repo.submit("new-lesson", 2, "a".repeat(64));
    await repo.review("new-lesson", 2, "a".repeat(64), true, null);
    await repo.publish("new-lesson", 2, "a".repeat(64), null);
    await repo.trash("new-lesson", "replaced");
    await repo.restore("new-lesson", "back");
    await repo.hold("new-lesson", null);
    await repo.setReviewPolicy(true, 0);
    expect(signatures.size).toBe(11);
    expect(new Set(calls.map((c) => c.fn))).toEqual(new Set(signatures.keys()));
    for (const { fn, args } of calls)
      expect(Object.keys(args).sort(), fn).toEqual(signatures.get(fn));
  });

  it("maps store errors to stable kinds, including PT409 conflicts", async () => {
    for (const [code, kind] of [
      ["PT409", "conflict"],
      ["42501", "forbidden"],
      ["22023", "invalid"],
      ["55000", "state"],
      ["40001", "unavailable"],
      ["PGRST301", "unavailable"],
    ]) {
      const { repo } = recorder({ error: { code } });
      const error = await repo.item("x").catch((e: unknown) => e);
      expect(error, code).toBeInstanceOf(EditorialError);
      expect((error as EditorialError).kind, code).toBe(kind);
    }
  });

  it("refuses invalid identities, bodies and reasons before any network call", async () => {
    const { calls, repo } = recorder();
    const attempts = [
      () =>
        repo.create({
          id: "Bad ID",
          family: "lesson",
          learningPath: "forex",
          parentId: "m",
          body: lesson,
          reason: "x",
        }),
      () =>
        repo.create({
          id: "c",
          family: "course",
          learningPath: "forex",
          parentId: "x" as never,
          body: { metadata: { title: "C" } },
          reason: "x",
        }),
      () =>
        repo.create({
          id: "a",
          family: "analysis",
          learningPath: "forex" as never,
          parentId: null,
          body: {
            metadata: { title: "A", category: "technical", excerpt: "e" },
            paragraphs: ["p"],
          },
          reason: "x",
        }),
      () =>
        repo.create({
          id: "a",
          family: "analysis",
          learningPath: null,
          parentId: null,
          body: {
            metadata: {
              title: "A",
              category: ["fundamental", "technical"] as never,
              excerpt: "e",
            },
            paragraphs: ["p"],
          },
          reason: "x",
        }),
      () =>
        repo.create({
          id: "l",
          family: "lesson",
          learningPath: "forex",
          parentId: "m",
          body: lesson,
          reason: "",
        }),
      () =>
        repo.save(
          "l",
          "lesson",
          1,
          { metadata: { title: "L" }, blocks: [{ type: "script" }] },
          "x",
        ),
      () =>
        repo.save(
          "l",
          "quiz",
          1,
          { metadata: { title: "Q" }, questions: [{ choices: [{}, {}] }] },
          "x",
        ),
    ];
    for (const attempt of attempts) {
      const error = await Promise.resolve()
        .then(attempt)
        .catch((e: unknown) => e);
      expect((error as EditorialError).kind).toBe("invalid");
    }
    expect(calls).toEqual([]);
  });

  it("accepts an analysis post in exactly one section", async () => {
    const { calls, repo } = recorder();
    await repo.create({
      id: "gold-outlook",
      family: "analysis",
      learningPath: null,
      parentId: null,
      body: {
        metadata: { title: "Gold", category: "technical", excerpt: "Levels" },
        paragraphs: ["One"],
      },
      reason: "first",
    });
    expect(calls[0].args).toMatchObject({
      p_family: "analysis",
      p_learning_path: null,
      p_parent: null,
    });
  });
});
