import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const here = __dirname;
const src = join(here, "..", "..");
const app = join(src, "app");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) && !/\.test\.tsx?$/.test(name)
      ? [path]
      : [];
  });
}

const read = (path: string) => readFileSync(path, "utf8");

// The MP01 sample-data preview is retired. Its approved visual tokens remain
// the shared design system for the real staff screens.
describe("M22 approved administration design system", () => {
  it("keeps only the shared styles, icons and primitives", () => {
    expect(readdirSync(here).sort()).toEqual([
      "admin-preview.module.css",
      "admin-preview.test.tsx",
      "icons.tsx",
      "primitives.tsx",
    ]);
  });

  it("uses no data, auth, network or storage code", () => {
    const forbidden = [
      /supabase/i,
      /lib\/auth/,
      /\bfetch\(/,
      /use server/,
      /use client/,
      /localStorage|sessionStorage|document\.cookie/,
      /process\.env/,
    ];
    for (const file of sourceFiles(here)) {
      const source = read(file);
      for (const pattern of forbidden)
        expect(source, `${file} ${pattern}`).not.toMatch(pattern);
      // Only the icon set may inject markup, and only from constants.
      if (!file.endsWith("icons.tsx"))
        expect(source, file).not.toContain("dangerouslySetInnerHTML");
    }
  });

  it("keeps the shared styles scoped to their own root", () => {
    const css = read(join(here, "admin-preview.module.css"));
    expect(css).not.toMatch(/^\s*(html|body|:root)\s*[,{]/m);
    expect(css).toContain("--muted2: #5b6678");
    expect(css).toContain(":focus-visible");
  });
});

describe("M22 MP03 legacy administration gate retirement", () => {
  it("serves no sample preview route", () => {
    expect(existsSync(join(app, "admin", "preview"))).toBe(false);
  });

  it("sends /admin to staff entry instead of a profile-role check", () => {
    const page = read(join(app, "admin", "page.tsx"));
    expect(page).toContain("redirect(STAFF_ENTRY_PATH)");
    expect(page).not.toMatch(
      /pipstart_profiles|\.select\(|requireAdministrator/,
    );
  });

  it("grants no authority from the legacy profile role anywhere", () => {
    for (const file of sourceFiles(src)) {
      const source = read(file);
      expect(source, file).not.toContain("requireAdministrator");
      expect(source, file).not.toContain("/admin/preview");
      expect(source, file).not.toMatch(/\.select\(\s*["']role["']\s*\)/);
    }
  });
});
