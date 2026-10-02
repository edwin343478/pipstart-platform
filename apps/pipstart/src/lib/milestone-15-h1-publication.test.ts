import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import ts from "typescript";
import { describe, it, expect, vi } from "vitest";
import { getPublishedLessons } from "../content/lesson-registry";
import { prepareLessonPageData } from "./lesson-page-server-data";
import { getForexQuizClientContext } from "./forex-quiz-context";
vi.mock("../components/lesson-bookmark-button", () => ({
  LessonBookmarkButton: () => null,
}));
import { LessonPage } from "../components/lesson-page";

const src = resolve(process.cwd(), "src");
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(dir, entry.name))
      : [join(dir, entry.name)],
  );
}
const sourceFiles = files(src).filter(
  (path) =>
    /\.(ts|tsx|mts|mdx)$/.test(path) &&
    !/\.test\.|\/test\/|\.d\.ts$/.test(path),
);
function imports(path: string) {
  if (path.endsWith(".mdx")) return [];
  const source = ts.createSourceFile(
    path,
    readFileSync(path, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    path.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const result: string[] = [];
  function visit(node: ts.Node) {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const clause = node.importClause;
      const bindings = clause?.namedBindings;
      const typeOnly =
        clause?.isTypeOnly ||
        (!clause?.name &&
          bindings &&
          ts.isNamedImports(bindings) &&
          bindings.elements.every((item) => item.isTypeOnly));
      if (!typeOnly) result.push(node.moduleSpecifier.text);
    }
    if (
      ts.isExportDeclaration(node) &&
      !node.isTypeOnly &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const onlyTypes =
        node.exportClause &&
        ts.isNamedExports(node.exportClause) &&
        node.exportClause.elements.every((item) => item.isTypeOnly);
      if (!onlyTypes) result.push(node.moduleSpecifier.text);
    }
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require")) &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    )
      result.push(node.arguments[0].text);
    ts.forEachChild(node, visit);
  }
  visit(source);
  return result;
}
function resolveImport(path: string, specifier: string) {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/"))
    return undefined;
  const base = specifier.startsWith("@/")
    ? resolve(src, specifier.slice(2))
    : resolve(dirname(path), specifier);
  return [
    base,
    ...[".ts", ".tsx", ".mts", ".mdx", "/index.ts", "/index.tsx"].map(
      (suffix) => base + suffix,
    ),
  ].find((path) => existsSync(path) && /\.(ts|tsx|mts|mdx)$/.test(path));
}

describe("Milestone 15-H1 publication boundaries", () => {
  it("keeps every client entry's runtime dependency graph outside the catalogue", () => {
    const visited = new Set<string>();
    function walk(path: string, chain: string[]) {
      if (visited.has(path)) return;
      visited.add(path);
      const source = readFileSync(path, "utf8");
      if (/^\s*["']use server["'];/.test(source)) return; // Next sends an action reference, not its implementation.
      const deps = imports(path);
      expect(deps, chain.join(" -> ")).not.toContain("server-only");
      expect(
        relative(src, path).replaceAll("\\", "/"),
        chain.join(" -> "),
      ).not.toMatch(/^content\/lessons\//);
      for (const dep of deps) {
        const next = resolveImport(path, dep);
        if (next) walk(next, [...chain, relative(src, next)]);
      }
    }
    const clients = sourceFiles.filter((path) =>
      /^\s*["']use client["'];/.test(readFileSync(path, "utf8")),
    );
    expect(clients.length).toBeGreaterThan(10);
    for (const client of clients) walk(client, [relative(src, client)]);
  });
  it.each(Array.from({ length: 11 }, (_, level) => `level-${level}`))(
    "sends only one current lesson body and compact navigation for %s",
    (level) => {
      const lessons = getPublishedLessons({ learningPath: "forex", level });
      for (const lesson of lessons) {
        const props = {
          path: "forex" as const,
          lesson,
          lessons,
          contextTitle: "Test",
          contextHref: "/learn/forex",
        };
        const data = prepareLessonPageData(props);
        expect(data.lesson.sections).toEqual(lesson.sections);
        expect(data.lesson.blocks).toEqual(
          lesson.sections?.length ? [] : lesson.blocks,
        );
        expect(data.lessons).toEqual(
          lessons.map(({ id, title, href }) => ({ id, title, href })),
        );
        expect(Object.keys(data.lesson)).not.toContain("seoDescription");
        const page = LessonPage(props);
        expect(page.props).toEqual(data);
        for (const row of page.props.lessons)
          expect(Object.keys(row).sort()).toEqual(["href", "id", "title"]);
      }
    },
  );
  it("refuses unpublished or unapproved current lessons and excludes draft sidebar bodies", () => {
    const lesson = getPublishedLessons({
      learningPath: "forex",
      level: "level-10",
    })[0];
    const props = {
      path: "forex" as const,
      lesson,
      lessons: [lesson],
      contextTitle: "Test",
      contextHref: "/learn/forex",
    };
    expect(() =>
      prepareLessonPageData({
        ...props,
        lesson: { ...lesson, status: "draft" },
      }),
    ).toThrow("Only approved published");
    expect(() =>
      prepareLessonPageData({
        ...props,
        lesson: { ...lesson, approved: false },
      }),
    ).toThrow("Only approved published");
    const data = prepareLessonPageData({
      ...props,
      lessons: [lesson, { ...lesson, id: "private-draft", status: "draft" }],
    });
    expect(data.lessons).toHaveLength(1);
  });
  it("passes compact quiz contexts for all ten Forex modules without sibling content or answer keys", () => {
    for (let level = 1; level <= 10; level++) {
      const first = getPublishedLessons({
        learningPath: "forex",
        level: `level-${level}`,
      })[0];
      const context = getForexQuizClientContext(first.course, first.module)!;
      expect(context).toBeDefined();
      expect(context.lessonIds).toEqual(context.lessons.map((item) => item.id));
      for (const item of [
        ...context.lessons,
        context.course,
        context.module,
        context.quiz,
      ])
        expect(Object.keys(item).sort()).toEqual(["href", "id", "title"]);
      expect(JSON.stringify(context)).not.toMatch(
        /correctChoiceIds|sections|blocks|This draft is not approved/,
      );
    }
    expect(
      getForexQuizClientContext("forex-kindergarten", "broker-foundations"),
    ).toBeUndefined();
  });
});
