"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import {
  loadLessonBookmarkAction,
  setLessonBookmarkAction,
} from "../app/learn/bookmark-actions";

import styles from "./lesson-bookmark-button.module.css";

type BookmarkState = {
  authenticated: boolean;
  bookmarked: boolean;
  lessonId: string;
};

export function LessonBookmarkButton({
  lessonHref,
  lessonId,
}: {
  lessonHref: string;
  lessonId: string;
}) {
  const [bookmarkState, setBookmarkState] = useState<BookmarkState | null>(
    null,
  );
  const [loadFailureLessonId, setLoadFailureLessonId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    void loadLessonBookmarkAction(lessonId)
      .then((result) => {
        if (active) setBookmarkState({ ...result, lessonId });
      })
      .catch(() => {
        if (active) setLoadFailureLessonId(lessonId);
      });

    return () => {
      active = false;
    };
  }, [lessonId]);

  const currentState =
    bookmarkState?.lessonId === lessonId ? bookmarkState : null;

  if (loadFailureLessonId === lessonId) {
    return (
      <div className={styles.wrapper}>
        <button className={styles.button} disabled type="button">
          Bookmark
        </button>
        <span className={styles.status} role="alert">
          Bookmarks are temporarily unavailable.
        </span>
      </div>
    );
  }

  if (!currentState) {
    return (
      <div className={styles.wrapper}>
        <button className={styles.button} disabled type="button">
          Checking bookmark…
        </button>
      </div>
    );
  }

  if (!currentState.authenticated) {
    return (
      <div className={styles.wrapper}>
        <Link
          className={styles.button}
          href={`/login?next=${encodeURIComponent(lessonHref)}`}
        >
          Sign in to bookmark
        </Link>
      </div>
    );
  }

  function toggleBookmark() {
    if (!currentState) return;
    const bookmarked = !currentState.bookmarked;
    setMessage("");
    setMessageIsError(false);
    startTransition(async () => {
      try {
        const result = await setLessonBookmarkAction({ bookmarked, lessonId });
        setBookmarkState({
          authenticated: true,
          bookmarked: result.bookmarked,
          lessonId,
        });
        setMessage(
          result.bookmarked ? "Lesson bookmarked." : "Bookmark removed.",
        );
      } catch {
        setMessageIsError(true);
        setMessage("Bookmark could not be updated. Try again.");
      }
    });
  }

  return (
    <div className={styles.wrapper}>
      <button
        aria-pressed={currentState.bookmarked}
        className={`${styles.button} ${currentState.bookmarked ? styles.bookmarked : ""}`}
        disabled={pending}
        onClick={toggleBookmark}
        type="button"
      >
        {pending
          ? "Saving…"
          : currentState.bookmarked
            ? "Bookmarked"
            : "Bookmark"}
      </button>
      {message ? (
        <span
          className={styles.status}
          role={messageIsError ? "alert" : "status"}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}
