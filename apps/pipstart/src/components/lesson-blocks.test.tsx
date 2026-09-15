import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { LessonBlock } from "../content/lesson-content";
import { LessonBlocks } from "./lesson-blocks";

const styles = readFileSync(
  join(process.cwd(), "src/components/lesson-blocks.module.css"),
  "utf8",
);

const blocks: LessonBlock[] = [
  { type: "definition", term: "Pip", children: "A conventional price unit." },
  { type: "example", children: "A practical example." },
  { type: "warning", children: "A general warning." },
  { type: "keyPoint", points: ["Remember this."] },
  {
    type: "formula",
    expression: "risk = balance × rate",
    explanation: "An illustration.",
  },
  { type: "exercise", prompt: "Identify the base currency." },
  {
    type: "diagram",
    alt: "A labelled market diagram",
    height: 400,
    src: "/diagram.png",
    width: 600,
  },
  {
    type: "comparisonTable",
    caption: "Comparison",
    columns: ["A", "B"],
    rows: [["1", "2"]],
  },
  { type: "riskNotice", children: "Trading can result in losses." },
  {
    type: "affiliateDisclosure",
    children: "Some links may be affiliate links.",
  },
  { type: "quizPreview", title: "Check your knowledge", questionCount: 3 },
];

describe("reusable lesson blocks", () => {
  it("renders every publishing block with accessible semantics", () => {
    const markup = renderToStaticMarkup(<LessonBlocks blocks={blocks} />);
    expect(markup).toContain("Pip");
    expect(markup).toContain("risk = balance × rate");
    expect(markup).toContain('alt="A labelled market diagram"');
    expect(markup).toContain("<caption>Comparison</caption>");
    expect(markup).toContain('scope="col"');
    expect(markup).toContain("3 questions · Coming soon");
  });

  it("keeps wide tables scrollable and blocks compact on mobile", () => {
    expect(styles).toContain("overflow-x: auto");
    expect(styles).toMatch(/@media \(max-width: 767px\)/);
  });
});
