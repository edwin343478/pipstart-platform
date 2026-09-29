import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const appRoot = path.resolve(import.meta.dirname);

function read(relativePath: string): string {
  return fs.readFileSync(path.join(appRoot, relativePath), "utf8");
}

describe("Milestone 15 deep lesson shell", () => {
  it("keeps the Forex lesson shell reusable across levels and courses", () => {
    const source = read("learn/forex/level-1/forex-lesson.tsx");

    expect(source).toContain("contextTitle?: string");
    expect(source).toContain("courseHref?: string");
    expect(source).toContain("courseTitle?: string");
    expect(source).toContain("lessons?: readonly ForexLesson[]");
    expect(source).toContain("progressKey?: string");
    expect(source).toContain("quizTarget?: LessonTarget | null");
    expect(source).toContain("<LessonPage");
  });

  it("uses the new stepper and responsive lesson layout", () => {
    const page = read("../components/lesson-page.tsx");
    const stepper = read("../components/SteppedLessonArticle.tsx");
    const css = read("../components/stepped-lesson-article.module.css");
    expect(page).toContain("<LessonSidebar");
    expect(page).toContain("<SteppedLessonArticle");
    expect(stepper).toContain('role="tablist"');
    expect(stepper).toContain('Show all sections at once');
    expect(stepper).not.toContain('Show all sections at once (for review)');
    expect(stepper).toContain('Next lesson: {nextLesson.title}');
    expect(css).toContain(".mobileSidebar");
    expect(css).toContain(".mobileProgress");
  });

  it("uses the approved support-card hierarchy", () => {
    const styles = read("../components/lesson-blocks.module.css");

    expect(styles).toContain("background: #fafbfc");
    expect(styles).toContain("background: #f0fdfa");
    expect(styles).toContain("border: 1.5px solid #0b1220");
    expect(styles).toContain("background: #fffbeb");
  });
});
