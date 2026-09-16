begin;

create or replace function public.pipstart_import_anonymous_progress(
  requested_course_id text,
  requested_module_id text,
  requested_lesson_ids text[],
  requested_fingerprint text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  imported_count integer := 0;
  lesson text;
  import_time timestamptz := now();
begin
  if current_user_id is null then raise exception 'authentication required'; end if;
  if coalesce(array_length(requested_lesson_ids, 1), 0) > 100 then
    raise exception 'too many lessons';
  end if;

  insert into public.pipstart_progress_imports (user_id, import_fingerprint)
  values (current_user_id, requested_fingerprint)
  on conflict do nothing;
  if not found then return 0; end if;

  insert into public.pipstart_enrollments (user_id, course_id)
  values (current_user_id, requested_course_id)
  on conflict (user_id, course_id) do update
    set last_activity_at = excluded.last_activity_at;

  foreach lesson in array requested_lesson_ids loop
    insert into public.pipstart_lesson_progress (
      user_id, course_id, module_id, lesson_id, is_complete, completed_at
    ) values (
      current_user_id, requested_course_id, requested_module_id,
      lesson, true, import_time
    )
    on conflict (user_id, lesson_id) do update set
      is_complete = true,
      completed_at = coalesce(
        public.pipstart_lesson_progress.completed_at,
        excluded.completed_at
      ),
      last_visited_at = greatest(
        public.pipstart_lesson_progress.last_visited_at,
        excluded.last_visited_at
      ),
      revision = public.pipstart_lesson_progress.revision + 1
    where not public.pipstart_lesson_progress.is_complete
      and not exists (
        select 1
        from public.pipstart_learning_events as learning_event
        where learning_event.user_id = current_user_id
          and learning_event.lesson_id = lesson
          and learning_event.event_type = 'lesson_reopened'
      );
    if found then imported_count := imported_count + 1; end if;
  end loop;

  insert into public.pipstart_learning_events (
    user_id, event_type, course_id, module_id, metadata
  ) values (
    current_user_id, 'progress_imported', requested_course_id,
    requested_module_id, jsonb_build_object('lesson_count', imported_count)
  );

  return imported_count;
end;
$$;

revoke all on function public.pipstart_import_anonymous_progress(text, text, text[], text)
  from public, anon, authenticated;
grant execute on function public.pipstart_import_anonymous_progress(text, text, text[], text)
  to authenticated;

commit;
