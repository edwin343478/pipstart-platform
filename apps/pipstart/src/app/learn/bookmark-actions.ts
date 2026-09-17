"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "../../lib/auth/session";
import { getPublishedLesson } from "../../lib/dashboard";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export async function loadLessonBookmarkAction(lessonId: string) {
  if (typeof lessonId !== "string") {
    throw new Error("Bookmark request is invalid.");
  }
  const lesson = getPublishedLesson(lessonId);
  if (!lesson) throw new Error("This lesson cannot be bookmarked.");

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { authenticated: false, bookmarked: false };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { authenticated: false, bookmarked: false };
  }

  const { data, error } = await supabase
    .from("pipstart_bookmarks")
    .select("resource_id")
    .eq("user_id", userData.user.id)
    .eq("resource_type", "lesson")
    .eq("resource_id", lesson.id)
    .maybeSingle();
  if (error) throw new Error("Bookmark status could not be loaded.");

  return { authenticated: true, bookmarked: Boolean(data) };
}

export async function setLessonBookmarkAction(input: {
  bookmarked: boolean;
  lessonId: string;
}) {
  if (
    typeof input?.lessonId !== "string" ||
    typeof input?.bookmarked !== "boolean"
  ) {
    throw new Error("Bookmark request is invalid.");
  }
  const lesson = getPublishedLesson(input.lessonId);
  if (!lesson) throw new Error("This lesson cannot be bookmarked.");

  const user = await requireUser(lesson.href);
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Bookmarks are temporarily unavailable.");

  if (input.bookmarked) {
    const { error } = await supabase.from("pipstart_bookmarks").insert({
      resource_id: lesson.id,
      resource_type: "lesson",
      user_id: user.id,
    });
    if (error && error.code !== "23505") {
      throw new Error("Bookmark could not be saved.");
    }
  } else {
    const { error } = await supabase
      .from("pipstart_bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("resource_type", "lesson")
      .eq("resource_id", lesson.id);
    if (error) throw new Error("Bookmark could not be removed.");
  }

  revalidatePath("/dashboard");
  revalidatePath(lesson.href);
  return { bookmarked: input.bookmarked };
}
