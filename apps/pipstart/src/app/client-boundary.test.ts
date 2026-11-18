import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Server/client boundary guard (found by the Package 6 journey, run 4): a server page, layout or route may import
// components from a "use client" module, but never a plain value or function. In a production build such an
// import is only a client reference, and calling it on the server fails the request (the new-quiz page did this).
const src = resolve(__dirname, "..");
const SERVER_FILES =
  /^(page|layout|template|default|not-found|route|opengraph-image|twitter-image|icon|sitemap|robots)\.(ts|tsx)$/;
const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const isClient = (file: string) =>
  /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(
    readFileSync(file, "utf8"),
  );
function resolveImport(from: string, spec: string): string | null {
  const base = spec.startsWith("@/")
    ? join(src, spec.slice(2))
    : spec.startsWith(".")
      ? resolve(dirname(from), spec)
      : null;
  if (!base) return null;
  for (const c of [
    base,
    base + ".tsx",
    base + ".ts",
    join(base, "index.tsx"),
    join(base, "index.ts"),
  ])
    if (existsSync(c) && statSync(c).isFile()) return c;
  return null;
}
/** Value imports (not type-only) a server file takes from client modules, as "file: name". */
export function clientValueImports(file: string): string[] {
  const text = readFileSync(file, "utf8");
  if (isClient(file)) return [];
  const out: string[] = [];
  const re = /import\s+(type\s+)?([^;]*?)\s+from\s+["']([^"']+)["']/g;
  for (const m of text.matchAll(re)) {
    if (m[1]) continue;
    const target = resolveImport(file, m[3]);
    if (!target || !isClient(target)) continue;
    const clause = m[2].trim();
    const named = /\{([\s\S]*)\}/.exec(clause)?.[1] ?? "";
    for (const part of named.split(",")) {
      const p = part.trim();
      if (!p || p.startsWith("type ")) continue;
      const name = p.split(/\s+as\s+/)[0].trim();
      if (!/^[A-Z]/.test(name)) out.push(m[3] + ": " + name);
    }
  }
  return out;
}

describe("server/client boundary", () => {
  const files = walk(join(src, "app")).filter((f) =>
    SERVER_FILES.test(f.split(/[\\/]/).pop() ?? ""),
  );
  it("finds the server entry files", () => {
    expect(files.length).toBeGreaterThan(50);
  });
  it("never imports a plain value or function from a client module into a server page, layout or route", () => {
    const offending = files.flatMap((f) =>
      clientValueImports(f).map((x) => f.slice(src.length + 1) + " -> " + x),
    );
    expect(offending).toEqual([]);
  });
});
