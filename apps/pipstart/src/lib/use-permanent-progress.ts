"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  importAnonymousProgressAction,
  loadProgressAction,
  setLessonCompletionAction,
  visitLessonAction,
} from "../app/learn/progress-actions";
import {
  completedLessonIds,
  type ProgressSnapshot,
} from "./permanent-progress";
import { runProgressSave } from "./progress-save-transition";

type Configuration = {
  courseId: string;
  eventName: string;
  lessonId?: string;
  parse: (value: string | null, ids: readonly string[]) => string[];
  serialize: (ids: string[]) => string;
  storageKey: string;
  validIds: readonly string[];
};
export type ProgressSyncState =
  "error" | "idle" | "resolving" | "saved" | "saving";

function read(key: string) {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function usePermanentProgress(config: Configuration) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const storage = (event: StorageEvent) => {
        if (!event.key || event.key === config.storageKey) callback();
      };
      window.addEventListener("storage", storage);
      window.addEventListener(config.eventName, callback);
      return () => {
        window.removeEventListener("storage", storage);
        window.removeEventListener(config.eventName, callback);
      };
    },
    [config.eventName, config.storageKey],
  );
  const getSnapshot = useCallback(
    () => read(config.storageKey),
    [config.storageKey],
  );
  const localValue = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const localIds = config.parse(localValue, config.validIds);
  const [remote, setRemote] = useState<ProgressSnapshot | null>(null);
  const [state, setState] = useState<ProgressSyncState>("resolving");
  const [message, setMessage] = useState("Checking saved progress…");
  const [failed, setFailed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        let result = await loadProgressAction();
        // Hydration begins with the server snapshot (an empty string). Read
        // storage again here so a full post-login navigation cannot skip an
        // anonymous import before useSyncExternalStore publishes its client
        // snapshot.
        const storedIds = config.parse(
          read(config.storageKey),
          config.validIds,
        );
        if (result.authenticated && storedIds.length) {
          result = await importAnonymousProgressAction({
            courseId: config.courseId,
            lessonIds: storedIds,
          });
          try {
            window.localStorage.removeItem(config.storageKey);
            window.dispatchEvent(new Event(config.eventName));
          } catch {
            /* server remains authoritative */
          }
        }
        if (result.authenticated && config.lessonId)
          await visitLessonAction(config.lessonId);
        if (active) {
          setRemote(result);
          setState("idle");
          setMessage(
            result.authenticated
              ? "Progress is synchronized with your account."
              : "Progress is saved on this device.",
          );
        }
      } catch {
        if (active) {
          setState("error");
          setMessage(
            "Saved progress could not be reached. Learning remains available.",
          );
        }
      }
    })();
    return () => {
      active = false;
    };
    // Import the initial local snapshot once; later local changes are handled by useSyncExternalStore.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.courseId, config.eventName, config.lessonId, config.storageKey]);

  const authenticated = remote?.authenticated === true;
  const ids = authenticated && remote ? completedLessonIds(remote) : localIds;

  useEffect(() => {
    if (!authenticated) return;
    const refresh = () => {
      void loadProgressAction()
        .then(setRemote)
        .catch(() => {
          setState("error");
          setMessage(
            "Progress refresh failed. Your last confirmed state is shown.",
          );
        });
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [authenticated]);

  const save = useCallback(
    async (complete: boolean) => {
      if (!config.lessonId || !remote) return;
      const lessonId = config.lessonId;
      const previous = remote;
      const record = remote.lessons.find((item) => item.lessonId === lessonId);
      setState("saving");
      setMessage("Saving progress…");
      setFailed(null);
      const result = await runProgressSave({
        complete,
        lessonId,
        onOptimistic: setRemote,
        persist: () =>
          setLessonCompletionAction({
            complete,
            expectedRevision: record?.revision ?? null,
            lessonId,
          }),
        previous,
      });
      setRemote(result.snapshot);
      setFailed(result.retryComplete);
      setState(result.state);
      setMessage(result.message);
    },
    [config.lessonId, remote],
  );

  function toggle(lessonId: string) {
    const complete = !ids.includes(lessonId);
    if (authenticated) {
      void save(complete);
      return;
    }
    try {
      const next = complete
        ? [...new Set([...ids, lessonId])]
        : ids.filter((id) => id !== lessonId);
      window.localStorage.setItem(config.storageKey, config.serialize(next));
      window.dispatchEvent(new Event(config.eventName));
      setState("saved");
      setMessage("Progress is saved on this device.");
    } catch {
      setState("error");
      setMessage(
        "This browser could not save progress. Learning remains available.",
      );
    }
  }
  return {
    authenticated,
    completedIds: ids,
    message,
    retry: failed === null ? undefined : () => void save(failed),
    snapshot: remote,
    syncState: state,
    toggle,
  };
}
