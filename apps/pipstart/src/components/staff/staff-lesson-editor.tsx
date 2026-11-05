"use client";
import {
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { runLessonEditorAction } from "@/app/admin/staff/content/lesson-actions";
import {
  lessonDraftInputSchema,
  type LessonDraftContent,
  type LessonDraftFields,
  type LessonDraftView,
  type LessonBlockEntry,
} from "@/lib/content/lesson-draft-contract";
import {
  LESSON_DRAFT_RISK,
  parseLessonCreation,
} from "@/lib/content/lesson-create-contract";
import {
  initialLessonEditor,
  lessonBuffer,
  lessonEditorReducer,
  lessonAssets,
  protectedLessonBlock,
} from "@/lib/content/lesson-editor-state";
import {
  LessonBlockFields,
  lessonBlockLabels,
  newLessonBlock,
  SourceList,
  TextList,
} from "./lesson-block-fields";
import { StaffLessonPreview } from "./staff-lesson-preview";
import { useDraftLeaveGuard } from "./use-draft-leave-guard";
import s from "@/components/admin-preview/admin-preview.module.css";
import styles from "./staff-lesson-editor.module.css";
export type LessonEditorCreation = { path: "forex" | "crypto"; parent: string };
const labels: Record<
  Exclude<keyof LessonDraftFields, "objectives" | "sources">,
  string
> = {
  title: "Title",
  description: "Description",
  estimatedMinutes: "Estimated minutes",
  seoTitle: "SEO title",
  seoDescription: "SEO description",
};
const subscribeToHydration = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;

export function StaffLessonEditor({
  item,
  creation,
}: {
  item: LessonDraftView | null;
  creation: LessonEditorCreation;
}) {
  const [state, dispatch] = useReducer(
      lessonEditorReducer,
      item,
      initialLessonEditor,
    ),
    [identity, setIdentity] = useState({ id: "", ...creation, order: 1 }),
    [loading, setLoading] = useState(false),
    [preview, setPreview] = useState(false),
    [blockType, setBlockType] =
      useState<LessonBlockEntry["value"]["type"]>("paragraph");
  const lock = useRef(false),
    status = useRef<HTMLParagraphElement>(null);
  const dirty =
    lessonBuffer(state) !== state.clean ||
    (!state.base &&
      (identity.id !== "" ||
        identity.parent !== creation.parent ||
        identity.path !== creation.path ||
        identity.order !== 1));
  useDraftLeaveGuard(
    dirty || state.phase === "busy" || state.phase === "uncertain",
  );
  // Server HTML stays inert until hydration: React resets a controlled field
  // when it hydrates, dropping or merging anything typed before that point.
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    clientHydrated,
    serverHydrated,
  );
  const disabled =
      !hydrated ||
      loading ||
      ["busy", "uncertain", "denied", "saved"].includes(state.phase),
    assets = lessonAssets(state.base?.content ?? state.content);
  const setContent = (content: LessonDraftContent) =>
    dispatch({ type: "edit", buffer: { content } });
  const entries =
    state.content.mode === "flat"
      ? state.content.blocks
      : state.content.sections.flatMap((s) => s.blocks);
  const isProtected = (b: LessonBlockEntry) =>
    (b.sourceIndex !== null && protectedLessonBlock(b.value)) ||
    (b.value.type === "riskNotice" && b.value.children === LESSON_DRAFT_RISK);
  function updateGroup(group: number, blocks: LessonBlockEntry[]) {
    const c = structuredClone(state.content);
    if (c.mode === "flat") c.blocks = blocks;
    else c.sections[group].blocks = blocks;
    setContent(c);
  }
  function groupControls(group: number, blocks: LessonBlockEntry[]) {
    return (
      <div className={styles.blockList}>
        {blocks.map((entry, index) => {
          const locked = isProtected(entry);
          return (
            <details key={index} className={styles.block}>
              <summary>
                {index + 1}. {lessonBlockLabels[entry.value.type]}
                {locked ? " · Protected disclosure" : ""}
              </summary>
              <fieldset disabled={disabled || locked}>
                <legend>{lessonBlockLabels[entry.value.type]} fields</legend>
                <LessonBlockFields
                  block={entry.value}
                  assets={assets}
                  onChange={(value) =>
                    updateGroup(
                      group,
                      blocks.map((v, i) => (i === index ? { ...v, value } : v)),
                    )
                  }
                />
              </fieldset>
              {locked && (
                <p>
                  This existing disclosure is preserved. It cannot be weakened
                  or removed in this editor.
                </p>
              )}
              {state.content.mode === "sections" && (
                <label>
                  Move block {index + 1} to section
                  <select
                    value={group}
                    disabled={disabled || blocks.length === 1}
                    onChange={(e) => {
                      const target = Number(e.target.value),
                        c = structuredClone(state.content);
                      if (
                        c.mode !== "sections" ||
                        target === group ||
                        !c.sections[target]
                      )
                        return;
                      const [moved] = c.sections[group].blocks.splice(index, 1);
                      c.sections[target].blocks.push(moved);
                      setContent(c);
                    }}
                  >
                    {state.content.sections.map((section, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {section.title || "Untitled section"}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <div className={styles.actions}>
                {[-1, 1].map((direction) => (
                  <button
                    key={direction}
                    type="button"
                    disabled={
                      disabled ||
                      index + direction < 0 ||
                      index + direction >= blocks.length
                    }
                    aria-label={
                      "Move block " +
                      (index + 1) +
                      (direction < 0 ? " up" : " down")
                    }
                    onClick={() => {
                      const moved = [...blocks];
                      [moved[index], moved[index + direction]] = [
                        moved[index + direction],
                        moved[index],
                      ];
                      updateGroup(group, moved);
                    }}
                  >
                    {direction < 0 ? "Move up" : "Move down"}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={disabled || locked || blocks.length === 1}
                  onClick={() => {
                    if (window.confirm("Remove this block from the draft?"))
                      updateGroup(
                        group,
                        blocks.filter((_, i) => i !== index),
                      );
                  }}
                >
                  Remove block {index + 1}
                </button>
              </div>
            </details>
          );
        })}
        <button
          type="button"
          disabled={
            disabled ||
            entries.length >= 500 ||
            (blockType === "diagram" && !assets.length)
          }
          onClick={() =>
            updateGroup(group, [
              ...blocks,
              { sourceIndex: null, value: newLessonBlock(blockType, assets) },
            ])
          }
        >
          Add {lessonBlockLabels[blockType].toLowerCase()} to{" "}
          {state.content.mode === "flat" ? "lesson" : "section " + (group + 1)}
        </button>
      </div>
    );
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (lock.current || state.phase !== "idle") return;
    const id = state.base
      ? { id: state.base.id, path: state.base.path, parent: state.base.parent }
      : { id: identity.id, path: identity.path, parent: identity.parent };
    const command = state.base
      ? {
          kind: "save",
          id: id.id,
          baseRevision: state.base.revision,
          baseSha256: state.base.bodySha256,
          fields: state.fields,
          content: state.content,
          reason: state.reason,
        }
      : {
          kind: "create",
          ...id,
          order: identity.order,
          fields: state.fields,
          content: state.content,
          reason: state.reason,
        };
    if (
      !(state.base
        ? lessonDraftInputSchema.safeParse(command).success
        : !!parseLessonCreation(command))
    ) {
      dispatch({ type: "invalid" });
      status.current?.focus();
      return;
    }
    lock.current = true;
    dispatch({ type: "busy" });
    try {
      dispatch({
        type: "result",
        result: await runLessonEditorAction(command),
        identity: id,
      });
    } catch {
      dispatch({ type: "result", result: { kind: "uncertain" }, identity: id });
    } finally {
      lock.current = false;
      status.current?.focus();
    }
  }
  async function latest() {
    if (lock.current) return;
    const id = state.base?.id || identity.id;
    if (!id) return;
    lock.current = true;
    setLoading(true);
    try {
      const result = await runLessonEditorAction({ kind: "load", id });
      dispatch({ type: "latest", result });
      if (result.kind === "ready" && state.phase === "saved")
        dispatch({ type: "use-latest" });
    } catch {
      dispatch({ type: "latest", result: { kind: "unavailable" } });
    } finally {
      lock.current = false;
      setLoading(false);
      status.current?.focus();
    }
  }
  return (
    <div className={styles.editor}>
      <header>
        <p className={s.eyebrow}>Content · Lesson draft</p>
        <h1>{state.base ? "Edit lesson" : "New lesson"}</h1>
        <p>
          Save a private draft. Saving does not approve, publish or change
          learner content.
        </p>
        <a href="/admin/staff/content">Back to content library</a>
      </header>
      <p
        className={styles.notice}
        ref={status}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {state.message || (dirty ? "Unsaved changes." : "No unsaved changes.")}
      </p>
      <form
        className={s.panel}
        aria-label="Lesson draft"
        aria-busy={!hydrated || state.phase === "busy" || loading}
        onSubmit={(e) => void save(e)}
      >
        <fieldset disabled={disabled}>
          <legend>
            {state.base
              ? "Permanent lesson identity"
              : "Choose a permanent identity"}
          </legend>
          {state.base ? (
            <dl>
              <dt>Identity</dt>
              <dd>{state.base.id}</dd>
              <dt>Learning path</dt>
              <dd>{state.base.path}</dd>
              <dt>Parent module</dt>
              <dd>{state.base.parent}</dd>
              <dt>Base revision</dt>
              <dd>{state.base.revision}</dd>
            </dl>
          ) : (
            <div className={styles.grid}>
              <label>
                Permanent identity
                <input
                  required
                  maxLength={100}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  value={identity.id}
                  onChange={(e) =>
                    setIdentity({ ...identity, id: e.target.value })
                  }
                />
              </label>
              <label>
                Learning path
                <select
                  value={identity.path}
                  onChange={(e) =>
                    setIdentity({
                      ...identity,
                      path: e.target.value as "forex" | "crypto",
                    })
                  }
                >
                  <option value="forex">Forex</option>
                  <option value="crypto">Crypto</option>
                </select>
              </label>
              <label>
                Parent module identity
                <input
                  required
                  maxLength={100}
                  value={identity.parent}
                  onChange={(e) =>
                    setIdentity({ ...identity, parent: e.target.value })
                  }
                />
              </label>
              <label>
                Order within module
                <input
                  type="number"
                  min={1}
                  max={10000}
                  required
                  value={Number.isFinite(identity.order) ? identity.order : ""}
                  onChange={(e) =>
                    setIdentity({ ...identity, order: e.target.valueAsNumber })
                  }
                />
              </label>
              <p>
                The module and course must both be readable; current write
                permission on the module is checked when creating. The Owner may
                need to assign the new lesson before you can reload or edit it.
              </p>
              <p>
                New lessons remain unapproved drafts. Sources, independent
                review and publication checks are still required before release.
              </p>
            </div>
          )}
          <div className={styles.grid}>
            {Object.entries(labels).map(([name, label]) => {
              const key = name as keyof typeof labels;
              return (
                <label key={key}>
                  {label}
                  {key === "estimatedMinutes" ? (
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      required
                      value={
                        Number.isFinite(state.fields[key])
                          ? state.fields[key]
                          : ""
                      }
                      onChange={(e) =>
                        dispatch({
                          type: "edit",
                          buffer: {
                            fields: {
                              ...state.fields,
                              [key]: e.target.valueAsNumber,
                            },
                          },
                        })
                      }
                    />
                  ) : (
                    <textarea
                      required
                      rows={key === "title" || key === "seoTitle" ? 1 : 3}
                      maxLength={
                        key === "description"
                          ? 2000
                          : key === "seoDescription"
                            ? 300
                            : 200
                      }
                      value={state.fields[key]}
                      onChange={(e) =>
                        dispatch({
                          type: "edit",
                          buffer: {
                            fields: { ...state.fields, [key]: e.target.value },
                          },
                        })
                      }
                    />
                  )}
                </label>
              );
            })}
          </div>
          <TextList
            label="Learning objectives"
            values={state.fields.objectives}
            onChange={(v) =>
              dispatch({
                type: "edit",
                buffer: { fields: { ...state.fields, objectives: v } },
              })
            }
          />
          <SourceList
            values={state.fields.sources}
            onChange={(v) =>
              dispatch({
                type: "edit",
                buffer: { fields: { ...state.fields, sources: v } },
              })
            }
          />
          {!state.base && (
            <label>
              Lesson layout
              <select
                value={state.content.mode}
                onChange={(e) => {
                  if (
                    e.target.value === "sections" &&
                    state.content.mode === "flat"
                  )
                    setContent({
                      mode: "sections",
                      sections: [
                        {
                          sourceIndex: null,
                          title: "",
                          blocks: state.content.blocks,
                        },
                      ],
                    });
                  else if (
                    e.target.value === "flat" &&
                    state.content.mode === "sections"
                  )
                    setContent({
                      mode: "flat",
                      blocks: state.content.sections.flatMap((s) => s.blocks),
                    });
                }}
              >
                <option value="flat">Continuous lesson</option>
                <option value="sections">Named sections</option>
              </select>
            </label>
          )}
          <h2>Lesson content</h2>
          <p>
            Use the block controls to edit and reorder content. Existing
            identity, references, dates, approvals and required disclosures are
            preserved.
          </p>
          <label>
            Block to add
            <select
              value={blockType}
              onChange={(e) => setBlockType(e.target.value as typeof blockType)}
            >
              {Object.entries(lessonBlockLabels).map(([type, label]) => (
                <option
                  key={type}
                  value={type}
                  disabled={type === "diagram" && !assets.length}
                >
                  {label}
                </option>
              ))}
            </select>
          </label>
          {!assets.length && (
            <p>
              Diagrams can be edited or reused when an approved asset already
              exists in this lesson. New asset uploads are unavailable.
            </p>
          )}
          {state.content.mode === "flat" ? (
            groupControls(0, state.content.blocks)
          ) : (
            <>
              {state.content.sections.map((section, i) => (
                <fieldset key={i} className={styles.section}>
                  <legend>Section {i + 1}</legend>
                  <label>
                    Section title {i + 1}
                    <input
                      maxLength={200}
                      required
                      value={section.title}
                      onChange={(e) => {
                        const c = structuredClone(state.content);
                        if (c.mode === "sections")
                          c.sections[i].title = e.target.value;
                        setContent(c);
                      }}
                    />
                  </label>
                  <label>
                    Short section title {i + 1} (optional)
                    <input
                      maxLength={200}
                      value={section.shortTitle ?? ""}
                      onChange={(e) => {
                        const c = structuredClone(state.content);
                        if (c.mode === "sections") {
                          if (e.target.value)
                            c.sections[i].shortTitle = e.target.value;
                          else delete c.sections[i].shortTitle;
                        }
                        setContent(c);
                      }}
                    />
                  </label>
                  {groupControls(i, section.blocks)}
                  <div className={styles.actions}>
                    {[-1, 1].map((direction) => (
                      <button
                        type="button"
                        key={direction}
                        disabled={
                          i + direction < 0 ||
                          state.content.mode !== "sections" ||
                          i + direction >= state.content.sections.length
                        }
                        onClick={() => {
                          const c = structuredClone(state.content);
                          if (c.mode === "sections")
                            [c.sections[i], c.sections[i + direction]] = [
                              c.sections[i + direction],
                              c.sections[i],
                            ];
                          setContent(c);
                        }}
                      >
                        Move section {i + 1} {direction < 0 ? "up" : "down"}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={
                        state.content.mode !== "sections" ||
                        state.content.sections.length === 1 ||
                        section.blocks.some(isProtected)
                      }
                      onClick={() => {
                        if (
                          !window.confirm("Remove this section and its blocks?")
                        )
                          return;
                        const c = structuredClone(state.content);
                        if (c.mode === "sections")
                          c.sections = c.sections.filter((_, n) => n !== i);
                        setContent(c);
                      }}
                    >
                      Remove section {i + 1}
                    </button>
                  </div>
                </fieldset>
              ))}
              <button
                type="button"
                disabled={
                  state.content.sections.length >= 100 || entries.length >= 500
                }
                onClick={() => {
                  const c = structuredClone(state.content);
                  if (c.mode === "sections")
                    c.sections.push({
                      sourceIndex: null,
                      title: "",
                      blocks: [
                        {
                          sourceIndex: null,
                          value: { type: "paragraph", children: "" },
                        },
                      ],
                    });
                  setContent(c);
                }}
              >
                Add section
              </button>
            </>
          )}
          <label>
            Change reason
            <input
              required
              maxLength={200}
              value={state.reason}
              onChange={(e) =>
                dispatch({ type: "edit", buffer: { reason: e.target.value } })
              }
            />
          </label>
        </fieldset>
        <div className={styles.actions}>
          <button
            type="submit"
            disabled={disabled || state.phase !== "idle" || !dirty}
          >
            {state.phase === "busy" ? "Saving lesson…" : "Save lesson draft"}
          </button>
          <button
            type="button"
            disabled={
              !hydrated ||
              loading ||
              state.phase === "busy" ||
              !(state.base?.id || identity.id)
            }
            onClick={() => void latest()}
          >
            {loading
              ? "Reading latest…"
              : state.phase === "saved"
                ? "Reload saved lesson"
                : "Load latest for comparison"}
          </button>
          <button
            type="button"
            aria-expanded={preview}
            onClick={() => setPreview(!preview)}
          >
            {preview ? "Hide preview" : "Preview lesson"}
          </button>
        </div>
      </form>
      {state.latest && (
        <section
          className={s.panel + " " + styles.comparison}
          aria-label="Compare latest lesson"
        >
          <h2>Latest revision {state.latest.revision}</h2>
          <p>
            Your entered work is unchanged. Compare both drafts before
            discarding any work.
          </p>
          <div className={styles.grid}>
            <div>
              <h3>Your entered metadata</h3>
              <dl>
                {Object.entries(labels).map(([key, label]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>{String(state.fields[key as keyof typeof labels])}</dd>
                  </div>
                ))}
                <dt>Learning objectives</dt>
                <dd>{state.fields.objectives.join("; ")}</dd>
                <dt>Sources</dt>
                <dd>
                  {state.fields.sources.map((r) => r.title).join("; ") ||
                    "None"}
                </dd>
              </dl>
              <StaffLessonPreview
                fields={state.fields}
                content={state.content}
                label="Your entered content"
              />
            </div>
            <div>
              <h3>Latest metadata</h3>
              <dl>
                {Object.entries(labels).map(([key, label]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>
                      {String(state.latest!.fields[key as keyof typeof labels])}
                    </dd>
                  </div>
                ))}
                <dt>Learning objectives</dt>
                <dd>{state.latest.fields.objectives.join("; ")}</dd>
                <dt>Sources</dt>
                <dd>
                  {state.latest.fields.sources.map((r) => r.title).join("; ") ||
                    "None"}
                </dd>
              </dl>
              <StaffLessonPreview
                fields={state.latest.fields}
                content={state.latest.content}
                label="Latest content"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={loading || state.phase === "busy"}
            onClick={() => {
              if (
                window.confirm(
                  "Discard your entered work and use the latest lesson draft?",
                )
              )
                dispatch({ type: "use-latest" });
            }}
          >
            Use latest and discard my changes
          </button>
        </section>
      )}
      {preview && (
        <div className={s.panel + " " + styles.preview}>
          <StaffLessonPreview fields={state.fields} content={state.content} />
        </div>
      )}
      {state.base && (
        <p>
          Revision {state.base.revision} ·{" "}
          <code className={styles.hash}>{state.base.bodySha256}</code>
        </p>
      )}
    </div>
  );
}
