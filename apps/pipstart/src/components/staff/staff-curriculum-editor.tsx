"use client";
import {
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { runCurriculumDraftAction } from "@/app/admin/staff/content/draft-actions";
import {
  validDraftInput,
  type CurriculumDraftFields,
  type CurriculumDraftView,
  type CurriculumDraftInput,
} from "@/lib/content/curriculum-draft-contract";
import {
  draftBuffer,
  editorReducer,
  initialEditor,
} from "@/lib/content/curriculum-editor-state";
import { useDraftLeaveGuard } from "./use-draft-leave-guard";
import s from "@/components/admin-preview/admin-preview.module.css";
import styles from "./staff-curriculum-editor.module.css";
export type EditorCreation = {
  family: "course" | "module";
  path: "forex" | "crypto";
  parent: string;
  level: string;
};
const labels: Record<keyof CurriculumDraftFields, string> = {
  title: "Title",
  description: "Description",
  order: "Order within parent",
  lessonContextTitle: "Lesson context label",
  lessonQuizLabel: "Lesson quiz label",
  seoTitle: "SEO title",
  seoDescription: "SEO description",
};
const subscribeToHydration = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;

export function StaffCurriculumEditor({
  item,
  creation,
}: {
  item: CurriculumDraftView | null;
  creation: EditorCreation;
}) {
  const [state, dispatch] = useReducer(editorReducer, item, initialEditor),
    [identity, setIdentity] = useState({ id: "", ...creation }),
    [loading, setLoading] = useState(false);
  const lock = useRef(false),
    status = useRef<HTMLParagraphElement>(null);
  const dirty =
    draftBuffer(state.fields, state.reason) !== state.clean ||
    (!state.base &&
      (identity.id !== "" ||
        identity.path !== creation.path ||
        identity.parent !== creation.parent ||
        identity.level !== creation.level));
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
  const identify = () =>
    state.base
      ? {
          id: state.base.id,
          family: state.base.family,
          path: state.base.path,
          parent: state.base.parent,
          level: state.base.level,
        }
      : {
          id: identity.id,
          family: identity.family,
          path: identity.path,
          parent: identity.family === "course" ? null : identity.parent,
          level: identity.family === "course" ? identity.level : null,
        };
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || state.phase !== "idle") return;
    const id = identify(),
      command: CurriculumDraftInput = state.base
        ? {
            kind: "save",
            id: id.id,
            baseRevision: state.base.revision,
            baseSha256: state.base.bodySha256,
            fields: { ...state.fields },
            reason: state.reason,
          }
        : {
            kind: "create",
            ...id,
            fields: { ...state.fields },
            reason: state.reason,
          };
    if (!validDraftInput(command)) {
      dispatch({ type: "invalid" });
      status.current?.focus();
      return;
    }
    lock.current = true;
    dispatch({ type: "busy" });
    try {
      dispatch({
        type: "result",
        result: await runCurriculumDraftAction(command),
        identity: id,
      });
    } catch {
      dispatch({ type: "result", result: { kind: "uncertain" }, identity: id });
    } finally {
      lock.current = false;
      status.current?.focus();
    }
  }
  async function compare() {
    if (lock.current) return;
    const id = state.base?.id || identity.id;
    if (!id) return;
    lock.current = true;
    setLoading(true);
    try {
      const result = await runCurriculumDraftAction({ kind: "load", id });
      dispatch({ type: "latest", result });
      if (result.kind === "ready" && state.phase === "saved" && !dirty)
        dispatch({ type: "use-latest" });
    } catch {
      dispatch({ type: "latest", result: { kind: "unavailable" } });
    } finally {
      lock.current = false;
      setLoading(false);
      status.current?.focus();
    }
  }
  function useLatest() {
    if (!state.latest || lock.current) return;
    if (
      (dirty || state.phase === "uncertain") &&
      !window.confirm("Discard your entered values and use the latest draft?")
    )
      return;
    dispatch({ type: "use-latest" });
  }
  const disabled =
    !hydrated ||
    loading ||
    state.phase === "busy" ||
    state.phase === "uncertain" ||
    state.phase === "denied";
  return (
    <div className={styles.editor}>
      <header>
        <p className={s.eyebrow}>Content · Draft editor</p>
        <h1>
          {state.base ? "Edit " + state.base.family : "New " + creation.family}
        </h1>
        <p>
          Save a private editorial draft. This does not approve, publish or
          change learner pages.
        </p>
        <a href="/admin/staff/content">Back to content library</a>
        {state.base?.family === "course" && (
          <p>
            <a
              href={
                "/admin/staff/content/editor?family=module&path=" +
                state.base.path +
                "&parent=" +
                encodeURIComponent(state.base.id)
              }
            >
              Add module to this course
            </a>
          </p>
        )}
        {state.base?.family === "module" && (
          <p>
            <a
              href={
                "/admin/staff/content/lesson?path=" +
                state.base.path +
                "&parent=" +
                encodeURIComponent(state.base.id)
              }
            >
              Add lesson to this module
            </a>
          </p>
        )}
      </header>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        ref={status}
        tabIndex={-1}
        className={styles.notice}
      >
        {state.message || (dirty ? "Unsaved changes." : "No unsaved changes.")}
      </p>
      <form
        onSubmit={(event) => void save(event)}
        aria-busy={!hydrated || state.phase === "busy" || loading}
        className={s.panel}
      >
        <fieldset disabled={disabled}>
          <legend>
            {state.base ? "Permanent identity" : "Choose a permanent identity"}
          </legend>
          {state.base ? (
            <dl>
              <dt>Identity</dt>
              <dd>{state.base.id}</dd>
              <dt>Path</dt>
              <dd>{state.base.path}</dd>
              <dt>Parent</dt>
              <dd>{state.base.parent ?? "No parent"}</dd>
              <dt>Level</dt>
              <dd>{state.base.level ?? "Inherited from parent"}</dd>
              <dt>Base revision</dt>
              <dd>{state.base.revision}</dd>
            </dl>
          ) : (
            <div className={styles.grid}>
              <label>
                Permanent identity
                <input
                  name="content-id"
                  required
                  maxLength={100}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  value={identity.id}
                  onChange={(e) =>
                    setIdentity({ ...identity, id: e.target.value })
                  }
                />
                <span>
                  Lowercase words joined by hyphens. Cannot be renamed later.
                </span>
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
              {creation.family === "course" ? (
                <label>
                  Level
                  <select
                    value={identity.level}
                    onChange={(e) =>
                      setIdentity({ ...identity, level: e.target.value })
                    }
                  >
                    {Array.from({ length: 11 }, (_, i) => (
                      <option value={"level-" + i} key={i}>
                        Level {i}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label>
                  Parent course identity
                  <input
                    required
                    maxLength={100}
                    value={identity.parent}
                    onChange={(e) =>
                      setIdentity({ ...identity, parent: e.target.value })
                    }
                  />
                  <span>
                    Current write permission on this course is checked again
                    when creating. The Owner may need to assign the new module
                    before you can edit it.
                  </span>
                </label>
              )}
            </div>
          )}
          <div className={styles.grid}>
            {(Object.keys(labels) as (keyof CurriculumDraftFields)[]).map(
              (name) => (
                <label key={name} htmlFor={"draft-" + name}>
                  {labels[name]}
                  {name === "description" || name === "seoDescription" ? (
                    <textarea
                      id={"draft-" + name}
                      rows={3}
                      required={name === "description"}
                      maxLength={name === "description" ? 2000 : 300}
                      value={state.fields[name]}
                      onChange={(e) =>
                        dispatch({ type: "field", name, value: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      id={"draft-" + name}
                      type={name === "order" ? "number" : "text"}
                      min={name === "order" ? 1 : undefined}
                      max={name === "order" ? 10000 : undefined}
                      step={name === "order" ? 1 : undefined}
                      required={name === "title" || name === "order"}
                      maxLength={name === "order" ? undefined : 200}
                      value={state.fields[name]}
                      onChange={(e) =>
                        dispatch({
                          type: "field",
                          name,
                          value:
                            name === "order"
                              ? Number(e.target.value)
                              : e.target.value,
                        })
                      }
                    />
                  )}
                  {name === "order" && (
                    <span>
                      Changing this number updates only this item’s order.
                    </span>
                  )}
                  {name === "description" && (
                    <span>
                      One plain-text paragraph, without leading/trailing spaces
                      or line breaks.
                    </span>
                  )}
                </label>
              ),
            )}
          </div>
          <label htmlFor="draft-reason">
            Change reason
            <input
              id="draft-reason"
              required
              maxLength={200}
              value={state.reason}
              onChange={(e) =>
                dispatch({ type: "reason", value: e.target.value })
              }
            />
          </label>
        </fieldset>
        <div className={styles.actions}>
          <button
            type="submit"
            disabled={disabled || state.phase !== "idle" || !dirty}
          >
            {state.phase === "busy" ? "Saving draft…" : "Save draft"}
          </button>
          {(state.base || identity.id) && (
            <button
              type="button"
              disabled={!hydrated || loading || state.phase === "busy"}
              onClick={() => void compare()}
            >
              {loading
                ? "Reading latest…"
                : state.phase === "saved"
                  ? "Reload saved draft"
                  : "Load latest for comparison"}
            </button>
          )}
        </div>
      </form>
      {state.latest && (
        <section
          className={s.panel + " " + styles.comparison}
          aria-labelledby="draft-compare-heading"
        >
          <h2 id="draft-compare-heading">
            Compare with latest revision {state.latest.revision}
          </h2>
          <p>
            Your entered values are unchanged. Review the differences before
            discarding or copying any work.
          </p>
          <dl>
            {(Object.keys(labels) as (keyof CurriculumDraftFields)[]).map(
              (key) => (
                <div key={key}>
                  <dt>{labels[key]}</dt>
                  <dd>
                    <strong>Your value:</strong>{" "}
                    {String(state.fields[key]) || "Empty"}
                  </dd>
                  <dd>
                    <strong>Latest value:</strong>{" "}
                    {String(state.latest!.fields[key]) || "Empty"}
                  </dd>
                </div>
              ),
            )}
          </dl>
          <button
            type="button"
            disabled={loading || state.phase === "busy"}
            onClick={useLatest}
          >
            Use latest and discard my changes
          </button>
        </section>
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
