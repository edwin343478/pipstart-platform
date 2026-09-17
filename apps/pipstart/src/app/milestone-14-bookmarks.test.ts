import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const appRoot = path.resolve(import.meta.dirname);
const read = (relativePath: string) =>
  fs.readFileSync(path.join(appRoot, relativePath), "utf8");

describe("Milestone 14 lesson bookmarks", () => {
  it("offers the same bookmark control on published Forex and Crypto lessons", () => {
    for (const route of [
      "learn/forex/level-1/forex-lesson.tsx",
      "learn/crypto/level-1/page.tsx",
    ]) {
      expect(read(route)).toContain("<LessonBookmarkButton");
      expect(read(route)).toContain("lessonHref=");
      expect(read(route)).toContain("lessonId=");
    }
  });

  it("loads bookmark state without forcing anonymous learners to authenticate", () => {
    const actions = read("learn/bookmark-actions.ts");
    expect(actions).toContain("loadLessonBookmarkAction");
    expect(actions).toContain("supabase.auth.getUser()");
    expect(actions).toContain(
      "return { authenticated: false, bookmarked: false }",
    );
    expect(actions).toContain('.eq("resource_type", "lesson")');
    expect(actions).toContain(".maybeSingle()");
  });

  it("validates published lessons and requires authentication before writes", () => {
    const actions = read("learn/bookmark-actions.ts");
    expect(actions.match(/getPublishedLesson/g) ?? []).toHaveLength(3);
    expect(actions).toContain("requireUser(lesson.href)");
    expect(actions).toContain('revalidatePath("/dashboard")');
    expect(actions).toContain("revalidatePath(lesson.href)");
  });

  it("keeps the bookmark control accessible and sign-in aware", () => {
    const control = read("../components/lesson-bookmark-button.tsx");
    expect(control).toContain("aria-pressed={currentState.bookmarked}");
    expect(control).toContain("Sign in to bookmark");
    expect(control).toContain("encodeURIComponent(lessonHref)");
    expect(control).toContain('"Lesson bookmarked."');
    expect(control).toContain('"Bookmark removed."');
    expect(control).toContain('role={messageIsError ? "alert" : "status"}');
  });
});
