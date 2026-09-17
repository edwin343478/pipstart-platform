begin;

create table public.pipstart_bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_type text not null check (resource_type = 'lesson'),
  resource_id text not null
    check (resource_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  primary key (user_id, resource_type, resource_id)
);

create index pipstart_bookmarks_recent_idx
  on public.pipstart_bookmarks (user_id, created_at desc);

alter table public.pipstart_bookmarks enable row level security;

create policy "Learners read their own PipStart bookmarks"
  on public.pipstart_bookmarks
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Learners create their own PipStart bookmarks"
  on public.pipstart_bookmarks
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Learners delete their own PipStart bookmarks"
  on public.pipstart_bookmarks
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.pipstart_bookmarks from public, anon, authenticated;
grant select on public.pipstart_bookmarks to authenticated;
grant insert (user_id, resource_type, resource_id)
  on public.pipstart_bookmarks to authenticated;
grant delete on public.pipstart_bookmarks to authenticated;

commit;
