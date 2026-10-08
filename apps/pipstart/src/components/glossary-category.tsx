import type { GlossaryEntry } from "../lib/glossary-search";
import styles from "./glossary-controls.module.css";
export function GlossaryCategory({
  entries,
  selected,
}: {
  entries: readonly GlossaryEntry[];
  selected: string;
}) {
  const categories = [...new Set(entries.map((e) => e.category))].sort();
  // No pending draft metadata is passed here. One fallback category needs no
  // selector; expanded categories appear after publication is approved.
  if (categories.length < 2)
    return selected ? (
      <input type="hidden" name="category" value={selected} />
    ) : null;
  return (
    <div className={styles.controls}>
      <label>
        Category
        <select name="category" defaultValue={selected}>
          <option value="">All categories</option>
          {selected && !categories.includes(selected) ? (
            <option value={selected}>Unavailable category</option>
          ) : null}
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
