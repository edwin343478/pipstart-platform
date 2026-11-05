import type { LessonEditableBlock } from "@/lib/content/lesson-draft-contract";
export const lessonBlockLabels: Record<LessonEditableBlock["type"], string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  learningLink: "Tool link",
  section: "Paragraph group",
  references: "References",
  riskStatement: "Risk statement",
  list: "List",
  quote: "Quote",
  reflection: "Reflection",
  takeaway: "Takeaway",
  definition: "Definition",
  example: "Example",
  warning: "Warning",
  keyPoint: "Key points",
  formula: "Formula",
  exercise: "Exercise",
  practice: "Worked practice",
  diagram: "Diagram",
  comparisonTable: "Comparison table",
  riskNotice: "Risk notice",
  affiliateDisclosure: "Affiliate disclosure",
  quizPreview: "Quiz introduction",
};
export function newLessonBlock(
  type: LessonEditableBlock["type"],
  assets: string[],
): LessonEditableBlock {
  switch (type) {
    case "heading":
      return { type, children: "", level: 2 };
    case "paragraph":
    case "quote":
    case "riskStatement":
    case "affiliateDisclosure":
      return { type, children: "" };
    case "learningLink":
      return { type, title: "", description: "", href: "/tools" };
    case "section":
      return { type, title: "", paragraphs: [""] };
    case "references":
      return { type, items: [{ title: "", url: "https://" }] };
    case "list":
      return { type, style: "unordered", items: [""] };
    case "reflection":
      return { type, title: "", points: [""] };
    case "takeaway":
    case "example":
    case "warning":
    case "riskNotice":
      return { type, children: "" };
    case "definition":
      return { type, term: "", children: "" };
    case "keyPoint":
      return { type, points: [""], checklist: false };
    case "formula":
      return { type, expression: "", explanation: "" };
    case "exercise":
      return { type, prompt: "" };
    case "practice":
      return { type, title: "", prompts: [""], answers: [""] };
    case "diagram":
      return {
        type,
        src: (assets[0] ?? "/unavailable.svg") as `/${string}`,
        alt: "",
        width: 600,
        height: 400,
      };
    case "comparisonTable":
      return { type, columns: ["", ""], rows: [["", ""]] };
    case "quizPreview":
      return { type, title: "", questionCount: 1 };
  }
}
type Spec = {
  text: string[];
  optional?: string[];
  lines?: string[];
  optionalLines?: string[];
};
const specs: Record<LessonEditableBlock["type"], Spec> = {
  heading: { text: ["children"] },
  paragraph: { text: ["children"] },
  learningLink: { text: ["title", "description", "href"] },
  section: { text: ["title"], lines: ["paragraphs"] },
  references: { text: [] },
  riskStatement: { text: ["children"] },
  list: { text: [], lines: ["items"] },
  quote: { text: ["children"] },
  reflection: {
    text: ["title"],
    lines: ["points"],
    optionalLines: ["introduction", "closing"],
  },
  takeaway: { text: [], optional: ["title"] },
  definition: { text: ["term", "children"] },
  example: { text: [], optional: ["title"] },
  warning: { text: [], optional: ["title"] },
  keyPoint: { text: [], optional: ["title"], lines: ["points"] },
  formula: { text: ["expression", "explanation"] },
  exercise: { text: ["prompt"] },
  practice: { text: ["title"], lines: ["prompts", "answers"] },
  diagram: {
    text: ["alt"],
    optional: ["caption"],
    optionalLines: ["description"],
  },
  comparisonTable: { text: [], optional: ["caption"] },
  riskNotice: { text: [] },
  affiliateDisclosure: { text: ["children"] },
  quizPreview: { text: ["title"] },
};
const labels: Record<string, string> = {
  children: "Content",
  href: "Local tool route",
  alt: "Alternative text",
  questionCount: "Question count",
  desktopSrc: "Desktop diagram",
  src: "Diagram asset",
  introduction: "Introduction paragraphs",
  closing: "Closing paragraphs",
  points: "Points",
  prompts: "Practice prompts",
  answers: "Worked answers",
  paragraphs: "Paragraphs",
  items: "Items",
  title: "Title",
  description: "Description",
  caption: "Caption",
  term: "Term",
  expression: "Expression",
  explanation: "Explanation",
  prompt: "Exercise prompt",
  width: "Width",
  height: "Height",
};
export function TextList({
  label,
  values,
  onChange,
  optional = false,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  optional?: boolean;
}) {
  return (
    <fieldset>
      <legend>{label}</legend>
      {values.map((v, i) => (
        <div key={i}>
          <label>
            {label + " " + (i + 1)}
            <textarea
              rows={2}
              maxLength={12000}
              value={v}
              onChange={(e) =>
                onChange(values.map((x, n) => (n === i ? e.target.value : x)))
              }
            />
          </label>
          <button
            type="button"
            disabled={!optional && values.length === 1}
            onClick={() => onChange(values.filter((_, n) => n !== i))}
          >
            Remove {label.toLowerCase()} {i + 1}
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={values.length >= 100}
        onClick={() => onChange([...values, ""])}
      >
        Add {label.toLowerCase()}
      </button>
    </fieldset>
  );
}
/** Lesson-level sources: HTTPS citations shown with the lesson. Drafts may have none. */
export function SourceList({
  values,
  onChange,
}: {
  values: { title: string; url: string }[];
  onChange: (v: { title: string; url: `https://${string}` }[]) => void;
}) {
  const update = (next: { title: string; url: string }[]) =>
    onChange(next as { title: string; url: `https://${string}` }[]);
  return (
    <fieldset>
      <legend>Sources</legend>
      <p>
        At least one HTTPS source is required before this lesson can be sent to
        a reviewer or published. Drafts can be saved without one.
      </p>
      {!values.length && <p>No sources yet.</p>}
      {values.map((item, i) => (
        <div key={i}>
          <label>
            Source title {i + 1}
            <input
              required
              maxLength={200}
              value={item.title}
              onChange={(e) =>
                update(
                  values.map((r, n) =>
                    n === i ? { ...r, title: e.target.value } : r,
                  ),
                )
              }
            />
          </label>
          <label>
            Source URL {i + 1}
            <input
              required
              type="url"
              maxLength={2048}
              value={item.url}
              onChange={(e) =>
                update(
                  values.map((r, n) =>
                    n === i ? { ...r, url: e.target.value } : r,
                  ),
                )
              }
            />
          </label>
          <button
            type="button"
            onClick={() => update(values.filter((_, n) => n !== i))}
          >
            Remove source {i + 1}
          </button>
        </div>
      ))}
      <button
        type="button"
        disabled={values.length >= 50}
        onClick={() => update([...values, { title: "", url: "https://" }])}
      >
        Add source
      </button>
    </fieldset>
  );
}
export function LessonBlockFields({
  block,
  onChange,
  assets,
}: {
  block: LessonEditableBlock;
  onChange: (b: LessonEditableBlock) => void;
  assets: string[];
}) {
  const value = block as unknown as Record<string, unknown>,
    spec = specs[block.type];
  const set = (key: string, v: unknown) =>
    onChange({ ...block, [key]: v } as LessonEditableBlock);
  const optional = (key: string, v: unknown) => {
    const next = { ...value };
    if (v === "" || (Array.isArray(v) && !v.length)) delete next[key];
    else next[key] = v;
    onChange(next as LessonEditableBlock);
  };
  return (
    <div>
      {[...spec.text, ...(spec.optional ?? [])].map((key) => (
        <label key={key}>
          {labels[key] ?? key}
          {spec.optional?.includes(key) ? " (optional)" : ""}
          <textarea
            rows={key === "title" ? 1 : 3}
            maxLength={["title", "term"].includes(key) ? 200 : 12000}
            value={String(value[key] ?? "")}
            onChange={(e) =>
              spec.optional?.includes(key)
                ? optional(key, e.target.value)
                : set(key, e.target.value)
            }
          />
        </label>
      ))}
      {[...(spec.lines ?? []), ...(spec.optionalLines ?? [])].map((key) => (
        <TextList
          key={key}
          label={labels[key] ?? key}
          values={Array.isArray(value[key]) ? (value[key] as string[]) : []}
          optional={spec.optionalLines?.includes(key)}
          onChange={(v) =>
            spec.optionalLines?.includes(key) ? optional(key, v) : set(key, v)
          }
        />
      ))}
      {["takeaway", "example", "warning", "riskNotice"].includes(
        block.type,
      ) && (
        <>
          <label>
            Content format
            <select
              value={Array.isArray(value.children) ? "paragraphs" : "text"}
              onChange={(e) =>
                set(
                  "children",
                  e.target.value === "paragraphs"
                    ? [String(value.children ?? "")]
                    : Array.isArray(value.children)
                      ? value.children.join("\n\n")
                      : value.children,
                )
              }
            >
              <option value="text">Single text</option>
              <option value="paragraphs">Separate paragraphs</option>
            </select>
          </label>
          {Array.isArray(value.children) ? (
            <TextList
              label="Content paragraphs"
              values={value.children as string[]}
              onChange={(v) => set("children", v)}
            />
          ) : (
            <label>
              Content
              <textarea
                rows={4}
                maxLength={12000}
                value={String(value.children)}
                onChange={(e) => set("children", e.target.value)}
              />
            </label>
          )}
        </>
      )}
      {block.type === "heading" && (
        <label>
          Heading level
          <select
            value={block.level ?? 2}
            onChange={(e) => set("level", Number(e.target.value))}
          >
            <option value={2}>Heading 2</option>
            <option value={3}>Heading 3</option>
          </select>
        </label>
      )}
      {block.type === "list" && (
        <label>
          List style
          <select
            value={block.style ?? "unordered"}
            onChange={(e) => set("style", e.target.value)}
          >
            <option value="unordered">Bullets</option>
            <option value="ordered">Numbered</option>
          </select>
        </label>
      )}
      {block.type === "keyPoint" && (
        <label>
          <input
            type="checkbox"
            checked={block.checklist ?? false}
            onChange={(e) => set("checklist", e.target.checked)}
          />
          Display as checklist
        </label>
      )}
      {block.type === "references" && (
        <fieldset>
          <legend>HTTPS references</legend>
          {block.items.map((item, i) => (
            <div key={i}>
              <label>
                Reference title {i + 1}
                <input
                  maxLength={200}
                  value={item.title}
                  onChange={(e) =>
                    set(
                      "items",
                      block.items.map((r, n) =>
                        n === i ? { ...r, title: e.target.value } : r,
                      ),
                    )
                  }
                />
              </label>
              <label>
                Reference URL {i + 1}
                <input
                  type="url"
                  maxLength={2048}
                  value={item.url}
                  onChange={(e) =>
                    set(
                      "items",
                      block.items.map((r, n) =>
                        n === i ? { ...r, url: e.target.value } : r,
                      ),
                    )
                  }
                />
              </label>
              <button
                type="button"
                disabled={block.items.length === 1}
                onClick={() =>
                  set(
                    "items",
                    block.items.filter((_, n) => n !== i),
                  )
                }
              >
                Remove reference {i + 1}
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={block.items.length >= 100}
            onClick={() =>
              set("items", [...block.items, { title: "", url: "https://" }])
            }
          >
            Add reference
          </button>
        </fieldset>
      )}
      {block.type === "diagram" && (
        <>
          <p>
            Choose only an asset already used in this lesson. Uploads and new
            assets are unavailable.
          </p>
          {(["src", "desktopSrc"] as const).map((key) => (
            <label key={key}>
              {labels[key]}
              <select
                value={block[key] ?? ""}
                onChange={(e) =>
                  key === "desktopSrc"
                    ? optional(key, e.target.value)
                    : set(key, e.target.value)
                }
              >
                {key === "desktopSrc" && (
                  <option value="">Use main diagram</option>
                )}
                {assets.map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {(["width", "height"] as const).map((key) => (
            <label key={key}>
              {labels[key]}
              <input
                type="number"
                min={1}
                max={10000}
                value={Number.isFinite(block[key]) ? block[key] : ""}
                onChange={(e) => set(key, e.target.valueAsNumber)}
              />
            </label>
          ))}
        </>
      )}
      {block.type === "quizPreview" && (
        <label>
          Question count
          <input
            type="number"
            min={1}
            max={100}
            value={
              Number.isFinite(block.questionCount) ? block.questionCount : ""
            }
            onChange={(e) => set("questionCount", e.target.valueAsNumber)}
          />
        </label>
      )}
      {block.type === "comparisonTable" && (
        <fieldset>
          <legend>Table</legend>
          {block.columns.map((column, i) => (
            <label key={i}>
              Column heading {i + 1}
              <input
                maxLength={200}
                value={column}
                onChange={(e) =>
                  set(
                    "columns",
                    block.columns.map((v, n) => (n === i ? e.target.value : v)),
                  )
                }
              />
            </label>
          ))}
          <div>
            <button
              type="button"
              disabled={block.columns.length >= 20}
              onClick={() =>
                onChange({
                  ...block,
                  columns: [...block.columns, ""],
                  rows: block.rows.map((row) => [...row, ""]),
                })
              }
            >
              Add column
            </button>
            <button
              type="button"
              disabled={block.columns.length <= 1}
              onClick={() =>
                onChange({
                  ...block,
                  columns: block.columns.slice(0, -1),
                  rows: block.rows.map((row) => row.slice(0, -1)),
                })
              }
            >
              Remove last column
            </button>
          </div>
          {block.rows.map((row, r) => (
            <fieldset key={r}>
              <legend>Row {r + 1}</legend>
              {row.map((cell, c) => (
                <label key={c}>
                  Row {r + 1}, column {c + 1}
                  <textarea
                    rows={2}
                    maxLength={12000}
                    value={cell}
                    onChange={(e) =>
                      set(
                        "rows",
                        block.rows.map((v, n) =>
                          n === r
                            ? v.map((x, i) => (i === c ? e.target.value : x))
                            : v,
                        ),
                      )
                    }
                  />
                </label>
              ))}
              <button
                type="button"
                disabled={block.rows.length <= 1}
                onClick={() =>
                  set(
                    "rows",
                    block.rows.filter((_, n) => n !== r),
                  )
                }
              >
                Remove row {r + 1}
              </button>
            </fieldset>
          ))}
          <button
            type="button"
            disabled={block.rows.length >= 100}
            onClick={() =>
              set("rows", [...block.rows, block.columns.map(() => "")])
            }
          >
            Add row
          </button>
        </fieldset>
      )}
    </div>
  );
}
