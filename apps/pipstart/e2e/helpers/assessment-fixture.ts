import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import type { AssessmentDefinition } from "../../src/lib/assessment";

// Node-side test fixture only: read the approved private definition without
// shipping answer keys to browser code or maintaining duplicate answer letters.
export function loadAssessmentFixture(file: string, exportName: string) {
  const filename = resolve(process.cwd(), "src/lib", file);
  const source = readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;
  const exports: Record<string, unknown> = {};
  runInNewContext(
    output,
    {
      exports,
      require(name: string) {
        if (name === "server-only") return {};
        throw new Error(
          `Unexpected runtime dependency in assessment fixture: ${name}`,
        );
      },
    },
    { filename, timeout: 1_000 },
  );
  const definition = exports[exportName] as AssessmentDefinition | undefined;
  if (
    !definition ||
    definition.learningPath !== "crypto" ||
    definition.status !== "published"
  ) {
    throw new Error(`Published Crypto fixture not found: ${exportName}`);
  }
  return definition;
}
