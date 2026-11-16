import { describe, expect, it } from "vitest";
import {
  bodyReferenceFindings,
  describeFinding,
  referenceReport,
  snapshotReferenceItems,
} from "./reference-check";
import { referenceTargets } from "./reference-targets";

const image = referenceTargets.assets.find((a) => a.startsWith("/images/"))!;
const tool = "/tools/risk-reward-calculator";
const lesson = (blocks: unknown[], extra: Record<string, unknown> = {}) => ({
  metadata: { title: "Lesson" },
  blocks,
  ...extra,
});

describe("MP10b body references", () => {
  it("accepts existing pages and images", () => {
    expect(
      bodyReferenceFindings(
        "l1",
        lesson([
          { type: "learningLink", title: "T", description: "D", href: tool },
          {
            type: "learningLink",
            title: "T",
            description: "D",
            href: "/tools",
          },
          {
            type: "diagram",
            alt: "A",
            src: image,
            desktopSrc: image,
            width: 1,
            height: 1,
          },
          { type: "paragraph", children: "Read /tools/nowhere in text." },
        ]),
      ),
    ).toEqual([]);
  });
  it("reports missing pages and images with their location, in order", () => {
    const findings = bodyReferenceFindings(
      "l1",
      lesson([
        { type: "paragraph", children: "x" },
        {
          type: "learningLink",
          title: "T",
          description: "D",
          href: "/tools/gone",
        },
        {
          type: "diagram",
          alt: "A",
          src: "/images/missing.svg",
          desktopSrc: "/images/also-missing.svg",
          width: 1,
          height: 1,
        },
      ]),
    );
    expect(findings).toEqual([
      {
        itemId: "l1",
        field: "blocks[1].href",
        reference: "/tools/gone",
        problem: "missing-page",
      },
      {
        itemId: "l1",
        field: "blocks[2].src",
        reference: "/images/missing.svg",
        problem: "missing-image",
      },
      {
        itemId: "l1",
        field: "blocks[2].desktopSrc",
        reference: "/images/also-missing.svg",
        problem: "missing-image",
      },
    ]);
    expect(describeFinding(findings[0])).toBe(
      "blocks[1].href links to a page that does not exist: /tools/gone",
    );
  });
  it("finds blocks inside lesson sections and a partner image", () => {
    expect(
      bodyReferenceFindings(
        "l2",
        lesson([{ type: "paragraph", children: "x" }], {
          sections: [
            {
              title: "S",
              entries: [
                {
                  sourceIndex: null,
                  value: {
                    type: "diagram",
                    alt: "A",
                    src: "/nope.png",
                    width: 1,
                    height: 1,
                  },
                },
              ],
            },
          ],
        }),
      ).map((f) => f.field),
    ).toEqual(["sections[0].entries[0].value.src"]);
    expect(
      bodyReferenceFindings("partner:p", {
        metadata: { title: "P" },
        image: { src: "/brokers/none.jpg", alt: "", width: 1, height: 1 },
      }),
    ).toEqual([
      {
        itemId: "partner:p",
        field: "image.src",
        reference: "/brokers/none.jpg",
        problem: "missing-image",
      },
    ]);
  });
  it("ignores a query or fragment on a tools link but not a different path", () => {
    expect(
      bodyReferenceFindings(
        "l",
        lesson([{ type: "learningLink", href: tool + "?a=1" }]),
      ),
    ).toEqual([]);
    expect(
      bodyReferenceFindings(
        "l",
        lesson([{ type: "learningLink", href: tool + "/x" }]),
      ),
    ).toHaveLength(1);
  });
  it("never treats external URLs or plain strings as internal references", () => {
    expect(
      bodyReferenceFindings("a", {
        metadata: {
          title: "Post",
          sources: [{ title: "S", url: "https://example.org/x" }],
        },
        paragraphs: ["/images/missing.svg is only text"],
      }),
    ).toEqual([]);
  });
});

describe("MP10b generation report", () => {
  const items = [
    {
      id: "c",
      family: "course",
      parentId: null,
      body: { metadata: { title: "C" } },
    },
    {
      id: "m",
      family: "module",
      parentId: "c",
      body: { metadata: { title: "M" } },
    },
    {
      id: "l",
      family: "lesson",
      parentId: "m",
      body: lesson([{ type: "learningLink", href: tool }]),
    },
    {
      id: "q",
      family: "quiz",
      parentId: "m",
      body: {
        metadata: { title: "Q", courseId: "c", moduleId: "m", lessonId: "l" },
      },
    },
  ];
  it("is clean for a coherent generation", () => {
    expect(referenceReport(items)).toEqual([]);
  });
  it("reports missing parents and quiz targets", () => {
    const broken = [
      ...items.filter((i) => i.id !== "m" && i.id !== "q"),
      {
        id: "q",
        family: "quiz",
        parentId: "m",
        body: {
          metadata: {
            title: "Q",
            courseId: "c",
            moduleId: "m",
            lessonId: "gone",
          },
        },
      },
    ];
    expect(
      referenceReport(broken).map((f) => `${f.itemId}:${f.field}:${f.problem}`),
    ).toEqual([
      "l:parent:missing-parent",
      "q:parent:missing-parent",
      "q:metadata.moduleId:missing-quiz-target",
      "q:metadata.lessonId:missing-quiz-target",
    ]);
  });
  it("reads snapshot items with partners and their links", () => {
    const text = JSON.stringify({
      format: "pipstart-content-snapshot",
      items: [
        {
          id: "c",
          family: "course",
          parentId: null,
          body: { metadata: { title: "C" } },
        },
      ],
      partners: [
        {
          id: "partner:p",
          body: { metadata: { title: "P" }, image: null },
          links: [{ id: "link:p", body: { url: "https://x.example" } }],
        },
      ],
    });
    expect(
      snapshotReferenceItems(text).map(
        (i) => `${i.id}/${i.family}/${i.parentId}`,
      ),
    ).toEqual([
      "c/course/null",
      "partner:p/partner/null",
      "link:p/link/partner:p",
    ]);
    expect(() => snapshotReferenceItems("{}")).toThrow("Snapshot has no items");
  });
});
