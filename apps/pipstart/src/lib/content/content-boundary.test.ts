import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

// Client components are kept away from server-only modules by the M15-H1 graph test.
// These checks make sure everything holding private content is server-only in the first
// place, and that the public contract modules stay safe to import anywhere.
const src = resolve(__dirname, "../..");
const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? entry.name === "node_modules"
        ? []
        : files(join(dir, entry.name))
      : [join(dir, entry.name)],
  );
const sources = files(src).filter(
  (path) => /\.(ts|tsx)$/.test(path) && !/\.test\.|\.d\.ts$/.test(path),
);
// Read each source once: the checks below scan the whole tree several times.
const text = new Map(sources.map((path) => [path, readFileSync(path, "utf8")]));
const read = (path: string) => text.get(path) ?? readFileSync(path, "utf8");
const rel = (path: string) => relative(src, path).replaceAll("\\", "/");
const serverOnly = (path: string) =>
  /^import "server-only";\r?\n/.test(read(path));

function runtimeImports(path: string) {
  const source = ts.createSourceFile(
    path,
    readFileSync(path, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  return source.statements.flatMap((statement) => {
    if (!ts.isImportDeclaration(statement)) return [];
    const clause = statement.importClause;
    const bindings = clause?.namedBindings;
    const typeOnly =
      clause?.isTypeOnly ||
      (!clause?.name &&
        bindings &&
        ts.isNamedImports(bindings) &&
        bindings.elements.every((item) => item.isTypeOnly));
    return typeOnly
      ? []
      : [(statement.moduleSpecifier as ts.StringLiteral).text];
  });
}

// A cold first run on Windows can pass the 5 s default while TypeScript and the tree load.
describe("M22 MP04b content boundary", { timeout: 60_000 }, () => {
  it("marks every module that defines quiz answer keys server-only", () => {
    // lib/assessment.ts is the grader: it holds no quiz data, and its graded review is
    // deliberately returned to the learner after submission.
    const quizData = sources.filter(
      (path) =>
        rel(path) !== "lib/assessment.ts" &&
        /: AssessmentDefinition = \{|correctChoiceIds: \[/.test(read(path)),
    );
    expect(quizData.length).toBeGreaterThanOrEqual(21);
    for (const path of quizData) expect(serverOnly(path), rel(path)).toBe(true);
  });

  it("marks the lesson catalogue, private view and code adapter server-only", () => {
    for (const path of [
      "content/lesson-registry.ts",
      "lib/assessment-registry.ts",
      "lib/content/private.ts",
      "lib/content/code-adapter.ts",
    ])
      expect(serverOnly(join(src, path)), path).toBe(true);
  });

  it("keeps the contract, validator and public view free of runtime private imports", () => {
    expect(runtimeImports(join(src, "lib/content/contract.ts"))).toEqual([]);
    expect(runtimeImports(join(src, "lib/content/public.ts"))).toEqual([]);
    expect(runtimeImports(join(src, "lib/content/validate.ts"))).toEqual([
      "./contract",
    ]);
  });

  it("switches no route to the private view or code adapter (no cutover)", () => {
    const importers = sources.filter(
      (path) =>
        !rel(path).startsWith("lib/content/") &&
        /lib\/content\/(private|code-adapter)["']/.test(read(path)),
    );
    expect(importers.map(rel)).toEqual([]);
  });
});
