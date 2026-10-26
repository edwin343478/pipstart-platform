import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { PreviewGallery } from "./gallery";
import { PreviewScreen } from "./preview-screen";
import { findScreen, neighboursOf, screens } from "./registry";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not found");
  },
  usePathname: () => "/admin/preview",
}));

const here = __dirname;
const app = join(here, "..", "..", "app");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css)$/.test(name) && !name.endsWith(".test.tsx")
      ? [path]
      : [];
  });
}

const read = (path: string) => readFileSync(path, "utf8");

describe("M22 MP01 admin design preview: registry", () => {
  it("lists the 27 approved screens with unique ids and numbers", () => {
    expect(screens).toHaveLength(27);
    expect(new Set(screens.map((screen) => screen.id)).size).toBe(27);
    expect(new Set(screens.map((screen) => screen.num)).size).toBe(27);
    for (const screen of screens) {
      expect(screen.id).toMatch(/^[a-z]\d-[a-z0-9-]+$/);
      expect(screen.title.length).toBeGreaterThan(3);
      expect(screen.note.length).toBeGreaterThan(20);
    }
  });

  it("chains every screen to its neighbours in order", () => {
    screens.forEach((screen, index) => {
      const { next, previous } = neighboursOf(screen.id);
      expect(previous?.id).toBe(screens[index - 1]?.id);
      expect(next?.id).toBe(screens[index + 1]?.id);
      expect(findScreen(screen.id)).toBe(screen);
    });
    expect(findScreen("../../etc/passwd")).toBeUndefined();
  });
});

describe("M22 MP01 admin design preview: markup", () => {
  it.each(screens.map((screen) => [screen.id]))(
    "renders %s as a sample-data page with one h1",
    (id) => {
      const html = renderToStaticMarkup(<PreviewScreen id={id} />);
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
      expect(html).toContain('id="main-content"');
      expect(html).toContain("sample data only");
      expect(html).toContain('role="note"');
      // Nothing on a preview page can send data anywhere.
      expect(html).not.toMatch(/<form[\s>]/);
      expect(html).not.toMatch(/\saction=/);
      expect(html).not.toMatch(/<script/);
      expect(html).not.toMatch(/href="https?:/);
      expect(html).not.toMatch(/<img[\s>]/);
      // Every button is a plain button, never a submit.
      for (const button of html.match(/<button\b[^>]*>/g) ?? []) {
        expect(button).toContain('type="button"');
      }
      // Fields are read-only and labelled.
      for (const field of html.match(/<(input|textarea)\b[^>]*>/g) ?? []) {
        if (/type="(checkbox|radio)"/.test(field)) continue;
        expect(field).toMatch(/readOnly=""|readonly=""/i);
      }
      for (const svg of html.match(/<svg\b[^>]*>/g) ?? []) {
        // Decorative icons are hidden; the sample QR code has a text label.
        expect(svg).toMatch(/aria-hidden="true"|aria-label="[^"]+"/);
      }
    },
  );

  it("makes the page behind a dialog inert", () => {
    const overlayScreens = screens.filter((screen) => screen.Overlay);
    expect(overlayScreens.length).toBeGreaterThanOrEqual(3);
    for (const screen of overlayScreens) {
      const html = renderToStaticMarkup(<PreviewScreen id={screen.id} />);
      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toMatch(/<main[^>]*inert=""/);
    }
  });

  it("shows the role-based navigation for each sample role", () => {
    const owner = renderToStaticMarkup(<PreviewScreen id="b1-overview" />);
    expect(owner).toContain("Roles &amp; access");
    const author = renderToStaticMarkup(<PreviewScreen id="c3-lesson" />);
    expect(author).not.toContain("Roles &amp; access");
  });

  it("links every gallery card to a screen that exists", () => {
    const html = renderToStaticMarkup(<PreviewGallery />);
    const hrefs = [...html.matchAll(/href="(\/admin\/preview\/[^"]+)"/g)].map(
      (match) => match[1],
    );
    expect(new Set(hrefs).size).toBe(27);
    for (const href of hrefs) {
      expect(findScreen(href.split("/").pop() ?? "")).toBeDefined();
    }
  });
});

describe("M22 MP01 admin design preview: gate and isolation", () => {
  it("checks the administrator before rendering any preview page", () => {
    for (const file of ["preview/page.tsx", "preview/[screen]/page.tsx"]) {
      const source = read(join(app, "admin", file));
      expect(source).toContain("await requireAdministrator()");
      expect(source.indexOf("await requireAdministrator()")).toBeLessThan(
        source.indexOf("<Preview"),
      );
    }
  });

  it("serves only the listed screens and keeps them out of search", () => {
    const page = read(join(app, "admin", "preview", "[screen]", "page.tsx"));
    expect(page).toContain("dynamicParams = false");
    expect(page).toContain("generateStaticParams");
    expect(page).toContain("notFound()");
    const layout = read(join(app, "admin", "preview", "layout.tsx"));
    expect(layout).toContain("index: false");
    expect(layout).toContain("follow: false");
  });

  it("links to the preview from the administration page only for administrators", () => {
    const page = read(join(app, "admin", "page.tsx"));
    expect(page).toContain("await requireAdministrator()");
    expect(page).toContain('href="/admin/preview"');
    expect(page).toContain("No administrative tools are published yet.");
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
      /dangerouslySetInnerHTML(?![^]*constant)/,
    ];
    const files = sourceFiles(here);
    expect(files.length).toBeGreaterThan(8);
    for (const file of files) {
      const source = read(file);
      for (const pattern of forbidden) {
        if (pattern.source.startsWith("dangerously")) {
          // Only the icon set may inject markup, and only from constants.
          if (!file.endsWith("icons.tsx")) {
            expect(source, file).not.toContain("dangerouslySetInnerHTML");
          }
          continue;
        }
        expect(source, `${file} ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("keeps the preview styles scoped to their own root", () => {
    const css = read(join(here, "admin-preview.module.css"));
    expect(css).not.toMatch(/^\s*(html|body|:root)\s*[,{]/m);
    expect(css).toContain("--muted2: #5b6678");
    expect(css).toContain(":focus-visible");
  });
});
