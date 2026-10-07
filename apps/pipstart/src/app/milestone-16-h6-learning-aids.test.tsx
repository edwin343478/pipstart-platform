import CryptoGlossaryPage from "./glossary/crypto/page";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  cryptoGlossaryEntries,
  cryptoLessonDocuments,
  forexLessonDocuments,
} from "../content/lesson-registry";
import { LessonBlocks } from "../components/lesson-blocks";
import { validateLessonForPublication } from "../content/lesson-content";
import {
  buildCryptoGlossary,
  cryptoTermSlug,
} from "../lib/crypto-learning-aids";
import { prepareLessonPageData } from "../lib/lesson-page-server-data";
const diagrams = cryptoLessonDocuments.flatMap((lesson) =>
  lesson.blocks.filter((block) => block.type === "diagram"),
);
describe("M16-H6 accessible learning aids", () => {
  it("gives every Crypto diagram distinct alt text, a native description and a real original file", () => {
    expect(diagrams).toHaveLength(41);
    for (const diagram of diagrams) {
      expect(diagram.alt).not.toBe(diagram.caption);
      expect(diagram.description?.length).toBeGreaterThan(0);
      expect(
        fs.existsSync(path.join(process.cwd(), "public", diagram.src)),
      ).toBe(true);
      const html = renderToStaticMarkup(<LessonBlocks blocks={[diagram]} />);
      expect(html).toContain("Read diagram as text");
      expect(html).toContain(`href="${diagram.src}"`);
      expect(html).toContain("<details");
      expect(html).not.toContain("<details open");
    }
  });
  it("retains all approved definition occurrences and repeated terms' distinct meanings", () => {
    const definitions = cryptoLessonDocuments.flatMap((lesson) =>
      lesson.blocks.filter((block) => block.type === "definition"),
    );
    expect(definitions).toHaveLength(120);
    for (const definition of definitions) {
      const entry = cryptoGlossaryEntries.find(
        (term) => term.slug === cryptoTermSlug(definition.term),
      );
      expect(
        entry?.meanings.some(
          (meaning) => meaning.definition === definition.children,
        ),
      ).toBe(true);
    }
    expect(cryptoGlossaryEntries).toHaveLength(120);
    expect(
      cryptoGlossaryEntries.find((term) => term.name === "Slashing")?.meanings,
    ).toHaveLength(2);
    expect(
      cryptoGlossaryEntries.every(
        (term) => !term.name.startsWith("Definition —"),
      ),
    ).toBe(true);
    expect(new Set(cryptoGlossaryEntries.map((term) => term.slug)).size).toBe(
      cryptoGlossaryEntries.length,
    );
  });
  it("links each meaning to its actual published Crypto lessons", () => {
    for (const entry of cryptoGlossaryEntries)
      for (const meaning of entry.meanings)
        for (const target of meaning.lessons) {
          const lesson = cryptoLessonDocuments.find(
            (item) => item.href === target.href,
          );
          expect(lesson).toBeDefined();
          expect(
            lesson?.blocks.some(
              (block) =>
                block.type === "definition" &&
                block.children === meaning.definition,
            ),
          ).toBe(true);
        }
  });
  it("excludes draft and unapproved definitions", () => {
    const lesson = cryptoLessonDocuments[0];
    const fixture = {
      metadata: { ...lesson, status: "draft" as const },
      blocks: [
        {
          type: "definition" as const,
          term: "Draft sentinel",
          children: "Must not appear",
        },
      ],
      href: lesson.href,
    };
    const entries = buildCryptoGlossary([
      fixture,
      {
        ...fixture,
        metadata: { ...fixture.metadata, status: "published", approved: false },
      },
    ]);
    expect(entries.some((entry) => entry.slug === "draft-sentinel")).toBe(
      false,
    );
  });
  it("sends only active lesson key terms and leaves Forex payloads unchanged", () => {
    for (const lesson of cryptoLessonDocuments) {
      const data = prepareLessonPageData({
        path: "crypto",
        lesson,
        lessons: cryptoLessonDocuments,
        contextTitle: "Crypto",
        contextHref: "/learn/crypto",
      });
      expect(data.lesson.keyTerms?.map((term) => term.href)).toEqual(
        lesson.relatedTermSlugs.map((slug) => `/glossary/crypto#${slug}`),
      );
      for (const term of data.lesson.keyTerms ?? [])
        expect(
          cryptoGlossaryEntries.some((entry) =>
            term.href.endsWith(`#${entry.slug}`),
          ),
        ).toBe(true);
    }
    const lesson = forexLessonDocuments[0];
    expect(
      prepareLessonPageData({
        path: "forex",
        lesson,
        lessons: forexLessonDocuments,
        contextTitle: "Forex",
        contextHref: "/learn/forex",
      }).lesson.keyTerms,
    ).toBeUndefined();
  });
  it("rejects duplicate Crypto alt/caption and empty descriptions", () => {
    const lesson = cryptoLessonDocuments.find((lesson) =>
      lesson.blocks.some((block) => block.type === "diagram"),
    )!;
    const diagram = lesson.blocks.find((block) => block.type === "diagram")!;
    const document = {
      metadata: lesson,
      blocks: [{ ...diagram, alt: diagram.caption! }],
    };
    expect(() => validateLessonForPublication(document)).toThrow(
      "alternative text must differ",
    );
    expect(() =>
      validateLessonForPublication({
        ...document,
        blocks: [{ ...diagram, description: [""] }],
      }),
    ).toThrow("description must contain nonempty text");
  });
  it("makes wide tables keyboard focusable with a name", () => {
    const html = renderToStaticMarkup(
      <LessonBlocks
        blocks={[
          {
            type: "comparisonTable",
            caption: "Two prices",
            columns: ["Asset", "Price"],
            rows: [["Practice", "100"]],
          },
        ]}
      />,
    );
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Two prices"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('scope="col"');
  });
  it("renders the complete native glossary with a scoped no-script stream reveal", async () => {
    const page = await CryptoGlossaryPage({
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page);
    expect(html.match(/<article\b/g)).toHaveLength(120);
    expect(html).toContain('id="gas"');
    expect(html).toContain("<noscript>");
    expect(html).toContain("@layer base");
    expect(html).toContain("[hidden]:has([data-crypto-glossary])");
    expect(html).toContain(
      "body:has([data-crypto-glossary]) [data-route-loading]",
    );
    expect(html).toContain('method="get"');
  });
});
