"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { LessonSection } from "../content/lesson-content";
import {
  readingStorageKey,
  resolveReadingState,
  sectionIds,
  type ReadingState,
} from "./lesson-reading-state";

const changeEvent = "pipstart:reading-change";
const memory = new Map<string, string>();
const serverSnapshot = '["",""]';

function subscribe(listener: () => void) {
  window.addEventListener(changeEvent, listener);
  window.addEventListener("storage", listener);
  window.addEventListener("popstate", listener);
  return () => {
    window.removeEventListener(changeEvent, listener);
    window.removeEventListener("storage", listener);
    window.removeEventListener("popstate", listener);
  };
}
function read(key: string) {
  if (memory.has(key)) return memory.get(key)!;
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return memory.get(key) ?? "";
  }
}

export function useLessonReadingState(
  lessonId: string,
  sections: readonly LessonSection[],
) {
  const ids = useMemo(() => sectionIds(sections), [sections]);
  const key = useMemo(
    () => readingStorageKey(lessonId, sections),
    [lessonId, sections],
  );
  const getSnapshot = useCallback(
    () => JSON.stringify([read(key), window.location.search]),
    [key],
  );
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => serverSnapshot,
  );
  const [raw, search] = JSON.parse(snapshot) as [string, string];
  const state = resolveReadingState(raw, search, ids);

  function write(next: ReadingState) {
    const value = JSON.stringify(next);
    try {
      window.localStorage.setItem(key, value);
      memory.delete(key);
    } catch {
      memory.set(key, value);
      /* Reading still works when storage is blocked. */
    }
    const url = new URL(window.location.href);
    url.searchParams.set("section", next.section ?? ids[0]);
    url.searchParams.set("all", next.showAll ? "1" : "0");
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event(changeEvent));
  }
  return {
    ...state,
    sectionIds: ids,
    select: (index: number) =>
      write({ ...state, section: ids[index] ?? ids[0] }),
    setShowAll: (showAll: boolean) =>
      write({ ...state, section: ids[state.activeIndex], showAll }),
    setChecked: (id: string, checked: boolean) =>
      write({
        ...state,
        section: ids[state.activeIndex],
        checked: checked
          ? [...new Set([...state.checked, id])]
          : state.checked.filter((item) => item !== id),
      }),
  };
}
